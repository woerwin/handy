// Overlay 提供基于浮层表现的 UI 组件，提供浮层的显示、隐藏、定位
define(function(require, exports, module) {
    var Base = require('base'),
        Events = require('events'),
        $ = require('zepto');

    var Overlay = Base.extend({
        options: {
            tpl: null, // HTML 模版。如果提供 tpl ，tpl 将做为 confirm 的 UI ，默认使用 window.confirm
            zIndex: 9999,
            parentNode: $('body'), // 将 tpl 动态插入到 parentNode
            css: {} // 浮层样式
        },
        initialize: function (options){
            this.setOptions(options);
        },
        sync: function (){
            // 如果没有提供 tpl 或者当前模版已经隐藏
            if(
                (this.options.tpl && $(this.options.tpl).css('display') === 'none')
                ||
                (!this.options.tpl)
              ){
                return;
            }

            this.trigger('sync',this);
        },
        render: function (){
            // tpl 定义为 HTML 字符串时
            if(this.options.tpl && !$(this.options.tpl).parent().get(0)){
                this.options.tpl = $(this.options.tpl).hide();
            }

            // 复制一份用户提供的 tpl ，并且去除 id
            this.options.tpl = this.options.tpl.clone().appendTo(this.options.parentNode).attr('id','');

            this.setCSS();
        },
        destroy: function (){
            this.options.tpl.remove();

            delete this.options;
        },
        show: function (){
            this.options.tpl.show();
            this.trigger('shown',this);
        },
        hide: function (){
            this.options.tpl.hide();
            this.trigger('hide',this);
        },
        setCSS: function (){
            this.options.tpl.css(this.options.css);
        }
    });

    Events.mixTo(Overlay);

    module.exports = Overlay;
});
