// flip 的单元测试
define(function(require) {
    var Flip = require('flip'),
        $ = require('$'),
        instance = null;

    describe('Flip', function() {
        beforeEach(function() {
            instance = new Flip({element:".flip_container"});
        });

        it('should has flip', function() {
            spyOn(instance, 'flip');
            instance.flip();
            expect(instance.flip).toHaveBeenCalled();
        });

        it('should has transitionStart and transitionEnd events.', function() {
            var i = 0, j = 0;
            runs(function() {
                instance.on('transitionStart', function() {
                    i = 1;
                });
                instance.on('transitionEnd', function() {
                    j = 1;
                });
                instance.flip("back");
            });

            waits(1500);

            runs(function() {
                expect(instance instanceof Flip).toBeTruthy();
                expect(i).toBe(1);
//                expect(j).toBe(1);
            });
        });
    });
});