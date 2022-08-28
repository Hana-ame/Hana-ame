大概用python(或者node.js?)
* 需要proxy设置

api确认可用
```
https://[host]/api/v1/statuses/${id}/favourited_by
https://mastodon.example/api/v1/statuses/:id/reblogged_by
```

api确认时间，刷新后

  * json合并
  * xml合并
  * delete标志，新20个在合并时出现问题


抓取rss内容
本地取出相同长度的内容
标记rss中能找到的内容
未标记的部分为新post，


* sqlite？或者是纯文本

addition
* 时间跳转
* 单人出列
* 多列切换


https://docs.joinmastodon.org/dev/routes/
https://www.rubydoc.info/gems/mastodon-api/Mastodon%2FREST%2FStatuses:reblogged_by