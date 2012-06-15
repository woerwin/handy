// Confirm 的单元测试
define(function (require){
    var Confirm = require('../src/confirm.js'),
        instance = null;

    describe('Confirm',function (){
        beforeEach(function (){
            instance = new Confirm();
            instance.show();
        });
        afterEach(function (){
            instance.destroy();
        });


        it('has default html template',function (){
            expect(instance.element.hasClass('ui-confirm')).toBeTruthy();
        });

        it('default align viewport center.',function (){
            var w = parseInt(instance.element.css('width'),10),
                h = parseInt(instance.element.css('height'),10),
                l = instance.element[0].offsetLeft,
                r = instance.element[0].offsetTop;
            expect(l).toBe((document.documentElement.clientWidth-w)/2);
            expect(r).toBe((document.documentElement.clientHeight-h)/2);
        });

        it('default has mask.',function (){
            expect(instance.mask.element.hasClass('ui-mask')).toBeTruthy();
        });

        it('destroy confirm and mask.',function (){
            instance.destroy();
            expect(instance.element).toBeNull();
            expect(instance.mask).toBeUndefined();
            instance = new Confirm();
        });

        it('has confirm custorm event and confirm method.',function (){
            var i = 0;

            instance.on('confirm',function (){
                i++;
            }).confirm();
            expect(i).toBe(1);
        });

        it('has show method and set message in the show method.',function (){
            instance.set('message','abc');
            expect(instance.get('contentElement').get(0).innerHTML).toBe('abc');
        });

        it('must be has mask',function (){
            var i = 0;
            try{
                instance.set('hasMask',false);
            }catch(e){
                i++;
            }
            expect(i).toBe(1);
        });
    });
});