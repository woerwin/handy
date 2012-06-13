// Overlay's it
define(function (require){
    var Overlay = require('../src/overlay');
    var $ = require('$');

    describe('arale overlay', function() {

        var overlay;

        beforeEach(function() {
            overlay = new Overlay({
                template: '<div></div>',
                width: 120,
                height: 110,
                zIndex: 90,
                id: 'overlay',
                className: 'ui-overlay',
                visible: false,
                style: {
                    color: '#e80',
                    backgroundColor: 'green',
                    paddingLeft: '11px',
                    fontSize: '13px'
                },
                align: {
                    selfXY: [0, 0],
                    baseElement: document.body,
                    baseXY: [100, 100]
                }
            }).render();
        });

        afterEach(function() {
            overlay.hide();
            overlay.destroy();
        });

        it('基本属性', function() {
            expect(overlay.element.attr('id')).toBe('overlay');
            expect(overlay.element.hasClass('ui-overlay')).toBe(true);
            expect(overlay.element.css('width')).toBe('120px');
            expect(overlay.element.css('height')).toBe('110px');
            expect(parseInt(overlay.element.css('z-index'))).toBe(90);
            expect(overlay.get('visible')).toBe(false);
            expect(overlay.element.css('color')).toBe('rgb(238, 136, 0)');
            expect(overlay.element.css('background-color')).toBe('green');
            expect(overlay.element.css('padding-left')).toBe('11px');
            expect(overlay.element.css('font-size')).toBe('13px');
            expect(overlay.get('align').selfXY[0]).toBe(0);
            expect(overlay.get('align').selfXY[1]).toBe(0);
            expect(overlay.get('align').baseElement).toBe(document.body);
            expect(overlay.get('align').baseXY[0]).toBe(100);
            expect(overlay.get('align').baseXY[1]).toBe(100);
        });

        it('默认属性', function() {
            overlay.hide().destroy();
            overlay = new Overlay({
                template: '<div></div>'
            }).render();
            expect(overlay.element[0].id).toBe('');
            expect(overlay.element[0].className).toBe('');
            expect(overlay.element.width()).toBe(0);
            expect(parseInt(overlay.element.css('z-index'))).toBe(99);
            expect(overlay.get('visible')).toBe(false);
            expect(overlay.get('style')).toEqual({});

            expect(overlay.get('align').selfXY[0]).toBe(0);
            expect(overlay.get('align').selfXY[1]).toBe(0);
            expect(overlay.get('align').baseElement._id).toBe('VIEWPORT');
            expect(overlay.get('align').baseXY[0]).toBe(0);
            expect(overlay.get('align').baseXY[1]).toBe(0);
        });

        it('设置属性', function() {
            overlay.set('style', {
                backgroundColor: 'red'
            });
            overlay.set('width', 300);
            overlay.set('height', 400);
            overlay.set('zIndex', 101);
            overlay.set('id', 'myid');
            overlay.set('className', 'myclass');
            overlay.set('visible', true);

            expect(overlay.element.css('width')).toBe('300px');
            expect(overlay.element.css('height')).toBe('400px');
            expect(parseInt(overlay.element.css('z-index'))).toBe(101);
            expect(overlay.element.css('background-color')).toBe('red');
            expect(overlay.element.attr('id')).toBe('myid');
            expect(overlay.element.hasClass('myclass')).toBe(true);
            expect(overlay.element.css('display')==='none').toBe(false);
        });

        it('显示隐藏', function() {
            overlay.show();
            expect(overlay.get('visible')).toBe(true);
            expect(overlay.element.css('display')==='none').toBe(false);

            overlay.hide();
            expect(overlay.get('visible')).toBe(false);
            expect(overlay.element.css('display')==='none').toBe(true);
        });

    });


    var instance = null;

    $('body').append('<div id="J-abc"></div>');

    describe('handy verlay',function (){
        beforeEach(function (){
            instance = new Overlay({
                element: '<div class="it">Overlay it.'+
                         '</div>',
                parentNode: '#J-abc'
            });
            instance.render();
        });

        it('Should has render,bindUI,destroy,show,hide,setStyles,addShim methods.',function (){
            spyOn(instance,'render');
            expect(instance.render).not.toHaveBeenCalled();

            spyOn(instance,'bindUI');
            expect(instance.bindUI).not.toHaveBeenCalled();

            spyOn(instance,'show');
            expect(instance.show).not.toHaveBeenCalled();

            spyOn(instance,'hide');
            expect(instance.hide).not.toHaveBeenCalled();

            spyOn(instance,'destroy');
            expect(instance.destroy).not.toHaveBeenCalled();
        });

        it('Has element default parameter and element innerHTML existed.',function (){
            expect(instance.element.html()).toBe('Overlay it.');
        });

        it('zIndex property default is 99.',function (){
            expect(instance.get('zIndex')).toBe(99);
        });

        it('parent property parameter passed.',function (){
            expect($(instance.get('parentNode'))[0]).toBe($('#J-abc')[0]);
        });

        it('Destroy correct work',function (){
            instance.destroy();
            expect(instance.element).toBeNull();
        });

        it('Modify element z-index.',function (){
            instance.set({
                zIndex: 888
            })
            expect(instance.element.css('zIndex')).toBe('888');
        });

        it('Hide overlay',function (){
            instance.show();
            instance.hide();
            expect(instance.element.css('display')).toBe('none');
        });

        it('Make sure element rendered to $(\'#J-abc\')',function (){
           expect($('#J-abc').find('.it')[0]).toBeTruthy();
        });
    });
});