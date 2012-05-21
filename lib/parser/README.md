#parser
=======
一个非常轻巧的 HTML5 data-attribute 解析器。

`parser` 的工作原理非常简单，当页面成功加载 `parser` 时，`parser` 会自动遍历当前的 `HTML` 文档，
查找凡带有 `data-module-name` 属性的元素，然后根据查询到的模块节点再查找模块对应的数据，查找完成后，`parser` 
会对这些数据做些拼装、处理，最后形成一套完整的 moduleName : moduleData JSON 数据
```js
{
  'tooltip' : [{},{}],
  'pageTransition' : [{}]
  ...
}
```
`parser` 再根据拼装后的数据做细分处理，最终得出的数据格式：
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
完成所有数据的细分处理后，`parser` 自动从指定的目录中加载 [Handy 模块](https://github.com/alipay/handy/tree/master/lib)，然后自动实例化。

当前的 `parser` 只工作在 Handy 模块中
