# git, shell, ssh and key

- generate public keys from private keys

```sh
ssh-keygen -y -f id_rsa > id_rsa.pub # not sure though
```

- add publickey to github.com

github.com > settings > ssh (or something)

- for clone from github.com for the first time

```sh
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
```

or type "yes"

## submodule

```sh
git submodule add ssh://root@144.34.219.146:26275/srv/notes
```

need to run

```sh
git submodule init
git submodule update
```

TODO: something unsolved
when edited submodules, how to sync them.

## remote 

delete branch

```sh
git push origin --delete [branch]
```
<<<<<<< HEAD:git.md
=======

would not delete the local branch automatically

```sh
git branch -d feature/login
```
>>>>>>> git:use ssh.md
