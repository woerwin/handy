#Overlay
提供基于浮层表现的 UI 组件

提供浮层的显示、隐藏、定位

##模块依赖
- [base](http://github.com/alipay/arale/tree/master/lib/base)
- [zepto](http://github.com/alipay/arale/tree/master/lib/zepto)

##Overlay 工作原理
`Overlay` 只需要传入一个 `element` 参数即可工作。
找到这个 `element` 后，`Overlay` 会动态修改它的样式，然后为它里面所有配置了以 `data-overlay` 做前缀的节点注册事件。
当显示 `Overlay` 的 `element` 时，`Overlay` 会动态的在 `element` 后面添加一个 `shim` (垫片)，这个 `shim` 的作用将用来
解决 android 平台下事件穿透的问题，这也是 **`Overlay`** 组件的一大亮点。

##Overlay 的亮点
- 有效的解决了 Android OS 平台下浮层事件穿透问题

##代码片段
###将当前页面中第一个 select 显示在页面的左上角
```js
define(function (require,exports,module){
   var Overlay = require('overlay');

   var selectOverlay = new Overlay({
              element: 'select',
              styles: {
                  position: 'absolute',
                  left: 0,
                  top: 0
              }
          });
   selectOverlay.render();

   document.querySelector('#J-overlay-trigger').addEventListener('click',function (){
      selectOverlay.show();
   },false);
});
```
###将 id 为 userInfo 的节点显示在某个超链接的右上角，并且在显示后为 `element` 添加阴影样式，以及为 `element` 中的节点绑定事件
```js
    userInfoOverlay = new Overlay({
        element: '#J-userInfo',
        styles: {
            zIndex: 88888,
            position: 'absolute',
            left: $('#J-userInfo-trigger').offset().left + $('#J-userInfo-trigger').offset().width,
            top: $('#J-userInfo-trigger').offset().top - $('#J-userInfo').offset().height
        }
    });
    userInfoOverlay.render();
    userInfoOverlay.on('shown',function (o){
      o.setStyles({
          '-webkit-box-shadow': '0px 0px 10px rgba(0,0,0,.7)'
      });
      o.options.element.find('.hide').unbind('click').click(function (){
          o.hide();
      });
    });
    document.querySelector('##J-userInfo-trigger').addEventListener('click',function (){
        userInfoOverlay.show();
    },false);
```

##API 参考
###参数说明
`element` Overlay 的浮层。参数数据类型 DOM Element、CSS Selector、Zepto Object、HTML String('&lt;div&gt;XXX&lt;/div&gt;')

`parentNode` element 将渲染 (appendTo) 到这个节点里，默认是 `$('body')`。参数数据类型和 element 一样

`styles` element 的样式集，对象字面量格式，默认的值是:
```js
  styles: {
      zIndex: 9999,
      display: 'none'
  }
```

###render `instance.render()`
执行 Overlay 对象的渲染工作

###bindUI `instance.bindUI()`
绑定 Overlay 对象的 UI 事件。支持链式调用

###destroy `instance.destroy()`
销毁 `Overlay` 对象。调用 `destroy` 方法应**特别小心**，它会清除当前 `Overlay` 对象的所有数据，并且从文档流中把 `element` **删除**

###show `instance.show()`
显示 `Overlay` 。默认的显示方法是更新 `element` 的 display 的样式值，如果你需要使用动画模式显示，你可以覆盖这个 show 方法。支持链式调用

###hide `instance.hide()`
隐藏 `Overlay` 。和 show 方法类似，你可以覆盖它，以便使用其它方式隐藏 `Overlay`。支持链式调用

###setStyles `instance.setStyles(styles)`
设置 `element` 的样式。styles 是字面量对象数据格式。支持链式调用

###addShim `instance.addShim()`
添加 shim(垫片)，主要为了解决 android os 平台浏览器事件穿问题，这个方法在 `show` 方法调用时会被调用，如果覆盖了 `show` 方法，请勿必调用 `addShim` 方法，
调用 `addShim` 时，会向 `element` 的父元素动态插入一个带有 `data-overlay-role="shim"` 的 div 标签，这个标签将绝对定位在 `element` 的后一层，意思就是：
shim 的 z-index 的值将是 element 的 z-index 值减1。这有点像用 iframe 做 shim 解 ie6 的浮层无法遮住表单控件问题 :-)

###自定义的事件
####shown `instance.on('shown',callback)`
`Overlay` 显示后调用，`callback` 带有一个参数指向当前 `Ovelay` 对象
```js
  selectOverlay.on('shown',function (o){
    o.options.element.append('已显示');//显示后向 element 末尾插入内容
  });
```
###hide `instance.on('hide',callback)`
与 shown 事件的用法一样

##测试用例
- [runner.html](../lib/overlay/tests/runner.html)

##演示地址
- [Demo](../lib/overlay/examples/overlay.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈