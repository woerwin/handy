#Storage
提供移动设备浏览器端数据存储解决方案

##模块依赖
- [event](http://github.com/alipay/arale/tree/master/lib/events)

##平台兼容
- UC 浏览器 7.9+
  
  部分 UC U3 内核的浏览器对 `Storage` 事件支持存在怪异(有时不能触发 change event)

##使用说明
`Storage` 是一个单例，可直接使用

```js
define(function (require,exports,module){
    var Storage = require('storage');
});
```
###available `Storage.available`
`available` 返回 Boolean，如果浏览器支持 localStorage 或 sessionStorage 返回 true，否则返回 false。

```js
define(function (require){
  var Storage = require('storage');
  if(Storage.available){
      //...
  }else{
      //...
  }
});
```

###set `Storage.set(key,value)`

存储一条数据

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
});
```
上面的代码在本地存储一条 key 为 name，value 为 handy 的数据，

`Storage` 当前只允许存储 String 类型的数据。

当 value 参数为 null 时，自动调用 `remove` 方法

###get `Storage.get(key)`

通过指定的 `key` 获取一条 String 类型的数据

```js
define(function (require){
    var Storage = require('storage');
    var name = Storage.get('name'); // handy
});
```
###keys `Storage.keys()`

返回已存储的所有 key, Array 类型

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.set('version','0.9.0');
    
    var keys = Storage.keys();//['name','version']
});
```
###remove `Storage.remove(key)`
通过指定的 key 删除对应的数据

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.set('version','0.9.0');
    
    Storage.keys();//['name','version'];
    Storage.remove('version');
    Storage.keys();//['name'];
});
```
`remove` 方法调用时会触发 [`Storage.on(remove:key)`](#removeEvent) 事件

###clear `Storage.clear()`
清除已存储的所有数据

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.set('version','0.9.0');
    
    Storage.keys();//['name','version'];
    Storage.clear();
    Storage.keys();//[]
});
```
值得注意 `clear` 只清除通过 `Storage` 存储的数据，并不是清除 `localStorage` 和 `sessionStorage` 对象中的所有数据
`clear` 方法调用时会触发 [`Storage.on('clear')`](#clearEvent) 事件

###`Storage` 混入了 [`event`](http://github.com/alipay/arale/tree/master/lib/events) 模块，因此它也有一套自定义事件机制。

###监听某条数据被修改 `Storage.on(change:key,callback)`

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.on('change:name',function (e){
        alert('有人修改了'+e.key);
        alert(e.key+'之前的数据是：'+e.oldValue);
        alert(e.key+'修改后的数据是：'+e.newValue);
    });
});
```
如果要测试 `Storage` 的回调事件，你需要打开两个浏览器窗口 (A,B)，在 A 窗口保存一条数据，在 B 窗口修改 A 窗口保存的数据(请注意一定要修改同名的 key )
<a name="removeEvent"></a>
###监听某条数据被删除 `Storage.on(remove:key,callback)`

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.on('remove:name',function (e){
        alert('有人修改了'+e.key);
    });
});
```
<a name="clearEvent"></a>
###监听 `Storage` 保存的所有数据被清除 `Storage.on('clear',callback)`

```js
define(function (requirze){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.on('clear',function (e){
        alert('您通过Storage保存的数据被全部清除。');
    });
});
```
##测试用例
- [runner.html](../lib/storage/tests/runner.html)

##演示地址
- [Demo](../lib/storage/examples/storage.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈