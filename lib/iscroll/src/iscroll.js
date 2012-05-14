// iscroll
// =======
// 轩与@http://weibo.com/semious
define(function (require, exports, module) {
    var $ = require('zepto'),
        libiScroll = require("./3rd/iscroll/4.1.9/iscroll.js"),
        iScroll,iScrollObj;

    module.exports = iScroll = function (id, options) {
        iScrollObj = new libiScroll($(id).get(0), options);
    };

    //iScroll类的方法
    iScroll.prototype = {
        //滚动结构更新 当滚动 DOM 结构发生变化时，需要进行 refresh
        refresh:function () {
            iScrollObj.refresh();
        },
        //销毁 iscroll 对象 不需要进行滚动的时候，将此对象进行销毁
        destroy:function () {
            iScrollObj.destroy();
        },
        //滚动到指定位置
        scrollTo:function (x, y, time, relative) {
            iScrollObj.scrollTo(x, y, time, relative);
        },
        //滚动到指定元素位置
        scrollToElement:function (element, time) {
            iScrollObj.scrollToElement(element, time);
        },
        //滚动到指定“页”
        scrollToPage:function (pageX, pageY, time) {
            iScrollObj.scrollToPage(pageX, pageY, time);
        }
    };
});
