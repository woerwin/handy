#Confirm
提供移动设备浏览器端 Confirm [模态对话框](http://zh.wikipedia.org/wiki/%E5%AF%B9%E8%AF%9D%E6%A1%86)

在阅读 `Confirm` 之前建议您先阅读 [handy overlay](overlay)

`Confirm` 默认的 HTML 模版：
```html
<div class="ui-confirm">
  <header class="ui-confirm-header">
    <a href="javascript:void(0)" class="ui-confirm-close">关闭</a>
  </header>
  <section class="ui-confirm-body"></section>
  <footer class="ui-confirm-footer">
    <a href="javascript:void(0)" class="ui-confirm-ok">确定</a>
    <a href="javascript:void(0)" class="ui-confirm-cancel">取消</a>
  </footer>
</div>
```
您可以通过 template 参数修改这套模版，如果修改 template 参数，相应的 contentElement closeElement titleElement  confirmElement cancelElement 必须要修改。

##模块依赖
- [handy dialog](dialog)
- [zepto](http://github.com/alipay/arale/tree/master/lib/zepto)

##代码片段
- 一个极为简单的 `Confirm`
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
上面的代码创建了一个简单的 `Confirm` 对象.
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

##API 参考
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

##测试用例
- [runner.html](../lib/confirm/tests/runner.html)

##演示地址
- [Demo](../lib/confirm/examples/confirm.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈


