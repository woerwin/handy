// Handy widget parser test
// ========================
define(function (require){
    require('../src/parser');

    describe('seajs',function (){
        var exist = typeof seajs !== 'undefined'  ? true : false;

        it('Make sure seajs is avalable.',function (){
            expect(exist).toBeTruthy();
        });
    });

    describe('parser',function (){
        it('Should HandyParserData exist.',function (){
            expect(HandyParserData).toBeTruthy();
        });

        it('pageTransition_one parsed success.',function (){
            expect(HandyParserData.pageTransition_one).toBeTruthy();
        });

        it('overlay_one parsed success.',function (){
            expect(HandyParserData.overlay_one).toBeTruthy();
        });

        it('overlay_two parsed success.',function (){
            expect(HandyParserData.overlay_two).toBeTruthy();
        });

        it('HandyParserData time calculated.',function (){
            expect(HandyParserData.time).toBeTruthy();
        });
    });
});
