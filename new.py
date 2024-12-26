import os
import datetime

today = datetime.date.today()
formatted_date = today.strftime("%Y年%m月%d日")  # Format the date as YYYY年MM月DD日
filename = f"notes/{formatted_date}.txt"

try:
    with open(filename, 'x') as f:
        pass  # Create an empty file
    print(f"File '{filename}' created successfully.")
except FileExistsError:
    print(f"Error: File '{filename}' already exists.")
os.system(f'code {filename}')