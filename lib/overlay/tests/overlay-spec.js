// Overlay's test
define(function (require){
    var Overlay = require('../src/overlay'),
        instance = null;

    describe('Overlay',function (){
        beforeEach(function (){
            instance = new Overlay({
                element: '<div>Overlay test.</div>'
            });
            instance.render();
        });

        it('Should has on,off,trigger,initialize,render,bindUI,destroy,show,hide,setStyles,addShim methods.',function (){
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

            spyOn(instance,'bindUI');
            expect(instance.bindUI).not.toHaveBeenCalled();

            spyOn(instance,'show');
            expect(instance.show).not.toHaveBeenCalled();

            spyOn(instance,'hide');
            expect(instance.hide).not.toHaveBeenCalled();

            spyOn(instance,'destroy');
            expect(instance.destroy).not.toHaveBeenCalled();

            spyOn(instance,'setStyles');
            var styles = {};
            instance.setStyles(styles);
            expect(instance.setStyles).toHaveBeenCalledWith(styles);

            spyOn(instance,'addShim');
            expect(instance.addShim).not.toHaveBeenCalled();
        });

        it('Should has options config parameter.',function (){
            expect(instance.options).toBeTruthy();
        });

        it('Should has element default parameter.',function (){
            expect(instance.options.element).toBeDefined();
        });

        it('Should has zIndex default parameter.',function (){
            expect(instance.options.styles.zIndex).toBeDefined();
        });

        it('Should has parent default parameter.',function (){
            expect(instance.options.parent).toBeDefined();
        });
        it('Should has styles default parameter.',function (){
            expect(instance.options.styles).toBeDefined();
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

            instance.options.element.css({
                display: 'block',
                zIndex: -1,
                position: 'absolute'
            });
        });

        it('Destroy correct work',function (){
            instance.destroy();
            expect(instance.options.element).toBeNull();
            expect(instance.shim).toBeNull();
            expect(instance.options.styles.zIndex).toBe(9999);
            expect(instance.options.styles).toBeDefined();
        });

        it('Detect shim node is rendered.',function (){
            instance.show();
            var shim = document.querySelector('div[data-overlay-role="shim"]');
            expect(shim.length).not.toBe(0);
        });
    });
});