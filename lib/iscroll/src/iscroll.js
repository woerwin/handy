// iscroll
// =======
// 轩与@http://weibo.com/semious
define(function(require, exports, module) {
    var Widget = require('widget'),
        $ = require('$'),
        libiScroll = require("./4.1.9/iscroll.js"),
        iScroll;

    module.exports = iScroll = Widget.extend({
        attrs:{
            element:null,
            viewportCSS:{
                position:"relative",
                readOnly:true
            }
        },
        //滚动结构更新 当滚动 DOM 结构发生变化时，需要进行 refresh
        refresh:function() {
            this.iScrollObj.refresh();
        },

        // 销毁 iscroll 对象 不需要进行滚动的时候，将此对象进行销毁
        destroy:function() {
            iScroll.superclass.destroy.call(this);

            //销毁第三方 iScroll 实例
            this.iScrollObj.destroy();

            $(this.srcNode).unwrap();
            this.srcNode = null;
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
            this._wrapiScroll();
            this._initCSS();
            this.iScrollObj = new libiScroll(this.viewport[0], this.get("options"));
        },
        //在 iScroll外层包个viewport
        _wrapiScroll:function() {
            var viewport = $('<div data-iScroll-role="viewport"></div>');
            this.element.wrapAll(viewport);
            this.viewport = viewport;
        },
        //初始化 iScroll 组件需要的样式
        _initCSS:function() {
            var iheight = this.element.data('iscrollHeight') || "",
                iwidth = this.element.data('iscrollWidth') || "",
                viewportClass = this.element.data('iscrollClass') || "";

            this.viewport.addClass(viewportClass).css(this.get("viewportCSS")).css({
                height:iheight,
                width:iwidth
            });
        }
    });
});
