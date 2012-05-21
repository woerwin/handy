/**
 * @fileOverview jParser单元测试
 * @author &lt;a href="http://qiqicartoon.com"&gt;颂赞&lt;/a&gt;
 * @author 双十
 * @author 轩与
 */
describe('seajs',function (){
    var exist = typeof seajs !== 'undefined'  ? true : false;
    
    it('Make sure seajs is avalable.',function (){
        expect(exist).toBeTruthy();
    });
});

describe('parser',function (){
    var parser = null;
    
    beforeEach(function (){
        seajs.use('parser',function (jparser){
            parser = jparser;
        });
    });
    
    it('Make sure parser\'s namespace',function (){
        expect(parser.namespace).toBe('parser');
    });
    
    it('Make sure the parser will not be pollution,is in the anonymous function in the execution.',function (){
       var parser = typeof jParser === 'undefined' ? false : true;
       expect(parser).toBeFalsy(); 
    });
    
    it('Make sure parsed data is Array',function (){
        var type = parser.data instanceof Array;
        
        expect(type).toBeTruthy();
    });
    
    it('Make sure that the correct save widgets',function (){
        var modules = [];
        parser.data.forEach(function (value,key){
            var moduleName = value['moduleName'],
                data = value['moduleData'];
            
            data.forEach(function (dataV,dataK){
                modules.push(moduleName+'_'+dataV['id']);
            });
        });
        modules.forEach(function (v,k){
            var isObject = typeof widgets[v] === 'object';
           
            expect(isObject).toBeTruthy(); 
        });
    });
});
