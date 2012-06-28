// Storage
// =======
// 提供一个本地数据存储机制。
define("#storage/0.9.0/storage-debug", ["#events/0.9.1/events-debug"], function(require, exports, module) {
    var Events = require("#events/0.9.1/events-debug"),
        Storage = exports,
        keys = [],
        L = null,
        S = null;

    Events.mixTo(Storage);

    Storage.available = !!(localStorage || sessionStorage);

    if (Storage.available) {
        L = localStorage;
        S = sessionStorage;
    }

    // 存储一条数据。
    // 目前仅支持存储 String 类型的数剧。
    Storage.set = function(key, value) {
        if(L.getItem('keys')){
            keys = L.getItem('keys').split(',') || [];
        }

        if (keys.indexOf(key) === -1) {
            var _keys = Storage.keys();
            _keys.push(key);
            L.setItem('keys',_keys);
        }

        if (Storage.available) {
            if (value === null) {
                return Storage.remove(key);
            }
            L.setItem(key, value);
        }
    };

    // 通过指定的 `key` 获取一条数据并返回。
    // return String data
    Storage.get = function(key) {
        return L.getItem(key);
    };

    // 获取所有通过 `Storage` 存储的字段，并返回。
    // return Array data
    Storage.keys = function() {
        var keys = L.getItem('keys');
        return  keys ? keys.split(',') : [];
    };

    // 通过指定的 `key` 删除的数据
    Storage.remove = function(key) {
        var k = key,
            _keys = Storage.keys();

        Storage.trigger('remove:' + key, {
            key: k
        });

        L.removeItem(k);

        _keys.forEach(function(key, i) {
            if (key === k) {
                _keys.splice(i, 1);
                return false;
            }
        });

        L.setItem('keys',_keys);
    };

    // 清除所有已存储的数据
    // 请注意不是清除 `localStorage` 下的所有数据
    // 而是清除通过 `Storage` 单例存储的所有数据
    Storage.clear = function() {
        var _keys = Storage.keys();
        _keys.forEach(function(k) {
            L.removeItem(k);
        });
        L.removeItem('keys');

        Storage.trigger('clear');
    };

    window.addEventListener('storage', function(e) {
        var keys = Storage.keys(),
            key = e.key;
        if (keys.indexOf(key) !== -1) {
            Storage.trigger('change:' + key, e);
        }

        if (e.newValue === 'null') {
            Storage.Key(key);
        }
    },false);
});
