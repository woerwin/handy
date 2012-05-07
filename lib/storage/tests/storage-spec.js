/**
 * @fiveOverview handy storage单元测试
 * @author &lt;a href="http://qiqicartoon.com"&gt;颂赞&lt;/a&gt;
 */
define(function (require){
    var storage = require('../src/storage');

    describe('Storage',function (){
        it('Make sure storage has get,set,clearAll,available,deleteKey,on,off and trigger method.',function (){
            var methods = 'get,set,available,on,off,trigger,deleteKey,getKeys'.split(',');

            methods.forEach(function (method){
                expect(storage[method]).toBeDefined();
            });
        });
        it('set and get method is correct calling.',function (){
            storage.set('handy',true);
            var handy = storage.get('handy');
            expect(handy).toBe('true');
        });
        it('change,delete event is correct calling.',function (){
            var i = 0;

            storage.on('handy:change',function (){
                i++;
            });
            storage.trigger('handy:change');
            storage.on('handy:delete',function (){
                i++;
            });
            storage.trigger('handy:delete');
            expect(i).toBe(2);
        });
        it('getKeys method is correct calling.',function (){
            storage.set('handy',true);
            storage.set('version','1.0');
            storage.set('storage','songzan');
            var keys = storage.getKeys();

            expect(keys.indexOf('handy')).not.toBe(-1);

            storage.deleteKey('storage');
            expect(keys.length).toBe(2);
            expect(keys.indexOf('storage')).toBe(-1);

            storage.set('storage','xuanyu');
            expect(keys.length).toBe(3);
            expect(keys.indexOf('storage')).not.toBe(-1);

            storage.set('storage','songzan');
            expect(keys.length).toBe(3);
            expect(keys.indexOf('storage')).not.toBe(-1);
        });
        it('deleteKey method is correct calling.',function (){
            storage.set('handy',true);
            storage.deleteKey('handy')
            var keys = storage.getKeys();

            expect(keys.indexOf('handy')).toBe(-1);
        });
        it('clearAll method is correct calling.',function (){
            var i=0;
            storage.on('clearAll',function (){i++;});
            storage.set('handy',true);
            storage.set('handy2',true);
            storage.set('handy3',true);
            storage.clearAll();
            expect(storage.getKeys().length).toBe(0);
            expect(i).toBe(1);
        });
    });
});