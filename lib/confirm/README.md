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
      <section>Confirm 内容<br /><a href="javascript:void(0)" data-overlay-role="trigger" data-overlay-action="hide">关闭</a></section>
</div>
```
```js
var var uiConfirm = new Confirm({
        element: '#J-confirm',
        message: 'handy confirm 演示',
        onConfirm: function (o){
            alert('您点击了确定');
        },
        onHide: function (o){
            alert('confirm 浮层已关闭');
        }
    });
```

