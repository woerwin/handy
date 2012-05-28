#flip
在移动设备上实现card翻转

##模块依赖
- Event事件模块

##平台兼容
- 基于Webkit核心的浏览器

##实现原理
card翻转主要使用了css的3d的y轴转动的功能，达到访卡片翻转的效果

##使用说明
为了正确构建该组件的html格式，以其达到其翻动的效果，其结构从外到内需要分为三层，容器层(container)、适口层(viewport)、内容层(content)。

在构建 flip 实例中，该组件会自动构建适口层，容器层和内容层需要自行构建。

在实例化的过程中，为了保证功能实现，会在容器层加上必要的样式，不过这个使用 js 直接实现在节点上，不需要使用者加上

flip 对于html结构有一定的要求，一般而言，html结构如下：
```html
<div>//flip container
    <div>frontface</div>
    <div>backface</div>
</div>
```
对于样式的需求
```js
    seajs.use('../src/flip', function (Flip) {
        Flip.flip("flip2");
    });
```

###


##测试用例
- [runner.html](../lib/storage/tests/runner.html)

##演示地址
- [Demo](../lib/storage/examples/flip.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈