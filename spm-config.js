// arale alias 
define({
    alias: {
        '$': 'zepto/1.0.0/zepto',
        'jquery': 'zepto/1.0.0/zepto',
        'handlebars': 'handlebars/1.0.0/handlebars',
        'backbone': 'backbone/0.9.2/backbone',
        'jasmine': 'jasmine/1.1.0/jasmine-html',
        'events': 'events/0.9.1/events',                     // 100%
        'class': 'class/0.9.2/class',                        // 100%
        'base': 'base/0.9.15/base',                          // 95%
        'widget': 'widget/0.9.16/widget-mobile',                    // 95%
        'templatable': 'widget/0.9.15/templatable-mobile',          // 95%
        'daparser': 'widget/0.9.15/daparser-mobile',
        'iscroll': 'iscroll/4.1.9/iscroll'
    },
    preload: [this.JSON ? '' : 'json', 'plugin-text']
});
