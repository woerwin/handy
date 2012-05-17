
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
seajs.config({
    alias: {
        'events': 'events/0.9.1/events',
        'zepto': 'zepto/0.8.0/zepto',
        'base': 'base/0.9.1/base',
        'class': 'class/0.9.0/class',
        'jquery': 'jquery/1.7.2/jquery'
    },
    preload: [this.JSON ? '' : 'json', 'plugin-text'],
    debug: 2
});
