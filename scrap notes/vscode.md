# 正则，替换
修改，注释变为行内注释

find: 
(?<=;|\s)//(.*)\n
replace: /*$1*/
for vscode用法

[替换groups](https://docs.microsoft.com/en-us/visualstudio/ide/using-regular-expressions-in-visual-studio?view=vs-2022#capture-groups-and-replacement-patterns)
[python文档](https://docs.python.org/3/library/re.html)

修改，删掉所有的空格

find: 
(?<!var|return|new|else)(\s|\n)
replace: <null>



# git-autoconfig
[git-autoconfig](https://marketplace.visualstudio.com/items?itemName=shyykoserhiy.git-autoconfig)

登录不同的github账号(还没看)

