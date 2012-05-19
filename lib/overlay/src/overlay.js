// Overlay 提供基于浮层表现的 UI 组件。
// 提供浮层的显示、隐藏、定位
define(function(require, exports, module) {
    var Base = require('base'),
        $ = require('zepto');

    var Overlay = Base.extend({
        options: {
            element: null,
            parentNode: $('body'), // 将 element 动态插入到 parentNode
            styles: { // 浮层样式
                zIndex: 9999,
                display: 'none'
            }
        },
        initialize: function (options){
            this.setOptions(options);
        },
        render: function (){
            // element 定义为 HTML 字符串时
            if(this.options.element && !$(this.options.element).parent().get(0)){
                this.options.element = $(this.options.element).hide();
            }

            // 复制一份用户提供的 element ，并且去除 id
            this.options.element = $(this.options.element).appendTo(this.options.parentNode);

            this.setStyles(this.options.styles);

            this.bindUI();

            return this;
        },
        bindUI: function (){
            var triggers = this.options.element.find('*[data-overlay-role="trigger"]'),
                that = this;

            Array.prototype.slice.call(triggers);

            triggers.forEach(function (trigger){
                if(trigger && (action = $(trigger).attr('data-overlay-action'))){
                    switch(action){
                        case 'hide':
                            $(trigger).unbind('click.overlay').bind('click.overlay',$.proxy(function (e){
                                e.preventDefault();
                                this.hide();
                            },that));
                            break;
                        case 'show':
                            $(trigger).unbind('click.overlay').bind('click.overlay',$.proxy(function (e){
                                e.preventDefault();
                                this.show();
                            },that));
                            break;
                        case 'destroy':
                            $(trigger).unbind('click.overlay').bind('click.overlay',$.proxy(function (e){
                                e.preventDefault();
                                this.destroy();
                            },that));
                            break;
                    }
                }
            });

            return this;
        },
        destroy: function (){
            this.options.element && $(this.options.element).remove();
            $(this.__shim).remove();
            this.options.element = null;
            this.__shim = null;
            this.options.parentNode = $('body');
            this.options.styles = {
                zIndex: 9999
            };
        },
        show: function (){
            var display = '';

            if($(this.options.element).css('display') === 'block'){
                display = 'block';
            }else if($(this.options.element).css('display') === '-webkit-box'){
                display = '-webkit-box';
            }

            $(this.options.element).css({
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

            return this;
        },
        hide: function (){
            $(this.options.element).hide();
            this.trigger('hide',this);
            this.__shim && $(this.__shim).remove();
            this.__shim = null;

            return this;
        },
        setStyles: function (styles){
            $(this.options.element).css(styles);

            return this;
        },
        // 解决 Android OS 部分机型中事件穿透问题
        // 如果子类覆盖 show 方法，强烈建议大子类的 show 方法中调用 addShim
        addShim: function (){
            if(this.__shim){
                return;
            }

            var element = $(this.options.element),
                offset = element.offset();

            var shim = $('<div data-overlay-role="shim" style="position:absolute;pointer-events:none;'+
                         'margin:0;padding:0;border:none;background:none;-webkit-tap-highlight-color:rgba(0,0,0,0);'+
                         'width:'+offset.width+'px;height:'+offset.height+'px;'+
                         'top:'+offset.top+'px;left:'+offset.left+'px;'+
                         'z-index:'+(parseInt(element.css('zIndex'),10)-1)+';"></div>');
            this.__shim = shim.appendTo(element.parent());

            return this;
        }
    });

    module.exports = Overlay;
});
