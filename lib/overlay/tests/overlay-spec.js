// Confirm 的单元测试
define(function (require){
    var Overlay = require('../src/overlay'),
        instance = null;

    describe('Overlay',function (){
        beforeEach(function (){
            instance = new Overlay({
                srcNode: '<div>Overlay test.</div>'
            });
        });

        it('Should has on,off,trigger,initialize,render,sync,destroy,show,hide methods.',function (){
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

            spyOn(instance,'sync');
            expect(instance.sync).not.toHaveBeenCalled();

            spyOn(instance,'show');
            expect(instance.show).not.toHaveBeenCalled();

            spyOn(instance,'hide');
            expect(instance.hide).not.toHaveBeenCalled();

            spyOn(instance,'destroy');
            expect(instance.destroy).not.toHaveBeenCalled();
        });

        it('Should has setCSS private method.',function (){
            spyOn(instance,'__setCSS');
            expect(instance.__setCSS).not.toHaveBeenCalled();
        });

        it('Should has options config parameter.',function (){
            expect(instance.options).toBeTruthy();
        });

        it('Should has srcNode property.',function (){
            expect(instance.options.srcNode).toBeDefined();
        });

        it('Should has zIndex property.',function (){
            expect(instance.options.zIndex).toBeDefined();
        });

        it('Should has shown,hide,sync evnts.',function (){
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

            instance.on('sync',function (o){
                i++;
            });
            instance.sync();
            expect(i).toBe(3);
        });

        it('Destroy correct work',function (){
            instance.destroy();
            expect(instance.options.srcNode).toBeNull();
            expect(instance.options.zIndex).toBe(9999);
        });
    });
});