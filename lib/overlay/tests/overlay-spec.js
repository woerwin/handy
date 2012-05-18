// Confirm 的单元测试
define(function (require){
    var Overlay = require('../src/overlay'),
        instance = null;

    describe('Overlay',function (){
        beforeEach(function (){
            instance = new Overlay({
                tpl: '<div>Overlay test.</div>'
            });
            instance.render();
        });

        it('Should has on,off,trigger,initialize,render,destroy,show,hide,setStyles,addShim methods.',function (){
            spyOn(instance,'on');
            expect(instance.on).not.toHaveBeenCalled();

            spyOn(instance,'trigger');
            expect(instance.trigger).not.toHaveBeenCalled();

            spyOn(instance,'off');
            expect(instance.off).not.toHaveBeenCalled();

            spyOn(instance,'initialize');
            expect(instance.initialize).not.toHaveBeenCalled();

            spyOn(instance,'render');
            expect(instance.render).not.toHaveBeenCalled();

            spyOn(instance,'show');
            expect(instance.show).not.toHaveBeenCalled();

            spyOn(instance,'hide');
            expect(instance.hide).not.toHaveBeenCalled();

            spyOn(instance,'destroy');
            expect(instance.destroy).not.toHaveBeenCalled();

            spyOn(instance,'setStyles');
            expect(instance.setStyles).not.toHaveBeenCalled();

            spyOn(instance,'addShim');
            expect(instance.addShim).not.toHaveBeenCalled();
        });

        it('Should has options config parameter.',function (){
            expect(instance.options).toBeTruthy();
        });

        it('Should has tpl property.',function (){
            expect(instance.options.tpl).toBeDefined();
        });

        it('Should has zIndex property.',function (){
            expect(instance.options.css.zIndex).toBeDefined();
        });

        it('Should has parentNode property.',function (){
            expect(instance.options.parentNode).toBeDefined();
        });
        it('Should has css property.',function (){
            expect(instance.options.css).toBeDefined();
        });

        it('Should has shown,hide evnts.',function (){
            var i = 0;
            instance.on('shown',function (){
                i++;
            });
            instance.show();
            expect(i).toBe(1);

            instance.on('hide',function (){
                i++;
            });
            instance.hide();
            expect(i).toBe(2);

            instance.options.tpl.css({
                display: 'block',
                zIndex: -1,
                position: 'absolute'
            });
        });

        it('Destroy correct work',function (){
            instance.destroy();
            expect(instance.options.tpl).toBeNull();
            expect(instance.__shim).toBeNull();
            expect(instance.options.css.zIndex).toBe(9999);
            expect(instance.options.css).toBeDefined();
        });

        it('Detect shim node is rendered.',function (){
            instance.show();
            var shim = document.querySelector('div[data-overlay-role="shim"]');
            expect(shim.length).not.toBe(0);
        });
    });
});