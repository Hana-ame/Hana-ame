# swagger

gin + swagger

Aim:
- make swagger work
  - record the workflow

# log

follow https://github.com/swaggo/gin-swagger

inital go mod
```sh
go mod init github.com/Hana-ame/Hana-ame/swagger
```

install gin
install swag
```sh
go get -u github.com/gin-gonic/gin
go get -u github.com/swaggo/swag/cmd/swag
```

*optional: see the manual*
```sh
swag -h
```
[more info (with chinese)](https://github.com/swaggo/swag/blob/master/README_zh-CN.md#swag-cli)

initial swag
(should at least have one `.go` file)
```sh 
swag init
```

download the gin-swagger 
```sh
go get -u github.com/swaggo/gin-swagger
go get -u github.com/swaggo/files
```

milestone:
settings are done.

note: find [go-project-name] in `go.mod` (for this project, it's `module github.com/Hana-ame/Hana-ame/swagger`)

**note: now add the notions before the code.**
every time changed the code, run `swag i` again

http://localhost:8080/api/v1/example/helloworld
which works well

http://localhost:8080/swagger/index.html#/example
should add `index.html`

**KNOWN ISSUE: if changed `// @BasePath /api`, the website will not follow.**

in general
[通用api信息](https://github.com/swaggo/swag/blob/master/README_zh-CN.md#%E9%80%9A%E7%94%A8api%E4%BF%A1%E6%81%AF)

api
[api操作](https://github.com/swaggo/swag/blob/master/README_zh-CN.md#api%E6%93%8D%E4%BD%9C)

TODO:
- POST params
- ...