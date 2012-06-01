// Confirm 的单元测试
define(function (require){
    var Confirm = require('../src/confirm.js'),
        instance = null;

    describe('Confirm',function (){
        beforeEach(function (){
            instance = new Confirm({
                element: '#J-ui-confirm'
            });
            instance.render();
        });

        it('Should has render,sync,bindUI,destroy,show,confirm,hide methods.',function (){
            spyOn(instance,'render');
            expect(instance.render).not.toHaveBeenCalled();

            spyOn(instance,'bindUI');
            expect(instance.bindUI).not.toHaveBeenCalled();

            spyOn(instance,'sync');
            expect(instance.sync).not.toHaveBeenCalled();

            spyOn(instance,'show');
            expect(instance.show).not.toHaveBeenCalled();

            spyOn(instance,'hide');
            expect(instance.hide).not.toHaveBeenCalled();

            spyOn(instance,'confirm');
            expect(instance.confirm).not.toHaveBeenCalled();

            spyOn(instance,'destroy');
            expect(instance.destroy).not.toHaveBeenCalled();
        });

        it('Should has shown,confirm,hide evnts.',function (){
            var i = 0,
                j = 0;
            instance.on('confirm',function (){
                i++;
            });
            instance.on('shown',function (){
                j--;
            });
            instance.on('hide',function (o){
                i++;
                expect(o).toBe(instance);
            });
            instance.hide();
            expect(i).toBe(1);

            instance.confirm();
            expect(i).toBe(2);

            instance.show();
            instance.destroy();
            expect(j).toBe(-1);
        });

        it('Destroy correct work',function (){
            instance.destroy();
            expect(instance.get('message')).toBeNull();
            expect(instance.get('element')).toBeNull();
            expect(instance.get('styles').zIndex).toBe(9999);
            expect(instance.get('styles')).toBeDefined();
        });
    });
});