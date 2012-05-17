// Confirm 提供 Confirm 模态对话框
// [理解模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)
define(function(require, exports, module) {
    var Overlay = require('overlay'),
        $ = require('zepto');

    var Confirm = Overlay.extend({
        options: {
            message: null // confirm 消息。如果指定了 tpl，message 将被忽略
        },
        initialize: function (options){
            Confirm.superclass.initialize.call(this,options);

            if(this.options.tpl){
                this.__mask = $('<div></div>');
            }
        },
        sync: function (){
            Confirm.superclass.sync.call(this);

            $(this.options.tpl).css({
                opacity: 0
            });

            var doc = document.documentElement,
                winW = doc.clientWidth,
                winH = doc.clientHeight,
                uiW = parseInt($(this.options.tpl).get(0).clientWidth,10),
                uiH = parseInt($(this.options.tpl).get(0).clientHeight,10),
                scrollY = window.scrollY,
                docH = doc.offsetHeight;

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

            docH < winH ? docH = winH : docH = docH;

            this.__mask.css({
                width: doc.offsetWidth,
                height: docH
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
                // 复制一份用户提供的 tpl ，并且去除 id
                this.options.tpl = $(this.options.tpl).clone().appendTo('body').attr('id','');
                this.__mask.appendTo('body');
                this.setCSS();
                this.bindUI();
            }
        },
        destroy: function (){
            this.__mask && this.__mask.remove();
            Confirm.superclass.destroy.call(this);
            this.__mask = null;
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
            }else{
                this.showTpl();
                this.sync();
            }

            this.trigger('shown',this);
        },
        showTpl: function (){
            $(this.options.tpl).css('display','block');
            this.__mask.css('display','block');
        },
        hide: function (){
            this.hideTpl();
            this.trigger('hide',this);
        },
        hideTpl: function (){
            this.__mask && this.__mask.hide();
            $(this.options.tpl).hide();
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
        setCSS: function (){
            $(this.options.tpl).css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: this.options.zIndex+1,
                margin: 0,
                display: 'none'
            });

            this.__mask.css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: this.options.zIndex,
                background: 'rgba(0,0,0,.5)',
                display: 'none',
                margin: 0
            });
        }
    });

    module.exports = Confirm;
});
