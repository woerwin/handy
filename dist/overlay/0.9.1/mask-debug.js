define("#overlay/0.9.1/mask-debug", ["#zepto/0.9.0/zepto-debug", "#overlay/0.9.1/overlay-debug", "#position/0.9.0/position-debug", "#android-shim/0.9.0/android-shim-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug"], function(require, exports, module) {

    var $ = require("#zepto/0.9.0/zepto-debug"),
        Overlay = require("#overlay/0.9.1/overlay-debug");


    // Mask
    // ----------
    // 全屏遮罩层组件

    var Mask = Overlay.extend({

        attrs: {
            width: '100%',
            height: '100%',

            className: 'ui-mask',
            style: {
                backgroundColor: 'rgba(0,0,0,.2)',
                position: 'absolute'
            },

            align: {
                // undefined 表示相对于当前可视范围定位
                baseElement: null
            }
        },

        show: function() {
            return Mask.superclass.show.call(this);
        },

        _onRenderBackgroundColor: function(val) {
            this.element.css('backgroundColor', val);
        }
    });

    // 单例
    module.exports = Mask;

});
