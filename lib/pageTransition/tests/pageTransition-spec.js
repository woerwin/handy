// pageTransition 的单元测试
define(function (require){
    var PageTransition = require('../src/pageTransition'),
        $ = require('$'),
        instance = null;

    describe('pageTransition',function (){
        beforeEach(function (){
            instance = new PageTransition({
                element: '#J-page-box'
            });
        });

        it('should has render,getPage,sync,destroy,bindUI and transition method.',function (){
            spyOn(instance,'render');
            instance.render();
            expect(instance.render).toHaveBeenCalled();


            spyOn(instance,'getPage');
            var page = instance.getPage();
            expect(instance.getPage).toHaveBeenCalled();

            spyOn(instance,'transition');
            instance.transition('#J-page-box-nextPage');
            expect(instance.transition).toHaveBeenCalledWith('#J-page-box-nextPage');

            spyOn(instance,'bindUI');
            expect(instance.bindUI).not.toHaveBeenCalled();

            spyOn(instance,'sync');
            expect(instance.sync).not.toHaveBeenCalled();

            spyOn(instance,'destroy');
            expect(instance.destroy).not.toHaveBeenCalled();
        });

        it('It\'s getPage method should return DOM Element.',function (){
            instance.render();
            expect(instance.getPage().innerHTML.length).toBeGreaterThan(1);
        });

        it('should has options property.',function (){
            spyOn(instance,'options');
        });

        it('should has transitionStart and transitionEnd events.',function (){
            runs(function (){
                instance.render();
                this.i=0,
                this.type,
                this.page,
                this.o;
                instance.on('transitionEnd',$.proxy(function (type,page,o){
                    this.i++;
                    this.page = page;
                    this.type = type
                    this.o = o;
                },this));
                instance.transition('#J-page-box-nextPage');
            });

            waits(1000);

            runs(function (){
                expect(instance instanceof PageTransition).toBeTruthy();
                expect(this.i).toBe(1);
                expect(this.type).toBe('forward');
                expect(this.page.nodeType).not.toBe(0);
            });
        });
    });
});