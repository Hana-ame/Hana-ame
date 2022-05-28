Data Science from Scratch 
<!-- []() -->
<a href="file:///C:/Users/lumin/Downloads/%E6%95%B0%E6%8D%AE%E7%A7%91%E5%AD%A6%E5%85%A5%E9%97%A8.pdf">pdf(本地)</a>

动物书

用的是比较旧的python2.7。

# 1

# 2
Python

```
tweet -> dict

tweet_keys = tweet.keys() # 键的列表 
tweet_values = tweet.values() # 值的列表
tweet_items = tweet.items() # （键, 值）元组的列表
```
```
word_counts -> dict
word_counts.get(word, 0) # getOrDefault
```
```
from collections import defaultdict
word_counts = defaultdict(int) # int()生成0
for word in document:
 word_counts[word] += 1
```
```
for i, _ in enumerate(documents): do_something(i)
```
```
list1 = ['a', 'b', 'c'] 
list2 = [1, 2, 3] 
zip(list1, list2) # 是[('a', 1), ('b', 2), ('c', 3)]

pairs = [('a', 1), ('b', 2), ('c', 3)] 
letters, numbers = zip(*pairs)
相当于 zip(('a', 1), ('b', 2), ('c', 3))
它返回 [('a','b','c')，('1','2','3')]
```
我们所需要的是一种指定一个可以取任意参数的函数的方法，利用参数拆分和一点点魔法
就可以做到这一点：
```
def magic(*args, **kwargs): 
 print "unnamed args:", args 
 print "keyword args:", kwargs 
magic(1, 2, key="word", key2="word2") 

# 输出
# 未命名args: (1, 2) 
# 关键词args: {'key2': 'word2', 'key': 'word'}
```