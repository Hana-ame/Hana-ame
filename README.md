# git 笔记

## 基础

待补完

## submodule

添加

```sh
git submodule add https://github.com/project/project.git vendors
```

更新

```sh
git submodule update --remote --merge
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