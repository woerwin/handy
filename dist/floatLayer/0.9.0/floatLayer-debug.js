// floatLayer
// =======
// 提供层的浮动、固定功能
define("#floatLayer/0.9.0/floatLayer-debug", ["overlay"], function(require, exports, module) {
    var Overlay = require('overlay');

    // thanks to http://cubiq.org/followalong
    var followAlong = function (el, options) {
            var that = this,
                i;

            // Default options
            that.options = {
                duration: '100ms'
            };

            // User defined options
            if (typeof options == 'object') {
                for (i in options) {
                    that.options[i] = options[i];
                }
            }

            that.element = typeof el == 'object' ? el : document.querySelector(el);
            that.element.style.webkitTransitionProperty = '-webkit-transform';
            that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
            that.element.style.webkitTransitionDuration = that.element.style.webkitTransitionDuration = that.options.duration;
            that.element.style.webkitTransform = translateOpen + '0,0' + translateClose;

            el = that.element;
            that.x1 = that.x2 = that.y1 = that.y2 = 0;
            do {
                that.x1 += el.offsetLeft;
                that.y1 += el.offsetTop;
            } while (el = el.offsetParent);

            that.x2 = that.x1 + that.element.offsetWidth;
            that.y2 = that.y1 + that.element.offsetHeight;

            setTimeout(function () {
                that.follow();
            }, 0);

            window.addEventListener('scroll', that, false);
        },
        has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
        translateOpen = 'translate' + (has3d ? '3d(' : '('),
        translateClose = has3d ? ',0)' : ')';


    followAlong.prototype = {
        handleEvent: function (e) {
            if (e.type == 'scroll') {
                this.follow(e);
            }
        },

        follow: function (e) {
            var that = this,
                scrollX = window.scrollX,
                scrollY = window.scrollY;

            if (window.scrollX > that.x1 || window.scrollY > that.y1) {
                that.element.className = that.element.className ? that.element.className + ' float' : 'float';
                that.element.style.left = that.x1 + 'px';
                that.element.style.top = that.y1 + 'px';
                that.element.style.webkitTransform = translateOpen + scrollX + 'px,' + scrollY + 'px' + translateClose;
            } else {
                that.element.style.webkitTransform = translateOpen + '0,0' + translateClose;
                that.element.className = that.element.className.replace(/(^|\\s)float(\\s|$)/gi, '');
                that.element.style.left = '';
                that.element.style.top = '';
            }
        }
    }

    module.exports = followAlong;
});
