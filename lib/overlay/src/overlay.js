// Overlay 提供基于浮层表现的 UI 组件，提供浮层的显示、隐藏、定位
define(function(require, exports, module) {
    var Base = require('base'),
        Events = require('events'),
        $ = require('zepto');

    var Overlay = Base.extend({
        options: {
            srcNode: null, // HTML 模版。如果提供 srcNode ，srcNode 将做为 confirm 的 UI ，默认使用 window.confirm
            zIndex: 9999
        },
        initialize: function (options){
            this.setOptions(options);
        },
        sync: function (){
            // 如果没有提供 srcNode 或者当前模版已经隐藏
            if(
                (this.options.srcNode && $(this.options.srcNode).css('display') === 'none')
                ||
                (!this.options.srcNode)
              ){
                return;
            }

            $(this.options.srcNode).css({
                opacity: 0
            });

            var doc = document.documentElement,
                winW = doc.clientWidth,
                winH = doc.clientHeight,
                uiW = parseInt($(this.options.srcNode).get(0).clientWidth,10),
                uiH = parseInt($(this.options.srcNode).get(0).clientHeight,10),
                scrollY = window.scrollY;

            // 解决 iOS 设备地址栏控件高度隐藏问题
            if($.os.ios){
               var clientH_scrollH_difference = doc.scrollHeight - winH;

               if(clientH_scrollH_difference >= 1 && clientH_scrollH_difference < 60){
                   scrollY += clientH_scrollH_difference;
               }
            }

            $(this.options.srcNode).css({
                left: (winW - uiW) / 2,
                top: (winH - uiH) / 2 + scrollY,
                opacity: 1
            });

            this.trigger('sync',this);
        },
        render: function (){
            // srcNode 定义为 HTML 字符串时
            if(this.options.srcNode && !$(this.options.srcNode).parent().get(0)){
                this.options.srcNode = $(this.options.srcNode).hide();
            }

            // 复制一份用户提供的 srcNode ，并且去除 id
            this.options.srcNode = $(this.options.srcNode).clone().appendTo('body').attr('id','');
            this.__setCSS();
        },
        destroy: function (){
            $(this.options.srcNode).remove();

            delete this.options;
        },
        show: function (){
            this.trigger('shown',this);
        },
        hide: function (){
            this.trigger('hide',this);
        },
        __setCSS: function (){
            $(this.options.srcNode).css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: this.options.zIndex,
                margin: 0,
                display: 'none'
            });
        }
    });

    Events.mixTo(Overlay);

    module.exports = Overlay;
});
