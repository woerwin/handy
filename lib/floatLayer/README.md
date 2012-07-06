#FloatLayer
提供移动设备浏览器端 UI 层的浮动、固定功能

##模块依赖
没有模块依赖

##使用说明
###参数
element 选择器或 DOM Element，暂且不支持 zepto 对象

duration 动画时间间隔。整数类型

```js
define(function (require,exports,module){
    var FloatLayer = require('floatLayer');
    new FloatLayer({
      element: 'header'
    });
    new FloatLayer({
      element: 'footer',
      duration: '1000'
    });
});
```

###sync `FloatLayer.sync()`

同步指定元素的位置，使其保持位置不变。`FloatLayer` 在实例化时，默认会调用一次 `sync` 方法，同时向 window 对象注册 scroll 事件，
当用户拖动页面时，`FloatLayer` 会自动同步 `element` 的 webkitTransform，更新位置。
`FloatLayer` 不会使其绝对定位，也不会使用 left/top 的值更新 element 的坐标值

##测试用例
- [runner.html](../lib/floatLayer/tests/runner.html)

##演示地址
- [Demo](../lib/floatLayer/examples/floatLayer.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈