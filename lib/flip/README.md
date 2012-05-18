#flip
在移动设备上实现界面翻转

##模块依赖
- Event事件模块

##平台兼容
- 基于Webkit核心的浏览器

##使用说明
单例模式，直接使用其提供的方法即可

```js
    seajs.use('../src/flip', function (Flip) {
        Flip.flip("flip2")
    });
```

###


##测试用例
- [runner.html](../lib/storage/tests/runner.html)

##演示地址
- [Demo](../lib/storage/examples/flip.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈