
// load sea.js
(function(m, o, d, u, l, a, r) {
    if(m[d]) return;
    function f(n, t) { return function() { r.push(n, arguments); return t; } }
    m[d] = a = { args: (r = []), config: f(0, a), use: f(1, a) };
    m.define = f(2);
    u = o.createElement('script');
    u.id = d + 'node';
    u.src = '../../../../arale/dist/seajs/1.1.0/sea.js';
    l = o.getElementsByTagName('head')[0];
    l.insertBefore(u, l.firstChild);
})(window, document, 'seajs');

// and its friends
(function(){
var handy = '../../../../handy/dist/';

seajs.config({

    alias: {
        'jasmine': 'jasmine/1.1.0/jasmine-html',

        'events': 'events/0.9.1/events',                     // 100%
        'class': 'class/0.9.2/class',                        // 100%
        'base': 'base/0.9.15/base',                          // 90%  完善阶段
        'widget': 'widget/0.9.15/widget',                    // 90%  完善阶段
        'widget-templatable': 'widget/0.9.15/templatable',   // 90%  完善阶段

        '$': 'zepto/1.0.0/zepto',
        'handlebars': 'handlebars/1.0.0/handlebars',

        'overlay': handy + 'overlay/0.9.1/overlay',
        'position': handy + 'position/0.9.0/position',
        'android-shim': handy + 'android-shim/0.9.0/android-shim',
        'mask': handy + 'overlay/0.9.1/mask',
        'baseDialog': handy + 'dialog/0.9.0/baseDialog',
        'animDialog': handy + 'dialog/0.9.0/animDialog'

    },
    preload: [this.JSON ? '' : 'json', 'plugin-text'],
    debug: 2
});
})();

