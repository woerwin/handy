// Overlay 提供基于浮层表现的 UI 组件。
// 提供浮层的显示、隐藏、定位
define(function(require, exports, module) {
    var Base = require('base'),
        Events = require('events'),
        $ = require('zepto');

    var Overlay = Base.extend({
        options: {
            tpl: null, // HTML 模版。如果提供 tpl ，tpl 将做为 confirm 的 UI ，默认使用 window.confirm
            parentNode: $('body'), // 将 tpl 动态插入到 parentNode
            css: { // 浮层样式
                zIndex: 9999,
                display: 'none'
            }
        },
        NAME: 'Overlay',
        initialize: function (options){
            this.setOptions(options);
        },
        render: function (){
            // tpl 定义为 HTML 字符串时
            if(this.options.tpl && !$(this.options.tpl).parent().get(0)){
                this.options.tpl = $(this.options.tpl).hide();
            }

            // 复制一份用户提供的 tpl ，并且去除 id
            this.options.tpl = $(this.options.tpl).clone().appendTo(this.options.parentNode).attr('id','');

            this.setStyles(this.options.css);
        },
        destroy: function (){
            if(this.options.tpl === null){return;}

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
            if($(this.options.tpl).css('display') !== 'none'){return;}

            var display = '';

            if($(this.options.tpl).css('display') === 'block'){
                display = 'block';
            }else if($(this.options.tpl).css('display') === '-webkit-box'){
                display = '-webkit-box';
            }

            $(this.options.tpl).css({
                'display': display
            });

            // 本来 handy 对 overlay addShim 方法的设计是: 如果是 android 设备再添加一个 shim
            // 但后来发现某些 android 刷机用户的 UA 通过 zepto 无法准确获取
            // 所以我们去除了这层判断处理，直接添加 shim
            /*if($.os.android){
                this.addShim();
            }*/
            this.addShim();

            this.trigger('shown',this);
        },
        hide: function (){
            if($(this.options.tpl).css('display') === 'none'){return;}

            $(this.options.tpl).hide();
            this.trigger('hide',this);
            this.__shim && $(this.__shim).remove();
            this.__shim = null;
        },
        setStyles: function (css){
            $(this.options.tpl).css(css);
        },
        // 解决 Android OS 部分机型中事件穿透问题
        // 如果子类覆盖 show 方法，强烈建议大子类的 show 方法中调用 addShim
        addShim: function (){
            if(this.__shim){
                return;
            }

            var tpl = $(this.options.tpl),
                offset = tpl.offset();

            var shim = $('<div data-overlay-role="shim" style="position:absolute;pointer-events:none;'+
                         'margin:0;padding:0;border:none;background:none;-webkit-tap-highlight-color:rgba(0,0,0,0);'+
                         'width:'+offset.width+'px;height:'+offset.height+'px;'+
                         'top:'+offset.top+'px;left:'+offset.left+'px;'+
                         'z-index:'+(parseInt(tpl.css('zIndex'),10)-1)+';"></div>');
            this.__shim = shim.appendTo(tpl.parent());
        }
    });

    Events.mixTo(Overlay);

    module.exports = Overlay;
});
