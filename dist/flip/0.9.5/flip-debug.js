// flip
// =======
// 轩与@http://weibo.com/semious
define(function(require, exports, module) {
    var Widget = require('widget'),
        $ = require('$'),
        Flip;

    var m = Math,
        dummyStyle = document.createElement('div').style,
        vendor = (function() {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for (; i < l; i++) {
                t = vendors[i] + 'ransform';
                if (t in dummyStyle) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }
            return false;
        })(),
        has3d = prefixStyle('perspective') in dummyStyle;
    //释放临时节点
    dummyStyle = null;

    module.exports = Flip = Widget.extend({
        attrs:{
            element:null,
            direction:"ltr", // 转动方向 默认从左往右 沿y 轴逆时针旋转,
            animation:"none",

            frontNode:null,
            backNode:null,
            contarinrCSS:{
                readonly:true
            },
            contarinrCSS2D:{
                readonly:true
            },
            containerCSS3D:{
                "-webkit-perspective":"1000",
                "-webkit-perspective-origin":"50% 50%",
                readonly:true
            },
            flipCSS:{
                "position":"relative",
                readonly:true
            },
            flipCSS2D:{
                "position":"relative",
                readonly:true
            },
            flipCSS3D:{
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
        // 解析DOM元素
        parseElement:function() {
            Flip.superclass.parseElement.call(this);

            // 将 html 用户定义属性进行解析为相应的属性/对象
            this.set("frontNode", this.element.find('*[data-flip-role=frontFace]') || null);
            this.set("backNode", this.element.find('*[data-flip-role=backFace]') || null);

            var triggerNodes = this.element.find('*[data-flip-role=trigger]');

            for (i = 0; i < triggerNodes.length; i++) {
                var t = this.get("triggers");
                t.push(triggerNodes[i]);
                this.set("triggers", t);
            }

            //wrap flip 增加flip viewport
            this._wrapFlip();
        },

        // 初始化 flip 组件
        setup:function() {
            // 初始化相应结构的3DCSS样式
            if (this.get("animation") == "3D" && has3d) {
                this._init3DCSS();
            } else {
                this._initCSS();
            }
        },

        // 初始化相关事件
        delegateEvents:function() {
            Flip.superclass.delegateEvents.call(this);

            var i, action,
                that = this;

            for (i in this.get("triggers")) {
                action = $(this.get("triggers")[i]).data('flipAction') || "flipBack";
                switch (action) {
                    case "flipFront":
                        $(this.get("triggers")[i]).bind("click.flip", function(e) {
                            e.preventDefault();
                            that.flip("front");
                        });
                        break;
                    case "flipBack":
                    default:
                        $(this.get("triggers")[i]).bind("click.flip", function(e) {
                            e.preventDefault();
                            that.flip("back");
                        });
                        break;
                }
            }
        },

        //Flip 类的方法
        flip:function(face) {
            // 如果动画正在进行中或者没有源节点或者已经是该 face ，则不做任何处理
            if (this._animating || !this.element || face == this.face) {
                return;
            }
            this.face = face || "back";
            if (this.get("animation") == "3D" && has3d) {
                this._flip3D();
            } else {
                this._flip();
            }
        },

        // 开始渲染 界面
        _flip:function() {
            var that = this;

            switch (this.face) {
                case "front":
                    this._startFrontFaceCSS = { "display":"none"};
                    this._endFrontFaceCSS = {"display":"block"};
                    this._startBackFaceCSS = { "display":"block"};
                    this._endBackFaceCSS = {"display":"none"};
                    break;
                case "back":
                default:
                    this._startFrontFaceCSS = { "display":"block"};
                    this._endFrontFaceCSS = {"dipplay":"none"};
                    this._startBackFaceCSS = { "display":"none"};
                    this._endBackFaceCSS = {"display":"block"};
                    break;
            }

            //在 frontnode 和 backnode 增加翻转前需要的样式定义
            $(this.get("frontNode")).css(this._startFrontFaceCSS);
            $(this.get("backNode")).css(this._startBackFaceCSS);
            // 触发自定义事件
//            this.trigger('transitionStart', this);
            setTimeout(function() {
                $(that.get("frontNode")).css(that._endFrontFaceCSS);
                $(that.get("backNode")).css(that._endBackFaceCSS);
            }, 10);
        },

        // 开始渲染 2D 界面
        _flip2D:function() {

        },

        // 开始渲染 3D 界面
        _flip3D:function() {
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
            $(this.viewport).bind("webkitTransitionEnd", function() {
                that._flip3DEnd();
            });
            //为 viewport 加载终点的样式定义
            $(this.viewport).css(this._endCSS);
        },

        // 翻转结束 释放临时使用资源
        _flip3DEnd:function() {
            // 触发自定义事件
            this.trigger('transitionEnd', this);
            this._removeEvent();
            this._animating = false;
        },

        _wrapFlip:function() {
            var container = $(this.srcNode),
                pageViewPort = $('<div data-flip-role="viewport"></div>');

            $(this.get("frontNode")).wrapAll(pageViewPort);
            $(this.get("backNode")).wrapAll(pageViewPort);
            this.viewport = $(pageViewPort, container);
        },

        // 初始化关键元素的 3DCSS 样式
        _init3DCSS:function() {
            //add CSS prefilp style
            this.element.css(this.get("containerCSS3D"));
            $(this.viewport).css(this.get("flipCSS3D"));
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
        // 初始化 CSS 样式
        _initCSS:function() {
            //add CSS prefilp style
            this.element.css(this.get("containerCSS"));
            $(this.viewport).css(this.get("flipCSS"));
            $(this.get("frontNode")).css(this.get("faceCSS"));
            $(this.get("backNode")).css(this.get("faceCSS"));
        },

        // 移除动画结束事件
        _removeEvent:function() {
            $(this.viewport).unbind("webkitTransitionEnd");
        }
    });

    function prefixStyle(style) {
        if (vendor === '') return style;
        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    }
});