#Confirm
提供移动平台 Confirm [模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)

##模块依赖
- [overlay](http://github.com/alipay/handy/tree/master/lib/overlay)
- [zepto](http://github.com/alipay/arale/tree/master/lib/zepto)

##Confirm 内部数据
@protected 受保护的数据，只在当前类和 Confirm 的子类中才能使用
```js
  this.mask = null;// 半透明遮照元素
```

##代码片段
- 实例化 `Confirm` 对象
```js
  var confirm = new Confirm({
              message: 'Handy confirm 演示',
              onConfirm: function (o){
                  alert('您点击了确定')
              },
              onHide: function (o){
                  alert('您点击了取消')
              }
       });

  confirm.render();
  document.querySelector('#J-simple-confirm').addEventListener('click',function (){
              confirm.show();
  },false);
```
上面的代码创建了一个简单的 `Handy confirm` 对象，由于没有提供 `element` 参数，当用户点击 `#J-simple-confirm` 时，一个系统原生的 `Confirm`
 弹出 `(window.confirm)`
- 一个自定义 UI 的 confirm
```html
<div id="J-confirm" class="J-confirm" style="display:none;">
      <h2>Confirm 标题</h2>
      <section>
          Confirm 内容<br />
          <a href="javascript:void(0)" data-overlay-role="trigger" data-overlay-action="hide">关闭</a>
      </section>
</div>
```
```js
seajs.use('../src/confirm', function (Confirm) {
   var uiConfirm = new Confirm({
        element: '#J-confirm',
        message: 'handy confirm 演示',
        onConfirm: function (o){
            alert('您点击了确定');
        },
        onHide: function (o){
            alert('confirm 浮层已关闭');
        }
       });
    uiConfirm.render();
});
```
- 继承 `Confirm`，创建一个带有缩放 (scale) 动画的 `Confirm`
```js
seajs.use('../src/confirm', function (Confirm) {
   var scaleConfirm = Confirm.extend({
            show: function (){
                // 调用父类的 show 方法
                scaleConfirm.superclass.show.call(this);

                var that = this;
                this.mask.css({
                    '-webkit-transform-origin': '50% 50%',
                    '-webkit-transform': 'scale(0)',
                    display: 'none'
                });

                this.options.element.css({
                    '-webkit-transform': 'scale(0)',
                    display: 'none'
                });
                setTimeout(function (){
                    that.mask.css('display','block').animate({
                        scale: 1
                    },150,'ease',function (){
                        that.sync();
                    });
                    that.options.element.css('display','block').animate({
                        scale: 1
                    },500,'ease');
                },0);
            },
            hide: function (){
                // 调用父类的 hide 方法
                scaleConfirm.superclass.hide.call(this);

                this.mask.css({
                    display: 'block'
                });

                this.options.element.css({
                    display: 'block'
                });
                this.mask.animate({
                    scale: 0
                });
                this.options.element.animate({
                    scale: 0
                });
            }
        });

   var uiConfirm2 = new scaleConfirm({
            element: '&lt;div style="background:#fff;padding:40px;"&gt;'+
                       '&lt;a href="#" data-confirm-role="trigger" data-confirm-action="confirm"&gt;确定&lt;/a&gt;'+
                       '&lt;a href="#" data-overlay-role="trigger" data-overlay-action="hide"&gt;关闭&lt;/a&gt;'+
                     '&lt;/div&gt;',
            message: 'handy confirm 演示'
        });
    uiConfirm2.render();
    uiConfirm2.on('confirm',function (o){ alert('您点击了确定');});
   });
```
##API 参考
###参数说明
`element` Confirm 的浮层。参数数据类型 DOM Element、CSS Selector、Zepto Object、HTML String('&lt;div&gt;XXX&lt;/div&gt;')

`parentNode` element 将渲染 (appendTo) 到这个节点里，默认是 `$('body')`。参数数据类型和 element 一样

`styles` element 的样式集，对象字面量格式，默认的值是:
```js
  styles: {
      zIndex: 9999,
      display: 'none'
  }
这和 [overlay](http://github.com/alipay/handy/tree/master/lib/overlay) 是的参数是一样的

