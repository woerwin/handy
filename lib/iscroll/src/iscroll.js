// iscroll
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var $ = require('zepto'),
        libiScroll = require("./3rd/iscroll/4.1.9/iscroll.js"),
        iScroll;

    var defaults = {
        viewportCSS:{
            "position":"relative"
        }
    };

    module.exports = iScroll = function (selDOM, options) {
        this.srcNode = $(selDOM).get(0);
        this.options = $.extend({}, defaults, options);
        this._init();

        this.iScrollObj = new libiScroll(this.viewport, options);
    };

    //滚动结构更新 当滚动 DOM 结构发生变化时，需要进行 refresh
    iScroll.prototype.refresh = function () {
        this.iScrollObj.refresh();
    };

    //销毁 iscroll 对象 不需要进行滚动的时候，将此对象进行销毁
    iScroll.prototype.refresh = function () {
        this.iScrollObj.destroy();
    };

    //滚动到指定位置
    iScroll.prototype.scrollTo = function (x, y, time, relative) {
        this.iScrollObj.scrollTo(x, y, time, relative);
    };

    //滚动到指定元素位置
    iScroll.prototype.scrollToElement = function (element, time) {
        this.iScrollObj.scrollToElement(element, time);
    };

    //滚动到指定“页”
    iScroll.prototype.scrollToPage = function (pageX, pageY, time) {
        this.iScrollObj.scrollToPage(pageX, pageY, time);
    };

    //初始化 iScroll
    iScroll.prototype._init = function () {
        this._wrapiScroll();
        this._initCSS();
    };

    //在 iScroll外层包个viewport
    iScroll.prototype._wrapiScroll = function () {
        var viewport = $('<div data-iScroll-role="viewport"></div>');

        $(this.srcNode).wrapAll(viewport);
        this.viewport = $(this.srcNode).parent("*[data-iScroll-role=viewport]")[0];
    };

    //初始化 iScroll 需要的样式
    iScroll.prototype._initCSS = function () {
        var iheight = this.srcNode.dataset.iscrollHeight || "",
            iwidth = this.srcNode.dataset.iscrollWidth || "",
            viewportClass = this.srcNode.dataset.iscrollClass || "";

        $(this.viewport).addClass(viewportClass).css(this.options.viewportCSS).css({
            height:iheight,
            width:iwidth
        });
    };
});
