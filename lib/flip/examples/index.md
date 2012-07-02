<style type="text/css">
        .flip_container {
            width: 192px;
            font-size: 14px;
            height: 145px;
            margin:0 auto;
        }

        img {
            display: block;
            -webkit-border-radius: 5px;
            -webkit-box-shadow : 2px 2px 2px #CCC;
        }

        p{
            margin: 5px 0;
        }
        #flip2 {
            background: #eee;
            padding: 10px;
            line-height: 1.9;
            width: 168px;
            height: 121px;
            -webkit-border-radius: 5px;
            border: 1px solid #CCC;
            color: #666;
            -webkit-box-shadow : 2px 2px 4px #DDD;
        }
</style>

<h2>卡片翻转演示</h2>
<div class="flip_container">
    <div id="flip1" data-flip-role="frontFace">
        <div>
            <a href="javascript:void(0);" data-flip-role="trigger" data-flip-action="backFace" title="查看照片信息" style="width:190px;height:150px;display:block;text-align:cengter;background:#000;">
              front
            </a>
        </div>
    </div>
    <div id="flip2" data-flip-role="backFace" style="display: none;">
        <p>照片名：城堡</p>
        <p>拍摄时间：2001年12月5日</p>
        <p>拍摄地点：摩洛哥</p>
        <p>拍摄人：***</p>
    </div>
</div>
<div style="margin-top: 5px;text-align:center;"><a href="javascript:flip && flip.flip('back');">翻转到后面</a></div>
<div style="margin-top: 5px;text-align:center;"><a href="javascript:flip && flip.flip('front');">翻转到前面</a></div>

```javascript
    var flip;
    seajs.use('flip', function (Flip) {
        flip = new Flip({element:".flip_container"});
    });
```