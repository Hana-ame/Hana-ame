import csv
from Tools.my_tools import parse_args, parse_fn, parse_endswith


# 假设你的文本数据在一个文本文件中
input_file = file_path = (
    parse_args(lambda x: x.endswith(".txt"))
    or parse_fn(
        lambda x: x.endswith("_txt"), lambda x: parse_endswith(x, "_txt") + ".txt"
    )
    or "input.txt"
)
output_file = file_path = (
    parse_args(lambda x: x.endswith(".csv"))
    or parse_fn(
        lambda x: x.endswith("_csv"), lambda x: parse_endswith(x, "_csv") + ".csv"
    )
    or "csv.csv"
)

# 读取文本文件并将每一行作为元素写入 CSV 文件
with open(input_file, 'r', encoding='utf-8') as infile:
    # 读取所有行
    lines = infile.readlines()

# 写入 CSV 文件
with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    writer = csv.writer(outfile)
    writer.writerow(["s"])
    for line in lines:
        # 去除行末的换行符，并将每一行作为 CSV 的一行写入
        writer.writerow([line.rstrip('\n')])

print(f"已将 {input_file} 中的行写入到 {output_file} 中。")
