// Network 的单元测试
// [颂赞](http://qiqicartoon.com)
define(function (require){
    var Network = require('../src/network'),
        i = 0,
        offlineCounter = 0,
        onlineCounter = 0;

    describe('Network',function (){
        beforeEach(function (){
            i = 0;
        });

        it('It should be has stop method',function (){
            expect(Network['stop']).toBeTruthy();
        });

        it('It should be has start method',function (){
            expect(Network['start']).toBeTruthy();
        });

        it('It should be has offline event.',function (){
            Network.start();
            Network.on('offline',function (){
                i++;
                offlineCounter++;
            });
            Network.trigger('offline');
            expect(i).toBe(1);
            Network.stop();
        });

        it('It should be has online event.',function (){
            Network.on('online',function (){
                i++;
                onlineCounter++;
            });
            Network.trigger('online');
            expect(i).toBe(1);
        });
    });
});