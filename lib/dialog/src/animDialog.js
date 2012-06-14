define(function(require, exports, module) {

    var $ = require('$'),
        Overlay = require('overlay'),
        BaseDialog = require('../src/baseDialog');

    // AnimDialog
    // -------
    // AnimDialog 组件继承自 Dialog 组件，提供了显隐的基本动画。

    var AnimDialog = BaseDialog.extend({

        attrs: {
            effect: {
                type: 'fade',
                duration: 400,      // 动画时长
                from: 'up'          // 方向 up|down|left|right
            },
            // 显示的动画效果，若未指定则采用 effect
            showEffect: {},
            // 隐藏时的动画效果，若未指定则采用 effect
            hideEffect: {}
        },

        show: function() {
            if (!this._rendered) {
                this.render();
            }
            var elem = this.element,
                that = this,
                ef = this.get('showEffect');

            if (ef === null) {
                ef = {
                    type: 'none'
                };
            }
            else {
                ef = $.extend({}, this.get('effect'), ef);
            }

            // 无动画
            if (ef.type === 'none') {
                elem.show();
            }
            // 淡入淡出
            else if (ef.type === 'fade') {
               elem.css({
                   'display': 'block',
                   opacity: 0
               }).animate({
                   opacity: 1
               },ef.duration, ef.easing);
            }
            // 滑动
            else if (ef.type === 'slide') {
                var direction = /left|right/i.test(ef.from) ? 'x' : 'y',
                    w = elem.css({
                        display: 'block',
                        opacity: 0
                    }) && elem[0].offsetWidth,
                    h = elem[0].offsetHeight;

                elem.css('opacity',1);
                switch(direction){
                    case 'x':
                        elem.css({
                            width: 0,
                            overflow: 'hidden'
                        }).animate({
                                width: w
                            },ef.duration, ef.easing,function (){
                                elem.css({
                                    overflow: 'auto'
                                })
                            });
                        break;
                    case 'y':
                        elem.css({
                            height: 0,
                            overflow: 'hidden'
                        }).animate({
                                height: h
                            },ef.duration, ef.easing,function (){
                                elem.css({
                                    overflow: 'auto'
                                })
                            });
                        break;
                }
            }
            // 移动
            else if (ef.type === 'move') {
                // 确保目标元素为 block 对象，以便创建窗口层
                elem.css({ display:'block' });
                elem.attr('tabindex', null);
                
                // 得到窗口层
                createLayer.call(this, elem);

                var width = this._layer.get('width'),
                    height = this._layer.get('height'),
                    properties;

                // 位置和显示前的准备
                elem.appendTo(this._layer.element).css({
                    top: 0,
                    left: 0,
                    display: 'block'
                });
                
                if (ef.from == 'left') {
                    elem.css('left', parseInt(elem.css('left')) - width);
                    properties = { left: 0 };
                }
                else if (ef.from == 'right') {
                    elem.css('left', parseInt(elem.css('left')) + width);    
                    properties = { left: 0 };
                }
                else if (ef.from == 'up') {
                    elem.css('top', parseInt(elem.css('top')) - height);
                    properties = { top: 0 };
                }
                else if (ef.from == 'down') {
                    elem.css('top', parseInt(elem.css('top')) + height);
                    properties = { top: 0 };
                }

                elem.animate(properties, {
                    duration: ef.duration,
                    easing: ef.easing,
                    complete: function() {
                        // 这里要复原因为 move 而造成的文档变化
                        // 真恶心
                        that.element.appendTo(document.body);
                        that.set('align', that.get('align'));
                        that._layer.destroy();
                        that._layer = null;
                    }
                });
            }

            return this;
        },

        hide: function() {
            var elem = this.element,
                that = this,
                ef = this.get('hideEffect');

            if (ef === null) {
                ef = {
                    type: 'none'
                };
            }
            else {
                ef = $.extend({}, this.get('effect'), ef);
            }

            // 无动画
            if (!ef || ef.type === 'none') {
                elem.hide();
            }
            // 淡入淡出
            else if (ef.type === 'fade') {
                elem.animate({
                        opacity: 0
                    },ef.duration, ef.easing,function (){
                    elem.css('display','none');
                });
            }
            // 滑动
            else if (ef.type === 'slide') {
                var direction = /left|right/i.test(ef.from) ? 'x' : 'y',
                    w = elem[0].offsetWidth,
                    h = elem[0].offsetHeight;

                switch(direction){
                    case 'x':
                        elem.css({
                            overflow: 'hidden'
                        }).animate({
                                width: 0
                            },ef.duration, ef.easing,function (){
                                elem.css({
                                   width: w
                                }).hide();
                            });
                        break;
                    case 'y':
                        elem.css({
                            overflow: 'hidden'
                        }).animate({
                                height: 0
                            },ef.duration, ef.easing,function (){
                                elem.css({
                                    height: h
                                }).hide();
                            });
                        break;
                }
            }
            // 移动
            else if (ef.type === 'move') {
                // 得到窗口层
                createLayer.call(this, elem);
                
                var width = this._layer.get('width'),
                    height = this._layer.get('height'),
                    properties;

                // 位置和显示前的准备
                elem.appendTo(this._layer.element).css({
                    top: 0,
                    left: 0,
                    display: 'block'
                });

                if (ef.from == 'left') {
                    properties = { left: -width };
                }
                else if (ef.from == 'right') {
                    properties = { left: width };
                }
                else if (ef.from == 'up') {
                    properties = { top: -height };
                }
                else if (ef.from == 'down') {
                    properties = { top: height };
                }

                elem.animate(properties, {
                    duration: ef.duration,
                    easing: ef.easing,
                    complete: function() {
                        that.element.appendTo(document.body);
                        that.set('align', that.get('align'));
                        that.element.hide();
                        that._layer.destroy();
                        that._layer = null;
                    }
                });
            }

            return this;
        }

    });

    module.exports = AnimDialog;

    // Helpers
    // -------

    // 准备好窗口层
    function createLayer(elem) {
        if (!this._layer) {
            this._layer = new Overlay({
                width: elem[0].offsetWidth,
                height: elem[0].offsetHeight,
                zIndex: 100,
                visible: true,
                style: {
                    overflow: 'hidden'
                },
                align: {
                    baseElement: elem[0]
                }
            });
        }
        this._layer.show();
    }

});

