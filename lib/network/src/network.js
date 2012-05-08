// Networks 提供了移动平台的在线，离线的监听
// [颂赞](http://qiqicartoon.com)
define(function (require,exports,module){
    var Events = require('events'),
        Network = exports,
        loopFn = null,
        status = null,
        onlineSwitch = null,
        offlineSwitch = null;

    Events.mixTo(Network);

    Network.start = function (){
        if(loopFn){return;}

        loopFn = setInterval(function (){
            status = !!navigator.onLine;

            switch(status){
                case true:
                    !onlineSwitch ? Network.trigger('online') : '';
                    onlineSwitch = true;
                    offlineSwitch = false;
                break;
                case false:
                    !offlineSwitch ? Network.trigger('offline') : '';
                    offlineSwitch = true;
                    onlineSwitch = false;
                break;
            }
        },200);
    };

    Network.stop = function (){
        clearInterval(loopFn);
        loopFn = null;
    };
});