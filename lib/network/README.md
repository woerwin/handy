#Network
提供移动平台的网络在线，离线的监听

##平台兼容性
- windows phone 7 IE 在切换网络状态时无法更新网络连接状态

##使用说明
`Network` 是一个单例，可直接使用

```js
define(function (require){
    var Network = require('network');
});
```

###online `Network.online(callback)`
网络连接时调用
```js
define(function (require){
    var Network = require('network');
    Network.online(function (){
        console.log('online');
    });
});
```
每次调用 `Network.online` ，`Network` 都会保存传入的 callback，网络状态发生改变时，执行 `callback` 对列
```js
define(function (require){
    var Network = require('network');
    Network.online(function (){
        console.log('online');
    });
    Network.online(function (){
        document.querySelector('#J-network-tip').style.display = 'none';
    });
});
```
上面的代码，在网络连接时，将依次执行 `console.log('online')` `document.querySelector('#J-network-tip').style.display = 'none';`

###offline  `Network.offline(callback)`
网络断开时调用
```js
define(function (require){
    var Network = require('network');
    Network.offline(function (){
        console.log('offline');
    });
});
```
每次调用 `Network.offline` ，`Network` 都会保存传入的 callback，网络状态发生改变时，执行 `callback` 对列
```js
define(function (require){
    var Network = require('network');
    Network.offline(function (){
        console.log('offline');
    });
    Network.offline(function (){
        document.querySelector('#J-network-tip').style.display = 'none';
    });
});
```
上面的代码，在网络断开时，将依次执行 `console.log('offline')` `document.querySelector('#J-network-tip').style.display = 'none';`

###destroy `Network.destroy()`
销毁 Network 的生命周期
```js
define(function (require){
    var Network = require('network');
    Network.online(function (){
        console.log('online')
    });
    Network.offline(function (){
        console.log('offline');
    });
    Network.destroy();
});
```
每 `require('network')` 一次 `Network` 将自动运行一个函数递归 (setTimeout)，每 200 毫秒递归查询一次网络状态的变化，
如果您的某块业务不需要 `Network` 递归查询，或者您的 webapp 需要退出的话，您应该调用 `Network.destroy()`

###测试用例
- [runner.html](../lib/network/tests/runner.html)

###演示地址
- [Demo](../lib/network/examples/network.html)

###后续需补充的
-    **兼容到 Phonegap 的 navigator.connection,用于检测当前的网络连接类型：WIFI,2G,3G,none**

     `Network` 当前只能检测到连接状态，还不能获取网络连接类型，如果通过中间件 (Phonegap) 是可以获取到网络连接类型

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈