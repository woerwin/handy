/**
 * HandyParser一个神秘的HTML模版解析器，基于HTML5 data-attribute实现
 * @author 轩与
 * @author &lt;a href="http://qiqicartoon.com"&gt;颂赞&lt;/a&gt;
 * @author 双十
 * version 0.1
 */
define("#parser/0.9.0/parser-debug", ["#events/0.9.1/events-debug"], function(require, exports, module) {
    var Events = require("#events/0.9.1/events-debug");

    //const
    var NAMESPACE = 'HandyParser',
        VERSION = 0.1;

    var _moduleData = {}, // 模块列表
        parsedData = [], // 对页面分析完成后的数据
        HandyParserData = {}, // 最终输出的所有实例化对象
        savingWidgetsOccurError = false;// 标识存储 widgets 实例化对象发生错误

    var HandyParser = window.HandyParser = {};//建立HandyParser命名空间
    Events.mixTo(HandyParser);

    var parseDOMStart = null,// 解析 DOM 数据的开始时间
        parseDOMEnd = null,// 解析 DOM 数据的结束时间

        analyzeDataStart = null,// 分析数据的开始时间
        analyzeDataEnd = null,// 分析数据的结束时间

        parseStart = null,// 开始解析的时间
        parseEnd = null;// 解析结束的时间

    window.HandyParserData = HandyParserData;

    // 从 DOM 中根据 data-attribute 约定，解析所需的数据
    // 解析后的数据格式
    // {
    //    moduleName: [{element:XXX,id:XXX},{element:XXX,id:XXX}],
    //    moduleName: [{element:XXX,id:XXX},{element:XXX,id:XXX}],
    //    ...
    // }
    // element 表示组件关联的外层元素 id 表示组件的 id
    HandyParser.parseDOM = function() {
        var elements = document.querySelector('body')
                       .querySelectorAll('*[data-module-name]');
        Array.prototype.slice.call(elements, 0).forEach(function(element) {
            var nodename = filterTag(element.nodeName.toLowerCase());
            if (nodename) {
                var moduleName = dataset(element).moduleName,
                    data = {
                      // moduleName : moduleName,
                      element: element,
                      id: dataset(element)['' + moduleName.toLowerCase() + 'Id']
                    };

                // 必须提供模块 id
                if (!data.id) {
                    var mes = 'The module "' +
                              moduleName +
                              '\'s" id is ' +
                              (data.id !== undefined ? data.id : 'undefined') +
                              '.';
                    reportError(mes, 'warn');
                }

                if (_moduleData[moduleName]) {
                    _moduleData[moduleName].push(data);
                }else {
                    _moduleData[moduleName] = [data];
                }
            }
        });
    };

    // 对 parser.parseDOM 解析后的数据 _moduleData 做分析
    HandyParser.analyzeData = function() {
        for (var name in _moduleData) {
            var modules = _moduleData[name];

            modules.forEach(function(module) {
                parsedData.push(analyzeModule(module, name));
            });

        }
    };

    // 根据分析后的数据动态加载模块
    HandyParser.loadModules = function() {
        if (!parsedData) {
            return reportError('The parsedData is null!', 'error');
        }

        if (!(parsedData instanceof Array)) {
            return reportError('The parsedData must be Array!', 'error');
        }

        parsedData.forEach(function(module, key) {
            var name = module.moduleName,
                data = module.moduleData;

            if (name) {
                require.async(name,function (m){
                    if(m){
                        instantiationModules(name, m, data, module.moduleId);
                    }
                });
            }
        });
    }

    HandyParser.start = function (){
        parseStart = new Date().getTime();

        parseDOMStart = new Date().getTime();
        HandyParser.parseDOM();
        parseDOMEnd = new Date().getTime();

        analyzeDataStart = new Date().getTime();
        HandyParser.analyzeData();
        analyzeDataEnd = new Date().getTime();

        HandyParser.loadModules();
    };

    /**
     * 用于实例化所需的模块
     * @param {String} name 模块名称.
     * @param {Object} _class seajs模块返回的接口，通常是一个类.
     * @param {Object} data 所需数据.
     */
    var modulesCount = 0;
    function instantiationModules(name, _class, data, id) {
        if (!data || !_class) {
            reportError('The module "' + name + '" not has data!', 'error');
        }

        saveWidgets(new _class(data), name + '_' + id);

        modulesCount++;

        if(modulesCount === parsedData.length){
            parseEnd = new Date().getTime();

            HandyParserData['time'] = {
                parseDOM: parseDOMEnd - parseDOMStart,
                analyzeData: analyzeDataEnd - analyzeDataStart,
                parse: parseEnd - parseStart
            };

            HandyParser.trigger('completed',HandyParser,HandyParserData);
        }
    }

    /**
     * 保存实例化对象
     * @param {Object} instance 实例化对象.
     * @param {Stirng} id 实例化对象唯一标识。
     * 由模块名＋下划线(_)+id组成，如pageTransition_cashier.
     */
    function saveWidgets(instance, id) {
        //如果某个widgets实例化对象存储时发生错误，余下的数据将不做任何处理
        if (savingWidgetsOccurError) {
            return;
        }

        if (typeof window.HandyParserData !== 'object') {
            reportError('window.HandyParserData is not object! ' +
                        NAMESPACE +
                        ' can\'t saves data!', 'error');
            savingWidgetsOccurError = true;
            return;
        }

        if (HandyParserData[id]) {
            reportError('HandyParserData.' + id + ' already exist', 'warn');
            return;
        }

        if (instance['render']) {
            instance.render();
        }else {
            reportError('HandyParserData.' +
                        id +
                        ' can\'t calling render method.', 'warn');
        }

        HandyParserData[id] = instance;
    }

    function reportError(mes, type) {
        if (!type) {
            type = 'log';
        }
        console[type](mes);
    }

    // Thank you dataset project<https://github.com/mui-lychi/dataset>
    function dataset(node) {
                var namespace = arguments[1],
                    options = arguments[2],
                    //customise the parsing options
                    defaultOptions = {
                        parseBoolean: true,
                        parseFunction: true,
                        parseNull: true,
                        parseObject: true,
                        parseNumber: true,
                        //customise parse function
                        parse: undefined
                    },
                    elem = document.createElement('div'),
                    support = elem.dataset ? true : false,
                    object = {},
                    setting = defaultOptions;

                if (options) {
                    for (k in options) {
                        setting[k] = options[k];
                    }
                }

                var _convertDataType = function(value) {
                    var result = value,
                        firstChar = value.charAt ? value.charAt(0) : '';

                    if (value === 'null') {
                        setting.parseNull ? result = null : result;
                    } else if (firstChar === '{' || firstChar === '[') {
                        if (!window['JSON']) {
                            var error = 'Your browser does not support' +
                                        'the primary JSON.Is IE?';
                            //throw(error);
                        }

                        try {
                            //if you use IE,you may be modify JSON.parse
                            setting.parseObject ?
                            result = JSON.parse(value) :
                            '';

                            for (var i in result) {
                                result[i] = _convertDataType(result[i]);
                            }
                        } catch (e) {
                            var error = 'The ' + value +
                                ' may be illegal JSON string! Happened in ' +
                                node + '.';
                            //throw(error);
                        }
                    } else if (value === 'true' || value === 'false') {
                        if (setting.parseNull) {
                            switch (value) {
                                case 'true':
                                    result = true;
                                    break;
                                case 'false':
                                    result = false;
                                    break;
                            }
                        }
                    } else if (!isNaN(value * 1)) {
                        setting.parseNumber ? result = value * 1 : result;
                    }

                    return result;
                }

                switch (support) {
                    case true:
                        var _object = node.dataset;

                        for (i in _object) {
                            value = _convertDataType(_object[i]);
                            object[i] = value;
                        }
                        break;
                    case false:
                        var attrs = node.attributes,
                            name = '';

                    function parseName(name) {
                        var data = '';
                        for (j = 1, nameL = name.length; j < nameL; j++) {
                            if (j !== 1) {
                                data += name[j].charAt(0).toUpperCase() +
                                        name[j].slice(1).toLowerCase();
                            } else {
                                data += name[j];
                            }
                        }
                        return data;
                    }

                        for (i = 0, l = attrs.length; i < l; i++) {
                            name = attrs[i]['name'].split('-');
                            var name = parseName(name);
                            name && name.length > 0 ?
                            object[name] = _convertDataType(attrs[i]['value']) :
                            '';
                        }
                        break;
                }

                return node.nodeType > 0 ? object : null;
            }

   // 过滤无用的标签
   // 参数 tagName 表示一个标签名
   // 如果传入的标签不是非法标签，比如 video,option,script...，
   // 因为这些标签是不可能与 UI 组件关联,返回 tagName，否则返回 false
   function filterTag(tagName) {
        if (tagName !== 'script' && tagName !== 'textarea' &&
           tagName !== 'input' && tagName !== 'button' &&
           tagName !== 'br' && tagName !== 'embed' &&
           tagName !== 'select' && tagName !== 'option' &&
           tagName !== 'pre' && tagName !== 'code' &&
           tagName !== 'iframe' && tagName !== 'img' &&
           tagName !== 'map' && tagName !== 'style' &&
           tagName !== 'video' && tagName !== 'audio' &&
           tagName !== 'canvas'
          ) {
               return tagName;
           }

         return false;
   }

   // 对一些特殊的字段做处理
   // 这些特殊的字段是指小驼峰格式，如 parentNode
   // 因为解析器从 html 标签取到的自定义属性会全部转换为小定，
   // 为了能够兼容到 handy 组件中某些小驼峰的字段名
   // 我们必须有一个 handy 组件的特殊关键字列表
   function filterSpecialField(field) {
       // 逐渐增加
       var fieldsList = ['parent'],
           result = field;

       fieldsList.forEach(function(f) {
           if (f.toLowerCase() === field.toLowerCase()) {
               result = f;
               return false;
           }
       });

       return result;
   }

   // 分析单个模块的数据
   // 参数 data 表示从 DOM 解析后的模块数据
   // 参数 moduleName 表示模块名
   function analyzeModule(data, moduleName) {
       var element = data.element;
           elements = element.querySelectorAll('*'),
           result = {
               moduleName: moduleName,
               moduleId: data.id,
               moduleData: {
                   element: element
               }
           },
           fieldset = [];

       // 计算给定的字段出现的次数
       function countFieldset(f) {
           var i = 0;

           fieldset.forEach(function(value) {
               if (value.toLowerCase() === f.toLowerCase()) {
                   i++;
               }
           });

           return i;
       }

       elements = Array.prototype.slice.call(elements, 0);

       elements.forEach(function(element) {
            var nodename = filterTag(element.nodeName.toLowerCase());

            if (nodename) {
                var data = dataset(element);
                for (var i in data) {
                    var fields = i.split(moduleName.toLowerCase()),
                        field = '';

                    if (fields && fields[1]) {
                        field = fields[1]['toLowerCase']();
                    }else {
                        // 如果不提供任何数据，直接跳出
                        return false;
                    }

                    fieldset.push(field);
                }
            }
       });
       elements.forEach(function(element) {
           var nodename = filterTag(element.nodeName.toLowerCase());

           if (nodename) {
               var data = dataset(element);
               analyzeDataset(data, element);
           }
       });

       function analyzeDataset(data, element) {
           for (var i in data) {
               var fields = i.split(moduleName.toLowerCase()),
                   field = '';

               if (fields && fields[1]) {
                   field = fields[1]['toLowerCase']();
               }else {
                   // 如果不提供任何数据，直接跳出
                   return false;
               }

               if (field) {
                   field = filterSpecialField(field);
               }

               if (countFieldset(field) === 1) {
                   result.moduleData[field] = data[i];
               }else if (countFieldset(field) > 1) {
                   if (result.moduleData[field]) {
                       // 如果参数是选择器
                       if (document.querySelector(data[i])) {
                           result.moduleData[field]['push'](data[i]);
                       }else {
                           if (result.moduleData[field][data[i]]) {
                               var module = result.moduleData[field][data[i]];
                               module['push'](element);
                           }else {
                               result.moduleData[field][data[i]] = [element];
                           }
                       }
                   }else {
                       // 如果参数是选择器
                       if (document.querySelector(data[i])) {
                           result.moduleData[field] = [];
                           result.moduleData[field]['push'](data[i]);
                       }else {
                           result.moduleData[field] = {};
                           result.moduleData[field][data[i]] = [element];
                       }
                   }
               }
           }
       }

       return result;
   }

   module.exports = HandyParser;
});
