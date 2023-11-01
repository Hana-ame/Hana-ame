# notes

## scrap notes

**TODO**
idk..

## swagger

```sh
git checkout learn/go/swagger
```

## git

notes for git

```sh
git checkout git
```

[ref](https://medium.com/@nightheronry/how-to-add-and-update-git-submodules-dc1ba035e63b#:~:text=In%20order%20to%20update%20an,the%20%E2%80%9C%E2%80%93merge%E2%80%9D%20option.&text=Using%20the%20%E2%80%9C%E2%80%93remote%E2%80%9D%20command,each%20submodule%20of%20your%20project.)

## merge

```sh
git merge [branch]
```

手动merge

```sh
git merge --no-commit --no-ff merge_branch
```

[ref](https://stackoverflow.com/questions/4657009/how-to-merge-all-files-manually-in-git)

试了一下其实是可以自动merge到文件夹里面的，不过可能要加一个预备merge，现在试试看。
需要一步额外的重命名。
设想的只merge某些文件可能还是有点大病。整个project merge过去好像是没啥问题是说？
要保持目录结构，很烦。

## 删除分支

```sh
git branch -d [branch]

git push origin --delete [branch]
git push origin :[branch]
```