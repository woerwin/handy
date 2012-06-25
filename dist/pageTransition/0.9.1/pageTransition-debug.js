// PageTransition 一个模拟 iOS 原生应用页面切换效果的 UI 组件
// PageTransition 所需的 HTML 结构(最基础的一种)：
// <div id="J-page-box">
//     <section data-pageTransition-role="page">
//       <a href="javascript:void(0)"
//          data-pageTransition-role="trigger"
//          data-pageTransition-action="next"
//          data-pageTransition-forward="#J-loginForm">
//       登录
//       </a>
//     </section>
// </div>
// <div id="J-loginForm" data-pageTransition-role="page">
//     <a href="javascript:void(0)"
//        data-pageTransition-role="trigger"
//        data-pageTransition-action="prev">
//      返回
//     </a>
// </div>
define("#pageTransition/0.9.1/pageTransition-debug", ["events","$"], function(require, exports, module) {
    var Events = require('events'),
        $ = require('$');

    var defaults = {
        element: null
    };

    function PageTransition(options) {
        this.options = $.extend({},defaults, options);
        this._prevPages = [];
        this._step = 0;

        this._DATAATTRIBUTENAMESPACE = 'data-pageTransition';
    }

    Events.mixTo(PageTransition);

    // 参数 page 是一个 DOM Element
    PageTransition.prototype.transition = function(page) {
        this.nextPage = $(page);

        if (this.getPage() && this.getPage()[0] === this.nextPage.get(0)) {
            return;
        }

        this._nextPageParent = this.nextPage.parent();
        this._transitionForward();
    }
    PageTransition.prototype.back = function (){
        this._transitionBack();
    };

    // 返回 DOM Element
    PageTransition.prototype.getPage = function() {
        return this.page;
    };

    PageTransition.prototype.render = function() {
        // 动态插入 page 视口
        this._insertPageViewport();

        // 更新 UI 样式
        this.sync();

        // 绑定 UI 事件
        this.bindUI();
    };

    // 更新 UI
    PageTransition.prototype.sync = function() {
        var container = $(this.options.element),
            containerW = container.css('width'),
            pages = this.viewport
                    .find('*[' + this._DATAATTRIBUTENAMESPACE + '-role=page]');

        this.viewport.css({
            width: parseInt(containerW, 10) * pages.length
        });

        container.css({
            overflow: 'hidden'
        });

        pages.css({
            'float': 'left',
            width: containerW
        }).show();
    };

    PageTransition.prototype.bindUI = function() {
        var DAS = this._DATAATTRIBUTENAMESPACE,
            trigger = this.viewport.find('*[' + DAS + '-role=trigger]');

        trigger.unbind('click.pageTransition')
               .bind('click.pageTransition', $.proxy(function(e) {
            e.preventDefault();
            var action = $(e.currentTarget).attr('' + DAS + '-action');

            switch (action) {
                case 'forward':
                    this.nextPage = $($(e.currentTarget)
                                    .attr('' + DAS + '-forward'));
                    this._nextPageParent = this.nextPage.parent();
                    this._transitionForward();
                    break;
                case 'back':
                    this._transitionBack();
                    break;
            }
        },this));
    };

    PageTransition.prototype.destroy = function() {
        var DAS = this._DATAATTRIBUTENAMESPACE,
            trigger = this.viewport.find('*[' + DAS + '-role=trigger]');

        trigger.unbind('click.pageTransition');

        $(this.options.element).attr('style', null)
                               .append(this._originPage.attr('style', null));
        this.page.removeAttr('style').appendTo(this._nextPageParent).hide();
        this.viewport.remove();

        // 清除所有数据
        this._step = 0;
        this._prevPages = [];
        this.page = null;
        this.nextPage = null;
        this.viewport = null;
        this._nextPageParent = null;
        this._originPage = null;
    };

    PageTransition.prototype._transitionForward = function() {
        this.trigger('transitionStart', 'forward', this.page, this);

        // 动态向 viewport 尾部添加一张页面
        this.nextPage.appendTo(this.viewport);
        this.sync();
        this.viewport.animate({
            marginLeft: -parseInt($(this.options.element).css('width'), 10)
        },300, null, $.proxy(function() {
            this.__transitionForwardEnd();
        },this));
    };

    PageTransition.prototype.__transitionForwardEnd = function() {
        // 将隐藏的页面从 viewport 拿走
        this.page.appendTo(this._nextPageParent).hide();

        // 重新绑定 UI 事件
        this.bindUI();
        this.trigger('transitionEnd', 'forward', this.nextPage, this);

        // 将前一张页面入栈
        this._prevPages.push(this.page);
        // 记录用户的操作次数
        this._step++;

        // 更新当前的 page
        this.page = this.nextPage;

        // 此时 viewport中只有一个页面，因此需要更新 viewport 的margin-left
        this.viewport.css({
            marginLeft: 0
        });

        this.sync();
    };

    PageTransition.prototype._transitionBack = function() {
        if(this._step <= 0){
            return;
        }
        this.trigger('transitionStart', 'back', this.page, this);

        // 动态向 viewport 头部添加一张页面
        this.viewport.prepend(this._prevPages[this._step - 1]);
        this.sync();
        this.viewport.css({
            marginLeft: -parseInt($(this.options.element).css('width'), 10)
        });
        this.viewport.animate({
            marginLeft: 0
        },300, null, $.proxy(function() {
            this._transitionBackEnd();
        },this));
    };

    PageTransition.prototype._transitionBackEnd = function() {
        // 将隐藏的页面从 viewport 拿走
        this.page.appendTo(this._nextPageParent).hide();

        // 重新绑定 UI 事件
        this.bindUI();
        var page = this._prevPages[this._step - 1] || this._originPage;
        this.trigger('transitionEnd', 'back', page, this);

        // 更新当前对象的 this.nextPage
        this.nextPage = this.page;
        // 更新当前对象的 this.page, this._prevPages 出栈
        this.page = this._prevPages[this._step - 1];
        this.viewport.css({
            marginLeft: 0
        });
        // this._prevPages 出栈，从 this._prevPages 栈中清除刚出栈的页面
        this._prevPages.splice(this._step - 1);
        // 用户返回一步
        this._step--;

        this.sync();
    };

    PageTransition.prototype._insertPageViewport = function() {
        var DAS = this._DATAATTRIBUTENAMESPACE,
            container = $(this.options.element),
            pageViewPort = $('<div ' + DAS + '-role="viewport"></div>'),
            page = $(container.find('*[' + DAS + '-role=page]')[0]);
        page.wrapAll(pageViewPort);
        this.viewport = $(pageViewPort, container);
        this.page = page;

        // 保存 PageTransition 最原始的页面，在 destroy 时，
        // 将清除 PageTransition 对象中除这个原始页面以外的所有页面
        // 如果用户在初始化页面中触发返回行为，也将返回到这个原始的页面
        this._originPage = page;
    };

    module.exports = PageTransition;
});
