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
###set `storage.set(key,value)`

存储一条数据

```js
define(function (require){
    var storage = require('storage');
    storage.set('name','handy');
});
```
上面的代码将通过localStorage向本地存储一条key为name，value为handy的数据，

`storage`当前只允许存储`String`数据。