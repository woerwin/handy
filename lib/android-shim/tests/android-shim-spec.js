define(function(require) {
    var Shim = require('../src/android-shim'),
        $ = require('$');

    describe('android-shim', function() {

        var div, isAnd = $.os.android;

        beforeEach(function() {
            div = $('<div></div>').appendTo(document.body);
        });

        afterEach(function() {
            div.remove();
        });

        it('return empty instance except not android', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (!isAnd) {
                var shim = new Shim(target[0]);
                shim.sync();

                expect(shim.shim).toBeUndefined();
                expect(shim.target).toBeUndefined();

                expect(shim.sync).toBeDefined();
                expect(shim.destroy).toBeDefined();
                shim.destroy();
            }

        });

        it('normal initialize ', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (isAnd) {
                var shim = new Shim(target[0]);
                shim.sync();

                var shimOffset = shim.shim.offset();
                var elementOffset = shim.target.offset();

                expect(shim.shim.css('height')).toBe('102px');
                expect(shim.shim.css('width')).toBe('102px');
                expect(shimOffset.left).toBe(elementOffset.left);
                expect(shimOffset.top).toBe(elementOffset.top);
                expect(parseInt(shim.shim.css('z-index'))).toBe(9);
                shim.destroy();
            }
        });

        it('only one shim is rendered',function (){
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (isAnd) {
                var shim = new Shim(target[0]);
                shim.sync();
                shim.sync();
                shim.sync();

                var elementOffset = shim.target.offset();
                var shims = $('*[data-role="shim"]');
                var i = 0;

                for(var j = 0;j < shims.length;j++){
                    if($(shims[j]).offset().left === elementOffset.left && $(shims[j]).offset().top === elementOffset.top){
                        i++;
                    }
                }

                expect(i).toBe(1);
            }
        });

        it('function sync', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (isAnd) {
                var shim = new Shim(target[0]);
                target.css({'width': '400px', 'height': '200px', 'border': '5px solid #fff'});

                shim.sync();

                expect(shim.shim.css('height')).toBe('210px');
                expect(shim.shim.css('width')).toBe('410px');
            }
        });

        it('function sync when target is hidden', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (isAnd) {
                var shim = new Shim(target[0]);

                target.css({'width': 0, 'border': 'none'});
                shim.sync();
                expect(shim.shim).toBeUndefined();

                target.css({'width': '10px', 'border': 'none'});
                shim.sync();
                expect(shim.shim.css('display') === 'none').toBeFalsy();

                target.css({'display': 'none'});
                shim.sync();
                expect(shim.shim.css('display')).toBe('none');
            }
        });

        it('function destroy', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (isAnd) {
                var shim = new Shim(target[0]).sync();
                shim.destroy();

                expect(shim.shim).toBeUndefined();
                expect(shim.target).toBeUndefined();
            }
        });

        it('function destroy when sync is not called', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (isAnd) {
                var shim = new Shim(target[0]);
                shim.destroy();

                expect(shim.shim).toBeUndefined();
                expect(shim.target).toBeUndefined();
            }
        });
    });
});
