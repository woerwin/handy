// Network 的单元测试
define(function (require){
    var Network = require('../src/network');

    describe('Network',function (){
        it('Should has online,offline,destroy method.',function (){
            expect(typeof Network['destroy']).toBe('function');
            expect(typeof Network['offline']).toBe('function');
            expect(typeof Network['online']).toBe('function');
        });

        it('online calling.',function (){
            var i = 0,
                j = 0;
            runs(function (){
                Network.online(function (){
                    i++;
                });
                Network.online(function (){
                    j++;
                });
            });

            delete navigator.onLine;
            navigator.onLine = true;
            waits(1500);

            runs(function (){
                expect(j).toBe(1);
                expect(i).toBe(1);
            });
        });

        it('offline calling.',function (){
            var i = 0,
                j = 0;
            runs(function (){
                Network.offline(function (){
                    i++;
                });
                Network.offline(function (){
                    j++;
                });
            });

            delete navigator.onLine;
            navigator.onLine = false;
            waits(1500);

            runs(function (){
                expect(j).toBe(1);
                expect(i).toBe(1);
            });
        });
    });
});