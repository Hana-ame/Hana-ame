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

## submodule

```sh
git submodule add ssh://root@144.34.219.146:26275/srv/notes
```

## remote 

delete branch

```sh
git push origin --delete [branch]
```