# 打包过程

- https://docs.python-guide.org/dev/virtualenvs/
- https://docs.python.org/3/library/venv.html
- https://stackoverflow.com/questions/47692213/reducing-size-of-pyinstaller-exe

这个是最开始的做法，怎么复现啊草。

```sh
py -m pipenv run py -m PyInstaller --onefile --clean .\read-csv.py
```

用python的venv的做法，好很多，虽然conda有二进制分发可能和这个重复了

```sh
py -m venv . # 这个版本还不会做gitignore
```

https://docs.python.org/3/library/venv.html#how-venvs-work

在这里学到怎么进虚拟环境

擦，这个顺便把没有全局环境的命令啥的问题都解决了

```ps1
# 读取文件列表
$fileList = Get-Content -Path "read-csv.filelist"
$zipFile = "csv.zip"


# 压缩文件
foreach ($file in $fileList) {
    # 添加文件到 ZIP 文件
    & zip $zipFile $file
}
``` 


py 