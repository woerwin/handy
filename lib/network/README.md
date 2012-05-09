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
每次调用 `Network.online` ，`Network` 都会保存传入的callback，网络状态发生改变时，执行 `callback` 对列
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