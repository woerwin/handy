#PageTransition
提供一个模拟 iOS 原生应用页面过渡效果的 UI 组件

- PageTransition 暂时只提供水平过渡效果

##模块依赖
- [event](http://github.com/alipay/arale/tree/master/lib/events)
- [zepto](http://github.com/alipay/arale/tree/master/lib/zepto)

##平台兼容
- 由于 `zepto` 仅兼容 `iOS` 和 `Android OS` ，因此 `PageTransition` 当前也仅兼容这两个平台，未来的版本会兼容到 `windows phone7`

##PageTransition 工作原理
`PageTransition` 包含了一套简单的 `data-attribute` 配置机制，有一部分参数的配置将通过 `data-attribute` 完成；

`PageTransition` 默认把您需要过渡的每个元素看做为一个 `role` (角色)为 `page` 的页面，
把触发器(也叫触点)看做为一个 `role` 为 `trigger` 的行为对象，把具体的行为通过 `action` 标识，然后通过 `data` 前缀配置这些参数。
```js
data-role="page" // 这是一个过渡页面
data-role="trigger" // 这是一个触发器
data-action="forward" // 这是触发器的行为(向前过渡)，可选的还有 back
data-forward="#J-nextPage" // 这是某个触发器需要向前过渡的目标元素，当点击触发器时，
                           // PageTransition 会在当前的触发器上查找需要过渡的目标元素
```
`PageTransition` 首先会在用户传入的 `srcNode` 这个 `DOM` 参数中查找带有 `data-role="page"` 的元素，
`PageTransition` 将查找到的**第一个** `page` 元素做为初始化页面，其它的 `data-role="page"` 将被忽略，然后向这个初始化页面的父层动态插入
一个带有 `data-role="viewport"` 属性的元素，这个元素就是 `PageTransition` 的视口，紧接着 `PageTransition` 会在当前视口下查找**所有**
带有 `data-role="trigger"` 的元素，为它们绑定 `click.pageTransition` 事件，每个视口都是独立的，因此您可能在 `PageTransition` 的页面
中嵌套 `PageTransition` 。当调用 `forward` 行为时，`PageTransition` 会动态向视口的末尾插入(append)触发器的 `data-forward` 属性指向的元素，
这个元素需要通过配置 `data-role="page"` 告诉 `PageTransition`：我也是一个页面，你可以在你的视口中对我做任何操作(过渡、绑定事件等)，所以
如果想在这个元素中绑定 `PageTransition` 行为(比如返回上一步)，你可以使用 `data-role="trigger" data-action="back"`，这和上述描述相同，
过渡结束后，会从视口中清除多余的页面，始终保持视口中只有一个页面，当然这些被清除的页面会被保存下来，以便**所有** `data-role="back"` 的触发器返回上一步，
在调用 `back` 行为时的处理和 `forward` 相似，只是动态的向视口的首部插入(prepend)插入被保存的上一张页面

##使用说明
`pageTransition` 所需的 HTML 结构：

```html
<div id="J-page-box">
        <section data-role="page">
          <a href="javascript:void(0)" data-role="trigger" data-action="forward" data-forward="#J-nextPage">下一张</a>
          定义了一个 trigger ，它带有 forward 行为，它要过渡的目标元素为 id＝J-nextPage
        </section>
</div>

<div id="J-nextPage" data-role="page">通过 data-role="page" 告诉 PageTransition，请把我看作一个页面
  <a href="javascript:void(0)" data-role="trigger" data-action="back">返回</a>
  当指定 data-action="back" 时不需要指定 data-back ，PageTransition 会自动保存前一张页面
</div>
```
实例化 `PageTransition`
```js
define(function (require){
  var PageTransition = require('pageTransition');
  var pageTransition = new PageTransition({
              srcNode: '#J-page-box'
          });
  pageTransition.render();
});
```
`pageTransition` 只需要传入 `srcNode` 参数，然后调用 `render` 方法。

每配置一个 `trigger` ，必须要定义它的 `data-role` 和 `data-action`，如果 action 是 forward，必须要指定 data-forward。
您还可以在每个页面中添加多个行为
```html
<div id="J-nextPage" data-role="page">
  <a href="javascript:void(0)" data-role="trigger" data-action="back">返回</a>
  <a href="javascript:void(0)" data-role="trigger" data-action="forward" data-forward="#J-nextPage2">下一张</a>
  <a href="javascript:void(0)" data-role="trigger" data-action="back">点击这里也可以返回</a>
</div>
```

