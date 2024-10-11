import csv

# 假设你的文本数据在一个文本文件中
input_file = "mem_data.txt"  # 输入文件
output_file = "output.txt"  # 输出 CSV 文件

# 读取文本文件并将每一行作为元素写入 CSV 文件
with open(input_file, "r", encoding="utf-8") as f:
    # 读取所有行
    lines = f.readlines()

s = ""
# 写入 CSV 文件
with open(output_file, "w", newline="", encoding="utf-8") as f:

    s += "第一行\n"
    s += "第2行\n"

    r0, r1, r2, r3 = 0, 0, 0, 0
    for i, v in enumerate(lines):
        # print(i, v)
        if i % 4 == 0:
            r0 = int(v)
        elif i % 4 == 1:
            r1 = int(v)
        elif i % 4 == 2:
            r2 = int(v)
        elif i % 4 == 3:
            r3 = int(v)
            
            # f.write(   str(  hex (((((r3) * 8 + r2) * 8) + r1 * 8) + r0)    )[2:]   )  # 小端 ?
            s +=    f"{(    (((((r3) * 8 + r2) * 8) + r1 * 8) + r0)    ):08x}"     # 小端 ?
            # f.write(str(  hex (((((r0) * 8 + r1) * 8) + r2 * 8) + r3)    )[2:])  # 小端 ?
            s += ",\n"
    s = s[:-2]
    
    s += ";\n"
    
    f.write(s)

print(f"已将 {input_file} 中的行写入到 {output_file} 中。")
