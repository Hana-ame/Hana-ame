
修改，注释变为行内注释

find: (?<=;|\s)//(.*)\n
replace: /*$1*/
for vscode用法

[替换groups](https://docs.microsoft.com/en-us/visualstudio/ide/using-regular-expressions-in-visual-studio?view=vs-2022#capture-groups-and-replacement-patterns)
[python文档](https://docs.python.org/3/library/re.html)

修改，删掉所有的空格

find: (?<!var)(\s|\n)
replace: <null>