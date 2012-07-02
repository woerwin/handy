<style type="text/css">
        .box {
            width: auto;
            margin: 0;
            padding: 0;
        }

        caption {
            text-align: left;
        }

        td {
            text-align: left;
        }

        table {
            margin: 10px 0;
        }

        table td:first-child {
            width: 100px;
        }
        .des{
            background:#F0F1F8;
            border:1px solid #D4D8EB;
            padding:10px;
            line-height:22px;
        }
        pre,code{
            padding:10px;
            background:#FCFBFA;
            border:1px solid #EFEEED;
            border-left-width:5px;
        }
        .green{color:green;}
        .red{color:red;}
</style>

<div class="box">
    <section>
        <h1>Example：Network</h1>
        Network 提供移动平台网络离线，在线的监听
        <article class="des">
            切换您的网络连接，同时查看页面网络状态的提示
        </article>
        <div id="J-output">
        </div>
        <a href="javascript:void(0)" id="J-stop">停止网络状态检测</a>
</div>

```javascript
    function getDOM(dom){return document.querySelector(dom);}

    seajs.use('network', function (Network) {
        var startTime = new Date().getTime();

        Network.online(function (){
            getDOM('#J-output').innerHTML = '网络状态：<span class="green">在线</span>';
        });

        Network.offline(function (){
            getDOM('#J-output').innerHTML = '网络状态：<span class="red">离线</span>';
        });

        getDOM('#J-stop').addEventListener('click',function (){
            Network.destroy();
        },false);
    });
```