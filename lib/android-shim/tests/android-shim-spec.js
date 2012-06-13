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

        // 测试非 ie6 下返回的空实例
        it('return empty instance except not android', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (!isAnd) {
                var shim = new Shim(target[0]);
                shim.sync();

                expect(shim.shim).toBeUndefined();
                expect(shim.target).toBeUndefined();

                expect(shim.sync).toBeDefined();
                expect(shim.destroy).toBeDefined();
            }

        });

        // 测试 android-shim 生成实例正常
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
                expect(shim.shim.css('z-index')).toBe(9);
            }

        });

        // 测试 sync 函数，修改目标元素宽高和边框，shim 重新计算
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

        // 测试当目标元素隐藏的时候sync函数，shim会隐藏
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

        // 测试 destroy 函数
        it('function destroy', function() {
            var target = $('<div></div>').css({'width': '100px', 'height': '100px', 'border': '1px solid #fff', 'z-index': 10}).appendTo(div);

            if (isAnd) {
                var shim = new Shim(target[0]).sync();
                shim.destroy();

                expect(shim.shim).toBeUndefined();
                expect(shim.target).toBeUndefined();
            }
        });

        // 测试 destroy 函数没有调用 sync
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
