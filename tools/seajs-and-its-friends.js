
// load sea.js
(function(m, o, d, u, l, a, r) {
    if(m[d]) return;
    function f(n, t) { return function() { r.push(n, arguments); return t; } }
    m[d] = a = { args: (r = []), config: f(0, a), use: f(1, a) };
    m.define = f(2);
    u = o.createElement('script');
    u.id = d + 'node';
    u.src = '/handy/dist/seajs/1.1.9/sea.js';
    l = o.getElementsByTagName('head')[0];
    l.insertBefore(u, l.firstChild);
})(window, document, 'seajs');


// and its friends
seajs.config({

    alias: {


        '$': 'zepto/0.9.0/zepto',
        'handlebars': 'handlebars/1.0.0/handlebars',
        'backbone': 'backbone/0.9.2/backbone',
        'jasmine': 'jasmine/1.1.0/jasmine-html',
        'events': 'events/0.9.1/events',                     // 100%
        'class': 'class/0.9.2/class',                        // 100%
        'base': 'base/0.9.15/base',                          // 95%
        'widget': 'widget/0.9.16/widget-mobile',                    // 95%
        'templatable': 'widget/0.9.15/templatable-mobile',          // 95%
        'daparser': 'widget/0.9.15/daparser-mobile',                // 95%
        'iscroll': 'iscroll/4.1.9/iscroll',

        // Utilities
        'android-shim': 'android-shim/0.9.0/android-shim',      // 95%
        'position': 'position/0.9.0/position',               // 95%

        // Widgets
        'overlay': 'overlay/0.9.1/overlay',                  // 95%
        'mask': 'overlay/0.9.1/mask',                        // 95%
        'baseDialog': 'dialog/0.9.0/baseDialog',             // 70%
        'animDialog': 'dialog/0.9.0/animDialog',             // 70%
        'switchable': 'switchable/0.9.5/switchable',         // 90%
        'tabs': 'switchable/0.9.5/tabs',                     // 90%
        'slide': 'switchable/0.9.5/slide',                   // 90%
        'accordion': 'switchable/0.9.5/accordion',           // 90%
        'carousel': 'switchable/0.9.5/carousel',             // 90%
        'flip': 'flip/0.9.5/flip',             // 90%
        'parser': 'parser/0.9.0/parser',
        'pageTransition': 'pageTransition/0.9.1/pageTransition',
        'storage': 'storage/0.9.0/storage',
        'scrollView': 'scrollView/0.9.2/scrollView',
        'network': 'network/0.9.0/network',
        'floatLayer': 'floatLayer/0.9.0/floatLayer',
        'validator': 'validator/0.8.1/validator'
    },

    preload: [this.JSON ? '' : 'json', 'seajs/plugin-text']
});
