// flip
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var $ = require('zepto'),
        Events = require('events'),
        Flip;

    var defaults = {
        direction: "ltr", // 转动方向 默认从左往右 沿y 轴逆时针旋转,
        frontNode: null,
        backNode: null,
        containerCSS: {
            "-webkit-perspective": "1000",
            "-webkit-perspective-origin": "50% 50%"
        },
        flipCSS: {
            "-webkit-transform-style": "preserve-3d",
            "-webkit-transition": "-webkit-transform 0.8s ease",
            "position": "relative"
        },
        faceCSS: {
            "position": "absolute",
            "left": 0,
            "top": 0,
            "display": "block"
        },
        triggers: []
    };

    module.exports = Flip = function (selDOM, options) {
//        if ($(selDom).length == 0) {
//            reportError("[Flip Module] Can not find selector,please check your selector!\r\nselector:" + selDom, "error");
//            return;
//        }
        //TODO 关于各类异常处理机制
        // 初始化配置信息
        this.initOptions(selDOM, options);
        // 解析DOM元素
        this.parseElement();
        // 加载事件代理
        this.delegateEvents();
        // 组件设置
        this.setup();
    };

    // 初始化配置 selDOM 为选择器或者 DOM 元素
    Flip.prototype.initOptions = function (selDOM, options) {
        this.srcNode = $(selDOM).get(0);
        this.options = $.extend({}, defaults, options);
    }

    // 解析DOM元素
    Flip.prototype.parseElement = function () {
        // 将 html 用户定义属性进行解析为相应的属性/对象
        this.options.frontNode = this.srcNode.querySelector('*[data-flip-role=frontFace]') || null;
        this.options.backNode = this.srcNode.querySelector('*[data-flip-role=backFace]') || null;

        var triggers = this.srcNode.querySelectorAll('*[data-flip-role=trigger]');
        for (i = 0; i < triggers.length; i++) {
            this.options.triggers.push(triggers[i]);
        }

        //wrap flip 增加flip viewport
        this._wrapFlip();
    };

    // 初始化 flip 组件
    Flip.prototype.setup = function () {
        // 初始化相应结构的CSS样式
        this._initCSS();
    };

    // 初始化相关事件
    Flip.prototype.delegateEvents = function () {
        var i, action,
            that = this;

        for (i in this.options.triggers) {
            action = this.options.triggers[i].dataset.flipAction || "flipBack";
            switch (action) {
                case "flipFront":
                    $(this.options.triggers[i]).bind("click.flip", function (e) {
                        e.preventDefault();
                        that.flip("front");
                    });
                    break;
                case "flipBack":
                default:
                    $(this.options.triggers[i]).bind("click.flip", function (e) {
                        e.preventDefault();
                        that.flip("back");
                    });
                    break;
            }
        }
        Events.mixTo(this);
    };

    //Flip 类的方法
    Flip.prototype.flip = function (face) {
        // 如果动画正在进行中或者没有源节点或者已经是该 face ，则不做任何处理
        if (this._animating || !this.srcNode || face == this.face) {
            return;
        }
        this.face = face || "back";

        // 开始进行翻转
        this._startFlip();
    };

    // 开始渲染界面
    Flip.prototype._startFlip = function () {
        var that = this;
        switch (this.options.direction) {
            case "ltr":
                switch (this.face) {
                    case "front":
                        this._startCSS = { "-webkit-transform": "rotateY(180deg)"};
                        this._endCSS = {"-webkit-transform": "rotateY(0deg)"};
                        break;
                    case "back":
                    default:
                        this._startCSS = { "-webkit-transform": "rotateY(0deg)"};
                        this._endCSS = {"-webkit-transform": "rotateY(180deg)"};
                        break;

                }
                break;
            default:
                switch (this.face) {
                    case "front":
                        this._startCSS = { "-webkit-transform": "rotateY(180deg)"};
                        this._endCSS = {"-webkit-transform": "rotateY(0deg)"};
                        break;
                    case "back":
                    default:
                        this._startCSS = { "-webkit-transform": "rotateY(0deg)"};
                        this._endCSS = {"-webkit-transform": "rotateY(180deg)"};
                        break;
                }
        }

        //为 viewport 增加翻转前需要的样式定义
        $(this.viewport).css(this._startCSS);
        this._animating = true;

        // 触发自定义事件
        this.trigger('transitionStart', this);
        $(this.viewport).bind("webkitTransitionEnd", function () {
            that._end();
        });
        //为 viewport 加载终点的样式定义
        $(this.viewport).css(this._endCSS);
    };

    // 翻转结束 释放临时使用资源
    Flip.prototype._end = function () {
        // 触发自定义事件
        this.trigger('transitionEnd', this);

        this._removeEvent();
        this._animating = false;
    };

    Flip.prototype._wrapFlip = function () {
        var container = $(this.options.srcNode),
            pageViewPort = $('<div data-flip-role="viewport"></div>');

        $(this.options.frontNode).wrapAll(pageViewPort);
        $(this.options.backNode).wrapAll(pageViewPort);
        this.viewport = $(pageViewPort, container);
    };

    // 初始化关键元素的 css 样式
    Flip.prototype._initCSS = function () {
        //add CSS prefilp style
        $(this.srcNode).css(this.options.containerCSS);
        $(this.viewport).css(this.options.flipCSS);
        $(this.options.frontNode).css(this.options.faceCSS);
        $(this.options.backNode).css(this.options.faceCSS);

        // 在节点上增加翻转所需的属性
        this.options.frontNode && $(this.options.frontNode).css({
            "-webkit-transform": "rotateY(0deg)",
            "-webkit-backface-visibility": "hidden"
        });
        this.options.backNode && $(this.options.backNode).css({
            "-webkit-transform": "rotateY(180deg)",
            "-webkit-backface-visibility": "hidden"
        });
    };

    Flip.prototype._removeEvent = function () {
        $(this.viewport).unbind("webkitTransitionEnd");
    };

    function reportError(mes, type) {
        if (!type) {
            type = 'log';
        }
        console[type](mes);
    }

});
