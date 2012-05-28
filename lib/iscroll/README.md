#iscroll
在移动设备上实现长列表滚动的解决方案

##模块依赖
- 依赖第三方iScroll类库

##平台兼容
- 基于Webkit核心的浏览器

##iScroll 实现原理
iScroll 的滚动效果主要通过css中translate数值的改变来实现滑动。为了正确构建该组件的html格式，以其达到滚动的效果，其结构从外到内，分为三层，容器层(container)、适口层(viewport)、内容层(content)。
在构建 iScroll 实例中，iScroll 会自动构建适口层，容器层和内容层需要自行构建。在实例化的过程中，为了保证功能实现，会在容器层加上必要的样式，不过这个使用 js 直接实现在节点上，不需要使用者加上
另外的样式。

##使用说明
通过 new，将 iscroll 实例化之后，即可进行使用,实例化接受两个参数 selector/DOM 选择器或者原生 DOM 节点，第二个参数为滚动的相关选项，具体说明如下：
hScroll 水平滚动功能 true/false 开启/关闭 用作开启/关闭水平滚动的功能，在默认的情况下，该组件会自动判断时候进行水平滚定，不过在特殊情况下，可能需要手工开启或者禁用水平滚动。
vScroll 垂直滚动功能 true/false 开启/关闭 和水平滚动功能类似
hScrollbar 水平滚动条 true/false 显示/隐藏 用作显示或者隐藏水平滚动条。
vScrollbar 垂直滚动条 true/false 显示/隐藏 和水平滚动条类似
hideScrollbar 隐藏滚动条 true/false 当用户没有行为的时候，自动隐藏滚动条 默认： true 。
momentum 惯性 enable/disable 启动/禁用 滚动的惯性 默认： true 。

实例前：
```html
    <div class="container">
        <div class="content"></div>
    <div>
```
```js
    seajs.use('../src/iscroll', function (iScroll) {
        var example1 = new iScroll(
                        "#module_dialog_help_iscrollContainer",
                        {
                            hScrollbar: false,
                            vScrollbar: false
                        });
    });
```
实例后html结构如下：
```html
    <div class="container">
        <div class="viewport">
            <div class="content"></div>
        </div>
    <div>
```
注意：结构中className为了方便说明使用，实际场景根据使用，并不用显性通过class或者其他属性名来说明， iScroll 会自行判断。

### 方法
####scrollTo(x, y, time, relative) 滚动到指定的位置

scrollTo:滚动到指定位置

@param{Number} x 横轴位置

@param{Number} y 纵轴位置

@param{Number} time 滚动到指定位置所需的过渡时间 单位 毫秒

@param{Boolean} relative 绝对位置/相对位置（可选，默认false）

使用实例：myiScroll.scrollTo(0,100,500);

----------
####scrollToElement:滚动到指定元素

@param{String} element 指定元素

@param{Number} time滚动到指定位置所需的过渡时间 单位 毫秒

使用实例：myScroll. scrollToElement(“li:nth-child(10)”,100,500);

------------
####scrollToPage:滚动到指定页（snap模式）

@param{String/Number} pageX 横轴的页id，“next”为当前页的下一页，“prev”为当前页的前一页

@param{String/Number} pageY 纵轴的页id，“next”为当前页的下一页，“prev”为当前页的前一页

@time{Number} time 滚动至指定页的过渡时间 单位 毫秒

使用实例：myScroll. scrollToPage(1,0,1500);

##演示地址
- [Demo](../lib/iscroll/iscroll.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈