define("#switchable/0.9.5/plugins/autoplay-debug", ["$"], function(require, exports, module) {

    var $ = require('$');


    // 自动播放插件
    module.exports = {

        attrs: {
            autoplay: true,

            // 自动播放的间隔时间
            interval: 5000
        },

        isNeeded: function() {
            return this.get('autoplay');
        },

        install: function() {
            var element = this.element;
            var EVENT_NS = '.' + this.cid;
            var timer;
            var interval = this.get('interval');
            var that = this;

            // start autoplay
            start();

            function start() {
                // 停止之前的
                stop();

                // 设置状态
                that.paused = false;

                // 开始现在的
                timer = setInterval(function() {
                    if (that.paused) return;
                    that.next();
                }, interval);
            }

            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
                that.paused = true;
            }

            // public api
            this.stop = stop;
            this.start = start;
        },

        destroy: function() {
            var EVENT_NS = '.' + this.cid;
            this.stop();
        }
    };


    // Helpers
    // -------


    function throttle(fn, ms) {
        ms = ms || 200;
        var throttleTimer;

        function f() {
            f.stop();
            throttleTimer = setTimeout(fn, ms);
        }

        f.stop = function() {
            if (throttleTimer) {
                clearTimeout(throttleTimer);
                throttleTimer = 0;
            }
        };

        return f;
    }
});
