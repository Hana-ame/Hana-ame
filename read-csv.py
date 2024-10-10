# import importlib
import pandas as pd
from typing import List
from Tools.my_tools import parse_args, parse_fn, parse_startswith
from Tools.my_file import FilePrinter

# 导入辅助functions
# funcs = eval("importlib.import_module('Tools.funcs')")
# funcs = importlib.import_module('Tools.funcs')
from Tools.funcs import * # nope

# 读取 CSV 文件
file_path = parse_args(lambda x: x.endswith(".csv")) or parse_fn(lambda x: x.endswith("_csv"), lambda x: x[:-4] + ".csv") or "csv.csv"
format_path = parse_args(lambda x: x.endswith(".txt")) or "format.txt"

print(f"读取csv文件：{file_path}")
print(f"读取format文件：{format_path}")

format_arr: List[str] = []
with open(format_path, encoding="utf8") as f:
  format_arr = [line.rstrip("\n") for line in f.readlines()]
print(f"Format: {format_arr}")

df = pd.read_csv(file_path)

# 显示读取的数据
print(df)

# 遍历 DataFrame 的每一行
with FilePrinter("output.txt") as f:
  for index, row in df.iterrows():
    # f.print(f"行{index}：{row.iloc[0]} = {row.iloc[1]}")
    # f.print(f"{row.iloc[0]} = {row.iloc[1]}")
    for format in format_arr:
      if (source := parse_startswith(format, "__")) is not None:
        f.print(str(eval(source)))
      else:
        f.print(format)
    f.println()
    