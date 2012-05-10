// PageTransition 一个模拟 iOS 原生应用页面切换效果的 UI 组件
// PageTransition 所需的 HTML 结构(最基础的一种)：
// <div id="J-page-box">
//     <section data-role="page">
//       <a href="javascript:void(0)" data-role="trigger" data-action="next" data-next="#J-loginForm">登录</a>
//     </section>
// </div>
// <div id="J-loginForm" data-role="page">
//     <a href="javascript:void(0)" data-role="trigger" data-action="prev">返回</a>
// </div>
define(function (require,exports,module){
    var Events = require('events'),
        $ = require('zepto');

    var defaults = {
        srcNode : null
    };

    function PageTransition(options){
        this.options = $.extend({},defaults,options);
        this.prevPages = [];
        this.step = 0;
    }

    Events.mixTo(PageTransition);

    PageTransition.prototype.transition = function (){
        this.nextPage.appendTo(this.viewport);

        this.sync();

        this.viewport.animate({
            marginLeft: -parseInt($(this.options.srcNode).css('width'),10)
        },300,null,$.proxy(function (){
            this._transitionEnd();
        },this));
    };

    // 返回 DOM Element
    PageTransition.prototype.getPage = function (){
        return this.page;
    };

    PageTransition.prototype.render = function (){
        // 动态插入 page 视口
        this._insertPageViewport();

        // 更新 UI 样式
        this.sync();

        // 绑定 UI 事件
        this.bindUI();
    };

    // 更新 UI
    PageTransition.prototype.sync = function (){
        var container = $(this.options.srcNode),
            containerW = container.css('width'),
            pages = this.viewport.find('*[data-role=page]');

        this.viewport.css({
            width: parseInt(containerW,10)*pages.length
        });

        container.css({
            overflow: 'hidden'
        });

        pages.css({
            float: 'left',
            width: containerW
        }).show();
    };

    PageTransition.prototype.bindUI = function (){
        var trigger = this.viewport.find('*[data-role=trigger]');

        trigger.unbind('click.pageTransition').bind('click.pageTransition',$.proxy(function (e){
            e.preventDefault();

            var action = $(e.currentTarget).attr('data-action');

            this.trigger('transitionStart',action,this.page,this);

            switch(action){
                case 'next':
                    this.nextPage = $($(e.currentTarget).attr('data-next'));
                    this._nextPageParent = this.nextPage.parent();
                    this.transition();
                    break;
                case 'prev':
                    this._transitionBack(e.currentTarget);
                    break;
            }
        },this));
    };

    PageTransition.prototype.destroy = function (){
        var trigger = this.viewport.find('*[data-role=trigger]');
console.log(trigger)
        trigger.unbind('click.pageTransition');

        $(this.options.srcNode).removeAttr('style').append(this._originPage.attr('style',null));
        this.page.removeAttr('style').appendTo(this._nextPageParent).hide();
        this.viewport.remove();

        // 清除所有数据
        this.step = 0;
        this.prevPages = [];
        this.page = null;
        this.nextPage = null;
        this.viewport = null;
        this._nextPageParent = null;
        this._originPage = null;
    };

    PageTransition.prototype._transitionEnd = function (){
        this.trigger('transitionEnd','next',this.nextPage,this);
        this.page.appendTo(this._nextPageParent).hide();

        this.prevPages.push(this.page);
        this.step++;

        this.page = this.nextPage;
        this.viewport.css({
            marginLeft: 0
        });
        this.bindUI();
    };

    PageTransition.prototype._transitionBackEnd = function (){
        this.trigger('transitionEnd','prev',this.prevPages[this.prevPages.length],this);
        this.page.appendTo(this._nextPageParent).hide();
        this.nextPage = this.page;
        this.page = this.prevPages[this.step-1];
        this.viewport.css({
            marginLeft: 0
        });
        this.prevPages.splice(this.step-1);
        this.step--;
        this.bindUI();
    };

    PageTransition.prototype._insertPageViewport = function (){
        var container = $(this.options.srcNode),
            pageViewPort = $('<div data-role="page-viewport"></div>'),
            page = $(container.find('*[data-role=page]')[0]);
        page.wrapAll(pageViewPort);
        this.viewport = $(pageViewPort);
        this.page = page;

        // 保存 PageTransition 最原始的页面，在 destroy 时，将清除 PageTransition 对象中除这个原始页面以外的所有页面
        this._originPage = page;
    };

    PageTransition.prototype._transitionBack = function (){
        this.viewport.prepend(this.prevPages[this.step-1]);
        this.sync();
        this.viewport.css({
            marginLeft: -parseInt($(this.options.srcNode).css('width'),10)
        });
        this.viewport.animate({
            marginLeft: 0
        },300,null,$.proxy(function (){
            this._transitionBackEnd();
        },this));
    };

    module.exports = PageTransition;
});