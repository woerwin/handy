define(function(require, exports, module) {
    var $ = require('$');
    var Position = require('position');


    // target 是需要添加垫片的目标元素，可以传 `DOM Element` 或 `Selector`
    function Shim(target) {
        // 如果选择器选了多个 DOM，则只取第一个
        this.target = $(target).eq(0);
    }


    // 根据目标元素计算 div 的显隐、宽高、定位
    Shim.prototype.sync = function() {
        var target = this.target;
        var shim = this.shim;

        var height = target[0].offsetHeight;
        var width = target[0].offsetWidth;

        // 如果目标元素隐藏，则 div 也隐藏
        // jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
        // http://api.jquery.com/hidden-selector/
        if (!height || !width || target.css('display') === 'none') {
            shim && shim.css('none');
        } else {
            // 第一次显示时才创建：as lazy as possible
            shim || (shim = this.shim = createShim());

            shim.css({
                'height': height,
                'width': width,
                'zIndex': parseInt(target.css('zIndex'),10) - 1 || 1
            });

            Position.pin(shim[0], target[0]);
            shim.css('display','block');
        }

        return this;
    };


    // 销毁 div 等
    Shim.prototype.destroy = function() {
        if (this.shim) {
            this.shim.remove();
            delete this.shim;
        }
        delete this.target;
    };

    if ($.os.android) {
        module.exports = Shim;
    } else {
        // 非 Android 都返回空函数
        function Noop() {
        }

        Noop.prototype.sync = Noop;
        Noop.prototype.destroy = Noop;

        module.exports = Noop;
    }

    // Helpers
    function createShim() {
        return $('<div>').css({
            display: 'none',
            border: 'none',
            background: 'rgba(255,255,255,0.01)',
            '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
            position: 'absolute',
            left: 0,
            top: 0 ,
            padding: 0,
            margin: 0
        }).appendTo(document.querySelector('body'));
    }
});
