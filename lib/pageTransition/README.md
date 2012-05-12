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
`PageTransition` 将查找到的**第一个** `page` 元素做为初始化页面，其它的 `data-role="page"` 将被忽略，然后向这个初始化页的父层动态插入
一个带有 `data-role="viewport"` 属性的元素，这个元素就是 `PageTransition` 的视口，紧接着 `PageTransition` 会在当前视口下查找**所有**
带有 `data-role="trigger"` 的元素，为它们绑定 `click.pageTransition` 事件

##使用说明
