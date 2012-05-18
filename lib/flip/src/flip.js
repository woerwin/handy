// flip
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var $ = require('zepto'),
        Events = require('events'),
        Flip;

    var defaults = {
        direction:"ltr", //转动方向 默认从左往右 沿y轴逆时针旋转,
        frontCSS:{
            "-webkit-backface-visibility":"hidden",
            "-webkit-transform-style":"preserve-3d",
            "-webkit-perspective":"600px"
        },
        backCSS:{
            "-webkit-backface-visibility":"hidden",
            "transform-style":"preserve-3d",
            "-webkit-perspective":"600px"
        }
    };

    module.exports = Flip = function (flips, options) {
        for (var i in flips) {
            this.flipDOMs.push($(flips[i]).get(0));
        }
        this.options = $.extend({}, defaults, options);
    };

    Events.mixTo(Flip);

    //Flip 类的方法
    Flip.prototype = {
        flipDOMs:[],
        //源元素节点
        srcNode:null,
        //目标元素节点
        targetNode:null,
        //进行翻动
        flip:function (selDOM) {
            this.srcNode = null;
            this.targetNode = null;
            //如果目标元素无效，则直接返回，不做任何动作
            for (var i in this.flipDOMs) {
                if (this.flipDOMs[i] == $(selDOM).get(0)) {
                    this.targetNode = $(selDOM).get(0);
                } else {
                    this.srcNode = this.flipDOMs[i];
                }
            }
            //预初始化，在进行变换前，进行各种初始化设置
            this._init();
            //开始进行Flip 锁定当前正在变形的元素，不再支持其他变形
            this._startFlip();
        },
        //初始化节点
        _init:function () {
            //在节点上增加翻转所需的属性
            $(this.srcNode).css(this.options.frontCSS);
            $(this.targetNode).css(this.options.backCSS);
            switch (this.options.direction) {
                case "ltr":
                    this._srcStartCSS = {
                        "-webkit-transform":"rotateY(0deg)",
                        "-webkit-transition":"-webkit-transform 1.6s ease"
                    };
                    this._srcEndCSS = {"-webkit-transform":"rotateY(180deg)"};
                    this._targetStartCSS = {
                        "-webkit-transform":"rotateY(180deg)",
                        "-webkit-transition":"-webkit-transform 1.6s ease"
                    };
                    this._targetEndCSS = {"-webkit-transform":"rotateY(0deg)"};
                    break;
                default:
                    this._srcStartCSS = {
                        "-webkit-transform":"rotateY(0deg)",
                        "-webkit-transition":"-webkit-transform 1s ease"
                    };
                    this._srcEndCSS = {"-webkit-transform":"rotateY(180deg)"};
                    this._targetStartCSS = {
                        "-webkit-transform":"rotateY(180deg)",
                        "-webkit-transition":"-webkit-transform 1s ease"
                    };
                    this._targetEndCSS = {"-webkit-transform":"rotateY(0deg)"};
            }
        },
        //开始渲染界面
        _startFlip:function () {
            var that = this;
//            this.trigger("transitionStart", this);
//            $(this.srcNode).bind("transitionend", function () {
//                that._end();
//            });
            $(this.srcNode).css({"display":"block"}).css(this._srcStartCSS).css(this._srcEndCSS);
//            $(this.targetNode).show();
            $(this.targetNode).css({"display":"block"}).css(this._targetStartCSS);
            window.setTimeout(function(){$(that.targetNode).css(that._targetEndCSS)},1);
        },
        //翻转结束 释放临时使用资源
        _end:function () {
//            this.trigger("transitionEnd", this);
            $(this.srcNode).attr("style", "");
            $(this.targetNode).attr("style", "");
        },
        _srcStartCSS:{},
        _targetStartCSS:{},
        _srcEndCSS:{},
        _targetEndCSS:{}
    };
});
