# read_csv.exe 说明
读取csv文件，按照当前目录下的`format.txt`进行print输出。

使用方法(.exe)
```sh
read-csv.exe 1.csv                // 读取 1.csv 文件(参数指定)，按照 format.txt 输出到 output.txt
read-csv.exe 1.csv format2.txt    // 读取 1.csv 文件(参数指定)，按照 format2.txt 输出到 output.txt
read-csv.1_csv.exe                // 读取 1.csv 文件(文件名指定)，按照 format.txt 输出到 output.txt
read-csv.exe                      // 读取 csv.csv 文件(默认)，按照 format.txt 输出到 output.txt
```

可以重命名程序文件，也可以传入参数对csv文件进行指定。

使用方法(.py)
```sh
python3 read-csv.py 1.csv                // 读取 1.csv 文件(参数指定)，按照 format.txt 输出到 output.txt
python3 read-csv.py 1.csv format2.txt    // 读取 1.csv 文件(参数指定)，按照 format2.txt 输出到 output.txt
python3 read-csv.1_csv.py                // 读取 1.csv 文件(文件名指定)，按照 format.txt 输出到 output.txt
python3 read-csv.py                      // 读取 csv.csv 文件(默认)，按照 format.txt 输出到 output.txt
```

format文件的设置
`__`(双下划线)开头会作为python表达式处理
其余作为字符串处理
参照format.txt

```txt
行号是：
__index
,    
可以是表达式
__index + 2
,   
第一列是：
__row.iloc[0]
,    
修改方括号内的数字。
第c2列是：
__row["c2"]
,  
修改引号内的内容。
一些文字123123,注意这行后面有空格，会被原样print出来   
两个下划线开始的行是特殊处理，跟别的文字会报错，其他都是按照string处理
```

关于`Tools/funcs.py`

通过写一些辅助函数，可以通过`__funcs.[func]([prams..])`的方式使用。
有一个example是参考dicts文件夹中的key对调value。

```txt  
__sub(f"key{index+1}")
   
__sub(f"key{index+1}", "file1")
```

默认访问default.json，如果指定了文件名，那么会访问[filename].json

**!!!注意!!!**
打包的exe文件只能用sub函数，只有装了py运行才能加其他函数，因为打包不让动态打包


## 可能的问题

Q：找不到dll文件
A：大概在网上找同名的文件放到当前目录就行

Q：报编码格式错误
A：都是按UTF8来处理的，csv导出的时候如果有选项选择UTF8

Q：py运行的时候找不到pandas
A：用pip安装

Q：funcs写了函数不让调用
A：用py运行read-csv.py

Q：funcs写了函数还是不对
A：必须用py运行，exe并不能load到修改过后的文件