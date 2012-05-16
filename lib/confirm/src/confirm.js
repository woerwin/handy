// Confirm 提供 Confirm 模态对话框
// [理解模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)
define(function(require, exports, module) {
    var Base = require('base'),
        $ = require('zepto');

    var Confirm = Base.extend({
        options: {
            tpl: null, // HTML 模版。如果提供 tpl ，tpl 将做为 confirm 的 UI ，默认使用 window.confirm
            message: null, // confirm 消息。如果指定了 tpl，message 将被忽略
            zIndex: null // 如果提供 tpl 参数，可以通过 zIndex 参数定义 tpl 的 z-index
        },
        initialize: function (options){
            this.setOptions(options);

            if(this.options.tpl){
                this.__mask = $('<div></div>');
            }
        },
        sync: function (){
            if(
                (this.options.tpl && this.__mask && $(this.options.tpl).css('display') === 'none')
                ||
                (!this.options.tpl)
              ){
                return;
            }

            $(this.options.tpl).css({
                opacity: 0
            });

            var doc = document.documentElement,
                winW = doc.clientWidth,
                winH = doc.clientHeight,
                uiW = parseInt($(this.options.tpl).get(0).clientWidth,10),
                uiH = parseInt($(this.options.tpl).get(0).clientHeight,10),
                scrollY = window.scrollY;

            // 解决 iOS 设备地址栏控件高度隐藏问题
            if($.os.ios){
               var clientH_scrollH_difference = doc.scrollHeight - winH;

               if(clientH_scrollH_difference >= 1 && clientH_scrollH_difference < 60){
                   scrollY += clientH_scrollH_difference;
               }
            }

            $(this.options.tpl).css({
                left: (winW - uiW) / 2,
                top: (winH - uiH) / 2 + scrollY,
                opacity: 1
            });

            this.__mask.css({
                width: doc.offsetWidth,
                height: doc.offsetHeight
            });
        },
        bindUI: function (){
            var triggers = $(this.options.tpl).find('*[data-confirm-role="trigger"]');
            triggers.click($.proxy(function (e){
                e.preventDefault();

                switch($(e.currentTarget).attr('data-confirm-action')){
                    case 'confirm':
                        this.confirm();
                        break;
                    case 'hide':
                        this.hide();
                        break;
                }
            },this));
        },
        render: function (){
            // tpl 定义为 HTML 字符串时
            if(this.options.tpl && !$(this.options.tpl).parent().get(0)){
                this.options.tpl = $(this.options.tpl).hide();
            }

            if(this.options.tpl){
                this.options.tpl = $(this.options.tpl).clone().appendTo('body').attr('id','');
                this.__mask.appendTo('body');
                this.__tplParent = $(this.options.tpl).parent();
                this.__setCSS();
                this.bindUI();
            }
        },
        destroy: function (){
            this.__mask && this.__mask.remove();
            this.options.tpl && $(this.options.tpl).remove();

            delete this.options;
            this.__mask = null;
            this.__tplParent = null;
        },
        show: function (){
            if(!this.options.tpl){
                var confirm = window.confirm(this.options.message);

                switch(confirm){
                    case true:
                        this.confirm();
                    break;
                    case false:
                        this.hide();
                    break;
                }
                return;
            }

            this.trigger('beforeShow',this);

            $(this.options.tpl).show();
            this.__mask.css('display','block');
            this.sync();

            this.trigger('afterShow',this);
        },
        hide: function (){
            this.__mask && this.__mask.hide();
            $(this.options.tpl).hide();
            this.trigger('hide',this);
        },
        confirm: function (){
            this.trigger('confirm',this);
        },
        getMask: function (){
            return this.__mask;
        },
        getTpl: function (){
            return $(this.options.tpl);
        },
        __setCSS: function (){
            $(this.options.tpl).css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: this.options.zIndex+1 || 9999,
                margin: 0
            });

            this.__mask.css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: this.options.zIndex || 9998,
                background: 'rgba(0,0,0,.5)',
                display: 'none',
                margin: 0
            });
        }
    });

    module.exports = Confirm;
});
