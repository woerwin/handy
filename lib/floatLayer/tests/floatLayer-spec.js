define(function (require){
    var FloatLayer = require('../src/floatLayer'),
        $ = require('$'),
        el,
        float;

    describe('FloatLayer',function (){
        beforeEach(function (){
            $('body').css({
                padding: 0,
                margin: 0
            })
            el = $('<header>').appendTo('body').css('opacity',0);
            float = new FloatLayer({
                element: el[0]
            });
        });

        afterEach(function (){
            el.remove();
        });

        it('Has handleEvent,sync method.',function (){
            spyOn(float,'handleEvent');
            expect(float.handleEvent).not.toHaveBeenCalled();

            spyOn(float,'sync');
            expect(float.sync).not.toHaveBeenCalled();
        });

        it('Calculation internal coordinate data.',function (){
            expect(float.x1).toBe(0);
            expect(float.y1).toBe(0);

            el = $('<footer style="margin-left:30px;margin-top:340px;width:300px;height:500px;">').appendTo('body').css('opacity',0);
            float = new FloatLayer({
                element:el[0]
            });

            expect(float.x1).toBe(30);
            expect(float.y1).toBe(340);
            expect(float.options.duration).toBe('100');

            var matrix = new WebKitCSSMatrix(getComputedStyle(float.element).webkitTransform);
            expect(matrix['e']).toBe(0);
        });
    });
});