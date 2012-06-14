#android-shim
提供阻止 Android OS 内置浏览器浮层组件 touch event 穿透问题

这个问题主要发生在 Android OS 内置浏览器，查看 [Android OS 事件穿透问题](http://v.youku.com/v_show/id_XNDAxMTE1NTgw.html)

##工作原理
![android-shim](/alipay/handy/raw/master/lib/overlay/docs/assets/handy-overlay-shim.jpg)

它会在指定元素的后面插入一个 div 标签，意思就是：
shim 的 z-index 的值将是目标元素 的 z-index 值减 1。这有点像 [iframe-shim](http://github.com/alipay/arale/tree/master/lib/iframe-shim) :-)

建议您阅读 [Android javascript 事件穿透解决方案](http://qiqicartoon.com/?p=1197)

##android-shim 的使用方法与 [arale iframe-shim](http://github.com/alipay/arale/tree/master/lib/events) 相同

##注意事项
- android-shim 自动判断当前是否是 Android OS ，非 Android OS 设备，不会动态添加添加 shim，因此您勿需再做判断
- android-shim 不会解决浮层后面元素触发 touch 事件的反馈，也就是被点击元素周围黄色的边框，您可以通过 -webkit-tap-highlight-color 解决