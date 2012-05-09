// handy Storage单元测试
define(function (require){
    var Storage = require('../src/storage');

    describe('Storage',function (){
        it('Make sure Storage has get,set,clearAll,available,deleteKey,on,off and trigger method.',function (){
            var methods = 'get,set,available,on,off,trigger,deleteKey,keys'.split(',');

            methods.forEach(function (method){
                expect(Storage[method]).toBeDefined();
            });
        });
        it('set and get method is correct calling.',function (){
            Storage.set('handy',true);
            var handy = Storage.get('handy');
            expect(handy).toBe('true');
        });
        it('change,delete event is correct calling.',function (){
            var i = 0;

            Storage.on('handy:change',function (){
                i++;
            });
            Storage.trigger('handy:change');
            Storage.on('handy:delete',function (){
                i++;
            });
            Storage.trigger('handy:delete');
            expect(i).toBe(2);
        });
        it('keys method is correct calling.',function (){
            Storage.set('handy',true);
            Storage.set('version','1.0');
            Storage.set('Storage','songzan');
            var keys = Storage.keys();

            expect(keys.indexOf('handy')).not.toBe(-1);

            Storage.deleteKey('Storage');
            expect(keys.length).toBe(2);
            expect(keys.indexOf('Storage')).toBe(-1);

            Storage.set('Storage','xuanyu');
            expect(keys.length).toBe(3);
            expect(keys.indexOf('Storage')).not.toBe(-1);

            Storage.set('Storage','songzan');
            expect(keys.length).toBe(3);
            expect(keys.indexOf('Storage')).not.toBe(-1);
        });
        it('deleteKey method is correct calling.',function (){
            Storage.set('handy',true);
            Storage.deleteKey('handy')
            var keys = Storage.keys();

            expect(keys.indexOf('handy')).toBe(-1);
        });
        it('clear method is correct calling.',function (){
            var i=0;
            Storage.on('clear',function (){i++;});
            Storage.set('handy',true);
            Storage.set('handy2',true);
            Storage.set('handy3',true);
            Storage.clear();
            expect(Storage.keys().length).toBe(0);
            expect(i).toBe(1);
        });
    });
});