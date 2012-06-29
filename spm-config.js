// arale alias 
define({
    alias: {
        // 外部
        '$': 'zepto/0.9.0/zepto',
        'handlebars': 'handlebars/1.0.0/handlebars',
        'backbone': 'backbone/0.9.2/backbone',
        'jasmine': 'jasmine/1.1.0/jasmine-html',
        'events': 'events/0.9.1/events',                     // 100%
        'class': 'class/0.9.2/class',                        // 100%
        'base': 'base/0.9.15/base',                          // 95%
        'widget': 'widget/0.9.16/widget-mobile',                    // 95%
        'templatable': 'widget/0.9.15/templatable-mobile',          // 95%
        'daparser': 'widget/0.9.15/daparser-mobile',
        'iscroll': 'iscroll/4.1.9/iscroll',

         // handy
        'android-shim': 'android-shim/0.9.0/android-shim',
        'baseDialog': 'dialog/0.9.0/baseDialog',
        'animDialog': 'dialog/0.9.0/animDialog',
        'flip': 'flip/0.9.0/flip',
        'floatLayer': 'floatLayer/0.9.0/floatLayer',
        'overlay': 'overlay/0.9.1/overlay',
        'network': 'network/0.9.0/network',
        'pageTransition': 'pageTransition/0.9.1/pageTransition',
        'parser': 'parser/0.9.0/parser',
        'position': 'position/0.9.0/position',
        'storage': 'storage/0.9.0/storage',
        'tabs': 'switchable/0.9.5/tabs',
        'accordion': 'switchable/0.9.5/accordion',
        'slide': 'switchable/0.9.5/slide',
        'carousel': 'switchable/0.9.5/carousel'
    },
    preload: [this.JSON ? '' : 'json', 'plugin-text']
});
