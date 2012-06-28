define("#switchable/0.9.5/slide-debug", ["#switchable/0.9.5/switchable-debug", "#zepto/1.0.0/zepto-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug", "#switchable/0.9.5/const-debug", "#switchable/0.9.5/plugins/effects-debug", "#switchable/0.9.5/plugins/autoplay-debug", "#switchable/0.9.5/plugins/circular-debug", "#switchable/0.9.5/plugins/multiple-debug"], function(require, exports, module) {
    var Switchable = require("#switchable/0.9.5/switchable-debug");

    // 卡盘轮播组件
    module.exports = Switchable.extend({
        attrs: {
            autoplay: true,
            circular: true
        }
    });
});
