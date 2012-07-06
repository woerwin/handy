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
<div class="flipContainer">//flip container
    <div data-flip-role="frontFace">frontface</div>
    <div data-flip-role="backFace">backface</div>
</div>
```
在以上的结构中，data-flip-role是必须设置的选项，注明是哪个面，被该表明的标签需要是块级元素，并且会被自动绝对定位，不过此样式会自动加载，在初始的html中，并不需要
设置，不过为了防止backface的元素在 组件初始化中会渲染在游览器中，造成会用户的视觉干扰，建议默认将其元素diplay设置为none。

```js
    seajs.use('../src/flip', function (Flip) {
        flip = new Flip(".flip_container");
    });
```
使用改flip的时候，new进行实例化，第一个参数为Selector或者DOM元素。

##html参数配置说明
###data-flip-role flip的角色
####frontFace：设置该元素为flip的正面
####backFace：设置该元素为flip的反面
####trigger: 设置该元素为触发器
#####backFace：触发后，翻转到卡片背面（如果已经是背面，则不变化）
#####frontFace：触发后，翻转到卡片正面

注释：如果在html结构中出现多个frontFace或者backFace，以第一次出现的元素为主，其余忽略
##方法
flip 进行翻转
@direction 转向的面 只支持两个数值： front 正面。 back 背面

##测试用例
- [runner.html](../lib/flip/tests/runner.html)

##演示地址
- [Demo](../lib/flip/examples/flip.html)

##反馈意见
欢迎创建 [GitHub Issue](http://github.com/alipay/handy/issues/new) 来提交反馈