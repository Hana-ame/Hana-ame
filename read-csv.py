# import importlib
import pandas as pd
from typing import List
from Tools.my_tools import parse_args, parse_fn, parse_startswith, parse_endswith
from Tools.my_file import FilePrinter

# 导入辅助functions
# funcs = eval("importlib.import_module('Tools.funcs')")
# funcs = importlib.import_module('Tools.funcs')
from Tools.funcs import *  # nope

# 读取 CSV 文件
file_path = (
    parse_args(lambda x: x.endswith(".csv"))
    or parse_fn(lambda x: x.endswith("_csv"), lambda x: parse_endswith(x, "_csv") + ".csv")
    or "csv.csv"
)
format_path = parse_args(lambda x: x.endswith(".txt")) or "format.txt"

print(f"读取csv文件：{file_path}")
print(f"读取format文件：{format_path}")

format_arr: List[str] = []
with open(format_path, encoding="utf8") as f:
    format_arr = [line.rstrip("\n") for line in f.readlines()]
print(f"Format: {format_arr}")

df = pd.read_csv(file_path)
df = df.fillna("")
# df = df.astype("str")
df = df.map(
    lambda x: str(int(x)) if isinstance(x, (int, float)) and x.is_integer() else str(x)
)


# 显示读取的数据
print(df)

# 遍历 DataFrame 的每一行
with FilePrinter("output.txt") as f:
    # lastrow = renew_lastrow(df.iloc[0], {key: "" for key in df.columns})
    lastrow = pd.Series("", df.columns, dtype=str)
    # print(lastrow)
    for index, row in df.iterrows():
        # f.print(f"行{index}：{row.iloc[0]} = {row.iloc[1]}")
        # f.print(f"{row.iloc[0]} = {row.iloc[1]}")
        for format in format_arr:
            if (
                source := parse_startswith(
                    format, prefix=["__", "ーー", "ー", "——", "—"]
                )
            ) is not None:
                # print(source)
                f.print(str(eval(source)))
            else:
                f.print(format)
        f.println()
        lastrow = renew_lastrow(row, lastrow)
