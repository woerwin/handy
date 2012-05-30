// Overlay
// -------
// 提供基于浮层表现的 UI 组件，提供浮层的显示、隐藏、定位
define(function(require, exports, module) {
    var Base = require('widget'),
        $ = require('$');

    var Overlay = Base.extend({
        attrs: {
            element: null,
            parent: $('body'), // 将 element 动态插入到 parent
            styles: { // 浮层样式
                zIndex: 9999,
                display: 'none'
            }
        },
        initialize: function(attrs) {
            Overlay.superclass.initialize.call(this,attrs);

            // protected
            this.shim = null;
        },
        render: function() {
            // element 定义为 HTML 字符串时
            if (
                this.get('element')
                &&
                !$(this.get('element')).parent().get(0)
               ) {
                this.set('element',$(this.get('element')).hide());
            }

            this.set('element',
                     $(this.get('element')).appendTo(this.get('parent'))
                    ).setStyles(this.get('styles'))
                     .bindUI();

            return this;
        },
        bindUI: function() {
            var triggers = this.get('element')
                           .find('*[data-overlay-role="trigger"]'),
                that = this;

            Array.prototype.slice.call(triggers);

            triggers.forEach(function(trigger) {
                if (
                    trigger
                    &&
                    (action = $(trigger).attr('data-overlay-action'))
                   ) {
                    switch (action) {
                        case 'hide':
                            $(trigger)
                                .unbind('click.overlay')
                                .bind('click.overlay', $.proxy(function(e) {
                                  e.preventDefault();
                                  this.hide();
                            },that));
                            break;
                        case 'show':
                            $(trigger)
                                .unbind('click.overlay')
                                .bind('click.overlay', $.proxy(function(e) {
                                  e.preventDefault();
                                  this.show();
                            },that));
                            break;
                        case 'destroy':
                            $(trigger)
                                .unbind('click.overlay')
                                .bind('click.overlay', $.proxy(function(e) {
                                  e.preventDefault();
                                  this.destroy();
                            },that));
                            break;
                    }
                }
            });

            return this;
        },
        destroy: function() {
            this.get('element')[0] && this.get('element').remove();
            this.shim && this.shim.remove();
            this.set('element',null);
            this.shim = null;
            this.set('parent',$('body')).set('styles',{
                zIndex: 9999
            });
        },
        show: function() {
            var display = '',
                element = this.get('element');

            if (element.css('display') === 'block') {
                display = 'block';
            }else if (element.css('display') === '-webkit-box') {
                display = '-webkit-box';
            }

            element.css({
                'display': display
            });

            // 本来 handy 对 overlay addShim 方法的设计是:
            // 如果是 android 设备再添加一个 shim
            // 但后来发现某些 android 刷机用户的 UA 通过 zepto 无法准确获取
            // 所以我们去除了这层判断处理，直接添加 shim
            /*if($.os.android){
                this.addShim();
            }*/
            this.addShim().trigger('shown', this);

            return this;
        },
        hide: function() {
            this.get('element').hide();
            this.trigger('hide', this);
            this.shim && this.shim.remove();
            this.shim = null;

            return this;
        },
        setStyles: function(styles) {
            this.get('element').css(styles);

            if(this.shim){
                var element = this.get('element'),
                    boxModelSize = getBoxModelSize(element[0]);

                this.shim.css({
                    width: parseInt(element.get(0).clientWidth,10)
                           + boxModelSize.borderWidth.left
                           + boxModelSize.borderWidth.right,
                    height: parseInt(element.get(0).clientHeight,10)
                           + boxModelSize.borderWidth.top
                           + boxModelSize.borderWidth.bottom,
                    left: parseInt(element.css('left'),10),
                    top: parseInt(element.css('top'),10) + window.scrollY
                });
            }

            return this;
        },
        // 解决 Android OS 部分机型中事件穿透问题
        // 如果子类覆盖 show 方法，强烈建议大子类的 show 方法中调用 addShim
        addShim: function() {
            if (this.shim) {
                return;
            }

            var element = this.get('element'),
                offset = element.offset(),
                zIndex = ((parseInt(element.css('zIndex'), 10) - 1) || 1);

            var shim = $('<div data-overlay-role="shim" '+
                         'style="position:absolute;' +
                         'margin:0;'+
                         'padding:0;'+
                         'border:none;'+
                         'background:rgba(255,255,255,0.01);-'+
                         'webkit-tap-highlight-color:rgba(0,0,0,0);' +
                         'width:' + offset.width + 'px;'+
                         'height:' + offset.height + 'px;' +
                         'top:' + offset.top + 'px;'+
                         'left:' + offset.left + 'px;' +
                         'z-index:' + zIndex + ';"></div>');
            this.shim = shim.appendTo(element.parent());

            return this;
        }
    });

    module.exports = Overlay;
});

// Get elements actual margin,padding and border-width value
// return {
//   margin: {
//     top:
//     right:
//     bottom:
//     left:
//   },
//   padding: {
//     top:
//     right:
//     bottom:
//     left:
//   },
//   borderWidth: {
//     top:
//     right:
//     bottom:
//     left:
//   }
// }
function getBoxModelSize(element){
    var CSSStyleDeclaration = getComputedStyle(element),
        margin = CSSStyleDeclaration['margin'],
        padding = CSSStyleDeclaration['padding'],
        bordersWidth = CSSStyleDeclaration['border-width'];

    // convert to Array
    // example ['10px','20px','30px','0px']
    function splitStylesValue(styles){
        return styles.split(' ');
    }

    // remove css properties PX unit
    function removeStylesPX(styles){
        var _styles = [];
        splitStylesValue(styles).forEach(function (v){
            _styles.push(
                v.replace(/(\d*)([\w|\s]*)$/,function ($1,$2){return $2;})
                );
        });

        return  _styles;
    }

    // parser css
    function parser(styles){
        var l = styles.length,
            result = {};

        switch(l){
            case 1:
                var fillval = styles[0];
                fillStyles(fillval,fillval,fillval);
                break;
            case 2:
                var y = styles[0],
                    x = styles[1];
                fillStyles(y,x);
                break;
            case 3:
                var y = styles[0],
                    x = styles[1];
                fillStyles(x);
                break;
        }



        styles = styles.map(function (v){
            return v*1;
        });

        result['top'] = styles[0];
        result['right'] = styles[1];
        result['bottom'] = styles[2];
        result['left'] = styles[3];

        function fillStyles(){
            for(var i = 0;i < arguments.length;i++){
                styles.push(arguments[i]);
            }
        }
        return result;
    }

    return {
        borderWidth: parser(removeStylesPX(bordersWidth)),
        padding: parser(removeStylesPX(padding)),
        margin: parser(removeStylesPX(margin))
    };
}

