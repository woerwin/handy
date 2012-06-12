`Position` 模块是 [Arale Position](http://github.com/alipay/arale/tree/master/lib/position) 的 mobile 版本，详细文档可参阅
[Arale Position](http://github.com/alipay/arale/tree/master/lib/position)

[Arale Position](http://github.com/alipay/arale/tree/master/lib/position) for mobile 重构列表：
 - 移除了针对 ie 的处理
 - document.docmentElement.scrollLeft 修改为 window.scrollX。因为在移动平台 document.docmentElement.scrollLeft
   和 document.docmentElement.scrollTop 始终返回 0
 - document.docmentElement.scrollTop 修改为 window.scrollY
 - 修改 $(node).offsetParent() 为 node.offsetParent。，因为 zepto 没有 offsetParent 方法
 - 修改 $(window).width()/height() 为 document.documentElement.clientWidth。因为 zepto 没有 $(window).width()/height() 方法
 - zepto 没有 $().outerWidth()/outerHeight() 方法，通过 node.offsetWidth/offsetHeight 获取实际大小,
   另外 mobile webkit 内核的浏览器通过 getComputedStyle() 无法取到 border-width 的值。
 - `position` mobile 版不支持 position:fixed

