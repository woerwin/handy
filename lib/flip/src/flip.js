// flip
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var $ = require('zepto'),
        Events = require('events'),
        Flip;

    var defaults = {
        direction:"ltr", //转动方向 默认从左往右 沿y轴逆时针旋转,
        frontNode:null,
        backNode:null,
        flipCSS:{
            "-webkit-transform-style":"preserve-3d",
            "-webkit-transition":"0.8s"
        }
    };

    module.exports = Flip = function (selDom, options) {
        this.srcNode = $(selDom).get(0);
        //TODO srcNode 为异常时，抛出异常
        this.options = $.extend({}, defaults, options);
        // 如果在html中有定义 flip 的定义，以其为准
        this.options.frontNode = this.srcNode.querySelector('*[data-flip-role=front]') || null;
        this.options.backNode = this.srcNode.querySelector('*[data-flip-role=back]') || null;
    };

    Events.mixTo(Flip);

    //Flip 类的方法
    Flip.prototype = {
        //源元素节点
        srcNode:null,
        //进行翻动
        flip:function (face) {
            if (this._animating && !this.srcNode) {
                return;
            }
            this.face = face || "back";
            //预初始化，在进行变换前，进行各种初始化设置
            this._init();
            //开始进行Flip 锁定当前正在变形的元素，不再支持其他变形
            this._startFlip();
        },
        //初始化节点
        _init:function () {
            var that = this;
            switch (this.options.direction) {
                case "ltr":
                    switch (this.face) {
                        case "front":
                            this._startCSS = { "-webkit-transform":"rotateY(180deg)"};
                            this._endCSS = {"-webkit-transform":"rotateY(0deg)"};
                            break;
                        case "back":
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
                            this._startCSS = { "-webkit-transform":"rotateY(0deg)"};
                            this._endCSS = {"-webkit-transform":"rotateY(180deg)"};
                            break;
                    }
            }
            //在节点上增加翻转所需的属性
            this.options.frontNode && $(this.options.frontNode).css({
                "-webkit-transform":"rotateY(0deg)",
                "-webkit-backface-visibility":"hidden"
            });
            this.options.backNode && $(this.options.backNode).css({
                "-webkit-transform":"rotateY(180deg)",
                "-webkit-backface-visibility":"hidden"
            });

            $(this.srcNode).css(this.options.flipCSS).css(this._startCSS);
            $(this.srcNode).bind("webkitTransitionEnd", function () {
                that._end();
            });
        },
        //开始渲染界面
        _startFlip:function () {
            var that = this;
//            this.trigger("transitionStart", this);
            this._animating = true;
            $(that.srcNode).css(that._endCSS);
        },
        //翻转结束 释放临时使用资源
        _end:function () {
            $(this.srcNode).unbind("webkitTransitionEnd");
            this._animating = false;
        },
        _animating:false
    };
});
