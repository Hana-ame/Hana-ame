# text board


```
/timeline/local
/timeline/fedi

/board/[boardName]
/board/[boardName@example.com]

```
board所具有属性
|||
|---|---|
|visibility| public / private|

当文中出现 #[tagName] 时，列入tag当中
```
/tag/[tagName]
```
设置一个公用账，以转嘟的方式进行收集。



当文中出现 @[userId] 时，相当于提起
```
/user/[userId]
```



一条回复的对应

|匿名版|毛象|键值|注释|
|---|---|---|---|
|无标题|cw|cw|text，作为cw文字使用|
|无名氏|昵称|dn|text，作为用户昵称使用|
|ID|userId|uid|text，作为用户登录id使用|
|内容|正文|content|text，储存正文|

其中不在外部显示的内容
|匿名版|毛象|键值|注释|
|---|---|---|---|
|No.id|时间戳(?)|id|唯一标识，主键，int？|
|回复id|回复id(?)|rid|标志回复了某条|
|timestamp|timestamp|ts|时间戳|



板块

|||||
|---|---|---|---|
|板块名称|
|id|主串的|
|回复数量|
|最后回复时间|

hashtag

|||||
|---|---|---|---|
|tag名称|
|id|回复或者主串的|
|回复数量|
|最后回复时间|

