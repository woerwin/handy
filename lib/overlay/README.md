#Overlay
提供基于浮层表现的 UI 组件,浮层的显示、隐藏、定位

建议您先阅读 [arale overlay](http://github.com/alipay/arale/tree/master/lib/overlay)

##模块依赖
- [widget](http://github.com/alipay/arale/tree/master/lib/widget)
- [zepto](http://github.com/alipay/arale/tree/master/lib/zepto)
- [handy position](position)
- [android-shim](android-shim)

##Overlay 工作原理
Overlay 会自动为它里面所有配置了以 `data-overlay` 做前缀的属性的节点注册事件。
当显示 `Overlay` 的 `element` 时，`Overlay` 会动态的在 `element` 后面添加一个 [`shim` (垫片)](android-shim)，这个 `shim` 的作用将用来
[解决 android 平台下事件穿透](http://v.youku.com/v_show/id_XNDAxMTE1NTgw.html) 的问题，这也是 **`Overlay`** 组件的一大亮点。

`Overlay` 带有一套 data-attribute API：

`data-overlay-role` 表示 overlay 模块中的角色，当前只有一个可选参数 `trigger`

`data-overlay-action` 表示 overlay 模块中角色的行为，当前可选参数有 `hide`、`destroy`

`Overlay` 模块的 `data-overlay-role` 和 `data-overlay-action` 必需同时出现:
```html
<a href="javascript:void(0)" data-overlay-role="trigger" data-overlay-action="hide">关闭</a>
<a href="javascript:void(0)" data-overlay-role="trigger" data-overlay-action="destroy">销毁</a>
```
`Overlay` 会自动为 `element` 元素中的所有定义了 `Overlay data-attribute` 参数的节点注册事件

##Overlay 的亮点
- 解决了 Android OS 平台[浮层事件穿透问题](http://qiqicartoon.com/?p=1197)

##测试用例
- [runner.html](../lib/overlay/tests/runner.html)

##演示地址
- [Demo](../lib/overlay/examples/overlay.html)
- [Arale Overlay Demo](http://github.com/alipay/arale/tree/master/lib/overlay/examples/overlay.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈