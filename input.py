import sys
import pyautogui
import time

time.sleep(1)

fn = sys.argv[1] if len(sys.argv) > 1 else "input.txt"

with open(fn, 'r', encoding='utf8') as f:
  s = f.read()
  pyautogui.write(s, interval=0.005)  # 每个字符之间有 0.1 秒的间隔
