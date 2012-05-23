#parser
=======
一个非常轻巧的 HTML5 data-attribute 解析器。

##工作原理
`parser` 的工作原理非常简单。当页面成功加载 `parser` 后，`parser` 会自动遍历所有带有 `data-module-name` 属性的节点，
然后在这些节点上查找当前模块所需的数据，`parser`
会对这些数据做处理，最后形成一个 moduleName : moduleData 的 JSON 数据
```js
{
  'tooltip' : [{},{}],
  'pageTransition' : [{}]
  ...
}
```
`parser` 再根据处理后的数据做细分处理，细分处理的最终目的是得到以下数据：
```js
[
  {
    moduleData: {},
    moduleId: '',
    moduleName: 'pageTransition'
  },
  {
    moduleData: {},
    moduleId: '',
    moduleName: 'tooltip'
  },
  {
    moduleData: {},
    moduleId: 'tooltip2',
    moduleName: 'tooltip'
  }
  ...
]
```
完成所有数据的细分处理后，`parser` 自动从指定的目录加载 [Handy 模块](https://github.com/alipay/handy/tree/master/lib)，
然后自动实例化，并立刻调用实例化对象的 `render` 方法。`Handy` 将把每个实例化对象 push 到 `window.HandyParserData` 属性中，因此
用户可以通过 `HandyParserData` 获取这些实例化对象做更复杂的业务逻辑处理。
