// Confirm 的单元测试
define(function (require){
    var Confirm = require('../src/confirm.js'),
        instance = null;

    describe('Confirm',function (){
        beforeEach(function (){
            instance = new Confirm({
                tpl: '#J-ui-confirm'
            });
        });

        it('Should has on,trigger,initialize,render,sync,bindUI,destroy,show,confirm,getMask,getTpl and hide methods.',function (){
            spyOn(instance,'on');
            expect(instance.on).not.toHaveBeenCalled();

            spyOn(instance,'trigger');
            expect(instance.trigger).not.toHaveBeenCalled();

            spyOn(instance,'initialize');
            expect(instance.initialize).not.toHaveBeenCalled();

            spyOn(instance,'render');
            expect(instance.render).not.toHaveBeenCalled();

            spyOn(instance,'bindUI');
            expect(instance.bindUI).not.toHaveBeenCalled();

            spyOn(instance,'sync');
            expect(instance.sync).not.toHaveBeenCalled();

            spyOn(instance,'getMask');
            expect(instance.bindUI).not.toHaveBeenCalled();

            spyOn(instance,'getTpl');
            expect(instance.sync).not.toHaveBeenCalled();

            spyOn(instance,'show');
            expect(instance.show).not.toHaveBeenCalled();

            spyOn(instance,'hide');
            expect(instance.hide).not.toHaveBeenCalled();

            spyOn(instance,'destroy');
            expect(instance.destroy).not.toHaveBeenCalled();
        });

        it('Should has options property.',function (){
            expect(instance.options).toBeTruthy();
        });

        it('Should has beforeShow,afterShow,confirm,hide',function (){
            var i = 0,
                j = 0;
            instance.on('hide',function (){
                i++;
            });
            instance.on('confirm',function (){
                i++;
            });
            instance.on('beforeShow',function (){
                j--;
            });
            instance.on('afterShow',function (){
                j++;
            });
            instance.hide();
            expect(i).toBe(1);

            instance.confirm();
            expect(i).toBe(2);

            instance.show();
            expect(j).toBe(0);
        });

        it('Destroy correct work',function (){
            instance.destroy();
            expect(instance.options.message).toBeNull();
            expect(instance.options.tpl).toBeNull();
            expect(instance.options.zIndex).toBeNull();
        });
    });
});