// Confirm 提供 Confirm 模态对话框
// [理解模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)
define(function(require, exports, module) {
    var Base = require('base'),
        $ = require('zepto');

    var Confirm = Base.extend({
        options: {
            tpl: null, // HTML 模版。如果提供 tpl ，tpl 将做为 confirm 的 UI ，默认使用 window.confirm
            message: null // confirm 消息。如果指定了 tpl，message 将被忽略
        },
        initialize: function (options){
            this.setOptions(options);

            if(this.options.tpl){
                this.__tplParent = $(this.options.tpl).parent();
                $(this.options.tpl).css({
                    position: 'absolute',
                    top: 0,
                    left: 0
                });
            }
        },
        bindUI: function (){},
        sync: function (){},
        render: function (){},
        destroy: function (){},
        show: function (){
            if(!this.options.tpl){
                var confirm = window.confirm(this.options.message);

                switch(confirm){
                    case true:
                        this.trigger('confirm',this);
                    break;
                    case false:
                        this.trigger('cancel',this);
                    break;
                }
                return;
            }

            $(this.options.tpl).show();
        },
        hide: function (){}
    });

    module.exports = Confirm;
});
