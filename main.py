import os
import json
from datetime import datetime
from pathlib import Path

# 指定文件夹路径和每个文件的最大条目数
folder_path = 'notes'
output_folder = 'json'
max_items_per_file = 25  # 请将 X 替换为您希望的最大条目数
files_info = []

# 遍历文件夹
for filename in os.listdir(folder_path):
    if filename.endswith('.txt'):
        file_path = Path(os.path.join(folder_path, filename))
        creation_time = os.path.getctime(file_path)
        modification_time = os.path.getmtime(file_path)
        name_without_extension = os.path.splitext(filename)[0]

        files_info.append({
            'path': file_path.as_posix(),
            'creation_date': datetime.fromtimestamp(creation_time).isoformat(),
            'modification_date': datetime.fromtimestamp(modification_time).isoformat(),
            'file_name': name_without_extension
        })

# 按照创建时间倒序排列
files_info.sort(key=lambda x: x['creation_date'], reverse=True)

# 分割文件信息并保存到多个 JSON 文件中
for i in range(0, len(files_info), max_items_per_file):
    output_file_path = os.path.join(output_folder, f"{i // max_items_per_file + 1}.json")
    with open(output_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(files_info[i:i + max_items_per_file], json_file, ensure_ascii=False, indent=4)

print(f"已将文件信息保存到 {output_folder} 文件夹中的 JSON 文件。")


# json的部分

# 定义 JSON 文件夹路径和 main.json 文件路径
json_dir = 'json'
main_json_path = 'main.json'

# 读取现有的 main.json 文件
with open(main_json_path, 'r', encoding='utf-8') as main_json_file:
    data = json.load(main_json_file)

# 获取 json 文件夹中的所有 JSON 文件
json_files = [f for f in os.listdir(json_dir) if f.endswith('.json')]

# 创建文件路径列表
json_file_paths = [Path(os.path.join(json_dir, file)).as_posix() for file in json_files]

# 更新 files 项目
data['files'] = json_file_paths

# 将更新后的内容写回 main.json
with open(main_json_path, 'w', encoding='utf-8') as main_json_file:
    json.dump(data, main_json_file, ensure_ascii=False, indent=2)

print(f'main.json 文件已成功更新，新的文件列表为：{json_file_paths}')
