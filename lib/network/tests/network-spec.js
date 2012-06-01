// Network 的单元测试
define(function (require){
    var Network = require('../src/network');

    describe('Network',function (){
        it('Should has online,offline,destroy method.',function (){
            expect(typeof Network['destroy']).toBe('function');
            expect(typeof Network['offline']).toBe('function');
            expect(typeof Network['online']).toBe('function');
        });

        if(navigator.onLine){
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
                waits(1000);

                runs(function (){
                    expect(j).toBe(1);
                    expect(i).toBe(1);
                });
            });
        } else{
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
                waits(1000);

                runs(function (){
                    expect(j).toBe(1);
                    expect(i).toBe(1);
                });
            });
        }    d

        it('Destroy network. ',function (){
            var i = 0;
            Network.destroy();
            runs(function (){
                if(navigator.onLine){
                    Network.online(function (){
                        i++;
                    });
                } else {
                    Network.offline(function (){
                        i++;
                    });
                }
            });
            waits(1000);
            runs(function (){
                expect(i).toBe(0);
            });
        });
    });
});