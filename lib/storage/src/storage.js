/**
 * @fileOverview 提供一个本地数据存储机制
 * @author &lt;a href="http://qiqicartoon.com"&gt;颂赞&lt;/a&gt;
 */
define(function (require,exports,module){
    var Events = require('events'),
        Storage = {},
        keys = [],
        L = null,
        S = null;

    Events.mixTo(Storage);

    Storage.available = localStorage || sessionStorage ? true : false;

    if(Storage.available){
        L = localStorage;
        S = sessionStorage;
    }

    Storage.set = function (key,value){
        if(keys.indexOf(key) === -1){
            keys.push(key);
        }

        if(Storage.available){
            if(value === null){
                return Storage.deleteKey(key);
            }
            L.setItem(key,value);
        }
    };

    /**
     * 通过指定的key获取一条数据
     * @param {String} key
     * @return {Object}
     */
    Storage.get = function (key){
        var data = L.getItem(key);
        return data;
    };

    /**
     * 获取所有存储的字段
     * @return {Array}
     */
    Storage.getKeys = function (){
        return keys;
    };

    /**
     * 删除指定的数据
     * @param {String} key
     */
    Storage.deleteKey = function (key){
        var k = key,
            _keys = Storage.getKeys();

        Storage.trigger(key+':delete',{
            key: k
        });

        L.setItem(k,null);
        L.removeItem(k);

        _keys.forEach(function (key,i){
            if(key === k){
                _keys.splice(i,1);
                return false;
            }
        });
        keys = _keys;
    };

    Storage.clearAll = function (){
        var _keys = Storage.getKeys();
        _keys.forEach(function (k){
            L.setItem(k,null);
            L.removeItem(k);
        });
        keys = [];

        Storage.trigger('clearAll');
    };

    window.addEventListener('storage',function (e){
        var keys = Storage.getKeys(),
            key = e.key;
        if(keys.indexOf(key) !== -1){
            Storage.trigger(key+':change',e);
        }

        if(e.newValue === 'null'){
            Storage.deleteKey(key);
        }
    },false);

    return Storage;
});
