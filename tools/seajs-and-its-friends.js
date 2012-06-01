
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
var handy = '../../../dist/';

seajs.config({

    alias: {

        'events': 'events/0.9.1/events',                     // 100%
        'class': 'class/0.9.1/class',                        // 100%
        'base': 'base/0.9.14/base',                          // 90%  完善阶段
        'widget': 'widget/0.9.10/widget',                    // 90%  完善阶段
        'widget-templatable': 'widget/0.9.10/templatable',   // 90%  完善阶段

        '$': 'zepto/0.8.0/zepto',
        'handlebars': 'handlebars/1.0.0/handlebars',

        'overlay': handy + 'overlay/0.9.0/overlay'

    },
    preload: [this.JSON ? '' : 'json', 'plugin-text'],
    debug: 2
});
})();

