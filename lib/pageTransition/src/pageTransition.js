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
    }

    Events.mixTo(PageTransition);

    PageTransition.prototype.transition = function (){
        this.nextPage.appendTo(this.viewport).show();

        this.sync();

        this.viewport.animate({
            marginLeft: -parseInt($(this.options.srcNode).css('width'),10)
        },300,null,$.proxy(function (){
            this._transitionEnd();
        },this));
    };

    PageTransition.prototype._transitionEnd = function (){
        this.trigger('transitionEnd','next',this.nextPage,this);
        this.page.remove();
        this.prevPage = this.page;
        this.page = this.nextPage;
        this.viewport.css({
            marginLeft: 0
        });
        this.bindUI();
    };

    PageTransition.prototype._transitionBackEnd = function (){
        this.trigger('transitionEnd','prev',this.prevPage,this);
        this.page.remove();
        this.nextPage = this.page;
        this.page = this.prevPage;
        this.viewport.css({
            marginLeft: 0
        });
        this.bindUI();
    };

    // 返回 DOM Element
    PageTransition.prototype.getPage = function (){
        return this.page;
    };

    PageTransition.prototype.render = function (){
        // 动态插入 page 视口
        this.insertPageViewport();

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
        });
    };

    PageTransition.prototype.insertPageViewport = function (){
        var container = $(this.options.srcNode),
            pageViewPort = $('<div data-role="page-viewport"></div>'),
            page = $(container.find('*[data-role=page]')[0]);
        page.wrapAll(pageViewPort);
        this.viewport = $(pageViewPort);
        this.page = page;
    };

    PageTransition.prototype.bindUI = function (){
        var trigger = this.viewport.find('*[data-role=trigger]');

        trigger.unbind('click.pageTransition').bind('click.pageTransition',$.proxy(function (e){
            e.preventDefault();

            var action = $(e.currentTarget).attr('data-action');

            this.trigger('transitionStart',action,this.page,this);

            switch(action){
                case 'next':
                    this.nextPage = this.nextPage || $($(e.currentTarget).attr('data-next'));
                    this.transition();
                    break;
                case 'prev':
                    this._transitionBack();
                    break;
            }
        },this));
    };

    PageTransition.prototype._transitionBack = function (){
        this.viewport.prepend(this.prevPage);
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