// Overlay's test
define(function (require){
    var Overlay = require('../src/overlay'),
        instance = null,
        $ = require('$');

    describe('Overlay',function (){
        beforeEach(function (){
            instance = new Overlay({
                element: '<div class="test">Overlay test.</div>'
            });
            instance.render();
        });

        it('Should has initialize,render,bindUI,destroy,show,hide,setStyles,addShim methods.',function (){

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
            expect(instance.setStyles).not.toHaveBeenCalled();

            spyOn(instance,'addShim');
            expect(instance.addShim).not.toHaveBeenCalled();
        });

        it('Has element default parameter and element innerHTML existed.',function (){
            expect(instance.get('element').html()).toBe('Overlay test.');
        });

        it('zIndex property is 9999.',function (){
            expect(instance.get('styles').zIndex).toBe(9999);
        });

        it('parent property parameter default is $(\'body\').',function (){
            expect(instance.get('parent')[0]).toBe(document.querySelector('body'));
        });
        it('styles property default is {zIndex:9999,display:none}.',function (){
            expect(instance.get('styles').zIndex).toBe(9999);
            expect(instance.get('styles').display).toBe('none');
        });

        it('Has shown,hide custom evnts.',function (){
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

            instance.get('element').css({
                display: 'block',
                zIndex: -1,
                position: 'absolute'
            });
        });

        it('Destroy correct work',function (){
            instance.destroy();
            expect(instance.get('element')).toBeNull();
            expect(instance.shim).toBeNull();
            expect(instance.get('styles').zIndex).toBe(9999);
            expect(instance.get('styles')).toBeDefined();
        });

        it('shim node is rendered.',function (){
            instance.show();
            var shim = document.querySelector('div[data-overlay-role="shim"]');
            expect(shim.length).not.toBe(0);
        });

        it('Modify element and shim z-index.',function (){
            instance.setStyles({
                zIndex: 888
            });
            instance.show();
            expect(instance.get('element').css('zIndex')).toBe('888');
            expect(instance.shim.css('zIndex')).toBe('887');
        });

        it('Hide overlay.',function (){
            instance.show();
            instance.hide();
            expect(instance.get('element').css('display')).toBe('none');
            expect(instance.shim).toBeNull();
        });

        it('Make sure element rendered to $(\'body\')',function (){
           expect($('body').find('.test')[0]).toBeTruthy();
        });
    });
});