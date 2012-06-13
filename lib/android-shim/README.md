#android-shim
提供阻止 Android OS 内置浏览器浮层组件 touch event 穿透问题

这个问题主要发生在 Android OS 内置浏览器，查看[Android OS 事件穿透问题](http://v.youku.com/v_show/id_XNDAxMTE1NTgw.html)

##工作原理
![android-shim](/alipay/handy/raw/master/lib/overlay/docs/assets/handy-overlay-shim.jpg)

它会在指定元素的后一层插入一个 div 标签，意思就是：
shim 的 z-index 的值将是目标元素 的 z-index 值减 1。这有点像[iframe-shim](http://github.com/alipay/arale/tree/master/lib/iframe-shim) :-)

建议您阅读[Android javascript 事件穿透解决方案](http://qiqicartoon.com/?p=1197)