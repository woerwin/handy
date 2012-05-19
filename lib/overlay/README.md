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

##使用说明
```js
var overlay = new Overlay({
            element: 'select',
            styles: {
                position: 'absolute',
                left: 0,
                top: 0
            }
        });
    overlay.render();

document.querySelector('#J-overlay-trigger').addEventListener('click',function (){
            overlay.show();
},false);
```
###参数说明
`element` Overlay 的浮层。参数数据类型 DOM Element、CSS Selector、Zepto Object、HTML String(&lt;div&gt;XXX&lt;/div&gt;)

`parentNode` element 将渲染 (appendTo) 到这个节点里，默认是 `$('body')`。参数数据类型和 element 一样

`styles` element 的样式集，对象字面量格式，默认的值是
```js
  styles: {
      zIndex: 9999,
      display: 'none'
  }
```

###render `instance.render()`
执行 Overlay 对象的渲染工作