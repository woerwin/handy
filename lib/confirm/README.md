#Confirm
提供移动设备浏览器端 Confirm [模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)

在阅读 `Confirm` 之前建议您先阅读 [overlay](http://github.com/alipay/handy/tree/master/lib/overlay)

##模块依赖
- [overlay](http://github.com/alipay/handy/tree/master/lib/overlay)
- [zepto](http://github.com/alipay/arale/tree/master/lib/zepto)

##Confirm 内部数据
@protected 受保护的数据，只在当前类和 `Confirm` 的子类中才能使用
```js
  this.mask // zepto 对象。半透明遮照元素
  this.syncShim // 受保护的方法，用于同步垫片的样式
```

##代码片段
- 一个极为简单的 `Confirm`(使用原生 `Confirm` 函数)
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
上面的代码创建了一个简单的 `Confirm` 对象，由于没有提供 `element` 参数，当执行 `confirm.show()` 时，一个系统原生的 `Confirm`
 弹出 `(window.confirm)`
- 一个自定义 UI 的 `Confirm`
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

                this.get('element').css({
                    '-webkit-transform': 'scale(0)',
                    display: 'none'
                });
                setTimeout(function (){
                    that.mask.css('display','block').animate({
                        scale: 1
                    },150,'ease',function (){
                        that.sync();
                    });
                    that.get('element').css('display','block').animate({
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

                this.get('element').css({
                    display: 'block'
                });
                this.mask.animate({
                    scale: 0
                });
                this.get('element').animate({
                    scale: 0
                });
            }
        });

   var uiConfirm2 = new scaleConfirm({
            element: '<div style="background:#fff;padding:40px;">'+
                       '<a href="#" data-confirm-role="trigger" data-confirm-action="confirm">确定</a>'+
                       '<a href="#" data-overlay-role="trigger" data-overlay-action="hide">关闭</a>'+
                     '</div>',
            message: 'handy confirm 演示'
        });
    uiConfirm2.render();
    uiConfirm2.on('confirm',function (o){ alert('您点击了确定');});
   });
```

##API 参考
###参数说明
`styles` `element` 的样式集，对象字面量格式，默认的值是:
```js
  styles: {
      position: 'absolute',
      top: 0,
      left: 0,
      margin: 0
  }
```
`Confirm` 带有一套 data-attribute，它也**继承了 `Overlay` data-attribute**：

`data-confirm-role` 表示 confirm 模块中的角色，当前只有一个可选参数 `trigger`

`data-confirm-action` 表示 overlay 模块中的角色的行为，当前可选参数有 `confirm`

`Confirm` 模块的 `data-confirm-role` 和 `data-confirm-action` 必需同时出现:
```html
<a href="javascript:void(0)" data-overlay-role="trigger" data-overlay-action="hide">取消</a>
<a href="javascript:void(0)" data-overlay-role="trigger" data-overlay-action="destroy">销毁</a>
<a href="javascript:void(0)" data-confirm-role="trigger" data-confirm-action="confirm">确定</a>
```
`Confirm` 会自动为 `element` 元素中的所有定义了 `Confirm data-attribute` 属性的节点注册事件。

##sync `instance.sync()`
在浏览器窗口或设备方向发生变化时用于更新 confirm 浮层的布局
```js
window.addEventListener('orientationchange',function (){
    confirm.sync();
},false);
```

更多的方法请阅读 [overlay](http://github.com/alipay/handy/tree/master/lib/overlay)

##测试用例
- [runner.html](../lib/confirm/tests/runner.html)

##演示地址
- [Demo](../lib/confirm/examples/confirm.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈


