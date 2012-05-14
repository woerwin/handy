// Storage
// =======
// 提供一个本地数据存储机制。
define(function(require, exports, module) {
    var Events = require('events'),
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
    // 目前仅支持存储String类型的数剧。
    // `key`
    // `value`
    Storage.set = function(key, value) {
        if (keys.indexOf(key) === -1) {
            keys.push(key);
        }

        if (Storage.available) {
            if (value === null) {
                return Storage.remove(key);
            }
            L.setItem(key, value);
        }
    };

    // 通过指定的 `key` 获取一条数据并返回。
    Storage.get = function(key) {
        return L.getItem(key);
    };

    // 获取所有通过 `Storage` 存储的字段，并返回。
    Storage.keys = function() {
        return keys;
    };

    // 通过指定的 `key` 删除的数据
    Storage.remove = function(key) {
        var k = key,
            _keys = Storage.keys();

        Storage.trigger(key + ':delete', {
            key: k
        });

        L.setItem(k, null);
        L.removeItem(k);

        _keys.forEach(function(key, i) {
            if (key === k) {
                _keys.splice(i, 1);
                return false;
            }
        });
        keys = _keys;
    };

    // 清除所有已存储的数据
    // 请注意不是清除 `localStorage` 下的所有数据，而是清除通过 `Storage` 单例存储的所有数据
    Storage.clear = function() {
        var _keys = Storage.keys();
        _keys.forEach(function(k) {
            L.setItem(k, null);
            L.removeItem(k);
        });
        keys = [];

        Storage.trigger('clear');
    };

    window.addEventListener('storage', function(e) {
        var keys = Storage.keys(),
            key = e.key;
        if (keys.indexOf(key) !== -1) {
            Storage.trigger(key + ':change', e);
        }

        if (e.newValue === 'null') {
            Storage.Key(key);
        }
    },false);
});
