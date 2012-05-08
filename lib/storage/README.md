#Storage
提供一套移动平台数据存储解决方案

##模块依赖
- [event](http://github.com/alipay/arale/tree/master/lib/events)

##使用说明
`storage` 是一个单例，可直接使用

```js
define(function (require,exports,module){
    var storage = require('storage');
});
```
###available属性 `storage.available`
`available`返回Boolean，如果浏览器支持`localStorage`或`sessionStorage`返回`true`，否则返回`false`

```js
define(function (require){
  var storage = require('storage');
  if(storage.available){
      //...
  }else{
      //...
  }
});
```

###set方法 `storage.set(key,value)`

存储一条数据

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
});
```
上面的代码将通过localStorage向本地存储一条key为name，value为handy的数据，

`storage`当前只允许存储`String`数据。

###get方法 `storage.get(key)`

通过指定的key获取一条数据

`get`方法返回一条数据

```js
define(function (require){
    var storage = require('storage');
    var name = storage.get('name');
});
```
###getKeys方法 `storage.getKeys()`

返回通过`storage`保存的所有key

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
    storage.set('version','0.9.0');
    
    var keys = storage.getKeys();//['name','version']
});
```
###deleteKey方法 `storage.deleteKey(key)`
删除指定的key及key对应的value

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
    storage.set('version','0.9.0');
    
    storage.getKeys();//['name','version'];
    storage.deleteKey('version');
    storage.getKeys();//['name'];
});
```
`deleteKey`方法调用时会触发`storage.on(key:delete)`事件

###clearAll方法 `storage.clearAll()`
清除通过`storage`存储的所有数据

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
    storage.set('version','0.9.0');
    
    storage.getKeys();//['name','version'];
    storage.clearAll();
    storage.getKeys();//[]
});
```
值得注意`clearAll`只清除通过`storage`存储的数据，并不是指清除`localStorage`和`sessionStorage`对象中的所有数据
`clearAll`方法调用时会触发`storage.on('clearAll')`事件

###`storage`混入了`event`模块，因此它也有一套自定义事件机制。

###监听某条数据被修改 `storage.on(key:change,callback)`

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
    storage.on('name:change',function (e){
        alert('有人修改了'+e.key);
        alert(e.key+'之前的数据是：'+e.oldValue);
        alert(e.key+'修改后的数据是：'+e.newValue);
    });
});
```
如果要尝试`storage.on`，你需要打开两个浏览器窗口(A,B)，在A窗口保存一条数据，在B窗口修改A窗口所保存的数据(请注意一定要修改同名的key)

###监听某条数据被删除 `storage.on(key:delete,callback)`

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
    storage.on('name:delete',function (e){
        alert('有人修改了'+e.key);
    });
});
```
###监听`storage`保存的所有数据被清除 `storage.on('clearAll',callback)`

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
    storage.on('clearAll',function (e){
        alert('您通过storage保存的数据被全部清除。');
    });
});
```