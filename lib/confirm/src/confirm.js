// Confirm
// =======
// 提供 Confirm 模态对话框
// [理解模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)
define(function(require, exports, module) {
    var Dialog = require('animDialog'),
        $ = require('$');

    var template = '<div class="ui-confirm"><header class="ui-confirm-header">'+
                   '<a href="javascript:void(0)" class="ui-confirm-close">'+
                   '关闭</a>'+'</header>'+
                   '<section class="ui-confirm-body"></section>'+
                   '<footer class="ui-confirm-footer">'+
                   '<a href="javascript:void(0)" class="ui-confirm-ok">确定</a>'+
                   '<a href="javascript:void(0)" class="ui-confirm-cancel">取消'+
                   '</a></footer></div>';

    var Confirm = Dialog.extend({
        attrs: {
            template: template,
            titleElement: 'header',
            contentElement: 'section',
            closeElement: 'header a',
            message: '',
            styles: {
                position: 'absolute',
                margin: 0
            },
            align: {
                selfXY: ['center','center'],
                baseXY: ['center','center']
            },
            hasMask: {
                value: true,
                readOnly: true
            },
            confirmElement: 'footer a:first-child',
            cancelElement: 'footer a:last-child'
        },
        delegateEvents: function() {
            Confirm.superclass.delegateEvents.call(this);

            var triggers = this.element.find('*[data-confirm-role="trigger"]');
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
        confirm: function() {
            this.trigger('confirm', this);
            return this;
        },
        show: function (){
            Confirm.superclass.show.call(this);
            $(this.get('contentElement')).html(this.get('message'));
            return this;
        }
    });

    module.exports = Confirm;
});
