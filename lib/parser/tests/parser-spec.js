// Handy widget parser test
// ========================
define(function (require){
    require('parser');

    HandyParser.start();

    var elements = null;

    describe('seajs',function (){
        var exist = typeof seajs !== 'undefined'  ? true : false;

        it('Make sure seajs is avalable.',function (){
            expect(exist).toBeTruthy();
        });
    });

    describe('parser',function (){
        beforeEach(function (){
            elements = document.querySelector('body').querySelectorAll('*[data-module-name]');
        });

        afterEach(function (){
            elements = null;
        });

        it('HandyParserData exist.',function (){
            expect(HandyParserData).toBeTruthy();
        });

        it('All module are finished parsed in html.',function (){
            waits(2000);

            runs(function (){
                Array.prototype.slice.call(elements, 0).forEach(function (element){
                    var moduleName = element.getAttribute('data-module-name'),
                        moduleId = element.getAttribute('data-'+moduleName+'-id');
                    expect(toString.call(HandyParserData[moduleName + '_' + moduleId])).toBe('[object Object]');
                });
            });
        });

        it('pageTransition_one parsed success.',function (){
            waits(2000);
            runs(function (){
                expect(HandyParserData.pageTransition_one.render).toBeTruthy();
            });
        });

        it('overlay_one parsed success.',function (){
            waits(2000);
            runs(function (){
                expect(HandyParserData.overlay_one.render).toBeTruthy();
            });
        });

        it('overlay_two parsed success.',function (){
            waits(2000);
            runs(function (){
                expect(HandyParserData.overlay_two.render).toBeTruthy();
            });
        });

        it('HandyParserData time calculated.',function (){
            waits(2000);
            runs(function (){
                HandyParser.on('completed',function (){
                    expect(toString.call(HandyParserData.time)).toBeTruthy('[object Object]');
                });
            });
        });

        it('Mutil parameter as a Array.',function (){
            waits(2000);
            runs(function (){
                HandyParser.on('completed',function (){
                    expect(toString.call(HandyParserData.overlay_one.get('role'))).toBe('[object Object]');
                });
            });
        });
    });
});
