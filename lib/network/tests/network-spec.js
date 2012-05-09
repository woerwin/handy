// Network 的单元测试
// [颂赞](http://qiqicartoon.com)
define(function (require){
    var Network = require('../src/network');

    describe('Network',function (){
        it('It should be has destroy method',function (){
            expect(typeof Network['destroy']).toBe('function');
        });

        it('It should be has offline method.',function (){
            expect(typeof Network['offline']).toBe('function');
        });

        it('It should be has online method.',function (){
            expect(typeof Network['online']).toBe('function');
        });
    });
});