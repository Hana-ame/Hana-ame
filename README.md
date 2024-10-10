# 打包过程

https://docs.python-guide.org/dev/virtualenvs/
py -m pipenv run py -m PyInstaller --onefile --clean .\read-csv.py

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