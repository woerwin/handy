#Storage
提供一套移动平台浏览器端数据存储解决方案

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
`available` 返回 Boolean，如果浏览器支持 `localStorage` 或 `sessionStorage` 返回 `true`，否则返回 `false`。

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
上面的代码将通过 localStorage 向本地存储一条 key 为 name，value 为 handy 的数据，

`Storage` 当前只允许存储 `String` 数据。

当 `value` 参数为 null 时，`Storage` 会调用 `remove` 方法

###get `Storage.get(key)`

通过指定的 `key` 获取一条数据

`get` 方法返回一条数据

```js
define(function (require){
    var Storage = require('storage');
    var name = Storage.get('name'); // handy
});
```
###keys `Storage.keys()`

返回通过 `Storage` 保存的所有 key. Array 类型

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.set('version','0.9.0');
    
    var keys = Storage.keys();//['name','version']
});
```
###remove `Storage.remove(key)`
删除指定的 key 及 key 对应的 value

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
`remove` 方法调用时会触发 `Storage.on(key:remove)` 事件

###clear `Storage.clear()`
清除通过 `Storage` 存储的所有数据

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
值得注意 `clear` 只清除通过 `Storage` 存储的数据，并不是指清除 `localStorage` 和 `sessionStorage` 对象中的所有数据
`clear` 方法调用时会触发 `Storage.on('clear')` 事件

###`Storage` 混入了 [`event`](http://github.com/alipay/arale/tree/master/lib/events) 模块，因此有一套自定义事件机制。

###监听某条数据被修改 `Storage.on(key:change,callback)`

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.on('name:change',function (e){
        alert('有人修改了'+e.key);
        alert(e.key+'之前的数据是：'+e.oldValue);
        alert(e.key+'修改后的数据是：'+e.newValue);
    });
});
```
如果要尝试 `Storage.on`，你需要打开两个浏览器窗口 (A,B)，在 A 窗口保存一条数据，在 B 窗口修改 A 窗口所保存的数据(请注意一定要修改同名的 key )

###监听某条数据被删除 `Storage.on(key:remove,callback)`

```js
define(function (require){
    var Storage = require('storage');
    Storage.set('name','handy');
    Storage.on('name:remove',function (e){
        alert('有人修改了'+e.key);
    });
});
```
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