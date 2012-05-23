// Handy widget parser test
// ========================
define(function (require){
    require('../src/parser');

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
            Array.prototype.slice.call(elements, 0).forEach(function (element){
                var moduleName = element.getAttribute('data-module-name'),
                    moduleId = element.getAttribute('data-'+moduleName+'-id');
                expect(toString.call(HandyParserData[moduleName + '_' + moduleId])).toBe('[object Object]');
            });
        });

        it('pageTransition_one parsed success.',function (){
            expect(HandyParserData.pageTransition_one.render).toBeTruthy();
        });

        it('overlay_one parsed success.',function (){
            expect(HandyParserData.overlay_one.render).toBeTruthy();
        });

        it('overlay_two parsed success.',function (){
            expect(HandyParserData.overlay_two.render).toBeTruthy();
        });

        it('HandyParserData time calculated.',function (){
            expect(toString.call(HandyParserData.time)).toBeTruthy('[object Object]');
        });

        it('Singal parameter direct assignment.',function (){
            expect(toString.call(HandyParserData.overlay_one.options.parent)).toBe('[object String]');
        });

        it('Mutil parameter as a Array.',function (){
            expect(toString.call(HandyParserData.overlay_one.options.role)).toBe('[object Object]');
        });
    });
});
