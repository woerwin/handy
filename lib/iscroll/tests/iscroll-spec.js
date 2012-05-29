//iscroll 的单元测试
define(function(require) {
    var iScroll = require('../src/iscroll'),
        $ = require('zepto'),
        instance = null;

    describe('iscroll', function() {
        beforeEach(function() {
            instance = new iScroll(".module_dialog_help_scroller");
        });

        it('should has refresh scrollTo scrollToElement scrollToPage', function() {
            spyOn(instance, 'refresh');
            instance.refresh();
            expect(instance.refresh).toHaveBeenCalled();

            spyOn(instance, 'scrollTo');
            instance.scrollTo(0, 0, 0, false);
            expect(instance.scrollTo).toHaveBeenCalled();

            spyOn(instance, 'scrollToElement');
            instance.scrollToElement("h5", 500);
            expect(instance.scrollToElement).toHaveBeenCalled();

            spyOn(instance, 'scrollToPage');
            instance.scrollToPage(0, 0, 500);
            expect(instance.scrollToPage).toHaveBeenCalled();

//            spyOn(instance, 'destroy');
//            instance.destroy();
//            expect(instance.destroy).not.toHaveBeenCalled();
        });

        it('should has options property.', function() {
            spyOn(instance, 'options');
        });

//        it('should has transitionStart and transitionEnd events.', function() {
//            runs(function() {
////                instance.render();
//                this.i = 0,
//                    this.type,
//                    this.page,
//                    this.o;
//                instance.on('transitionEnd', $.proxy(function(type, page, o) {
//                    this.i++;
//                    this.page = page;
//                    this.type = type
//                    this.o = o;
//                }, this));
//                instance.transition('#J-page-box-nextPage');
//            });
//
//            waits(1000);
//
//            runs(function() {
//                expect(instance instanceof PageTransition).toBeTruthy();
//                expect(this.i).toBe(1);
//                expect(this.type).toBe('forward');
//                expect(this.page.nodeType).not.toBe(0);
//            });
//        });
    });
});