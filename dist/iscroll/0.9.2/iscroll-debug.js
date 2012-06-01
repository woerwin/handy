// iscroll
// =======
// 轩与@http://weibo.com/semious
define("#iscroll/0.9.2/iscroll", ["base","$","./3rd/iscroll/4.1.9/iscroll.js"], function(require, exports, module) {
    var Base = require('base'),
        $ = require('$'),
        libiScroll = require("./3rd/iscroll/4.1.9/iscroll.js"),
        iScroll;

    module.exports = iScroll = Base.extend({
        attrs:{
            element:null,
            viewportCSS:{
                position:"relative",
                readOnly:true
            }
        },
        initialize:function(attrs) {
            iScroll.superclass.initialize.call(this, attrs);
            this.parseElement();
            this.delegateEvents();
            this.setup();
        },
        parseElement:function() {
            this._wrapiScroll();
        },
        delegateEvents:function() {
            //增加当子节点发生变化时， iScroll 组件会自动更新
//            $(this.viewport).bind("DOMSubtreeModified", function() {
//                console.log("DOMSubtreeModifiedCalled");
//            });
        },
        //滚动结构更新 当滚动 DOM 结构发生变化时，需要进行 refresh
        refresh:function() {
            this.iScrollObj.refresh();
        },

        // 销毁 iscroll 对象 不需要进行滚动的时候，将此对象进行销毁
        destroy:function() {
            //销毁第三方 iScroll 实例
            this.iScrollObj.destroy();

            //销毁自身的 iScroll 实例
            this._destroy();
        },
        // 滚动到指定位置
        scrollTo:function(x, y, time, relative) {
            this.iScrollObj.scrollTo(x, y, time, relative);
        },
        // 滚动到指定元素位置
        scrollToElement:function(element, time) {
            this.iScrollObj.scrollToElement(element, time);
        },
        // 滚动到指定“页”
        scrollToPage:function(pageX, pageY, time) {
            this.iScrollObj.scrollToPage(pageX, pageY, time);
        },
        // 设置 iScroll 组件实例
        setup:function() {
            this._initCSS();
            this.iScrollObj = new libiScroll(this.viewport, this.get("options"));
        },
        //在 iScroll外层包个viewport
        _wrapiScroll:function() {
            var viewport = $('<div data-iScroll-role="viewport"></div>');
            this.srcNode = $(this.get("element")).get(0);

            $(this.srcNode).wrapAll(viewport);
            this.viewport = $(this.srcNode).parent("*[data-iScroll-role=viewport]")[0];

        },
        //初始化 iScroll 组件需要的样式
        _initCSS:function() {
            var iheight = this.srcNode.dataset.iscrollHeight || "",
                iwidth = this.srcNode.dataset.iscrollWidth || "",
                viewportClass = this.srcNode.dataset.iscrollClass || "";

            $(this.viewport).addClass(viewportClass).css(this.get("viewportCSS")).css({
                height:iheight,
                width:iwidth
            });
        },
        //销毁 iScroll 实例
        _destroy:function() {
            $(this.srcNode).unwrap();
            this.srcNode = null;
        }
    });
});
