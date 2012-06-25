// floatLayer
// =======
// 提供层的浮动、固定功能
define(function(require, exports, module) {
    // thanks to http://cubiq.org/followalong
    var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
        translateOpen = 'translate' + (has3d ? '3d(' : '('),
        translateClose = has3d ? ',0)' : ')';

    function FloatLayer(options) {
            var self = this,
                i;

            // Default options
            self.options = {
                duration: '100'
            };

            // User defined options
            if (typeof options == 'object') {
                for (i in options) {
                    self.options[i] = options[i];
                }
            }

            var el = options['element'];
            var el = typeof el == 'object' ? el : document.querySelector(el),
                dur = el.style.webkitTransitionDuration;

            el.style.webkitTransitionProperty = '-webkit-transform';
            el.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,.25,1)';
            el.style.webkitTransitionDuration=dur=self.options.duration + 'ms';
            el.style.webkitTransform = translateOpen + '0,0' + translateClose;

            self.element = el;

            self.x1 = self.x2 = self.y1 = self.y2 = 0;

            do {
                self.x1 += el.offsetLeft;
                self.y1 += el.offsetTop;
            } while (el = el.offsetParent);

            setTimeout(function() {
                self.sync();
            }, 0);

            window.addEventListener('scroll', self, false);
        }

    FloatLayer.prototype = {
        handleEvent: function(e) {
            if (e.type == 'scroll') {
                this.sync(e);
            }
        },

        sync: function() {
            var self = this,
                scrollX = window.scrollX,
                scrollY = window.scrollY,
                el = self.element,
                transform;

            if (window.scrollX > self.x1 || window.scrollY > self.y1) {
                el.style.left = self.x1 + 'px';
                el.style.top = self.y1 + 'px';

                transform = translateOpen + scrollX + 'px,'
                                + scrollY + 'px' + translateClose;
            } else {
                transform = translateOpen + '0,0' + translateClose;
                el.style.left = '';
                el.style.top = '';
            }

            el.style.webkitTransform = transform;
        }
    };

    module.exports = FloatLayer;
});
