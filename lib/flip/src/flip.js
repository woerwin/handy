// flip
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var Base = require('base'),
        $ = require('$'),
        Events = require('events'),
        Flip;

    module.exports = Flip = Base.extend({
        attrs:{
            element:null,
            direction:"ltr", // 转动方向 默认从左往右 沿y 轴逆时针旋转,
            frontNode:null,
            backNode:null,
            containerCSS:{
                "-webkit-perspective":"1000",
                "-webkit-perspective-origin":"50% 50%",
                readonly:true
            },
            flipCSS:{
                "-webkit-transform-style":"preserve-3d",
                "-webkit-transition":"-webkit-transform 0.8s ease",
                "position":"relative",
                readonly:true
            },
            faceCSS:{
                "position":"absolute",
                "left":0,
                "top":0,
                "display":"block",
                readonly:true
            },
            triggers:[]
        },
        initialize:function (attrs) {
            Flip.superclass.initialize.call(this, attrs);

            // 解析DOM元素
            this.parseElement();
            // 加载事件代理
            this.delegateEvents();
            // 组件设置
            this.setup();
        },

        // 解析DOM元素
        parseElement:function () {
            this.srcNode = $(this.get("element")).get(0);

            // 将 html 用户定义属性进行解析为相应的属性/对象
            this.set("frontNode", this.srcNode.querySelector('*[data-flip-role=frontFace]') || null);
            this.set("backNode", this.srcNode.querySelector('*[data-flip-role=backFace]') || null);

            var triggerNodes = this.srcNode.querySelectorAll('*[data-flip-role=trigger]');

            for (i = 0; i < triggerNodes.length; i++) {
                var t = this.get("triggers");
                t.push(triggerNodes[i]);
                this.set("triggers", t);
            }

            //wrap flip 增加flip viewport
            this._wrapFlip();
        },

        // 初始化 flip 组件
        setup:function () {
            // 初始化相应结构的CSS样式
            this._initCSS();
        },

        // 初始化相关事件
        delegateEvents:function () {
            var i, action,
                that = this;

            for (i in this.get("triggers")) {
                action = this.get("triggers")[i].dataset.flipAction || "flipBack";
                switch (action) {
                    case "flipFront":
                        $(this.get("triggers")[i]).bind("click.flip", function (e) {
                            e.preventDefault();
                            that.flip("front");
                        });
                        break;
                    case "flipBack":
                    default:
                        $(this.get("triggers")[i]).bind("click.flip", function (e) {
                            e.preventDefault();
                            that.flip("back");
                        });
                        break;
                }
            }
            Events.mixTo(this);
        },

        //Flip 类的方法
        flip:function (face) {
            // 如果动画正在进行中或者没有源节点或者已经是该 face ，则不做任何处理
            if (this._animating || !this.srcNode || face == this.face) {
                return;
            }
            this.face = face || "back";

            // 开始进行翻转
            this._startFlip();
        },

        // 开始渲染界面
        _startFlip:function () {
            var that = this;
            switch (this.get("direction")) {
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

            // 触发自定义事件
            this.trigger('transitionStart', this);
            $(this.viewport).bind("webkitTransitionEnd", function () {
                that._end();
            });
            //为 viewport 加载终点的样式定义
            $(this.viewport).css(this._endCSS);
        },

        // 翻转结束 释放临时使用资源
        _end:function () {
            // 触发自定义事件
            this.trigger('transitionEnd', this);
            this._removeEvent();
            this._animating = false;
        },

        _wrapFlip:function () {
            var container = $(this.srcNode),
                pageViewPort = $('<div data-flip-role="viewport"></div>');

            $(this.get("frontNode")).wrapAll(pageViewPort);
            $(this.get("backNode")).wrapAll(pageViewPort);
            this.viewport = $(pageViewPort, container);
        },

        // 初始化关键元素的 css 样式
        _initCSS:function () {
            //add CSS prefilp style
            $(this.srcNode).css(this.get("containerCSS"));
            $(this.viewport).css(this.get("flipCSS"));
            $(this.get("frontNode")).css(this.get("faceCSS"));
            $(this.get("backNode")).css(this.get("faceCSS"));

            // 在节点上增加翻转所需的属性
            this.get("frontNode") && $(this.get("frontNode")).css({
                "-webkit-transform":"rotateY(0deg)",
                "-webkit-backface-visibility":"hidden"
            });
            this.get("backNode") && $(this.get("backNode")).css({
                "-webkit-transform":"rotateY(180deg)",
                "-webkit-backface-visibility":"hidden"
            });
        },

        // 移除动画结束事件
        _removeEvent:function () {
            $(this.viewport).unbind("webkitTransitionEnd");
        }
    });

    function reportError(mes, type) {
        if (!type) {
            type = 'log';
        }
        console[type](mes);
    }
});
