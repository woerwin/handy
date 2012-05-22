// Confirm
// -------
// 提供 Confirm 模态对话框
// [理解模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)
define(function(require, exports, module) {
    var Overlay = require('overlay'),
        $ = require('zepto');

    var Confirm = Overlay.extend({
        options: {
            message: null, // confirm 消息。如果指定了 element，message 将被忽略
            styles: {
                position: 'absolute',
                top: 0,
                left: 0,
                margin: 0
            }
        },
        initialize: function(options) {
            Confirm.superclass.initialize.call(this, options);

            // protected
            this.mask = null;

            if (this.options.element) {
                this.mask = $('<div></div>');
            }
        },
        sync: function() {
            if (!this.options.element) {return;}

            $(this.options.element).css({
                opacity: 0
            });

            var doc = document.documentElement,
                winW = doc.clientWidth,
                winH = doc.clientHeight,
                uiW = parseInt($(this.options.element).get(0).clientWidth, 10),
                uiH = parseInt($(this.options.element).get(0).clientHeight, 10),
                scrollY = window.scrollY,
                docH = doc.offsetHeight;

            // 解决 iOS 设备地址栏控件高度隐藏问题
            if ($.os.ios) {
               var clientH_scrollH_difference = doc.scrollHeight - winH;

               if (clientH_scrollH_difference >= 1 && clientH_scrollH_difference < 60) {
                   scrollY += clientH_scrollH_difference;
               }
            }

            this.options.element.css({
                left: (winW - uiW) / 2,
                top: (winH - uiH) / 2 + scrollY,
                opacity: 1
            });

            docH < winH ? docH = winH : docH = docH;

            this.mask.css({
                width: doc.offsetWidth,
                height: docH
            });

            this.syncShim();

            return this;
        },
        bindUI: function() {
            Confirm.superclass.bindUI.call(this);
            var triggers = $(this.options.element).find('*[data-confirm-role="trigger"]');
            triggers.click($.proxy(function(e) {
                e.preventDefault();

                switch ($(e.currentTarget).attr('data-confirm-action')) {
                    case 'confirm':
                        this.confirm();
                        break;
                }
            },this));

            return this;
        },
        render: function() {
            // element 定义为 HTML 字符串时
            if (this.options.element && !$(this.options.element).parent().get(0)) {
                this.options.element = $(this.options.element).hide();
            }

            if (this.options.element) {
                this.mask.appendTo('body');
                Confirm.superclass.render.call(this);
            }

            return this;
        },
        destroy: function() {
            this.mask && this.mask.remove();
            Confirm.superclass.destroy.call(this);
            this.mask = null;
        },
        show: function() {
            if (!this.options.element) {
                var confirm = window.confirm(this.options.message);

                switch (confirm) {
                    case true:
                        this.confirm();
                    break;
                    case false:
                        this.hide();
                    break;
                }
            }else {
                $(this.options.element).css({
                    'display': 'block'
                });
                this.mask.css('display', 'block');
                this.sync();

                var actualElement = this.options.element;
                this.options.element = this.mask;
                this.addShim();
                this.options.element = actualElement;

                this.trigger('shown', this);
            }

            return this;
        },
        hide: function() {
            this.mask && this.mask.hide();
            Confirm.superclass.hide.call(this);
            return this;
        },
        confirm: function() {
            this.trigger('confirm', this);
            return this;
        },
        setStyles: function(styles) {
            Confirm.superclass.setStyles.call(this, styles);

            this.mask.css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: this.options.zIndex,
                background: 'rgba(0,0,0,.5)',
                display: 'none',
                margin: 0
            });

            return this;
        },
        // protected
        syncShim: function() {
            $(this.shim).css({
                width: this.mask.offset().width,
                height: this.mask.offset().height,
                left: this.mask.offset().left,
                top: this.mask.offset().top
            });
        }
    });

    module.exports = Confirm;
});
