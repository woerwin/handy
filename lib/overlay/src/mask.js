define(function(require, exports, module) {

    var $ = require('$'),
        Overlay = require('./overlay');


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
