// flip
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var $ = require('zepto'),
        Events = require('events'),
        Flip;

    var defaults = {
        direction:"ltr", // 转动方向 默认从左往右 沿y 轴逆时针旋转,
        frontNode:null,
        backNode:null,
        containerCSS:{
            "-webkit-perspective":"1000",
            "-webkit-perspective-origin":"50% 50%"
        },
        flipCSS:{
            "-webkit-transform-style":"preserve-3d",
            "-webkit-transition":"-webkit-transform 0.8s ease",
            "position":"relative"
        },
        faceCSS:{
            "position":"absolute",
            "left":0,
            "top":0,
            "display":"block"
        },
        triggers:[]
    };

    module.exports = Flip = function (selDom, options) {
        var i, triggers = [];

        if ($(selDom).length == 0) {
            reportError("[Flip Module] Can not find selector,please check your selector!\r\nselector:" + selDom, "error");
            return;
        }
        this.srcNode = $(selDom).get(0);
        this.options = $.extend({}, defaults, options);

        this._init();
    };

    Events.mixTo(Flip);

    //Flip 类的方法
    Flip.prototype.flip = function (face) {
        //如果动画正在进行中或者没有源节点或者已经是该 face，则不做任何处理
        if (this._animating || !this.srcNode || face == this.face) {
            return;
        }
        this.face = face || "back";

        // 开始进行翻转
        this._startFlip();
    };

    // 初始化 flip 组件
    Flip.prototype._init = function () {
        var that = this;

        //parseHTML data-*
        this._parseHTML();

        //wrap flip 增加flip viewport
        this._wrapFlip();

        // 初始化相应结构的CSS样式
        this._initCSS();

        // 初始化事件
        this._initEvent();
    };

    // 开始渲染界面
    Flip.prototype._startFlip = function () {
        var that = this;
        switch (this.options.direction) {
            case "ltr":
                switch (this.face) {
                    case "front":
                        this._startCSS = { "-webkit-transform":"rotateY(180deg)"};
                        this._endCSS = {"-webkit-transform":"rotateY(0deg)"};
                        break;
                    case "back":
                    default:
                        this._startCSS = { "-webkit-transform":"rotateY(0deg)"};
                        this._endCSS = {"-webkit-transform":"rotateY(180deg)"};
                        break;

                }
                break;
            case "utd":
                switch (this.face) {
                    case "front":
                        this._startCSS = { "-webkit-transform":"rotateX(-180deg)"};
                        this._endCSS = {"-webkit-transform":"rotateX(0deg)"};
                        break;
                    case "back":
                    default:
                        this._startCSS = { "-webkit-transform":"rotateX(0deg)"};
                        this._endCSS = {"-webkit-transform":"rotateX(-180deg)"};
                        break;
                }
                break;
            default:
                switch (this.face) {
                    case "front":
                        this._startCSS = { "-webkit-transform":"rotateY(180deg)"};
                        this._endCSS = {"-webkit-transform":"rotateY(0deg)"};
                        break;
                    case "back":
                    default:
                        this._startCSS = { "-webkit-transform":"rotateY(0deg)"};
                        this._endCSS = {"-webkit-transform":"rotateY(180deg)"};
                        break;
                }
        }

        //为 viewport 增加翻转前需要的样式定义
        $(this.viewport).css(this._startCSS);
        this._animating = true;

        this.trigger('transitionStart', this);
        $(this.viewport).bind("webkitTransitionEnd", function () {
            that._end();
        });
        //为 viewport 加载终点的样式定义
        $(this.viewport).css(this._endCSS);
    };

    // 翻转结束 释放临时使用资源
    Flip.prototype._end = function () {
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

    Flip.prototype._initCSS = function () {
        //add CSS prefilp style
        $(this.srcNode).css(this.options.containerCSS);
        $(this.viewport).css(this.options.flipCSS);
        $(this.options.frontNode).css(this.options.faceCSS);
        $(this.options.backNode).css(this.options.faceCSS);

        // 在节点上增加翻转所需的属性
        this.options.frontNode && $(this.options.frontNode).css({
            "-webkit-transform":"rotateY(0deg)",
            "-webkit-backface-visibility":"hidden"
        });
        this.options.backNode && $(this.options.backNode).css({
            "-webkit-transform":"rotateY(180deg)",
            "-webkit-backface-visibility":"hidden"
        });
    };

    Flip.prototype._initEvent = function () {
        var i,
            that = this;

        for (i in this.options.triggers) {
            action = this.options.triggers[i].dataset.flipAction || "flipBack";
            if (action == "flipFront") {
                $(this.options.triggers[i]).bind("click.flip", function () {
                    that.flip("front");
                })
            } else {
                $(this.options.triggers[i]).bind("click.flip", function () {
                    that.flip("back");
                });
            }
        }
    };

    Flip.prototype._removeEvent = function () {
        $(this.viewport).unbind("webkitTransitionEnd");
    };

    Flip.prototype._parseHTML = function () {
        // 将 html 用户定义属性进行解析为相应的属性/对象
        this.options.frontNode = this.srcNode.querySelector('*[data-flip-role=frontFace]') || null;
        this.options.backNode = this.srcNode.querySelector('*[data-flip-role=backFace]') || null;

        triggers = this.srcNode.querySelectorAll('*[data-flip-role=trigger]');
        for (i = 0; i < triggers.length; i++) {
            this.options.triggers.push(triggers[i]);
        }
    }

    function reportError(mes, type) {
        if (!type) {
            type = 'log';
        }
        console[type](mes);
    }

});
