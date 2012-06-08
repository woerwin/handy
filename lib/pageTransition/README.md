#PageTransition
提供移动设备浏览器端模拟 iOS 原生应用页面过渡效果的 UI 组件

- PageTransition 暂时只提供水平过渡效果

##模块依赖
- [event](http://github.com/alipay/arale/tree/master/lib/events)
- [zepto](http://github.com/alipay/arale/tree/master/lib/zepto)

##平台兼容
- 由于 `zepto` 仅兼容 `iOS` 和 `Android OS` ，因此 `PageTransition` 当前也仅兼容这两个平台，未来的版本会兼容到 `windows phone7`

##PageTransition 工作原理
![handy.pageTransition.structure](/alipay/handy/raw/master/lib/pageTransition/docs/assets/handy.pageTransition.structure.jpg)

`PageTransition` 支持 `data-attribute` API，部分参数的配置将通过 `data-attribute` 完成。它把需要过渡的每个节点看做为一个 `role` (角色)为 `page` 的页面，
把触发器(也叫触点)看做为一个 `role` 为 `trigger` 的触发器对象，具体的行为通过 `action` 参数指定，然后通过 `data-pageTransition` 前缀配置这些参数。

在 `Handy` 中，每个组件的 `data-attribute` 属性将由 data 前缀 + 组件名(小驼峰格式) + 具体的属性名构成,`pageTransition` 的 data-attribute 参数列表：
```js
data-pageTransition-role="page" // 一个页面
data-pageTransition-role="trigger" // 一个触发器
data-pageTransition-action="forward" // 触发器的行为(向前过渡)，可选的还有 back
data-pageTransition-forward="#J-nextPage" // 某个触发器需要向前过渡的目标元素，当点击触发器时，
                                          // PageTransition 会在当前的触发器上查找需要过渡的目标元素
```
它首先会在用户传入的 `element` 中查找带有 `data-pageTransition-role="page"` 的元素，接着将查找到的**第一个** `page` 元素做为初始化页面，其它的 `data-pageTransition-role="page"` 将被忽略，然后向这个初始化页面的父层动态插入
一个带有 `data-pageTransition-role="viewport"` 属性的元素，这个元素就是它的视口，接着它会在当前视口下查找**所有**带有 `data-pageTransition-role="trigger"` 的元素，为它们绑定 `click.pageTransition` 事件，每个视口都是独立的，
因此您可能在 `PageTransition` 的页面中嵌套 `PageTransition` 。

当调用 `forward` 行为时，`PageTransition` 会动态向视口的末尾插入 (append) 触发器的 `data-pageTransition-forward` 属性指向的目标节点，
这个目标节点需要通过 `data-pageTransition-role="page"` 属性告诉 `PageTransition`：我也是一个页面，你可以在你的视口中对我做任何操作(过渡、绑定事件等)，所以
如果想在这个元素中绑定 `PageTransition` 行为(比如返回上一步)，你可以使用 `data-pageTransition-role="trigger" data-pageTransition-action="back"`，这和上述描述相同，
过渡结束后，会从视口中清除多余的页面，始终保持视口中只有一个页面，当然这些被清除的页面会被保存下来，以便带有 `data-pageTransition-role="back"` 的触发器返回上一步，
在调用 `back` 行为时的处理和 `forward` 相似，只是动态的向视口的首部插入(prepend)插入被保存的上一张页面

`PageTransition` 过渡效果使用了 margin-left 动画，并没有使用 translate-x ，

由此带来的体验问题是：<a href="http://qiqicartoon.com/?p=1023" target="_blank">动画运动不够平滑</a>

既然 margin-left 在移动平台的动画不够平滑，为何还要使用 margin-left 呢？您可以参考 <a href="http://qiqicartoon.com/?p=785" target="_blank">Android平台中CSS3 transition和animation问题</a>

##使用说明
`pageTransition` 所需的 HTML 结构：

```html
<div id="J-page-box">
        <section data-pageTransition-role="page">
          <a href="javascript:void(0)" data-pageTransition-role="trigger" data-pageTransition-action="forward" data-pageTransition-forward="#J-nextPage">下一张</a>
          定义了一个 trigger ，它带有 forward 行为，它要过渡的目标元素为 id＝J-nextPage
        </section>
</div>

<div id="J-nextPage" data-pageTransition-role="page">通过 data-pageTransition-role="page" 告诉 PageTransition，请把我看作一个页面
  <a href="javascript:void(0)" data-pageTransition-role="trigger" data-pageTransition-action="back">返回</a>
  当指定 data-pageTransition-action="back" 时不需要指定 data-pageTransition-back ，PageTransition 会自动保存前一张页面
</div>
```
实例化 `PageTransition`

```js
define(function (require){
  var PageTransition = require('pageTransition');
  var pageTransition = new PageTransition({
              element: '#J-page-box'
          });
  pageTransition.render();
});
```
`pageTransition` 只需要传入 `element` 参数，然后调用 `render` 方法。

上面的代码完成了一个简单的 `pageTransition` 的配置。调用 `render` 方法后，`pageTransition` 自动在 `＃J-page-box` 中插入 `<div data-pageTransition-role="viewport">`，然后再将
`<section data-pageTransition-role="page">` 插入到刚才的视口中，接着为 section 标签中的 a 元素绑定 click 事件，当这个链接触发 click 事件时，`pageTransition` 会从超链接的
`data-pageTransition-forward` 属性中找到下一张页面的引用，动态将 `#J-nextPage` 插入(appendTo)到视口，过渡效果结束后，重新绑定 UI 事件，然后将过渡出视口的 section 元素(处于不可见)放到 `#J-nextPage`
的父元素中并隐藏，坦白说就是把当前页面与下一张页面换个位置罢了。


每配置一个 `trigger` ，必须要定义它的 `data-pageTransition-role` 和 `data-pageTransition-action`，如果 action 是 forward，必须要指定 data-pageTransition-forward。

您还可以在每个页面中添加多个行为

```html
<div id="J-nextPage" data-pageTransition-role="page">
  <a href="javascript:void(0)" data-pageTransition-role="trigger" data-pageTransition-action="back">返回</a>
  <a href="javascript:void(0)" data-pageTransition-role="trigger" data-pageTransition-action="forward" data-pageTransition-forward="#J-nextPage2">下一张</a>
  <a href="javascript:void(0)" data-pageTransition-role="trigger" data-pageTransition-action="back">点击这里也可以返回</a>
</div>
```
###render `pageTransition.render()`
渲染 `pageTransition` 实例化对象

###getPage `pageTransition.getPage()`
返回 `pageTransition` 的当前页面，一个 zepto object
```js
define(function (require){
  var PageTransition = require('pageTransition');
  var pageTransition = new PageTransition({
                element: '#J-page-box'
            });
  pageTransition.render();

  console.log(pageTransition.getPage().html());//...
});
```

###transition `pageTransition.transition(DOM Element)`
执行一次页面过渡。其实就是调用 `forward` 行为

参数 `DOM Element` 可以传入选择器 / DOM 对象 / zepto 对象
```js
define(function (require){
  var PageTransition = require('pageTransition');
  var pageTransition = new PageTransition({
                element: '#J-page-box'
            });
  pageTransition.render();

  document.querySelector('#J-next').addEventListener('click',function (){
      pageTransition.transition('#J-nextPage');
  },false);
});
```

###sync `pageTransition.sync()`
更新 UI

调用 `sync` 方法时，对 `pageTransition` 的视口及页面做样式更新
```js
define(function (require){
  var pageTransition = new require('pageTransition')({
                element: '#J-page-box'
            });
  pageTransition.render();

  window.addEventListener('resize',function (){
      pageTransition.sync();
  },false);
});
```
**最佳实践:您应该在设备方向或窗口发生变化时，调用 `sync` 方法**

###destroy `pageTransition.destroy()`
销毁 `pageTransition` 对象，释放内存
```js
define(function (require){
  var pageTransition = new require('pageTransition')({
                element: '#J-page-box'
            });
  pageTransition.render();

  document.querySelector('#J-destroy').addEventListener('click',function (){
      pageTransition.destroy();
  },false);
});
```
调用 `destroy` 方法，`pageTransition` 对象中的数据将被清除，
同时动态添加的样式也会被清除，`pageTransition` 视口中的页面也将全部释放到各自原来的容器中

###自定义事件
####transitionStart `pageTransition.on('transitionStart',callback)`
####transitionEnd `pageTransition.on('transitionEnd',callback)`
```js
define(function (require){
  var pageTransition = new require('pageTransition')({
                element: '#J-page-box'
            });
  pageTransition.render();

  pageTransition.on('transitionStart',function (type,page,o){
      console.log(type);// forward or back
      console.log(page);// 当前 DOM Element
      console.log(o);// 当前实例化对象
  });

  pageTransition.on('transitionEnd',function (type,page,o){
        console.log(type);// forward or back
        console.log(page);// 当前 DOM Element
        console.log(o);// 当前实例化对象
    });
});
```
自定义事件回调将带有三个参数：过渡类型、当前页面、当前对象。

- **PageTransition 支持深层嵌套。意思是你可以在 PageTransition 中嵌套另一个 PageTransition**

##测试用例
- [runner.html](../lib/pageTransition/tests/runner.html)

##演示地址
- [Demo](../lib/pageTransition/examples/pageTransition.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈

