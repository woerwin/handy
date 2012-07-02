<style>
    * {
        margin:0;
        padding:0;
    }
    body {
        height:1000px;
        padding: 0;
        margin: 0;
    }
    .example {
        border:3px dashed #ccc;
        margin:30px 50px;
        color:#777;
        font-size:16px;
    }
    h2 {
        color:#2296CC;
        font-size:16px;
        margin:10px;
        font-family: consolas;
    }
</style>

<div class="example">
    <h2>1. 显示默认遮罩层：mask.show();</h2>
    <button id="a">点击显示默认遮罩层</button>
</div>
<div class="example">
    <h2>2. 显示修改的遮罩层：mask.set('backgroundColor', 'green').set('opacity', '0.3').show();;</h2>
    <button id="b">点击显示修改的遮罩层</button>
</div>

```javascript
    seajs.use('mask', function(mask) {

        document.getElementById('a').onclick = function() {
            new mask().show();
        };
        document.getElementById('b').onclick = function() {
            var _mask = new mask({
                template: '<div style="-webkit-box-pack:center;dipslay:-webkit-box;"><a style="background:#000;padding:5px;color:#fff;text-decoration:none;" href="javascript:void(0)" data-module-name="overlay" data-overlay-role="trigger" data-overlay-action="hide">关闭</a></div>'
            });
            _mask.set('backgroundColor', 'rgba(13,40,322,.3)').show();
        };

    });
```


