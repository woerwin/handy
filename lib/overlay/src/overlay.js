// Overlay 提供基于浮层表现的 UI 组件，提供浮层的显示、隐藏、定位
define(function(require, exports, module) {
    var Base = require('base'),
        Events = require('events'),
        $ = require('zepto');

    var Overlay = Base.extend({
        options: {
            tpl: null, // HTML 模版。如果提供 tpl ，tpl 将做为 confirm 的 UI ，默认使用 window.confirm
            parentNode: $('body'), // 将 tpl 动态插入到 parentNode
            css: { // 浮层样式
                zIndex: 9999
            }
        },
        NAME: 'Overlay',
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
            this.options.tpl = $(this.options.tpl).clone().appendTo(this.options.parentNode).attr('id','');

            this.setCSS();
        },
        destroy: function (){
            $(this.options.tpl).remove();
            $(this.__shim).remove();
            this.options.tpl = null;
            this.__shim = null;
            this.options.parentNode = $('body');
            this.options.css = {
                zIndex: 9999
            };
        },
        show: function (){
            var display = '';

            if($(this.options.tpl).css('display') === 'block'){
                display = 'block';
            }else if($(this.options.tpl).css('display') === '-webkit-box'){
                display = '-webkit-box';
            }

            $(this.options.tpl).css({
                'display': display
            });

            this.addShim();
            this.trigger('shown',this);
        },
        hide: function (){
            $(this.options.tpl).hide();
            this.trigger('hide',this);
        },
        setCSS: function (){
            $(this.options.tpl).css(this.options.css);
        },
        // 解决 Android OS 部分机型中事件穿透问题
        // 如果子类覆盖 show 方法，强烈建议大子类的 show 方法中调用 addShim
        addShim: function (){
            var tpl = $(this.options.tpl),
                offset = tpl.offset();

            var shim = $('<div style="position:absolute;pointer-events:none;'+
                         'width:'+offset.width+'px;height:'+offset.height+'px;'+
                         'top:'+offset.top+'px;left:'+offset.left+'px;'+
                         'z-index:'+(parseInt(tpl.css('zIndex'),10)-1)+';"></div>');
            this.__shim = shim.appendTo(tpl.parent());
        }
    });

    Events.mixTo(Overlay);

    module.exports = Overlay;
});
