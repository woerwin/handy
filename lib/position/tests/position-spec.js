define(function(require) {

    var Position = require('../src/position');
    var $ = require('$');

    describe('position', function() {

        var pinElement, baseElement, noopDiv;
        $(document.body).css({
            'margin': 0,
            padding:0
        });

        beforeEach(function() {
            pinElement = $('<div style="width:100px;height:100px;">pinElement</div>').appendTo(document.body);
            // for ie6 bug
            noopDiv = $('<div></div>').appendTo(document.body);
            baseElement = $('<div id="test" style="margin:20px;border:5px solid #000;padding:20px;width:200px;height:200px;">baseElement</div>').appendTo(document.body);
        });

        afterEach(function() {
            baseElement.remove();
            noopDiv.remove();
            pinElement.remove();
            $('embed').remove();
        });

        it('offsetParent绝对定位：', function() {
            var offsetParent = $('<div style="position:absolute;top:50px;left:50px;"></div>').appendTo(document.body);
            baseElement.appendTo(offsetParent);
            Position.pin(pinElement, { element:baseElement, x: 100, y: 100 });
            expect(parseInt(pinElement[0].offsetTop)).toBe(170);
            expect(parseInt(pinElement[0].offsetLeft)).toBe(170);
            offsetParent.remove();
        });

        it('负百分比：Position.pin(pinElement, { element:baseElement, x: "-100%", y: "-50%" })', function() {
            Position.pin(pinElement, { element:baseElement, x: '-100%', y: '-50%' });
            expect(parseInt(pinElement.css('top'),10)).toBe(-105);
            expect(parseInt(pinElement.css('left'),10)).toBe(-230);
        });

        it('相对屏幕定位：Position.pin(pinElement, { x: 100, y: 100 })', function() {
            Position.pin(pinElement, { x: 100, y: 100 });
            expect(pinElement[0].offsetTop).toBe(100);
            expect(pinElement[0].offsetLeft).toBe(100);
        });

        it('基本情况：Position.pin({ element: pinElement, x: 0, y: 0 }, { element:baseElement, x: 100, y: 100 })', function() {
            Position.pin({ element: pinElement, x: 0, y: 0 }, { element:baseElement, x: 100, y: 100 });
            expect(pinElement[0].offsetTop).toBe(120);
            expect(pinElement[0].offsetLeft).toBe(120);
        });

        it('第一个参数简略写法：Position.pin(pinElement, { element:baseElement, x: 100, y: 100 })', function() {
            Position.pin({ element: pinElement, x: 0, y: 0 }, { element:baseElement, x: 100, y: 100 });
            expect(pinElement[0].offsetTop).toBe(120);
            expect(pinElement[0].offsetLeft).toBe(120);
        });

        it('带px的字符串参数：Position.pin(pinElement, { element:baseElement, x: "100px", y: "100px" })', function() {
            Position.pin({ element: pinElement, x: 0, y: 0 }, { element:baseElement, x: "100px", y: "100px" });
            expect(pinElement[0].offsetTop).toBe(120);
            expect(pinElement[0].offsetLeft).toBe(120);
        });

        it('负数定位点：Position.pin({ element: pinElement, x: -100, y: -100 }, { element:baseElement, x: 0, y: 0 })', function() {
            Position.pin({ element: pinElement, x: -100, y: -100 }, { element:baseElement, x: 0, y: 0 });
            expect(pinElement[0].offsetTop).toBe(120);
            expect(pinElement[0].offsetLeft).toBe(120);
        });

        it('百分比：Position.pin(pinElement, { element:baseElement, x: "100%", y: "50%" })', function() {
            Position.pin(pinElement, { element:baseElement, x: '100%', y: '50%' });
            expect(pinElement[0].offsetTop).toBe(145);
            expect(pinElement[0].offsetLeft).toBe(270);
        });



        it('别名：Position.pin({ element:pinElement, x: "left", y: "left" }, { element:baseElement, x: "right", y: "center" })', function() {
            Position.pin({ element:pinElement, x: "left", y: "left" }, { element:baseElement, x: 'right', y: 'center' });
            expect(pinElement[0].offsetTop).toBe(145);
            expect(pinElement[0].offsetLeft).toBe(270);
        });

        it('百分比小数：Position.pin(pinElement, { element:baseElement, x: "99.5%", y: "50.5%" })', function() {
            Position.pin(pinElement, { element:baseElement, x: "99.5%", y: "50.5%" });
            expect(pinElement[0].offsetTop).toBeGreaterThan(145.99);
            expect(pinElement[0].offsetTop).toBeLessThan(147.01);
            expect(pinElement[0].offsetLeft).toBeGreaterThan(267.99);
            expect(pinElement[0].offsetLeft).toBeLessThan(269.01);
        });

        it('居中定位：Position.center(pinElement, baseElement);', function() {
            Position.center(pinElement, baseElement);
            expect(pinElement[0].offsetTop).toBe(95);
            expect(pinElement[0].offsetLeft).toBe(95);
        });

        it('屏幕居中定位：Position.center(pinElement );', function() {
            Position.center(pinElement);
            expect((document.documentElement.clientHeight-100)/2).toBeGreaterThan(pinElement[0].offsetTop-0.51);
            expect((document.documentElement.clientHeight-100)/2).toBeLessThan(pinElement[0].offsetTop+0.51);
            expect((document.documentElement.clientWidth-100)/2).toBeGreaterThan(pinElement[0].offsetLeft-0.51);
            expect((document.documentElement.clientWidth-100)/2).toBeLessThan(pinElement[0].offsetLeft+0.51);
        });

        it('加号应用：', function() {
            Position.pin(pinElement, { element:baseElement, x: "100%+20px", y: "50%+15px" });
            expect(parseInt(pinElement[0].offsetTop)).toBe(160);
            expect(parseInt(pinElement[0].offsetLeft)).toBe(290);
        });

        it('减号应用：', function() {
            Position.pin(pinElement, { element:baseElement, x: "100%-20px", y: "50%-15px" });
            expect(parseInt(pinElement[0].offsetTop)).toBe(130);
            expect(parseInt(pinElement[0].offsetLeft)).toBe(250);
        });

        it('加减号混用：', function() {
            Position.pin(pinElement, { element:baseElement, x: "100%-20px+10px", y: "50%-15px+5px" });
            expect(parseInt(pinElement[0].offsetTop)).toBe(135);
            expect(parseInt(pinElement[0].offsetLeft)).toBe(260);
        });

        it('相对自身定位：', function() {
            baseElement.remove();
            Position.pin(pinElement, { element:pinElement, x: "100%", y: 0 });
            expect(parseInt(pinElement[0].offsetTop)).toBe(0);
            expect(parseInt(pinElement[0].offsetLeft)).toBe(100);
        });

        it('fixed定位：', function() {
            pinElement.css('position', 'fixed');
            Position.pin(pinElement, { x: "300px", y: 250 });
            expect(pinElement.css('position')).toBe('fixed');
            expect(pinElement.css('top')).toBe('250px');
            expect(pinElement.css('left')).toBe('300px');
        });

    });
});
