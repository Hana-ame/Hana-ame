import pyautogui
import time

time.sleep(1)

with open("input.txt", 'r', encoding='utf8') as f:
  s = f.read()
  pyautogui.write(s, interval=0.005)  # 每个字符之间有 0.1 秒的间隔
