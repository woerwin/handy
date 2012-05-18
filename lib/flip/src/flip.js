// iscroll
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var $ = require('zepto'),
        Events = require('events'),
        Flip;

    var defaults = {
        srcNode:null,
        direction:"ltr", //转动方向 默认从左往右 沿y轴逆时针旋转,
        frontCSS:{
            "-webkit-backface-visibility":"hidden",
            "-webkit-transform-style":"preserve-3d",
            "-webkit-perspective":400,
            "-webikit-transition":"-webkit-transform 500 ease"
        },
        backCSS:{
            "-webkit-backface-visibility":"hidden",
            "transform-style":"preserve-3d",
            "-webkit-perspective":400,
            "-webikit-transition":"-webkit-transform 500 ease"
        }
    };

    Events.mixTo(Flip);

    module.exports = Flip = function (selDoms, options) {
        this.scrNode = $(selDom).get(0);
        this.options = $.extend({}, defaults, options);
    };

    //Flip类的方法
    Flip.prototype = {
        //源元素节点
        srcNode:null,
        //目标元素节点
        targetNode:null,
        //进行翻动
        flip:function (selDom) {
            //如果目标元素无效，则直接返回，不做任何动作
            if ($(selDom).length == 0) {
                return;
            }
            this.targetNode = $(selDom).get(0) || null;
            //预初始化，在进行变换前，进行各种初始化设置
            this._init();
            //开始进行Flip 锁定当前正在变形的元素，不再支持其他变形
            this._start();
            //结束Flip，进行flip之后的各种善后处理
            this._end();
        },
        //初始化节点
        _init:function () {
            //在节点上增加翻转所需的属性
            $(this.scrNode).css(this.options.frontCSS);
            $(this.targetNode).css(this.options.backCSS);
            switch (this.options.direction) {
                case "ltr":
                    this._srcStartCSS = {"-webkit-transform":"rotateY(0deg)"};
                    this._srcEndCSS = {"-webkit-transform":"rotateY(180deg)"};
                    this._targetStartCSS = {"-webkit-transform":"rotateY(180deg)"};
                    this._targetEndCSS = {"-webkit-transform":"rotateY(0deg)"};
                    break;
                default:
                    this._srcStartCSS = {"-webkit-transform":"rotateY(0deg)"};
                    this._srcEndCSS = {"-webkit-transform":"rotateY(180deg)"};
                    this._targetStartCSS = {"-webkit-transform":"rotateY(180deg)"};
                    this._targetEndCSS = {"-webkit-transform":"rotateY(0deg)"};
            }
        },
        //开始进行翻转变化
        _start:function () {
            var that = this;
            this.trigger("transitionStart", this);
            $(this.scrNode).addEventListener("transitionend", function(){
                that._end();
            }, false);
            $(this.scrNode).show().css(this._srcStartCSS).css(this._srcEndCSS).hide();
            $(this.targetNode).show().css(this._targetStartCSS).css(this._targetEndCSS);
        },
        //翻转结束 释放临时使用资源
        _end:function(){
            this.trigger("transitionEnd", this);
            $(this.scrNode).attr("style",null);
            $(this.scrNode).attr("style",null);
        },
        _srcStartCSS:{},
        _targetStartCSS:{},
        _srcEndCSS:{},
        _targetEndCSS:{}
    };
});
