
### 绑定

```vue
<tag :[attr]="[exp]">

<!-- same as -->
<tag v-bind:[attr]="[exp]">
```

双向绑定
```vue
<tag v-model="[exp]">
```

是个语法糖，还原为
```vue

```

```vue
// templete
<tag v-on:click="[exp]">
<tag @click="[exp]">

// script
function [exp](event) {}
```

传值的情况

```vue
// templete
<tag @click="[exp](value)">

// script
function [exp](value) {}

// if need event
// templete
<tag @click="[exp]($event, value)">

// script
function [exp](event, value) {}
```


### v-for v-if
先运行v-for
```vue
// templete
<tag v-for="[exp]" v-if="[exp]">
```
传递事件