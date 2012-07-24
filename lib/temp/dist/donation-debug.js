// PageTransition 一个模拟 iOS 原生应用页面切换效果的 UI 组件
// PageTransition 所需的 HTML 结构(最基础的一种)：
// <div id="J-page-box">
//     <section data-pageTransition-role="page">
//       <a href="javascript:void(0)"
//          data-pageTransition-role="trigger"
//          data-pageTransition-action="next"
//          data-pageTransition-forward="#J-loginForm">
//       登录
//       </a>
//     </section>
// </div>
// <div id="J-loginForm" data-pageTransition-role="page">
//     <a href="javascript:void(0)"
//        data-pageTransition-role="trigger"
//        data-pageTransition-action="prev">
//      返回
//     </a>
// </div>
define("#pageTransition/0.9.3/pageTransition-debug", ["#events/0.9.1/events-debug", "#zepto/0.9.0/zepto-debug"], function(require, exports, module) {
    var Events = require("#events/0.9.1/events-debug"),
        $ = require("#zepto/0.9.0/zepto-debug");

    var defaults = {
        element: null,
        duration: 300
    };

    function PageTransition(options) {
        this.options = $.extend({},defaults, options);
        this._prevPages = [];
        this._step = 0;

        this._DATAATTRIBUTENAMESPACE = 'data-pageTransition';
    }

    Events.mixTo(PageTransition);

    // 参数 page 是一个 DOM Element
    PageTransition.prototype.transition = function(page) {
        this.nextPage = $(page);

        if (this.getPage() && this.getPage()[0] === this.nextPage.get(0)) {
            return;
        }

        this._nextPageParent = this.nextPage.parent();
        this._transitionForward();
    }
    PageTransition.prototype.back = function (){
        this._transitionBack();
    };

    // 返回 DOM Element
    PageTransition.prototype.getPage = function() {
        return this.page;
    };

    PageTransition.prototype.render = function() {
        // 动态插入 page 视口
        this._insertPageViewport();

        // 更新 UI 样式
        this.sync();

        // 绑定 UI 事件
        this.bindUI();
    };

    // 更新 UI
    PageTransition.prototype.sync = function() {
        var container = $(this.options.element),
            containerW = container.css('width'),
            pages = this.viewport
                    .find('*[' + this._DATAATTRIBUTENAMESPACE + '-role=page]');

        this.viewport.css({
            width: parseInt(containerW, 10) * pages.length
        });

        container.css({
            overflow: 'hidden'
        });

        pages.css({
            'float': 'left',
            width: containerW
        }).show();
    };

    PageTransition.prototype.bindUI = function() {
        var DAS = this._DATAATTRIBUTENAMESPACE,
            trigger = this.viewport.find('*[' + DAS + '-role=trigger]');

        trigger.unbind('click.pageTransition')
               .bind('click.pageTransition', $.proxy(function(e) {
            e.preventDefault();
            var action = $(e.currentTarget).attr('' + DAS + '-action');

            switch (action) {
                case 'forward':
                    this.nextPage = $($(e.currentTarget)
                                    .attr('' + DAS + '-forward'));
                    this._nextPageParent = this.nextPage.parent();
                    this._transitionForward();
                    break;
                case 'back':
                    this._transitionBack();
                    break;
            }
        },this));
    };

    PageTransition.prototype.destroy = function() {
        var DAS = this._DATAATTRIBUTENAMESPACE,
            trigger = this.viewport.find('*[' + DAS + '-role=trigger]');

        trigger.unbind('click.pageTransition');

        $(this.options.element).attr('style', null)
                               .append(this._originPage.attr('style', null));
        this.page.removeAttr('style').appendTo(this._nextPageParent).hide();
        this.viewport.remove();

        // 清除所有数据
        this._step = 0;
        this._prevPages = [];
        this.page = null;
        this.nextPage = null;
        this.viewport = null;
        this._nextPageParent = null;
        this._originPage = null;
    };

    PageTransition.prototype._transitionForward = function() {
        // 动态向 viewport 尾部添加一张页面
        this.nextPage.appendTo(this.viewport);
        this.sync();
        this.trigger('transitionStart', 'forward', this.page, this);
        this.viewport.animate({
            marginLeft: -parseInt($(this.options.element).css('width'), 10)
        },this.options.duration, null, $.proxy(function() {
            this.__transitionForwardEnd();
        },this));
    };

    PageTransition.prototype.__transitionForwardEnd = function() {
        // 将隐藏的页面从 viewport 拿走
        this.page.appendTo(this._nextPageParent).hide();

        // 重新绑定 UI 事件
        this.bindUI();
        this.trigger('transitionEnd', 'forward', this.nextPage, this);

        // 将前一张页面入栈
        this._prevPages.push(this.page);
        // 记录用户的操作次数
        this._step++;

        // 更新当前的 page
        this.page = this.nextPage;

        // 此时 viewport中只有一个页面，因此需要更新 viewport 的margin-left
        this.viewport.css({
            marginLeft: 0
        });

        this.sync();
    };

    PageTransition.prototype._transitionBack = function() {
        if(this._step <= 0){
            return;
        }
        // 动态向 viewport 头部添加一张页面
        this.viewport.prepend(this._prevPages[this._step - 1]);
        this.sync();
        this.trigger('transitionStart', 'back', this.page, this);
        this.viewport.css({
            marginLeft: -parseInt($(this.options.element).css('width'), 10)
        });
        this.viewport.animate({
            marginLeft: 0
        },this.options.duration, null, $.proxy(function() {
            this._transitionBackEnd();
        },this));
    };

    PageTransition.prototype._transitionBackEnd = function() {
        // 将隐藏的页面从 viewport 拿走
        this.page.appendTo(this._nextPageParent).hide();

        // 重新绑定 UI 事件
        this.bindUI();
        var page = this._prevPages[this._step - 1] || this._originPage;
        this.trigger('transitionEnd', 'back', page, this);

        // 更新当前对象的 this.nextPage
        this.nextPage = this.page;
        // 更新当前对象的 this.page, this._prevPages 出栈
        this.page = this._prevPages[this._step - 1];
        this.viewport.css({
            marginLeft: 0
        });
        // this._prevPages 出栈，从 this._prevPages 栈中清除刚出栈的页面
        this._prevPages.splice(this._step - 1);
        // 用户返回一步
        this._step--;

        this.sync();
    };

    PageTransition.prototype._insertPageViewport = function() {
        var DAS = this._DATAATTRIBUTENAMESPACE,
            container = $(this.options.element),
            pageViewPort = $('<div ' + DAS + '-role="viewport"></div>'),
            page = $(container.find('*[' + DAS + '-role=page]')[0]);
        page.wrapAll(pageViewPort);
        this.viewport = $(pageViewPort, container);
        this.page = page;

        // 保存 PageTransition 最原始的页面，在 destroy 时，
        // 将清除 PageTransition 对象中除这个原始页面以外的所有页面
        // 如果用户在初始化页面中触发返回行为，也将返回到这个原始的页面
        this._originPage = page;
    };

    module.exports = PageTransition;
});


define("#events/0.9.1/events-debug", [], function() {

    // Events
    // -----------------
    // Thanks to:
    //  - https://github.com/documentcloud/backbone/blob/master/backbone.js
    //  - https://github.com/joyent/node/blob/master/lib/events.js


    // Regular expression used to split event strings
    var eventSplitter = /\s+/;


    // A module that can be mixed in to *any object* in order to provide it
    // with custom events. You may bind with `on` or remove with `off` callback
    // functions to an event; `trigger`-ing an event fires all callbacks in
    // succession.
    //
    //     var object = new Events();
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    function Events() {
    }


    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    Events.prototype.on = function(events, callback, context) {
        var cache, event, list;
        if (!callback) return this;

        cache = this.__events || (this.__events = {});
        events = events.split(eventSplitter);

        while (event = events.shift()) {
            list = cache[event] || (cache[event] = []);
            list.push(callback, context);
        }

        return this;
    };


    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    Events.prototype.off = function(events, callback, context) {
        var cache, event, list, i, len;

        // No events, or removing *all* events.
        if (!(cache = this.__events)) return this;
        if (!(events || callback || context)) {
            delete this.__events;
            return this;
        }

        events = events ? events.split(eventSplitter) : keys(cache);

        // Loop through the callback list, splicing where appropriate.
        while (event = events.shift()) {
            list = cache[event];
            if (!list) continue;

            if (!(callback || context)) {
                delete cache[event];
                continue;
            }

            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback ||
                        context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }
        }

        return this;
    };


    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    Events.prototype.trigger = function(events) {
        var cache, event, all, list, i, len, rest = [], args;
        if (!(cache = this.__events)) return this;

        events = events.split(eventSplitter);

        // Using loop is more efficient than `slice.call(arguments, 1)`
        for (i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i];
        }

        // For each event, walk through the list of callbacks twice, first to
        // trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
            // Copy callback lists to prevent modification.
            if (all = cache.all) all = all.slice();
            if (list = cache[event]) list = list.slice();

            // Execute event callbacks.
            if (list) {
                for (i = 0, len = list.length; i < len; i += 2) {
                    list[i].apply(list[i + 1] || this, rest);
                }
            }

            // Execute "all" callbacks.
            if (all) {
                args = [event].concat(rest);
                for (i = 0, len = all.length; i < len; i += 2) {
                    all[i].apply(all[i + 1] || this, args);
                }
            }
        }

        return this;
    };


    // Mix `Events` to object instance or Class function.
    Events.mixTo = function(receiver) {
        receiver = receiver.prototype || receiver;
        var proto = Events.prototype;

        for (var p in proto) {
            if (proto.hasOwnProperty(p)) {
                receiver[p] = proto[p];
            }
        }
    };


    // Helpers
    // -------

    var keys = Object.keys;

    if (!keys) {
        keys = function(o) {
            var result = [];

            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        }
    }


    return Events;
});



define('#zepto/0.9.0/zepto-debug', [], function(require) {

  var _zepto = window.Zepto;
  var _$ = window.$;

  /* Zepto v1.0rc1 - polyfill zepto event detect fx ajax form touch - zeptojs.com/license */
;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,

    // Used by `$.zepto.init` to wrap elements, text/comment nodes, document,
    // and document fragment node types.
    elementTypes = [1, 3, 8, 9, 11],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]+)$/,
    tagSelectorRE = /^[\w-]+$/,
    toString = ({}).toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function isFunction(value) { return toString.call(value) == "[object Function]" }
  function isObject(value) { return value instanceof Object }
  function isPlainObject(value) {
    var key, ctor
    if (toString.call(value) !== "[object Object]") return false
    ctor = (isFunction(value.constructor) && value.constructor.prototype)
    if (!ctor || !hasOwnProperty.call(ctor, 'isPrototypeOf')) return false
    for (key in value);
    return key === undefined || hasOwnProperty.call(value, key)
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return array.filter(function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name) {
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'
    var container = containers[name]
    container.innerHTML = '' + html
    return $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = arguments.callee.prototype
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // if a JavaScript object is given, return a copy of it
      // this is a somewhat peculiar option, but supported by
      // jQuery so we'll do it, too
      else if (isPlainObject(selector))
        dom = [$.extend({}, selector)], selector = null
      // wrap stuff like `document` or `window`
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, whichs makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source)
        if (source[key] !== undefined)
          target[key] = source[key]
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (element === document && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  function funcArg(context, arg, idx, payload) {
   return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  $.isFunction = isFunction
  $.isObject = isObject
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) })
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) })
      return this
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result
      if (this.length == 1) result = zepto.qsa(this[0], selector)
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return $(result)
    },
    closest: function(selector, context){
      var node = this[0]
      while (node && !zepto.matches(node, selector))
        node = node !== context && node !== document && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector)
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return this.map(function(){ return this[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(newContent){
      return this.each(function(){
        $(this).wrapAll($(newContent)[0].cloneNode(false))
      })
    },
    wrapAll: function(newContent){
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent))
        newContent.append(this)
      }
      return this
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return $(this.map(function(){ return this.cloneNode(true) }))
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide()
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ if (this.nodeType === 1) this.removeAttribute(name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] ? this[0][name] : undefined) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? data : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : undefined) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(){
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: obj.width,
        height: obj.height
      }
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return (
          this.length == 0
            ? undefined
            : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      for (key in property)
        if(typeof property[key] == 'string' && property[key] == '')
          this.each(function(){ this.style.removeProperty(dasherize(key)) })
        else
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'

      if (typeof property == 'string')
        if (value == '')
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (this.length < 1) return false
      else return classRE(name).test(this[0].className)
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = this.className, newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined)
          return this.className = ''
        classList = this.className
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        this.className = classList.trim()
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var newName = funcArg(this, name, idx, this.className)
        ;(when === undefined ? !$(this).hasClass(newName) : when) ?
          $(this).addClass(newName) : $(this).removeClass(newName)
      })
    }
  }

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
        this[0] == document ? document.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        var el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function insert(operator, target, node) {
    var parent = (operator % 2) ? target : target.parentNode
    parent ? parent.insertBefore(node,
      !operator ? target.nextSibling :      // after
      operator == 1 ? parent.firstChild :   // prepend
      operator == 2 ? target :              // before
      null) :                               // append
      $(node).remove()
  }

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var nodes = $.map(arguments, function(n){ return isObject(n) ? n : zepto.fragment(n) })
      if (nodes.length < 1) return this
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i]
          traverseNode(node, function(node){
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT' && (!node.type || node.type === 'text/javascript'))
              window['eval'].call(window, node.innerHTML)
          })
          if (copyByClone && index < size - 1) node = node.cloneNode(true)
          insert(operator, target, node)
        }
      })
    }

    $.fn[(operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After')] = function(html){
      $(html)[key](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.camelize = camelize
  zepto.uniq = uniq
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
'$' in window || (window.$ = Zepto)
;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={}

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.isObject(events)) $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function add(element, events, fn, selector, getDelegate, capture){
    capture = !!capture
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var delegate = getDelegate && getDelegate(fn, event),
        callback = delegate || fn
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data))
        if (result === false) event.preventDefault()
        return result
      }
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length})
      set.push(handler)
      element.addEventListener(handler.e, proxyfn, capture)
    })
  }
  function remove(element, events, fn, selector){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(handler.e, handler.proxy, false)
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event)
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    var capture = false
    if(event == 'blur' || event == 'focus'){
      if($.iswebkit)
        event = event == 'blur' ? 'focusout' : event == 'focus' ? 'focusin' : event
      else
        capture = true
    }

    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      }, capture)
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.bind(event, selector) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.unbind(event, selector) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else if (this.length) try { this.get(0)[name]() } catch(e){}
      return this
    }
  })

  $.Event = function(type, props) {
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    return event
  }

})(Zepto)
;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/)

    // todo clean this up with a better OS/browser
    // separation. we need to discern between multiple
    // browsers on android, and decide if kindle fire in
    // silk mode is android or not

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    clearProperties = {}

  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  clearProperties[prefix + 'transition-property'] =
  clearProperties[prefix + 'transition-duration'] =
  clearProperties[prefix + 'transition-timing-function'] =
  clearProperties[prefix + 'animation-name'] =
  clearProperties[prefix + 'animation-duration'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = duration / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssProperties[prefix + 'animation-name'] = properties
      cssProperties[prefix + 'animation-duration'] = duration + 's'
      endEvent = $.fx.animationEnd
    } else {
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) {
          transforms || (transforms = [])
          transforms.push(key + '(' + properties[key] + ')')
        }
        else cssProperties[key] = properties[key]

      if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
      if (!$.fx.off && typeof properties === 'object') {
        cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
        cssProperties[prefix + 'transition-duration'] = duration + 's'
        cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, arguments.callee)
      }
      $(this).css(clearProperties)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    setTimeout(function() {
      that.css(cssProperties)
      if (duration <= 0) setTimeout(function() {
        that.each(function(){ wrappedCallback.call(this) })
      }, 0)
    }, 0)

    return this
  }

  testEl = null
})(Zepto)
;(function($){
  var jsonpID = 0,
      isObject = $.isObject,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      abort = function(){
        $(script).remove()
        if (callbackName in window) window[callbackName] = empty
        ajaxComplete('abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (options.error) script.onerror = function() {
      xhr.abort()
      options.error()
    }

    window[callbackName] = function(data){
      clearTimeout(abortTimeout)
      $(script).remove()
      delete window[callbackName]
      ajaxSuccess(data, xhr, options)
    }

    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
      }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0
  }

  function mimeToDataType(mime) {
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (isObject(options.data)) options.data = $.param(options.data)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = $.ajaxSettings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, 'error', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  $.get = function(url, success){ return $.ajax({ url: url, success: success }) }

  $.post = function(url, data, success, dataType){
    if ($.isFunction(data)) dataType = dataType || success, success = data, data = null
    return $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
  }

  $.getJSON = function(url, success){
    return $.ajax({ url: url, success: success, dataType: 'json' })
  }

  $.fn.load = function(url, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector
    if (parts.length > 1) url = parts[0], selector = parts[1]
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response.replace(rscript, "")).find(selector).html()
        : response)
      success && success.call(self)
    })
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var array = $.isArray(obj)
    $.each(obj, function(key, value) {
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (traditional ? $.isArray(value) : isObject(value))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace('%20', '+')
  }
})(Zepto)
;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)
;(function($){
  var touch = {}, touchTimeout

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  var longTapDelay = 750, longTapTimeout

  function longTap(){
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap(){
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  $(document).ready(function(){
    var now, delta

    $(document.body).bind('touchstart', function(e){
      now = Date.now()
      delta = now - (touch.last || now)
      touch.el = $(parentIfText(e.touches[0].target))
      touchTimeout && clearTimeout(touchTimeout)
      touch.x1 = e.touches[0].pageX
      touch.y1 = e.touches[0].pageY
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true
      touch.last = now
      longTapTimeout = setTimeout(longTap, longTapDelay)
    }).bind('touchmove', function(e){
      cancelLongTap()
      touch.x2 = e.touches[0].pageX
      touch.y2 = e.touches[0].pageY
    }).bind('touchend', function(e){
       cancelLongTap()

      // double tap (tapped twice within 250ms)
      if (touch.isDoubleTap) {
        touch.el.trigger('doubleTap')
        touch = {}

      // swipe
      } else if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                 (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
        touch.el.trigger('swipe') &&
          touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
        touch = {}

      // normal tap
      } else if ('last' in touch) {
        touch.el.trigger('tap')

        touchTimeout = setTimeout(function(){
          touchTimeout = null
          touch.el.trigger('singleTap')
          touch = {}
        }, 250)
      }
    }).bind('touchcancel', function(){
      if (touchTimeout) clearTimeout(touchTimeout)
      if (longTapTimeout) clearTimeout(longTapTimeout)
      longTapTimeout = touchTimeout = null
      touch = {}
    })
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)


  window.Zepto = _zepto;
  window.$ = _$;

  return Zepto;
});


define("#overlay/0.9.1/overlay-debug", ["#zepto/0.9.0/zepto-debug", "#position/0.9.0/position-debug", "#android-shim/0.9.0/android-shim-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug"], function(require, exports, module) {

    var $ = require("#zepto/0.9.0/zepto-debug"),
        Position = require("#position/0.9.0/position-debug"),
        Shim = require("#android-shim/0.9.0/android-shim-debug"),
        Widget = require("#widget/0.9.16/widget-mobile-debug");

    // Overlay
    // -------
    // Overlay 组件的核心特点是可定位（Positionable）和可层叠（Stackable），是一切悬浮类
    // UI 组件的基类。

    var Overlay = Widget.extend({

        attrs: {
            // 基本属性
            width: '',
            height: '',
            zIndex: 99,
            visible: false,

            // 定位配置
            align: {
                // element 的定位点，默认为左上角
                selfXY: [0, 0],
                // 基准定位元素，默认为当前可视区域
                baseElement: Position.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [0, 0]
            },

            // 父元素
            parentNode: document.body
        },

        render: function() {
            // 让用户传入的 config 生效并插入到文档流中
            Overlay.superclass.render.call(this);

            // 在插入到文档流后，重新定位一次
            this._setPosition();

            return this;
        },

        delegateEvents: function() {
            Overlay.superclass.delegateEvents.call(this);

            var triggers = this.element.find('*[data-overlay-role="trigger"]'),
                that = this;

            Array.prototype.slice.call(triggers);

            triggers.forEach(function(trigger) {
                var t = trigger;
                if (t && (action = $(t).attr('data-overlay-action'))) {
                    switch (action) {
                        case 'hide':
                            $(t).unbind('click.overlay')
                                .bind('click.overlay', $.proxy(function(e) {
                                e.preventDefault();
                                this.hide();
                            },that));
                            break;
                        /*case 'show':
                         $(trigger)
                         .unbind('click.overlay')
                         .bind('click.overlay', $.proxy(function(e) {
                         e.preventDefault();
                         this.show();
                         },that));
                         break;*/
                        case 'destroy':
                            $(t).unbind('click.overlay')
                                .bind('click.overlay', $.proxy(function(e) {
                                e.preventDefault();
                                this.destroy();
                            },that));
                            break;
                    }
                }
            });

            return this;
        },

        destroy: function() {
            this.element.remove();
            Overlay.superclass.destroy.call(this);
        },

        show: function() {
            // 若从未渲染，则调用 render
            if (!this.rendered) {
                this.render();
            }

            this.set('visible', true);
            return this;
        },

        hide: function() {
            this.set('visible', false);
            return this;
        },

        setup: function() {
            // 加载 iframe 遮罩层并与 overlay 保持同步
            this._setupShim();
        },

        // 进行定位
        _setPosition: function(align) {
            // 不在文档流中，定位无效
            if (!isInDocument(this.element[0])) return;

            align || (align = this.get('align'));
            var isHidden = this.element.css('display') === 'none';

            // 在定位时，为避免元素高度不定，先显示出来
            if (isHidden) {
                this.element.css({ visibility: 'hidden', display: 'block' });
            }

            Position.pin({
                element: this.element,
                x: align.selfXY[0],
                y: align.selfXY[1]
            }, {
                element: align.baseElement,
                x: align.baseXY[0],
                y: align.baseXY[1]
            });

            // 定位完成后，还原
            if (isHidden) {
                this.element.css({ visibility: '', display: 'none' });
            }

            return this;
        },

        // 加载 iframe 遮罩层并与 overlay 保持同步
        _setupShim: function() {
            var shim = new Shim(this.element);
            this.after('show hide', shim.sync, shim);
            this.before('destroy',shim.destroy,shim);

            // 除了 parentNode 之外的其他属性发生变化时，都触发 shim 同步
            var attrs = Overlay.prototype.attrs;
            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    if (attr === 'parentNode') continue;
                    this.on('change:' + attr, shim.sync, shim);
                }
            }
        },


        // 用于 set 属性后的界面更新

        _onRenderWidth: function(val) {
            this.element.css('width', val);
        },

        _onRenderHeight: function(val) {
            this.element.css('height', val);
        },

        _onRenderZIndex: function(val) {
            this.element.css('zIndex', val);
        },

        _onRenderAlign: function(val) {
            this._setPosition(val);
        },

        _onRenderVisible: function(val) {
            this.element[val ? 'show' : 'hide']();
        }

    });

    module.exports = Overlay;


    // Helpers
    // -------
    function contains(a, b){
        return a.contains ?
            a != b && a.contains(b) :
            !!(a.compareDocumentPosition(b) & 16);
    }
    function isInDocument(element) {
        return contains(document.documentElement, element);
    }

});


define("#position/0.9.0/position-debug", ["#zepto/0.9.0/zepto-debug"], function(require, exports) {
    // Position
    // --------
    // 定位工具组件，将一个 DOM 节点相对对另一个 DOM 节点进行定位操作。
    // 代码易改，人生难得

    var Position = exports,
        VIEWPORT = { _id: 'VIEWPORT', nodeType: 1 },
        $ = require("#zepto/0.9.0/zepto-debug"),
        isPinFixed = false;

    // 将目标元素相对于基准元素进行定位
    // 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
    Position.pin = function(pinObject, baseObject) {

        // 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
        pinObject = normalize(pinObject);
        baseObject = normalize(baseObject);

        // 设定目标元素的 position 为绝对定位
        // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
        var pinElement = $(pinObject.element);

        if (pinElement.css('position') !== 'fixed') {
            pinElement.css('position', 'absolute');
            isPinFixed = false;
        }
        else {
            // 定位 fixed 元素的标志位，下面有特殊处理
            isPinFixed = true;
        }

        // 将位置属性归一化为数值
        // 注：必须放在上面这句 `css('position', 'absolute')` 之后，
        //    否则获取的宽高有可能不对
        posConverter(pinObject);
        posConverter(baseObject);

        var parentOffset = getParentOffset(pinElement);
        var baseOffset = baseObject.offset();

        // 计算目标元素的位置
        var top = baseOffset.top + baseObject.y -
            pinObject.y - parentOffset.top;

        var left = baseOffset.left + baseObject.x -
            pinObject.x - parentOffset.left;

        // 定位目标元素
        pinElement.css({ left: left, top: top });
    };


    // 将目标元素相对于基准元素进行居中定位
    // 接受两个参数，分别为目标元素和定位的基准元素，都是 DOM 节点类型
    Position.center = function(pinElement, baseElement) {
        Position.pin({
            element: pinElement,
            x: '50%',
            y: '50%'
        }, {
            element: baseElement,
            x: '50%',
            y: '50%'
        });
    };


    // 这是当前可视区域的伪 DOM 节点
    // 需要相对于当前可视区域定位时，可传入此对象作为 element 参数
    Position.VIEWPORT = VIEWPORT;


    // Helpers
    // -------

    // 将参数包装成标准的定位对象，形似 { element: a, x: 0, y: 0 }
    function normalize(posObject) {
        posObject = toElement(posObject) || {};

        if (posObject.nodeType) {
            posObject = { element: posObject };
        }

        var element = null;
        if((toString.call(posObject.element) === '[object String]') || (
            posObject.element && posObject.element.nodeType
            )){
            element = $(posObject.element)[0] ;
        }else if(toString.call(posObject.element) === '[object Array]'){
            element = posObject.element[0];
        }else{
            element = VIEWPORT;
        }

        if (element.nodeType !== 1) {
            throw new Error('posObject.element is invalid.');
        }

        var result = {
            element: element,
            x: posObject.x || 0,
            y: posObject.y || 0
        };

        var isVIEWPORT = (element === VIEWPORT || element._id === 'VIEWPORT');

        // 归一化 offset
        result.offset = function() {
            // 若定位 fixed 元素，则父元素的 offset 没有意义
            if (isPinFixed) {
                return {
                    left: 0,
                    top: 0
                };
            }
            else if (isVIEWPORT) {
                // 移动平台浏览器没有 document.documentElement.scrollTop/scrollLeft
                // 使用 window.scrollY/scrollX
                return {
                    left: window.scrollX,
                    top: window.scrollY
                };
            }
            else {
                return $(element).offset();
            }
        };

        // 归一化 size, 含 padding 和 border
        result.size = function() {
            var el = isVIEWPORT ? $(window) : $(element);

            if(el[0].nodeType !== 1){
                return {
                    // zeptojs 没有 $(window).width()/height() 方法
                    width: numberize(document.documentElement.clientWidth),
                    height: numberize(document.documentElement.clientHeight)
                }
            }
            // 获取元素实际宽度、高度。这包括 border-width，padding
            // 因为 mobile safari 的 getComputedStyle() 方法无法
            // 取得 border-width，因此使用 offsetWidth/offsetHeight 获取
            return {
                width: el[0].offsetWidth,
                height: el[0].offsetHeight
            };
        };

        return result;
    }

    // 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字
    function posConverter(pinObject) {
        pinObject.x = xyConverter(pinObject.x, pinObject, 'width');
        pinObject.y = xyConverter(pinObject.y, pinObject, 'height');
    }

    // 处理 x, y 值，都转化为数字
    function xyConverter(x, pinObject, type) {
        // 先转成字符串再说！好处理
        x = x + '';

        // 处理 px
        x = x.replace(/px/gi, '');

        // 处理 alias
        if (/\D/.test(x)) {
            x = x.replace(/(?:top|left)/gi, '0%')
                .replace(/center/gi, '50%')
                .replace(/(?:bottom|right)/gi, '100%');
        }

        // 将百分比转为像素值
        if (x.indexOf('%') !== -1) {
            //支持小数
            x = x.replace(/(\d+\.?\d+)%/gi, function(m, d) {
                return pinObject.size()[type] * (d / 100.0);
            });
        }

        // 处理类似 100%+20px 的情况
        if (/[+\-*\/]/.test(x)) {
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                // 参照：http://jsperf.com/eval-newfunction-for
                x = (new Function('return ' + x))();
            } catch (e) {
                throw new Error('Invalid position value: ' + x);
            }
        }

        // 转回为数字
        return numberize(x);
    }

    // 获取 offsetParent 的位置
    function getParentOffset(element) {
        // zepto 没有
        var parent = element[0].offsetParent;

        if(!parent){return {
            top: 0,
            left: 0
        };}

        if (parent[0] === document.documentElement) {
            parent = $(document.body);
        }

        // 获取 offsetParent 的 offset
        // 注1：document.body 会默认带 8 像素的偏差
        //
        // 注2：IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
        // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
        // 转为 document.body
        //
        // 以上两种情况直接赋为 0
        var offset = (parent === document.querySelector('body')) ?
        { left: 0, top: 0 } : $(parent).offset();

        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += numberize($(parent).css('border-top-width'));
        offset.left += numberize($(parent).css('border-left-width'));

        return offset;
    }

    function numberize(s) {
        return parseFloat(s, 10) || 0;
    }

    function toElement(element) {
        return $(element)[0];
    }
});


define("#android-shim/0.9.0/android-shim-debug", ["#zepto/0.9.0/zepto-debug", "#position/0.9.0/position-debug"], function(require, exports, module) {
    var $ = require("#zepto/0.9.0/zepto-debug");
    var Position = require("#position/0.9.0/position-debug");


    // target 是需要添加垫片的目标元素，可以传 `DOM Element` 或 `Selector`
    function Shim(target) {
        // 如果选择器选了多个 DOM，则只取第一个
        this.target = $(target).eq(0);
    }


    // 根据目标元素计算 div 的显隐、宽高、定位
    Shim.prototype.sync = function() {
        var target = this.target;
        var shim = this.shim;

        var height = target[0].offsetHeight;
        var width = target[0].offsetWidth;

        // 如果目标元素隐藏，则 div 也隐藏
        // jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
        // http://api.jquery.com/hidden-selector/
        if (!height || !width || target.css('display') === 'none') {
            shim && shim.css('display','none');
        } else {
            // 第一次显示时才创建：as lazy as possible
            shim || (shim = this.shim = createShim());

            shim.css({
                'height': height,
                'width': width,
                'zIndex': parseInt(target.css('zIndex'),10) - 1 || 1
            });

            Position.pin(shim[0], target[0]);
            shim.css('display','block');
        }

        return this;
    };


    // 销毁 div 等
    Shim.prototype.destroy = function() {
        if (this.shim) {
            this.shim.remove();
            delete this.shim;
        }
        delete this.target;
    };

    if ($.os.android) {
        module.exports = Shim;
    } else {
        // 非 Android 都返回空函数
        function Noop() {
        }

        Noop.prototype.sync = Noop;
        Noop.prototype.destroy = Noop;

        module.exports = Noop;
    }

    // Helpers
    function createShim() {
        return $('<div data-role="shim">').css({
            display: 'none',
            border: 'none',
            background: 'rgba(255,255,255,0.01)',
            '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
            position: 'absolute',
            left: 0,
            top: 0 ,
            padding: 0,
            margin: 0
        }).appendTo(document.querySelector('body'));
    }
});


define("#widget/0.9.16/widget-mobile-debug", ["#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#zepto/0.9.0/zepto-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug"], function(require, exports, module) {

    // Widget
    // ---------
    // Widget 是与 DOM 元素相关联的非工具类组件，主要负责 View 层的管理。
    // Widget 组件具有四个要素：描述状态的 attributes 和 properties，描述行为的 events
    // 和 methods。Widget 基类约定了这四要素创建时的基本流程和最佳实践。


    var Base = require("#base/0.9.16/base-debug");
    var $ = require("#zepto/0.9.0/zepto-debug");
    var DAParser = require("#widget/0.9.16/daparser-debug");
    var AutoRender = require("#widget/0.9.16/auto-render-debug");

    var DELEGATE_EVENT_NS = '.delegate-events-';
    var ON_RENDER = '_onRender';


    var Widget = Base.extend({

        // config 中的这些键值会直接添加到实例上，转换成 properties
        propsInAttrs: ['element', 'template', 'model', 'events'],

        // 与 widget 关联的 DOM 元素
        element: null,

        // 默认模板
        template: '<div></div>',

        // 默认数据模型
        model: null,

        // 事件代理，格式为：
        //   {
        //     'mousedown .title': 'edit',
        //     'click {{attrs.saveButton}}': 'save'
        //     'click .open': function(ev) { ... }
        //   }
        events: null,

        // 属性列表
        attrs: {
            // 基本属性
            id: '',
            className: '',
            style: {},

            // 组件的默认父节点
            parentNode: document.body
        },

        // 初始化方法，确定组件创建时的基本流程：
        // 初始化 attrs --》 初始化 props --》 初始化 events --》 子类的初始化
        initialize: function(config) {
            this.cid = uniqueCid();

            // 初始化 attrs
            var dataAttrsConfig = this._parseDataAttrsConfig(config);
            this.initAttrs(config, dataAttrsConfig);

            // 初始化 props
            this.parseElement();
            this._parseDataset();
            this.initProps();

            // 初始化 events
            this.delegateEvents();

            // 子类自定义的初始化
            this.setup();
        },

        // 解析通过 data-attr 设置的 api
        _parseDataAttrsConfig: function(config) {
            var dataAttrsConfig;
            if (config) {
                var element = $(config.element);
            }

            // 解析 data-api 时，只考虑用户传入的 element，不考虑来自继承或从模板构建的
            if (element && element[0] &&
                    !AutoRender.isDataApiOff(element)) {
                dataAttrsConfig = DAParser.parseElement(element);
                normalizeConfigValues(dataAttrsConfig);
            }

            return dataAttrsConfig;
        },

        // 构建 this.element
        parseElement: function() {
            var element = this.element;

            if (element) {
                this.element = $(element);
            }
            // 未传入 element 时，从 template 构建
            else if (this.get('template')) {
                this.parseElementFromTemplate();
            }

            // 如果对应的 DOM 元素不存在，则报错
            if (!this.element || !this.element[0]) {
                throw new Error('element is invalid');
            }
        },

        // 从模板中构建 this.element
        parseElementFromTemplate: function() {
            this.element = $(this.get('template'));
        },

        // 解析 this.element 中的 data-* 配���，获得 this.dataset
        // 并自动将 data-action 配置转换成事件代理
        _parseDataset: function() {
            if (AutoRender.isDataApiOff(this.element)) return;

            this.dataset = DAParser.parseBlock(this.element);

            var actions = this.dataset.action;
            if (actions) {
                var events = getEvents(this) || (this.events = {});
                parseDataActions(actions, events);
            }
        },

        // 负责 properties 的初始化，提供给子类覆盖
        initProps: function() {
        },

        // 注册事件代理
        delegateEvents: function(events, handler) {
            events || (events = getEvents(this));
            if (!events) return;

            // 允许使用：widget.delegateEvents('click p', function(ev) { ... })
            if (isString(events) && isFunction(handler)) {
                var o = {};
                o[events] = handler;
                events = o;
            }

            // key 为 'event selector'
            for (var key in events) {
                if (!events.hasOwnProperty(key)) continue;

                var args = parseEventKey(key, this);
                var eventType = args.type;
                var selector = args.selector;

                (function(handler, widget) {

                    var callback = function(ev) {
                        if (isFunction(handler)) {
                            handler.call(widget, ev);
                        } else {
                            widget[handler](ev);
                        }
                    };

                    // delegate
                    if (selector) {
                        widget.element.on(eventType, selector, callback);
                    }
                    // normal bind
                    // 分开写是为了兼容 zepto，zepto 的判断不如 jquery 强劲有力
                    else {
                        widget.element.on(eventType, callback);
                    }

                })(events[key], this);
            }

            return this;
        },

        // 卸载事件代理
        undelegateEvents: function(eventKey) {
            var args = {};

            // 卸载所有
            if (arguments.length === 0) {
                args.type = DELEGATE_EVENT_NS + this.cid;
            }
            // 卸载特定类型：widget.undelegateEvents('click li');
            else {
                args = parseEventKey(eventKey, this);
            }

            this.element.off(args.type, args.selector);
            return this;
        },

        // 提供给子类覆盖的初始化方法
        setup: function() {
        },

        // 将 widget 渲染到页面上
        // 渲染不仅仅���括插入到 DOM 树中，还包括样式渲染等
        // 约定：子类覆盖时，需保持 `return this`
        render: function() {

            // 让渲染相关属性的初始值生效，并绑定到 change 事件
            if (!this.rendered) {
                this._renderAndBindAttrs();
                this.rendered = true;
            }

            // 插入到文档流中
            var parentNode = this.get('parentNode');
            if (parentNode && !isInDocument(this.element[0])) {
                this.element.appendTo(parentNode);
            }

            return this;
        },

        // 让属性的初始值生效，并绑定到 change:attr 事件上
        _renderAndBindAttrs: function() {
            var widget = this;
            var attrs = widget.attrs;

            for (var attr in attrs) {
                if (!attrs.hasOwnProperty(attr)) continue;
                var m = ON_RENDER + ucfirst(attr);

                if (this[m]) {
                    var val = this.get(attr);

                    // 让属性的初始值生效。注：默认空值不触发
                    if (!isEmptyAttrValue(val)) {
                        this[m](this.get(attr), undefined, attr);
                    }

                    // 将 _onRenderXx 自动绑定到 change:xx 事件上
                    (function(m) {
                        widget.on('change:' + attr, function(val, prev, key) {
                            widget[m](val, prev, key);
                        });
                    })(m);
                }
            }
        },

        _onRenderId: function(val) {
            this.element.attr('id', val);
        },

        _onRenderClassName: function(val) {
            this.element.addClass(val);
        },

        _onRenderStyle: function(val) {
            this.element.css(val);
        },

        // 在 this.element 内寻找匹配节点
        $: function(selector) {
            return this.element.find(selector);
        },

        destroy: function() {
            this.undelegateEvents();
            Widget.superclass.destroy.call(this);
        }
    });

    Widget.autoRender = AutoRender.autoRender;
    Widget.autoRenderAll = AutoRender.autoRenderAll;
    Widget.StaticsWhiteList = ['autoRender'];

    module.exports = Widget;


    // Helpers
    // ------

    var toString = Object.prototype.toString;
    var cidCounter = 0;

    function uniqueCid() {
        return 'widget-' + cidCounter++;
    }

    function isString(val) {
        return toString.call(val) === '[object String]';
    }

    function isFunction(val) {
        return toString.call(val) === '[object Function]';
    }

    function isEmptyObject(o) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) return false;
        }
        return true;
    }

    function trim(s) {
        return s.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    // Zepto 上没有 contains 方法
    var contains = $.contains || function(a, b) {
        return !!(a.compareDocumentPosition(b) & 16);
    };

    function isInDocument(element) {
        return contains(document.documentElement, element);
    }

    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }


    var JSON_LITERAL_PATTERN = /^\s*[\[{].*[\]}]\s*$/;
    var parseJSON = this.JSON ? JSON.parse : $.parseJSON;

    // 解析并归一化配置中的值
    function normalizeConfigValues(config) {
        for (var p in config) {
            if (config.hasOwnProperty(p)) {

                var val = config[p];
                if (!isString(val)) continue;

                if (JSON_LITERAL_PATTERN.test(val)) {
                    val = val.replace(/'/g, '"');
                    config[p] = normalizeConfigValues(parseJSON(val));
                }
                else {
                    config[p] = normalizeConfigValue(val);
                }
            }
        }

        return config;
    }

    // 将 'false' 转换为 false
    // 'true' 转换为 true
    // '3253.34' 转换为 3253.34
    function normalizeConfigValue(val) {
        if (val.toLowerCase() === 'false') {
            val = false;
        }
        else if (val.toLowerCase() === 'true') {
            val = true;
        }
        else if (/\d/.test(val) && /[^a-z]/i.test(val)) {
            var number = parseFloat(val);
            if (number + '' === val) {
                val = number;
            }
        }

        return val;
    }


    // 解析 data-action，添加到 events 中
    function parseDataActions(actions, events) {
        for (var action in actions) {
            if (!actions.hasOwnProperty(action)) continue;

            // data-action 可以含有多个事件，比如：click x, mouseenter y
            var parts = trim(action).split(/\s*,\s*/);
            var selector = actions[action];

            while (action = parts.shift()) {
                var m = action.split(/\s+/);
                var event = m[0];
                var method = m[1];

                // 默认是 click 事件
                if (!method) {
                    method = event;
                    event = 'click';
                }

                events[event + ' ' + selector] = method;
            }
        }
    }

    // 对于 attrs 的 value 来说，以下值都���为是空值： null, undefined, '', [], {}
    function isEmptyAttrValue(o) {
        return o == null || // null, undefined
                (isString(o) || $.isArray(o)) && o.length === 0 || // '', []
                $.isPlainObject(o) && isEmptyObject(o); // {}
    }


    var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/;
    var EXPRESSION_FLAG = /{{([^}]+)}}/g;
    var INVALID_SELECTOR = 'INVALID_SELECTOR';

    function getEvents(widget) {
        if (isFunction(widget.events)) {
            widget.events = widget.events();
        }
        return widget.events;
    }

    function parseEventKey(eventKey, widget) {
        var match = eventKey.match(EVENT_KEY_SPLITTER);
        var eventType = match[1] + DELEGATE_EVENT_NS + widget.cid;

        // 当没有 selector 时，需要设置为 undefined，以使得 zepto 能正确转换为 bind
        var selector = match[2] || undefined;

        if (selector && selector.indexOf('{{') > -1) {
            selector = parseEventExpression(selector, widget);
        }

        return {
            type: eventType,
            selector: selector
        };
    }

    // 将 {{xx}}, {{yy}} 转换成 .daparser-n, .daparser-m
    function parseEventExpression(selector, widget) {

        return selector.replace(EXPRESSION_FLAG, function(m, name) {
            var parts = name.split('.');
            var point = widget, part;

            while (part = parts.shift()) {
                if (point === widget.attrs) {
                    point = widget.get(part);
                } else {
                    point = point[part];
                }
            }

            // 已经是 className，比如来自 dataset 的
            if (isString(point)) {
                return point;
            }

            // 看是否是 element
            var element = $(point)[0];
            if (element && element.nodeType === 1) {
                return '.' + DAParser.stamp(element);
            }

            // 不能识别的，返回无效标识
            return INVALID_SELECTOR;
        });
    }

});


define("#base/0.9.16/base-debug", ["#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug"], function(require, exports, module) {

    // Base
    // ---------
    // Base 是一个基础类，提供 Class、Events、Attrs 和 Aspect 支持。


    var Class = require("#class/0.9.2/class-debug");
    var Events = require("#events/0.9.1/events-debug");
    var Aspect = require("#base/0.9.16/aspect-debug");
    var Attribute = require("#base/0.9.16/attribute-debug");


    var Base = Class.create({
        Implements: [Events, Aspect, Attribute],

        initialize: function(config) {
            this.initAttrs(config);
        },

        destroy: function() {
            this.off();

            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        }
    });

    module.exports = Base;

});



define("#class/0.9.2/class-debug", [], function() {

    // Class
    // -----------------
    // Thanks to:
    //  - http://mootools.net/docs/core/Class/Class
    //  - http://ejohn.org/blog/simple-javascript-inheritance/
    //  - https://github.com/ded/klass
    //  - http://documentcloud.github.com/backbone/#Model-extend
    //  - https://github.com/joyent/node/blob/master/lib/util.js
    //  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js


    // The base Class implementation.
    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && isFunction(o)) {
            return classify(o);
        }
    }


    // Create a new Class.
    //
    //    var SuperPig = Class.create({
    //        Extends: Animal,
    //        Implements: Flyable,
    //        initialize: function() {
    //            SuperPig.superclass.initialize.apply(this, arguments);
    //        },
    //        Statics: {
    //            COLOR: 'red'
    //        }
    //    });
    //
    Class.create = function(parent, properties) {
        if (!isFunction(parent)) {
            properties = parent;
            parent = null;
        }

        properties || (properties = {});
        parent || (parent = properties.Extends || Class);
        properties.Extends = parent;

        // The created class constructor
        function SubClass() {
            // Call the parent constructor.
            parent.apply(this, arguments);

            // Only call initialize in self constructor.
            if (this.constructor === SubClass && this.initialize) {
                this.initialize.apply(this, arguments);
            }
        }

        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            mix(SubClass, parent, parent.StaticsWhiteList);
        }

        // Add instance properties to the subclass.
        implement.call(SubClass, properties);

        // Make subclass extendable.
        return classify(SubClass);
    };


    function implement(properties) {
        var key, value;

        for (key in properties) {
            value = properties[key];

            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }


    // Create a sub Class based on `Class`.
    Class.extend = function(properties) {
        properties || (properties = {});
        properties.Extends = this;

        return Class.create(properties);
    };


    function classify(cls) {
        cls.extend = Class.extend;
        cls.implement = implement;
        return cls;
    }


    // Mutators define special properties.
    Class.Mutators = {
        'Extends': function(parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);

            // Keep existed properties.
            mix(proto, existed);

            // Enforce the constructor to be what we expect.
            proto.constructor = this;

            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto;

            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.superclass = parent.prototype;
        },

        'Implements': function(items) {
            isArray(items) || (items = [items]);
            var proto = this.prototype, item;

            while (item = items.shift()) {
                mix(proto, item.prototype || item);
            }
        },

        'Statics': function(staticProperties) {
            mix(this, staticProperties);
        }
    };


    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {
    }

    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ?
            function(proto) {
                return { __proto__: proto };
            } :
            function(proto) {
                Ctor.prototype = proto;
                return new Ctor();
            };


    // Helpers
    // ------------

    function mix(r, s, wl) {
        // Copy "all" properties including inherited ones.
        for (var p in s) {
            if (s.hasOwnProperty(p)) {
                if(wl && indexOf(wl, p) === -1) continue;

                // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
                if (p !== 'prototype') {
                    r[p] = s[p];
                }
            }
        }
    }


    var toString = Object.prototype.toString;
    var isArray = Array.isArray;

    if (!isArray) {
        isArray = function(val) {
            return toString.call(val) === '[object Array]';
        };
    }

    var isFunction = function(val) {
        return toString.call(val) === '[object Function]';
    };

    var indexOf = Array.prototype.indexOf ?
            function(arr, item) {
                return arr.indexOf(item);
            } :
            function(arr, item) {
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            };


    return Class;
});



define("#base/0.9.16/aspect-debug", [], function(require, exports) {

    // Aspect
    // ---------------------
    // Thanks to:
    //  - http://yuilibrary.com/yui/docs/api/classes/Do.html
    //  - http://code.google.com/p/jquery-aop/
    //  - http://lazutkin.com/blog/2008/may/18/aop-aspect-javascript-dojo/


    // 在指定方法执行前，先执行 callback
    exports.before = function(methodName, callback, context) {
        return weave.call(this, 'before', methodName, callback, context);
    };


    // 在指定方法执行后，再执行 callback
    exports.after = function(methodName, callback, context) {
        return weave.call(this, 'after', methodName, callback, context);
    };


    // Helpers
    // -------

    var eventSplitter = /\s+/;

    function weave(when, methodName, callback, context) {
        var names = methodName.split(eventSplitter);
        var name, method;

        while (name = names.shift()) {
            method = getMethod(this, name);
            if (!method.__isAspected) {
                wrap.call(this, name);
            }
            this.on(when + ':' + name, callback, context);
        }

        return this;
    }


    function getMethod(host, methodName) {
        var method = host[methodName];
        if (!method) {
            throw new Error('Invalid method name: ' + methodName);
        }
        return method;
    }


    function wrap(methodName) {
        var old = this[methodName];

        this[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var beforeArgs = ['before:' + methodName].concat(args);

            this.trigger.apply(this, beforeArgs);
            var ret = old.apply(this, arguments);
            this.trigger('after:' + methodName, ret);

            return ret;
        };

        this[methodName].__isAspected = true;
    }

});


define("#base/0.9.16/attribute-debug", [], function(require, exports) {

    // Attribute
    // -----------------
    // Thanks to:
    //  - http://documentcloud.github.com/backbone/#Model
    //  - http://yuilibrary.com/yui/docs/api/classes/AttributeCore.html
    //  - https://github.com/berzniz/backbone.getters.setters


    // 负责 attributes 的初始化
    // attributes 是与实例相关的状态信息，可读可写，发生变化时，会自动触发相关事件
    exports.initAttrs = function(config, dataAttrsConfig) {
        // 合并来自 data-attr 的配置
        if (dataAttrsConfig) {
            config = config ?
                    merge(dataAttrsConfig, config) :
                    dataAttrsConfig;
        }

        var specialProps = this.propsInAttrs || [];
        var attrs, inheritedAttrs, userValues;

        // Get all inherited attributes.
        inheritedAttrs = getInheritedAttrs(this, specialProps);
        attrs = merge({}, inheritedAttrs);

        // Merge user-specific attributes from config.
        if (config) {
            userValues = normalize(config);
            merge(attrs, userValues);
        }

        // Automatically register `this._onChangeAttr` method as
        // a `change:attr` event handler.
        parseEventsFromInstance(this, attrs);

        // initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
        this.attrs = attrs;

        // 对于有 setter 的属性，要用初始值 set 一下，以保证关联属性也一同初始化
        // 这样还可以让 onXx 通过 setter 的方式支持更多形式
        setSetterAttrs(this, attrs, userValues);

        // Convert `on/before/afterXxx` config to event handler.
        parseEventsFromAttrs(this, attrs);

        // 将 this.attrs 上的 special properties 放回 this 上
        copySpecialProps(specialProps, this, this.attrs, true);
    };


    // Get the value of an attribute.
    exports.get = function(key) {
        var attr = this.attrs[key] || {};
        var val = attr.value;
        return attr.getter ? attr.getter.call(this, val, key) : val;
    };


    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    exports.set = function(key, val, options) {
        var attrs = {};

        // set("key", val, options)
        if (isString(key)) {
            attrs[key] = val;
        }
        // set({ "key": val, "key2": val2 }, options)
        else {
            attrs = key;
            options = val;
        }

        options || (options = {});
        var silent = options.silent;

        var now = this.attrs;
        var changed = this.__changedAttrs || (this.__changedAttrs = {});

        for (key in attrs) {
            if (!attrs.hasOwnProperty(key)) continue;

            var attr = now[key] || (now[key] = {});
            val = attrs[key];

            if (attr.readOnly) {
                throw new Error('This attribute is readOnly: ' + key);
            }

            // invoke validator
            if (attr.validator) {
                var ex = attr.validator.call(this, val, key);
                if (ex !== true) {
                    if (options.error) {
                        options.error.call(this, ex);
                    }
                    continue;
                }
            }

            // invoke setter
            if (attr.setter) {
                val = attr.setter.call(this, val, key);
            }

            // 获取设置前的 prev 值
            var prev = this.get(key);

            // 获取需要设置的 val 值
            // 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
            if (isPlainObject(prev) && isPlainObject(val)) {
                val = merge(merge({}, prev), val);
            }

            // set finally
            now[key].value = val;

            // invoke change event
            // 初始化时对 set 的调用，不触发任何事件
            if (!this.__initializingAttrs && !isEqual(prev, val)) {
                if (silent) {
                    changed[key] = [val, prev];
                }
                else {
                    this.trigger('change:' + key, val, prev, key);
                }
            }
        }

        return this;
    };


    // Call this method to manually fire a `"change"` event for triggering
    // a `"change:attribute"` event for each changed attribute.
    exports.change = function() {
        var changed = this.__changedAttrs;

        if (changed) {
            for (var key in changed) {
                if (changed.hasOwnProperty(key)) {
                    var args = changed[key];
                    this.trigger('change:' + key, args[0], args[1], key);
                }
            }
            delete this.__changedAttrs;
        }

        return this;
    };


    // Helpers
    // -------

    var toString = Object.prototype.toString;

    var isArray = Array.isArray || function(val) {
        return toString.call(val) === '[object Array]';
    };

    function isString(val) {
        return toString.call(val) === '[object String]';
    }

    function isFunction(val) {
        return toString.call(val) === '[object Function]';
    }

    function isPlainObject(o) {
        return o &&
            // 排除 boolean/string/number/function 等
            // 标准浏览器下，排除 window 等非 JS 对象
            // 注：ie8- 下，toString.call(window 等对象)  返回 '[object Object]'
                toString.call(o) === '[object Object]' &&
            // ie8- 下，排除 window 等非 JS 对象
                ('isPrototypeOf' in o);
    }

    function isEmptyObject(o) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) return false;
        }
        return true;
    }

    function merge(receiver, supplier) {
        var key, value;

        for (key in supplier) {
            if (supplier.hasOwnProperty(key)) {
                value = supplier[key];

                // 只 clone 数组和 plain object，其他的保持不变
                if (isArray(value)) {
                    value = value.slice();
                }
                else if (isPlainObject(value)) {
                    value = merge(receiver[key] || {}, value);
                }

                receiver[key] = value;
            }
        }

        return receiver;
    }

    var keys = Object.keys;

    if (!keys) {
        keys = function(o) {
            var result = [];

            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        }
    }

    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }


    function getInheritedAttrs(instance, specialProps) {
        var inherited = [];
        var proto = instance.constructor.prototype;

        while (proto) {
            // 不要拿到 prototype 上的
            if (!proto.hasOwnProperty('attrs')) {
                proto.attrs = {};
            }

            // 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
            copySpecialProps(specialProps, proto.attrs, proto);

            // 为空时不添加
            if (!isEmptyObject(proto.attrs)) {
                inherited.unshift(proto.attrs);
            }

            // 向上回溯一级
            proto = proto.constructor.superclass;
        }

        // Merge and clone default values to instance.
        var result = {};
        for (var i = 0, len = inherited.length; i < len; i++) {
            result = merge(result, normalize(inherited[i]));
        }

        return result;
    }

    function copySpecialProps(specialProps, receiver, supplier, isAttr2Prop) {
        for (var i = 0, len = specialProps.length; i < len; i++) {
            var key = specialProps[i];

            if (supplier.hasOwnProperty(key)) {
                var val = supplier[key];
                receiver[key] = isAttr2Prop ? receiver.get(key) : val;
            }
        }
    }


    var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
    var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;

    function parseEventsFromInstance(host, attrs) {
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                var m = '_onChange' + ucfirst(attr);
                if (host[m]) {
                    host.on('change:' + attr, host[m]);
                }
            }
        }
    }

    function parseEventsFromAttrs(host, attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var value = attrs[key].value, m;

                if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
                    host[m[1]](getEventName(m[2]), value);
                    delete attrs[key];
                }
            }
        }
    }

    // Converts `Show` to `show` and `ChangeTitle` to `change:title`
    function getEventName(name) {
        var m = name.match(EVENT_NAME_PATTERN);
        var ret = m[1] ? 'change:' : '';
        ret += m[2].toLowerCase() + m[3];
        return ret;
    }


    function setSetterAttrs(host, attrs, userValues) {
        var options = { silent: true };
        host.__initializingAttrs = true;

        for (var key in userValues) {
            if (userValues.hasOwnProperty(key)) {
                if (attrs[key].setter) {
                    host.set(key, userValues[key].value, options);
                }
            }
        }

        delete host.__initializingAttrs;
    }


    var ATTR_SPECIAL_KEYS = ['value', 'getter', 'setter',
        'validator', 'readOnly'];

    // normalize `attrs` to
    //
    //   {
    //      value: 'xx',
    //      getter: fn,
    //      setter: fn,
    //      validator: fn,
    //      readOnly: boolean
    //   }
    //
    function normalize(attrs) {
        // clone it
        attrs = merge({}, attrs);

        for (var key in attrs) {
            var attr = attrs[key];

            if (isPlainObject(attr) &&
                    hasOwnProperties(attr, ATTR_SPECIAL_KEYS)) {
                continue;
            }

            attrs[key] = {
                value: attr
            };
        }

        return attrs;
    }

    function hasOwnProperties(object, properties) {
        for (var i = 0, len = properties.length; i < len; i++) {
            if (object.hasOwnProperty(properties[i])) {
                return true;
            }
        }
        return false;
    }


    // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined, '', [], {}
    function isEmptyAttrValue(o) {
        return o == null || // null, undefined
                (isString(o) || isArray(o)) && o.length === 0 || // '', []
                isPlainObject(o) && isEmptyObject(o); // {}
    }

    // 判断属性值 a 和 b 是否相等，注意仅适用于属性值的判断，非普适的 === 或 == 判断。
    function isEqual(a, b) {
        if (a === b) return true;

        if (isEmptyAttrValue(a) && isEmptyAttrValue(b)) return true;

        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;

        switch (className) {

            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are
                // equivalent; thus, `"5"` is equivalent to `new String("5")`.
                return a == String(b);

            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `equal`
                // comparison is performed for other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);

            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values.
                // Dates are compared by their millisecond representations.
                // Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;

            // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                        a.global == b.global &&
                        a.multiline == b.multiline &&
                        a.ignoreCase == b.ignoreCase;

            // 简单判断数组包含的 primitive 值是否相等
            case '[object Array]':
                var aString = a.toString();
                var bString = b.toString();

                // 只要包含非 primitive 值，为了稳妥起见，都返回 false
                return aString.indexOf('[object') === -1 &&
                        bString.indexOf('[object') === -1 &&
                        aString === bString;
        }

        if (typeof a != 'object' || typeof b != 'object') return false;

        // 简单判断两个对象是否相等，只判断第一层
        if (isPlainObject(a) && isPlainObject(b)) {

            // 键值不相等，立刻返回 false
            if (!isEqual(keys(a), keys(b))) {
                return false;
            }

            // 键相同，但有值不等，立刻返回 false
            for (var p in a) {
                if (a[p] !== b[p]) return false;
            }

            return true;
        }

        // 其他情况返回 false, 以避免误判导致 change 事件没发生
        return false;
    }

});


define("#widget/0.9.16/daparser-mobile-debug", ["#zepto/0.9.0/zepto-debug"], function(require, exports) {

    // DAParser
    // --------
    // data api 解析器，提供对 block 块和单个 element 的解析，并可用来自动初始化页面中
    // 的所有 Widget 组件。


    var $ = require("#zepto/0.9.0/zepto-debug");
    var ATTR_DA_CID = 'data-daparser-cid';
    var DAParser = exports;


    // 输入是 DOM element，假设 html 为
    //
    //   <div data-widget="Dialog">
    //     <h3 data-role="title">...</h3>
    //     <ul data-role="content">
    //       <li data-role="item">...</li>
    //       <li data-role="item">...</li>
    //     </ul>
    //     <span data-action="click close">X</span>
    //   </div>
    //
    // 输出是
    //
    //  {
    //     "widget": { "Dialog": ".daparser-0" }
    //     "role": {
    //        "title": ".daparser-1",
    //        "content": ".daparser-2",
    //        "role": ".daparser-3,.daparser-4",
    //     },
    //     "action": {
    //        "click close": ".daparser-5"
    //     }
    //  }
    //
    // 有 data-* 的节点，会自动加上 class="daparser-n"
    //
    DAParser.parseBlock = function(root) {
        root = $(root)[0];
        var stringMap = {};

        // 快速判断 dataset 是否为空，减少无 data-* 时的性能损耗
        if (!hasDataAttrs(root)) return stringMap;

        var elements = makeArray(root.getElementsByTagName('*'));
        elements.unshift(root);

        for (var i = 0, len = elements.length; i < len; i++) {
            var element = elements[i];
            var dataset = DAParser.parseElement(element);
            var cid = element.getAttribute(ATTR_DA_CID);

            for (var key in dataset) {

                // 给 dataset 不为空的元素设置 uid
                if (!cid) {
                    cid = DAParser.stamp(element);
                }

                var val = dataset[key];
                var o = stringMap[key] || (stringMap[key] = {});

                // 用 selector 的形式存储
                o[val] || (o[val] = '');
                o[val] += (o[val] ? ',' : '') + '.' + cid;
            }
        }

        return stringMap;
    };


    // 得到某个 DOM 元素的 dataset
    DAParser.parseElement = function(element) {
        element = $(element)[0];

        // ref: https://developer.mozilla.org/en/DOM/element.dataset
        if (element.dataset) {
            // ���换成普通对象返回
            return $.extend({}, element.dataset);
        }

        var dataset = {};
        var attrs = element.attributes;

        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            var name = attr.name;

            if (name.indexOf('data-') === 0) {
                name = camelCase(name.substring(5));
                dataset[name] = attr.value;
            }
        }

        return dataset;
    };


    // 给 DOM 元素添加具有唯一性质的 className
    DAParser.stamp = function(element) {
        element = $(element)[0];
        var cid = element.getAttribute(ATTR_DA_CID);

        if (!cid) {
            cid = uniqueId();
            element.setAttribute(ATTR_DA_CID, cid);
            element.className += ' ' + cid;
        }
        return cid;
    };


    // Helpers
    // ------

    function makeArray(o) {
        var arr = [];

        for (var i = 0, len = o.length; i < len; i++) {
            var node = o[i];

            // 过滤掉注释等节点
            if (node.nodeType === 1) {
                arr.push(node);
            }
        }

        return arr;
    }


    function hasDataAttrs(element) {
        var outerHTML = element.outerHTML;

        // 大部分浏览器已经支持 outerHTML
        if (outerHTML) {
            return outerHTML.indexOf(' data-') !== -1;
        }

        // 看子元素里是否有 data-*
        var innerHTML = element.innerHTML;
        if (innerHTML && innerHTML.indexOf(' data-') !== -1) {
            return true;
        }

        // 判断自己是否有 data-*
        var dataset = DAParser.parseElement(element);
        //noinspection JSUnusedLocalSymbols
        for (var p in dataset) {
            return true;
        }

        return false;
    }


    // 仅处理字母开头的，其他情况仅作小写转换："data-x-y-123-_A" --> xY-123-_a
    var RE_DASH_WORD = /-([a-z])/g;

    function camelCase(str) {
        return str.toLowerCase().replace(RE_DASH_WORD, function(all, letter) {
            return (letter + '').toUpperCase();
        });
    }


    var idCounter = 0;

    function uniqueId() {
        return 'daparser-' + idCounter++;
    }

});


define("#widget/0.9.16/auto-render-mobile-debug", ["#zepto/0.9.0/zepto-debug"], function(require, exports) {

    var $ = require("#zepto/0.9.0/zepto-debug");


    // 自动渲染接口，子类可根据自己的初始化逻辑进行覆盖
    exports.autoRender = function(config) {
        new this(config).render();
    };


    // 根据 data-widget 属性，自动渲染所有开启了 data-api 的 widget 组件
    exports.autoRenderAll = function(root) {
        root = $(root || document.body);
        var modules = [];
        var elements = [];

        root.find('[data-widget]').each(function(i, element) {
            if (!exports.isDataApiOff(element)) {
                modules.push(element.getAttribute('data-widget').toLowerCase());
                elements.push(element);
            }
        });

        if (modules.length) {
            require.async(modules, function() {

                for (var i = 0; i < arguments.length; i++) {
                    var SubWidget = arguments[i];
                    var element = elements[i];

                    if (SubWidget.autoRender) {
                        SubWidget.autoRender({
                            element: element,
                            renderType: 'auto'
                        });
                    }
                }
            });
        }
    };


    var isDefaultOff = $(document.body).attr('data-api') === 'off';

    // 是否没开启 data-api
    exports.isDataApiOff = function(element) {
        var elementDataApi = $(element).attr('data-api');

        // data-api 默认开启，关闭只有两种方式：
        //  1. element 上有 data-api="off"，表示关闭单个
        //  2. document.body 上有 data-api="off"，表示关闭所有
        return  elementDataApi === 'off' ||
                (elementDataApi !== 'on' && isDefaultOff);
    };

});


define('#zepto/0.9.0/zepto-debug', [], function(require) {

  var _zepto = window.Zepto;
  var _$ = window.$;

  /* Zepto v1.0rc1 - polyfill zepto event detect fx ajax form touch - zeptojs.com/license */
;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,

    // Used by `$.zepto.init` to wrap elements, text/comment nodes, document,
    // and document fragment node types.
    elementTypes = [1, 3, 8, 9, 11],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]+)$/,
    tagSelectorRE = /^[\w-]+$/,
    toString = ({}).toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function isFunction(value) { return toString.call(value) == "[object Function]" }
  function isObject(value) { return value instanceof Object }
  function isPlainObject(value) {
    var key, ctor
    if (toString.call(value) !== "[object Object]") return false
    ctor = (isFunction(value.constructor) && value.constructor.prototype)
    if (!ctor || !hasOwnProperty.call(ctor, 'isPrototypeOf')) return false
    for (key in value);
    return key === undefined || hasOwnProperty.call(value, key)
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return array.filter(function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name) {
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'
    var container = containers[name]
    container.innerHTML = '' + html
    return $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = arguments.callee.prototype
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // if a JavaScript object is given, return a copy of it
      // this is a somewhat peculiar option, but supported by
      // jQuery so we'll do it, too
      else if (isPlainObject(selector))
        dom = [$.extend({}, selector)], selector = null
      // wrap stuff like `document` or `window`
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, whichs makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source)
        if (source[key] !== undefined)
          target[key] = source[key]
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (element === document && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : emptyArray ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? emptyArray :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  function funcArg(context, arg, idx, payload) {
   return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  $.isFunction = isFunction
  $.isObject = isObject
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) })
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) })
      return this
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result
      if (this.length == 1) result = zepto.qsa(this[0], selector)
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return $(result)
    },
    closest: function(selector, context){
      var node = this[0]
      while (node && !zepto.matches(node, selector))
        node = node !== context && node !== document && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector)
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return this.map(function(){ return this[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(newContent){
      return this.each(function(){
        $(this).wrapAll($(newContent)[0].cloneNode(false))
      })
    },
    wrapAll: function(newContent){
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent))
        newContent.append(this)
      }
      return this
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return $(this.map(function(){ return this.cloneNode(true) }))
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide()
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ if (this.nodeType === 1) this.removeAttribute(name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] ? this[0][name] : undefined) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? data : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : undefined) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(){
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: obj.width,
        height: obj.height
      }
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return (
          this.length == 0
            ? undefined
            : this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      for (key in property)
        if(typeof property[key] == 'string' && property[key] == '')
          this.each(function(){ this.style.removeProperty(dasherize(key)) })
        else
          css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'

      if (typeof property == 'string')
        if (value == '')
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (this.length < 1) return false
      else return classRE(name).test(this[0].className)
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = this.className, newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined)
          return this.className = ''
        classList = this.className
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        this.className = classList.trim()
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var newName = funcArg(this, name, idx, this.className)
        ;(when === undefined ? !$(this).hasClass(newName) : when) ?
          $(this).addClass(newName) : $(this).removeClass(newName)
      })
    }
  }

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return this[0] == window ? window['inner' + Dimension] :
        this[0] == document ? document.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        var el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function insert(operator, target, node) {
    var parent = (operator % 2) ? target : target.parentNode
    parent ? parent.insertBefore(node,
      !operator ? target.nextSibling :      // after
      operator == 1 ? parent.firstChild :   // prepend
      operator == 2 ? target :              // before
      null) :                               // append
      $(node).remove()
  }

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var nodes = $.map(arguments, function(n){ return isObject(n) ? n : zepto.fragment(n) })
      if (nodes.length < 1) return this
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i]
          traverseNode(node, function(node){
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT' && (!node.type || node.type === 'text/javascript'))
              window['eval'].call(window, node.innerHTML)
          })
          if (copyByClone && index < size - 1) node = node.cloneNode(true)
          insert(operator, target, node)
        }
      })
    }

    $.fn[(operator % 2) ? key+'To' : 'insert'+(operator ? 'Before' : 'After')] = function(html){
      $(html)[key](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.camelize = camelize
  zepto.uniq = uniq
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
'$' in window || (window.$ = Zepto)
;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={}

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.isObject(events)) $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function add(element, events, fn, selector, getDelegate, capture){
    capture = !!capture
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var delegate = getDelegate && getDelegate(fn, event),
        callback = delegate || fn
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data))
        if (result === false) event.preventDefault()
        return result
      }
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length})
      set.push(handler)
      element.addEventListener(handler.e, proxyfn, capture)
    })
  }
  function remove(element, events, fn, selector){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(handler.e, handler.proxy, false)
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event)
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    var capture = false
    if(event == 'blur' || event == 'focus'){
      if($.iswebkit)
        event = event == 'blur' ? 'focusout' : event == 'focus' ? 'focusin' : event
      else
        capture = true
    }

    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      }, capture)
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.bind(event, selector) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return selector == undefined || $.isFunction(selector) ?
      this.unbind(event, selector) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else if (this.length) try { this.get(0)[name]() } catch(e){}
      return this
    }
  })

  $.Event = function(type, props) {
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    return event
  }

})(Zepto)
;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/)

    // todo clean this up with a better OS/browser
    // separation. we need to discern between multiple
    // browsers on android, and decide if kindle fire in
    // silk mode is android or not

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    clearProperties = {}

  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  clearProperties[prefix + 'transition-property'] =
  clearProperties[prefix + 'transition-duration'] =
  clearProperties[prefix + 'transition-timing-function'] =
  clearProperties[prefix + 'animation-name'] =
  clearProperties[prefix + 'animation-duration'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = duration / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssProperties[prefix + 'animation-name'] = properties
      cssProperties[prefix + 'animation-duration'] = duration + 's'
      endEvent = $.fx.animationEnd
    } else {
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) {
          transforms || (transforms = [])
          transforms.push(key + '(' + properties[key] + ')')
        }
        else cssProperties[key] = properties[key]

      if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
      if (!$.fx.off && typeof properties === 'object') {
        cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
        cssProperties[prefix + 'transition-duration'] = duration + 's'
        cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, arguments.callee)
      }
      $(this).css(clearProperties)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    setTimeout(function() {
      that.css(cssProperties)
      if (duration <= 0) setTimeout(function() {
        that.each(function(){ wrappedCallback.call(this) })
      }, 0)
    }, 0)

    return this
  }

  testEl = null
})(Zepto)
;(function($){
  var jsonpID = 0,
      isObject = $.isObject,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      abort = function(){
        $(script).remove()
        if (callbackName in window) window[callbackName] = empty
        ajaxComplete('abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (options.error) script.onerror = function() {
      xhr.abort()
      options.error()
    }

    window[callbackName] = function(data){
      clearTimeout(abortTimeout)
      $(script).remove()
      delete window[callbackName]
      ajaxSuccess(data, xhr, options)
    }

    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
      }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0
  }

  function mimeToDataType(mime) {
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (isObject(options.data)) options.data = $.param(options.data)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = $.ajaxSettings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, 'error', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  $.get = function(url, success){ return $.ajax({ url: url, success: success }) }

  $.post = function(url, data, success, dataType){
    if ($.isFunction(data)) dataType = dataType || success, success = data, data = null
    return $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
  }

  $.getJSON = function(url, success){
    return $.ajax({ url: url, success: success, dataType: 'json' })
  }

  $.fn.load = function(url, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector
    if (parts.length > 1) url = parts[0], selector = parts[1]
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response.replace(rscript, "")).find(selector).html()
        : response)
      success && success.call(self)
    })
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var array = $.isArray(obj)
    $.each(obj, function(key, value) {
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (traditional ? $.isArray(value) : isObject(value))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace('%20', '+')
  }
})(Zepto)
;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)
;(function($){
  var touch = {}, touchTimeout

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  var longTapDelay = 750, longTapTimeout

  function longTap(){
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap(){
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  $(document).ready(function(){
    var now, delta

    $(document.body).bind('touchstart', function(e){
      now = Date.now()
      delta = now - (touch.last || now)
      touch.el = $(parentIfText(e.touches[0].target))
      touchTimeout && clearTimeout(touchTimeout)
      touch.x1 = e.touches[0].pageX
      touch.y1 = e.touches[0].pageY
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true
      touch.last = now
      longTapTimeout = setTimeout(longTap, longTapDelay)
    }).bind('touchmove', function(e){
      cancelLongTap()
      touch.x2 = e.touches[0].pageX
      touch.y2 = e.touches[0].pageY
    }).bind('touchend', function(e){
       cancelLongTap()

      // double tap (tapped twice within 250ms)
      if (touch.isDoubleTap) {
        touch.el.trigger('doubleTap')
        touch = {}

      // swipe
      } else if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                 (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
        touch.el.trigger('swipe') &&
          touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
        touch = {}

      // normal tap
      } else if ('last' in touch) {
        touch.el.trigger('tap')

        touchTimeout = setTimeout(function(){
          touchTimeout = null
          touch.el.trigger('singleTap')
          touch = {}
        }, 250)
      }
    }).bind('touchcancel', function(){
      if (touchTimeout) clearTimeout(touchTimeout)
      if (longTapTimeout) clearTimeout(longTapTimeout)
      longTapTimeout = touchTimeout = null
      touch = {}
    })
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)


  window.Zepto = _zepto;
  window.$ = _$;

  return Zepto;
});


define('#handlebars/1.0.0/handlebars-debug', [], function() {

// lib/handlebars/base.js
var Handlebars = {};

Handlebars.VERSION = "1.0.beta.6";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
    return fn(context);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});
;
// lib/handlebars/compiler/parser.js
/* Jison generated parser */
var handlebars = (function(){

var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"program":4,"EOF":5,"statements":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"inMustache":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"OPEN_PARTIAL":24,"params":25,"hash":26,"param":27,"STRING":28,"INTEGER":29,"BOOLEAN":30,"hashSegments":31,"hashSegment":32,"ID":33,"EQUALS":34,"pathSegments":35,"SEP":36,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"OPEN_PARTIAL",28:"STRING",29:"INTEGER",30:"BOOLEAN",33:"ID",34:"EQUALS",36:"SEP"},
productions_: [0,[3,2],[4,3],[4,1],[4,0],[6,1],[6,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[7,2],[17,3],[17,2],[17,2],[17,1],[25,2],[25,1],[27,1],[27,1],[27,1],[27,1],[26,1],[31,2],[31,1],[32,3],[32,3],[32,3],[32,3],[21,1],[35,3],[35,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1] 
break;
case 2: this.$ = new yy.ProgramNode($$[$0-2], $$[$0]) 
break;
case 3: this.$ = new yy.ProgramNode($$[$0]) 
break;
case 4: this.$ = new yy.ProgramNode([]) 
break;
case 5: this.$ = [$$[$0]] 
break;
case 6: $$[$0-1].push($$[$0]); this.$ = $$[$0-1] 
break;
case 7: this.$ = new yy.InverseNode($$[$0-2], $$[$0-1], $$[$0]) 
break;
case 8: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0]) 
break;
case 9: this.$ = $$[$0] 
break;
case 10: this.$ = $$[$0] 
break;
case 11: this.$ = new yy.ContentNode($$[$0]) 
break;
case 12: this.$ = new yy.CommentNode($$[$0]) 
break;
case 13: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]) 
break;
case 14: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]) 
break;
case 15: this.$ = $$[$0-1] 
break;
case 16: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]) 
break;
case 17: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], true) 
break;
case 18: this.$ = new yy.PartialNode($$[$0-1]) 
break;
case 19: this.$ = new yy.PartialNode($$[$0-2], $$[$0-1]) 
break;
case 20: 
break;
case 21: this.$ = [[$$[$0-2]].concat($$[$0-1]), $$[$0]] 
break;
case 22: this.$ = [[$$[$0-1]].concat($$[$0]), null] 
break;
case 23: this.$ = [[$$[$0-1]], $$[$0]] 
break;
case 24: this.$ = [[$$[$0]], null] 
break;
case 25: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 26: this.$ = [$$[$0]] 
break;
case 27: this.$ = $$[$0] 
break;
case 28: this.$ = new yy.StringNode($$[$0]) 
break;
case 29: this.$ = new yy.IntegerNode($$[$0]) 
break;
case 30: this.$ = new yy.BooleanNode($$[$0]) 
break;
case 31: this.$ = new yy.HashNode($$[$0]) 
break;
case 32: $$[$0-1].push($$[$0]); this.$ = $$[$0-1] 
break;
case 33: this.$ = [$$[$0]] 
break;
case 34: this.$ = [$$[$0-2], $$[$0]] 
break;
case 35: this.$ = [$$[$0-2], new yy.StringNode($$[$0])] 
break;
case 36: this.$ = [$$[$0-2], new yy.IntegerNode($$[$0])] 
break;
case 37: this.$ = [$$[$0-2], new yy.BooleanNode($$[$0])] 
break;
case 38: this.$ = new yy.IdNode($$[$0]) 
break;
case 39: $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 40: this.$ = [$$[$0]] 
break;
}
},
table: [{3:1,4:2,5:[2,4],6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],24:[1,15]},{1:[3]},{5:[1,16]},{5:[2,3],7:17,8:18,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,19],20:[2,3],22:[1,13],23:[1,14],24:[1,15]},{5:[2,5],14:[2,5],15:[2,5],16:[2,5],19:[2,5],20:[2,5],22:[2,5],23:[2,5],24:[2,5]},{4:20,6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],24:[1,15]},{4:21,6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],24:[1,15]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{17:22,21:23,33:[1,25],35:24},{17:26,21:23,33:[1,25],35:24},{17:27,21:23,33:[1,25],35:24},{17:28,21:23,33:[1,25],35:24},{21:29,33:[1,25],35:24},{1:[2,1]},{6:30,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],24:[1,15]},{5:[2,6],14:[2,6],15:[2,6],16:[2,6],19:[2,6],20:[2,6],22:[2,6],23:[2,6],24:[2,6]},{17:22,18:[1,31],21:23,33:[1,25],35:24},{10:32,20:[1,33]},{10:34,20:[1,33]},{18:[1,35]},{18:[2,24],21:40,25:36,26:37,27:38,28:[1,41],29:[1,42],30:[1,43],31:39,32:44,33:[1,45],35:24},{18:[2,38],28:[2,38],29:[2,38],30:[2,38],33:[2,38],36:[1,46]},{18:[2,40],28:[2,40],29:[2,40],30:[2,40],33:[2,40],36:[2,40]},{18:[1,47]},{18:[1,48]},{18:[1,49]},{18:[1,50],21:51,33:[1,25],35:24},{5:[2,2],8:18,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,2],22:[1,13],23:[1,14],24:[1,15]},{14:[2,20],15:[2,20],16:[2,20],19:[2,20],22:[2,20],23:[2,20],24:[2,20]},{5:[2,7],14:[2,7],15:[2,7],16:[2,7],19:[2,7],20:[2,7],22:[2,7],23:[2,7],24:[2,7]},{21:52,33:[1,25],35:24},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14]},{18:[2,22],21:40,26:53,27:54,28:[1,41],29:[1,42],30:[1,43],31:39,32:44,33:[1,45],35:24},{18:[2,23]},{18:[2,26],28:[2,26],29:[2,26],30:[2,26],33:[2,26]},{18:[2,31],32:55,33:[1,56]},{18:[2,27],28:[2,27],29:[2,27],30:[2,27],33:[2,27]},{18:[2,28],28:[2,28],29:[2,28],30:[2,28],33:[2,28]},{18:[2,29],28:[2,29],29:[2,29],30:[2,29],33:[2,29]},{18:[2,30],28:[2,30],29:[2,30],30:[2,30],33:[2,30]},{18:[2,33],33:[2,33]},{18:[2,40],28:[2,40],29:[2,40],30:[2,40],33:[2,40],34:[1,57],36:[2,40]},{33:[1,58]},{14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16]},{5:[2,17],14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18]},{18:[1,59]},{18:[1,60]},{18:[2,21]},{18:[2,25],28:[2,25],29:[2,25],30:[2,25],33:[2,25]},{18:[2,32],33:[2,32]},{34:[1,57]},{21:61,28:[1,62],29:[1,63],30:[1,64],33:[1,25],35:24},{18:[2,39],28:[2,39],29:[2,39],30:[2,39],33:[2,39],36:[2,39]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15]},{18:[2,34],33:[2,34]},{18:[2,35],33:[2,35]},{18:[2,36],33:[2,36]},{18:[2,37],33:[2,37]}],
defaultActions: {16:[2,1],37:[2,23],53:[2,21]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                var errStr = "";
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + this.terminals_[symbol] + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};/* Jison generated lexer */
var lexer = (function(){

var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            match = this._input.match(this.rules[rules[i]]);
            if (match) {
                lines = match[0].match(/\n.*/g);
                if (lines) this.yylineno += lines.length;
                this.yylloc = {first_line: this.yylloc.last_line,
                               last_line: this.yylineno+1,
                               first_column: this.yylloc.last_column,
                               last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                this._more = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, rules[i],this.conditionStack[this.conditionStack.length-1]);
                if (token) return token;
                else return;
            }
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:
                                   if(yy_.yytext.slice(-1) !== "\\") this.begin("mu");
                                   if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1), this.begin("emu");
                                   if(yy_.yytext) return 14;
                                 
break;
case 1: return 14; 
break;
case 2: this.popState(); return 14; 
break;
case 3: return 24; 
break;
case 4: return 16; 
break;
case 5: return 20; 
break;
case 6: return 19; 
break;
case 7: return 19; 
break;
case 8: return 23; 
break;
case 9: return 23; 
break;
case 10: yy_.yytext = yy_.yytext.substr(3,yy_.yyleng-5); this.popState(); return 15; 
break;
case 11: return 22; 
break;
case 12: return 34; 
break;
case 13: return 33; 
break;
case 14: return 33; 
break;
case 15: return 36; 
break;
case 16: /*ignore whitespace*/ 
break;
case 17: this.popState(); return 18; 
break;
case 18: this.popState(); return 18; 
break;
case 19: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\"/g,'"'); return 28; 
break;
case 20: return 30; 
break;
case 21: return 30; 
break;
case 22: return 29; 
break;
case 23: return 33; 
break;
case 24: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 33; 
break;
case 25: return 'INVALID'; 
break;
case 26: return 5; 
break;
}
};
lexer.rules = [/^[^\x00]*?(?=(\{\{))/,/^[^\x00]+/,/^[^\x00]{2,}?(?=(\{\{))/,/^\{\{>/,/^\{\{#/,/^\{\{\//,/^\{\{\^/,/^\{\{\s*else\b/,/^\{\{\{/,/^\{\{&/,/^\{\{![\s\S]*?\}\}/,/^\{\{/,/^=/,/^\.(?=[} ])/,/^\.\./,/^[\/.]/,/^\s+/,/^\}\}\}/,/^\}\}/,/^"(\\["]|[^"])*"/,/^true(?=[}\s])/,/^false(?=[}\s])/,/^[0-9]+(?=[}\s])/,/^[a-zA-Z0-9_$-]+(?=[=}\s\/.])/,/^\[[^\]]*\]/,/^./,/^$/];
lexer.conditions = {"mu":{"rules":[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"INITIAL":{"rules":[0,1,26],"inclusive":true}};return lexer;})()
parser.lexer = lexer;
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = handlebars;
exports.parse = function () { return handlebars.parse.apply(handlebars, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
};
;
// lib/handlebars/compiler/base.js
Handlebars.Parser = handlebars;

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  // override in the host environment
  log: function(level, str) {}
};

Handlebars.log = function(level, str) { Handlebars.logger.log(level, str); };
;
// lib/handlebars/compiler/ast.js
(function() {

  Handlebars.AST = {};

  Handlebars.AST.ProgramNode = function(statements, inverse) {
    this.type = "program";
    this.statements = statements;
    if(inverse) { this.inverse = new Handlebars.AST.ProgramNode(inverse); }
  };

  Handlebars.AST.MustacheNode = function(params, hash, unescaped) {
    this.type = "mustache";
    this.id = params[0];
    this.params = params.slice(1);
    this.hash = hash;
    this.escaped = !unescaped;
  };

  Handlebars.AST.PartialNode = function(id, context) {
    this.type    = "partial";

    // TODO: disallow complex IDs

    this.id      = id;
    this.context = context;
  };

  var verifyMatch = function(open, close) {
    if(open.original !== close.original) {
      throw new Handlebars.Exception(open.original + " doesn't match " + close.original);
    }
  };

  Handlebars.AST.BlockNode = function(mustache, program, close) {
    verifyMatch(mustache.id, close);
    this.type = "block";
    this.mustache = mustache;
    this.program  = program;
  };

  Handlebars.AST.InverseNode = function(mustache, program, close) {
    verifyMatch(mustache.id, close);
    this.type = "inverse";
    this.mustache = mustache;
    this.program  = program;
  };

  Handlebars.AST.ContentNode = function(string) {
    this.type = "content";
    this.string = string;
  };

  Handlebars.AST.HashNode = function(pairs) {
    this.type = "hash";
    this.pairs = pairs;
  };

  Handlebars.AST.IdNode = function(parts) {
    this.type = "ID";
    this.original = parts.join(".");

    var dig = [], depth = 0;

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i];

      if(part === "..") { depth++; }
      else if(part === "." || part === "this") { this.isScoped = true; }
      else { dig.push(part); }
    }

    this.parts    = dig;
    this.string   = dig.join('.');
    this.depth    = depth;
    this.isSimple = (dig.length === 1) && (depth === 0);
  };

  Handlebars.AST.StringNode = function(string) {
    this.type = "STRING";
    this.string = string;
  };

  Handlebars.AST.IntegerNode = function(integer) {
    this.type = "INTEGER";
    this.integer = integer;
  };

  Handlebars.AST.BooleanNode = function(bool) {
    this.type = "BOOLEAN";
    this.bool = bool;
  };

  Handlebars.AST.CommentNode = function(comment) {
    this.type = "comment";
    this.comment = comment;
  };

})();;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }

  this.message = tmp.message;
};
Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /&(?!\w+;)|[<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/compiler/compiler.js
Handlebars.Compiler = function() {};
Handlebars.JavaScriptCompiler = function() {};

(function(Compiler, JavaScriptCompiler) {
  Compiler.OPCODE_MAP = {
    appendContent: 1,
    getContext: 2,
    lookupWithHelpers: 3,
    lookup: 4,
    append: 5,
    invokeMustache: 6,
    appendEscaped: 7,
    pushString: 8,
    truthyOrFallback: 9,
    functionOrFallback: 10,
    invokeProgram: 11,
    invokePartial: 12,
    push: 13,
    assignToHash: 15,
    pushStringParam: 16
  };

  Compiler.MULTI_PARAM_OPCODES = {
    appendContent: 1,
    getContext: 1,
    lookupWithHelpers: 2,
    lookup: 1,
    invokeMustache: 3,
    pushString: 1,
    truthyOrFallback: 1,
    functionOrFallback: 1,
    invokeProgram: 3,
    invokePartial: 1,
    push: 1,
    assignToHash: 1,
    pushStringParam: 1
  };

  Compiler.DISASSEMBLE_MAP = {};

  for(var prop in Compiler.OPCODE_MAP) {
    var value = Compiler.OPCODE_MAP[prop];
    Compiler.DISASSEMBLE_MAP[value] = prop;
  }

  Compiler.multiParamSize = function(code) {
    return Compiler.MULTI_PARAM_OPCODES[Compiler.DISASSEMBLE_MAP[code]];
  };

  Compiler.prototype = {
    compiler: Compiler,

    disassemble: function() {
      var opcodes = this.opcodes, opcode, nextCode;
      var out = [], str, name, value;

      for(var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if(opcode === 'DECLARE') {
          name = opcodes[++i];
          value = opcodes[++i];
          out.push("DECLARE " + name + " = " + value);
        } else {
          str = Compiler.DISASSEMBLE_MAP[opcode];

          var extraParams = Compiler.multiParamSize(opcode);
          var codes = [];

          for(var j=0; j<extraParams; j++) {
            nextCode = opcodes[++i];

            if(typeof nextCode === "string") {
              nextCode = "\"" + nextCode.replace("\n", "\\n") + "\"";
            }

            codes.push(nextCode);
          }

          str = str + " " + codes.join(" ");

          out.push(str);
        }
      }

      return out.join("\n");
    },

    guid: 0,

    compile: function(program, options) {
      this.children = [];
      this.depths = {list: []};
      this.options = options;

      // These changes will propagate to the other compiler components
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }

      return this.program(program);
    },

    accept: function(node) {
      return this[node.type](node);
    },

    program: function(program) {
      var statements = program.statements, statement;
      this.opcodes = [];

      for(var i=0, l=statements.length; i<l; i++) {
        statement = statements[i];
        this[statement.type](statement);
      }
      this.isSimple = l === 1;

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++;

      this.usePartial = this.usePartial || result.usePartial;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache;
      var depth, child, inverse, inverseGuid;

      var params = this.setupStackForMustache(mustache);

      var programGuid = this.compileProgram(block.program);

      if(block.program.inverse) {
        inverseGuid = this.compileProgram(block.program.inverse);
        this.declare('inverse', inverseGuid);
      }

      this.opcode('invokeProgram', programGuid, params.length, !!mustache.hash);
      this.declare('inverse', null);
      this.opcode('append');
    },

    inverse: function(block) {
      var params = this.setupStackForMustache(block.mustache);

      var programGuid = this.compileProgram(block.program);

      this.declare('inverse', programGuid);

      this.opcode('invokeProgram', null, params.length, !!block.mustache.hash);
      this.declare('inverse', null);
      this.opcode('append');
    },

    hash: function(hash) {
      var pairs = hash.pairs, pair, val;

      this.opcode('push', '{}');

      for(var i=0, l=pairs.length; i<l; i++) {
        pair = pairs[i];
        val  = pair[1];

        this.accept(val);
        this.opcode('assignToHash', pair[0]);
      }
    },

    partial: function(partial) {
      var id = partial.id;
      this.usePartial = true;

      if(partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'depth0');
      }

      this.opcode('invokePartial', id.original);
      this.opcode('append');
    },

    content: function(content) {
      this.opcode('appendContent', content.string);
    },

    mustache: function(mustache) {
      var params = this.setupStackForMustache(mustache);

      this.opcode('invokeMustache', params.length, mustache.id.original, !!mustache.hash);

      if(mustache.escaped && !this.options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },

    ID: function(id) {
      this.addDepth(id.depth);

      this.opcode('getContext', id.depth);

      this.opcode('lookupWithHelpers', id.parts[0] || null, id.isScoped || false);

      for(var i=1, l=id.parts.length; i<l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    INTEGER: function(integer) {
      this.opcode('push', integer.integer);
    },

    BOOLEAN: function(bool) {
      this.opcode('push', bool.bool);
    },

    comment: function() {},

    // HELPERS
    pushParams: function(params) {
      var i = params.length, param;

      while(i--) {
        param = params[i];

        if(this.options.stringParams) {
          if(param.depth) {
            this.addDepth(param.depth);
          }

          this.opcode('getContext', param.depth || 0);
          this.opcode('pushStringParam', param.string);
        } else {
          this[param.type](param);
        }
      }
    },

    opcode: function(name, val1, val2, val3) {
      this.opcodes.push(Compiler.OPCODE_MAP[name]);
      if(val1 !== undefined) { this.opcodes.push(val1); }
      if(val2 !== undefined) { this.opcodes.push(val2); }
      if(val3 !== undefined) { this.opcodes.push(val3); }
    },

    declare: function(name, value) {
      this.opcodes.push('DECLARE');
      this.opcodes.push(name);
      this.opcodes.push(value);
    },

    addDepth: function(depth) {
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },

    setupStackForMustache: function(mustache) {
      var params = mustache.params;

      this.pushParams(params);

      if(mustache.hash) {
        this.hash(mustache.hash);
      }

      this.ID(mustache.id);

      return params;
    }
  };

  JavaScriptCompiler.prototype = {
    // PUBLIC API: You can override these methods in a subclass to provide
    // alternative compiled forms for name lookup and buffering semantics
    nameLookup: function(parent, name, type) {
			if (/^[0-9]+$/.test(name)) {
        return parent + "[" + name + "]";
      } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
	    	return parent + "." + name;
			}
			else {
				return parent + "['" + name + "']";
      }
    },

    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return "buffer += " + string + ";";
      }
    },

    initializeBuffer: function() {
      return this.quotedString("");
    },

    namespace: "Handlebars",
    // END PUBLIC API

    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options || {};

      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        aliases: { self: 'this' },
        registers: {list: []}
      };

      this.preamble();

      this.stackSlot = 0;
      this.stackVars = [];

      this.compileChildren(environment, options);

      var opcodes = environment.opcodes, opcode;

      this.i = 0;

      for(l=opcodes.length; this.i<l; this.i++) {
        opcode = this.nextOpcode(0);

        if(opcode[0] === 'DECLARE') {
          this.i = this.i + 2;
          this[opcode[1]] = opcode[2];
        } else {
          this.i = this.i + opcode[1].length;
          this[opcode[0]].apply(this, opcode[1]);
        }
      }

      return this.createFunctionContext(asObject);
    },

    nextOpcode: function(n) {
      var opcodes = this.environment.opcodes, opcode = opcodes[this.i + n], name, val;
      var extraParams, codes;

      if(opcode === 'DECLARE') {
        name = opcodes[this.i + 1];
        val  = opcodes[this.i + 2];
        return ['DECLARE', name, val];
      } else {
        name = Compiler.DISASSEMBLE_MAP[opcode];

        extraParams = Compiler.multiParamSize(opcode);
        codes = [];

        for(var j=0; j<extraParams; j++) {
          codes.push(opcodes[this.i + j + 1 + n]);
        }

        return [name, codes];
      }
    },

    eat: function(opcode) {
      this.i = this.i + opcode.length;
    },

    preamble: function() {
      var out = [];

      // this register will disambiguate helper lookup from finding a function in
      // a context. This is necessary for mustache compatibility, which requires
      // that context functions in blocks are evaluated by blockHelperMissing, and
      // then proceed as if the resulting value was provided to blockHelperMissing.
      this.useRegister('foundHelper');

      if (!this.isChild) {
        var namespace = this.namespace;
        var copies = "helpers = helpers || " + namespace + ".helpers;";
        if(this.environment.usePartial) { copies = copies + " partials = partials || " + namespace + ".partials;"; }
        out.push(copies);
      } else {
        out.push('');
      }

      if (!this.environment.isSimple) {
        out.push(", buffer = " + this.initializeBuffer());
      } else {
        out.push("");
      }

      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.source = out;
    },

    createFunctionContext: function(asObject) {
      var locals = this.stackVars;
      if (!this.isChild) {
        locals = locals.concat(this.context.registers.list);
      }

      if(locals.length > 0) {
        this.source[1] = this.source[1] + ", " + locals.join(", ");
      }

      // Generate minimizer alias mappings
      if (!this.isChild) {
        var aliases = []
        for (var alias in this.context.aliases) {
          this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
        }
      }

      if (this.source[1]) {
        this.source[1] = "var " + this.source[1].substring(2) + ";";
      }

      // Merge children
      if (!this.isChild) {
        this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
      }

      if (!this.environment.isSimple) {
        this.source.push("return buffer;");
      }

      var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

      for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }

      if (asObject) {
        params.push(this.source.join("\n  "));

        return Function.apply(this, params);
      } else {
        var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + this.source.join("\n  ") + '}';
        Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
        return functionSource;
      }
    },

    appendContent: function(content) {
      this.source.push(this.appendToBuffer(this.quotedString(content)));
    },

    append: function() {
      var local = this.popStack();
      this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
      if (this.environment.isSimple) {
        this.source.push("else { " + this.appendToBuffer("''") + " }");
      }
    },

    appendEscaped: function() {
      var opcode = this.nextOpcode(1), extra = "";
      this.context.aliases.escapeExpression = 'this.escapeExpression';

      if(opcode[0] === 'appendContent') {
        extra = " + " + this.quotedString(opcode[1][0]);
        this.eat(opcode);
      }

      this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")" + extra));
    },

    getContext: function(depth) {
      if(this.lastContext !== depth) {
        this.lastContext = depth;
      }
    },

    lookupWithHelpers: function(name, isScoped) {
      if(name) {
        var topStack = this.nextStack();

        this.usingKnownHelper = false;

        var toPush;
        if (!isScoped && this.options.knownHelpers[name]) {
          toPush = topStack + " = " + this.nameLookup('helpers', name, 'helper');
          this.usingKnownHelper = true;
        } else if (isScoped || this.options.knownHelpersOnly) {
          toPush = topStack + " = " + this.nameLookup('depth' + this.lastContext, name, 'context');
        } else {
          this.register('foundHelper', this.nameLookup('helpers', name, 'helper'));
          toPush = topStack + " = foundHelper || " + this.nameLookup('depth' + this.lastContext, name, 'context');
        }

        toPush += ';';
        this.source.push(toPush);
      } else {
        this.pushStack('depth' + this.lastContext);
      }
    },

    lookup: function(name) {
      var topStack = this.topStack();
      this.source.push(topStack + " = (" + topStack + " === null || " + topStack + " === undefined || " + topStack + " === false ? " +
 				topStack + " : " + this.nameLookup(topStack, name, 'context') + ");");
    },

    pushStringParam: function(string) {
      this.pushStack('depth' + this.lastContext);
      this.pushString(string);
    },

    pushString: function(string) {
      this.pushStack(this.quotedString(string));
    },

    push: function(name) {
      this.pushStack(name);
    },

    invokeMustache: function(paramSize, original, hasHash) {
      this.populateParams(paramSize, this.quotedString(original), "{}", null, hasHash, function(nextStack, helperMissingString, id) {
        if (!this.usingKnownHelper) {
          this.context.aliases.helperMissing = 'helpers.helperMissing';
          this.context.aliases.undef = 'void 0';
          this.source.push("else if(" + id + "=== undef) { " + nextStack + " = helperMissing.call(" + helperMissingString + "); }");
          if (nextStack !== id) {
            this.source.push("else { " + nextStack + " = " + id + "; }");
          }
        }
      });
    },

    invokeProgram: function(guid, paramSize, hasHash) {
      var inverse = this.programExpression(this.inverse);
      var mainProgram = this.programExpression(guid);

      this.populateParams(paramSize, null, mainProgram, inverse, hasHash, function(nextStack, helperMissingString, id) {
        if (!this.usingKnownHelper) {
          this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';
          this.source.push("else { " + nextStack + " = blockHelperMissing.call(" + helperMissingString + "); }");
        }
      });
    },

    populateParams: function(paramSize, helperId, program, inverse, hasHash, fn) {
      var needsRegister = hasHash || this.options.stringParams || inverse || this.options.data;
      var id = this.popStack(), nextStack;
      var params = [], param, stringParam, stringOptions;

      if (needsRegister) {
        this.register('tmp1', program);
        stringOptions = 'tmp1';
      } else {
        stringOptions = '{ hash: {} }';
      }

      if (needsRegister) {
        var hash = (hasHash ? this.popStack() : '{}');
        this.source.push('tmp1.hash = ' + hash + ';');
      }

      if(this.options.stringParams) {
        this.source.push('tmp1.contexts = [];');
      }

      for(var i=0; i<paramSize; i++) {
        param = this.popStack();
        params.push(param);

        if(this.options.stringParams) {
          this.source.push('tmp1.contexts.push(' + this.popStack() + ');');
        }
      }

      if(inverse) {
        this.source.push('tmp1.fn = tmp1;');
        this.source.push('tmp1.inverse = ' + inverse + ';');
      }

      if(this.options.data) {
        this.source.push('tmp1.data = data;');
      }

      params.push(stringOptions);

      this.populateCall(params, id, helperId || id, fn, program !== '{}');
    },

    populateCall: function(params, id, helperId, fn, program) {
      var paramString = ["depth0"].concat(params).join(", ");
      var helperMissingString = ["depth0"].concat(helperId).concat(params).join(", ");

      var nextStack = this.nextStack();

      if (this.usingKnownHelper) {
        this.source.push(nextStack + " = " + id + ".call(" + paramString + ");");
      } else {
        this.context.aliases.functionType = '"function"';
        var condition = program ? "foundHelper && " : ""
        this.source.push("if(" + condition + "typeof " + id + " === functionType) { " + nextStack + " = " + id + ".call(" + paramString + "); }");
      }
      fn.call(this, nextStack, helperMissingString, id);
      this.usingKnownHelper = false;
    },

    invokePartial: function(context) {
      params = [this.nameLookup('partials', context, 'partial'), "'" + context + "'", this.popStack(), "helpers", "partials"];

      if (this.options.data) {
        params.push("data");
      }

      this.pushStack("self.invokePartial(" + params.join(", ") + ");");
    },

    assignToHash: function(key) {
      var value = this.popStack();
      var hash = this.topStack();

      this.source.push(hash + "['" + key + "'] = " + value + ";");
    },

    // HELPERS

    compiler: JavaScriptCompiler,

    compileChildren: function(environment, options) {
      var children = environment.children, child, compiler;

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new this.compiler();

        this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
        var index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context);
      }
    },

    programExpression: function(guid) {
      if(guid == null) { return "self.noop"; }

      var child = this.environment.children[guid],
          depths = child.depths.list;
      var programParams = [child.index, child.name, "data"];

      for(var i=0, l = depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("depth0"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      if(depths.length === 0) {
        return "self.program(" + programParams.join(", ") + ")";
      } else {
        programParams.shift();
        return "self.programWithDepth(" + programParams.join(", ") + ")";
      }
    },

    register: function(name, val) {
      this.useRegister(name);
      this.source.push(name + " = " + val + ";");
    },

    useRegister: function(name) {
      if(!this.context.registers[name]) {
        this.context.registers[name] = true;
        this.context.registers.list.push(name);
      }
    },

    pushStack: function(item) {
      this.source.push(this.nextStack() + " = " + item + ";");
      return "stack" + this.stackSlot;
    },

    nextStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return "stack" + this.stackSlot;
    },

    popStack: function() {
      return "stack" + this.stackSlot--;
    },

    topStack: function() {
      return "stack" + this.stackSlot;
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r') + '"';
    }
  };

  var reservedWords = (
    "break else new var" +
    " case finally return void" +
    " catch for switch while" +
    " continue function this with" +
    " default if throw" +
    " delete in try" +
    " do instanceof typeof" +
    " abstract enum int short" +
    " boolean export interface static" +
    " byte extends long super" +
    " char final native synchronized" +
    " class float package throws" +
    " const goto private transient" +
    " debugger implements protected volatile" +
    " double import public let yield"
  ).split(" ");

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

	JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
		if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
			return true;
		}
		return false;
	}

})(Handlebars.Compiler, Handlebars.JavaScriptCompiler);

Handlebars.precompile = function(string, options) {
  options = options || {};

  var ast = Handlebars.parse(string);
  var environment = new Handlebars.Compiler().compile(ast, options);
  return new Handlebars.JavaScriptCompiler().compile(environment, options);
};

Handlebars.compile = function(string, options) {
  options = options || {};

  var compiled;
  function compile() {
    var ast = Handlebars.parse(string);
    var environment = new Handlebars.Compiler().compile(ast, options);
    var templateSpec = new Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);
    return Handlebars.template(templateSpec);
  }

  // Template is only compiled on first use and cached after that point.
  return function(context, options) {
    if (!compiled) {
      compiled = compile();
    }
    return compiled.call(this, context, options);
  };
};
;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;


return Handlebars;
});


define("#overlay/0.9.1/mask-debug", ["#zepto/0.9.0/zepto-debug", "#overlay/0.9.1/overlay-debug", "#position/0.9.0/position-debug", "#android-shim/0.9.0/android-shim-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug"], function(require, exports, module) {

    var $ = require("#zepto/0.9.0/zepto-debug"),
        Overlay = require("#overlay/0.9.1/overlay-debug");


    // Mask
    // ----------
    // 全屏遮罩层组件

    var Mask = Overlay.extend({

        attrs: {
            width: '100%',
            height: '100%',

            className: 'ui-mask',
            style: {
                backgroundColor: 'rgba(0,0,0,.2)',
                position: 'absolute'
            },

            align: {
                // undefined 表示相对于当前可视范围定位
                baseElement: null
            }
        },

        show: function() {
            return Mask.superclass.show.call(this);
        },

        _onRenderBackgroundColor: function(val) {
            this.element.css('backgroundColor', val);
        }
    });

    // 单例
    module.exports = Mask;

});


define("#overlay/0.9.1/overlay-debug", ["#zepto/0.9.0/zepto-debug", "#position/0.9.0/position-debug", "#android-shim/0.9.0/android-shim-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug"], function(require, exports, module) {

    var $ = require("#zepto/0.9.0/zepto-debug"),
        Position = require("#position/0.9.0/position-debug"),
        Shim = require("#android-shim/0.9.0/android-shim-debug"),
        Widget = require("#widget/0.9.16/widget-mobile-debug");

    // Overlay
    // -------
    // Overlay 组件的核心特点是可定位（Positionable）和可层叠（Stackable），是一切悬浮类
    // UI 组件的基类。

    var Overlay = Widget.extend({

        attrs: {
            // 基本属性
            width: '',
            height: '',
            zIndex: 99,
            visible: false,

            // 定位配置
            align: {
                // element 的定位点，默认为左上角
                selfXY: [0, 0],
                // 基准定位元素，默认为当前可视区域
                baseElement: Position.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [0, 0]
            },

            // 父元素
            parentNode: document.body
        },

        render: function() {
            // 让用户传入的 config 生效并插入到文档流中
            Overlay.superclass.render.call(this);

            // 在插入到文档流后，重新定位一次
            this._setPosition();

            return this;
        },

        delegateEvents: function() {
            Overlay.superclass.delegateEvents.call(this);

            var triggers = this.element.find('*[data-overlay-role="trigger"]'),
                that = this;

            Array.prototype.slice.call(triggers);

            triggers.forEach(function(trigger) {
                var t = trigger;
                if (t && (action = $(t).attr('data-overlay-action'))) {
                    switch (action) {
                        case 'hide':
                            $(t).unbind('click.overlay')
                                .bind('click.overlay', $.proxy(function(e) {
                                e.preventDefault();
                                this.hide();
                            },that));
                            break;
                        /*case 'show':
                         $(trigger)
                         .unbind('click.overlay')
                         .bind('click.overlay', $.proxy(function(e) {
                         e.preventDefault();
                         this.show();
                         },that));
                         break;*/
                        case 'destroy':
                            $(t).unbind('click.overlay')
                                .bind('click.overlay', $.proxy(function(e) {
                                e.preventDefault();
                                this.destroy();
                            },that));
                            break;
                    }
                }
            });

            return this;
        },

        destroy: function() {
            this.element.remove();
            Overlay.superclass.destroy.call(this);
        },

        show: function() {
            // 若从未渲染，则调用 render
            if (!this.rendered) {
                this.render();
            }

            this.set('visible', true);
            return this;
        },

        hide: function() {
            this.set('visible', false);
            return this;
        },

        setup: function() {
            // 加载 iframe 遮罩层并与 overlay 保持同步
            this._setupShim();
        },

        // 进行定位
        _setPosition: function(align) {
            // 不在文档流中，定位无效
            if (!isInDocument(this.element[0])) return;

            align || (align = this.get('align'));
            var isHidden = this.element.css('display') === 'none';

            // 在定位时，为避免元素高度不定，先显示出来
            if (isHidden) {
                this.element.css({ visibility: 'hidden', display: 'block' });
            }

            Position.pin({
                element: this.element,
                x: align.selfXY[0],
                y: align.selfXY[1]
            }, {
                element: align.baseElement,
                x: align.baseXY[0],
                y: align.baseXY[1]
            });

            // 定位完成后，还原
            if (isHidden) {
                this.element.css({ visibility: '', display: 'none' });
            }

            return this;
        },

        // 加载 iframe 遮罩层并与 overlay 保持同步
        _setupShim: function() {
            var shim = new Shim(this.element);
            this.after('show hide', shim.sync, shim);
            this.before('destroy',shim.destroy,shim);

            // 除了 parentNode 之外的其他属性发生变化时，都触发 shim 同步
            var attrs = Overlay.prototype.attrs;
            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    if (attr === 'parentNode') continue;
                    this.on('change:' + attr, shim.sync, shim);
                }
            }
        },


        // 用于 set 属性后的界面更新

        _onRenderWidth: function(val) {
            this.element.css('width', val);
        },

        _onRenderHeight: function(val) {
            this.element.css('height', val);
        },

        _onRenderZIndex: function(val) {
            this.element.css('zIndex', val);
        },

        _onRenderAlign: function(val) {
            this._setPosition(val);
        },

        _onRenderVisible: function(val) {
            this.element[val ? 'show' : 'hide']();
        }

    });

    module.exports = Overlay;


    // Helpers
    // -------
    function contains(a, b){
        return a.contains ?
            a != b && a.contains(b) :
            !!(a.compareDocumentPosition(b) & 16);
    }
    function isInDocument(element) {
        return contains(document.documentElement, element);
    }

});


define("#validator/0.8.4/core-debug", ["#zepto/0.9.0/zepto-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug", "#validator/0.8.4/async-debug", "#validator/0.8.4/utils-debug", "#validator/0.8.4/rule-debug", "#validator/0.8.4/item-debug"], function(require, exports, module) {

    var $ = require("#zepto/0.9.0/zepto-debug"),
        async = require("#validator/0.8.4/async-debug"),
        Widget = require("#widget/0.9.16/widget-mobile-debug"),
        utils = require("#validator/0.8.4/utils-debug"),
        Item = require("#validator/0.8.4/item-debug");

    var validators = [];

    var setterConfig = {
        value: function() {},
        setter: function(val) {
            return typeof val != 'function' ? utils.helper(val) : val;
        }
    };

    var Core = Widget.extend({

        attrs: {
            triggerType: 'blur',
            checkOnSubmit: true,    //是否在表单提交前进行校验，默认进行校验。
            stopOnError: false,     //校验整个表单时，遇到错误时是否停止校验其他表单项。
            autoSubmit: true,       //When all validation passed, submit the form automatically.
            checkNull: true,         //除提交前的校验外，input的值为空时是否校验。
            onItemValidate: setterConfig,
            onItemValidated: setterConfig,
            onFormValidate: setterConfig,
            onFormValidated: setterConfig,
            showMessage: setterConfig, // specify how to display error messages
            hideMessage: setterConfig // specify how to hide error messages
        },

        setup: function() {

            //disable html5 form validation
            this.element.attr('novalidate', 'novalidate');

            //Validation will be executed according to configurations stored in items.
            this.items = [];

            var that = this;

            //If checkOnSubmit is true, then bind submit event to execute validation.
            if(this.get('checkOnSubmit')) {
                this.element.submit(function(e) {
                    e.preventDefault();
                    that.execute(function(err) {
                        if (!err) {
                            that.get('autoSubmit') && that.element.get(0).submit();
                        }
                    });
                });
            }

            this.on('formValidate', function() {
                var that = this;
                $.each(this.items, function(i, item) {
                    that.query(item.element).get('hideMessage').call(that, null, item.element);
                });
            });

            this.on('itemValidated', function(err, message, element) {
                if (err)
                    this.query(element).get('showMessage').call(this, message, element);
                else
                    this.query(element).get('hideMessage').call(this, message, element);
            });

            validators.push(this);
        },

        Statics: $.extend({helper: utils.helper}, require("#validator/0.8.4/rule-debug"), {
            autoRender: function(cfg) {

                var validator = new this(cfg);

                $('input, textarea, select', validator.element).each(function(i, input) {

                    input = $(input);
                    var type = input.attr('type');

                    if (type == 'button' || type == 'submit' || type == 'reset') {
                        return true;
                    }

                    var options = {};

                    if (type == 'radio' || type == 'checkbox') {
                        options.element = $('[type=' + type + '][name=' + input.attr('name') + ']', validator.element);
                    } else {
                        options.element = input;
                    }


                    if (!validator.query(options.element)) {

                        var obj = utils.parseDom(input);

			if (!obj.rule) return true;

                        $.extend(options, obj);

                        validator.addItem(options);
                    }
                });
            },

            query: function(selector) {
                var target = $(selector);
                var result = null;

                $.each(validators, function(i, validator) {
                    if (target.get(0) == validator.element.get(0)) {
                        result = validator;
                        return false;
                    } else {
                        var item = validator.query(target);
                        if (item) {
                            result = item;
                            return false;
                        }
                    }
                });

                return result;
            },

            validate: function(options) {
                var element = $(options.element);
                var validator = new Core({
                    element: element.parents('form')
                });

                validator.addItem(options);
                validator.query(element).execute();
                validator.destroy();
            }
        }),


        addItem: function(cfg) {

            var item = new Item($.extend({
                triggerType: this.get('triggerType'),
                checkNull: this.get('checkNull'),
                showMessage: this.get('showMessage'),
                hideMessage: this.get('hideMessage')
            }, cfg));

            this.items.push(item);

            item.set('_handler', function() {
                if (!item.get('checkNull') && !item.element.val()) return;
                item.execute();
            });
            this.element.on(item.get('triggerType'), '[' + DATA_ATTR_NAME + '=' + stampItem(item) + ']', item.get('_handler'));

            item.on('all', function(eventName) {
                this.trigger.apply(this, [].slice.call(arguments));
            }, this);

            return this;
        },

        removeItem: function(selector) {
            var target = selector instanceof Item ? selector.element : $(selector),
                items = this.items,
                that = this;

            var j;
            $.each(this.items, function(i, item) {
                if (target.get(0) == item.element.get(0)) {
                    j = i;
                    that.element.off(item.get('triggerType'), '[' + DATA_ATTR_NAME + '=' + stampItem(item) + ']', item.get('_handler'));
                    item.destroy();
                    return false;
                }
            });
            j !== undefined && this.items.splice(j, 1);

            return this;
        },

        execute: function(callback) {
            var that = this;

            this.trigger('formValidate', this.element);

            var complete = function(err) {
                that.trigger('formValidated', that.element, Boolean(err));
                callback && callback(Boolean(err));
            };

            if (this.get('stopOnError')) {
                var tasks = {};
                $.each(this.items, function(i, item) {
                    tasks[i] = function(cb) {
                        item.execute(cb);
                    };
                });
                async.series(tasks, complete);
            } else {
                async.forEach(this.items, function(item, cb) {
                    item.execute(cb);
                }, complete);
            }

            return this;
        },

        destroy: function() {
            this.element.unbind('submit');
            var that = this;
            $.each(this.items, function(i, item) {
                that.removeItem(item);
            });
            var j;
            $.each(validators, function(i, validator) {
                if (validator == this) {
                    j = i;
                    return false;
                }
            });
            validators.splice(j, 1);

            Core.superclass.destroy.call(this);
        },

        query: function(selector) {
            var target = $(selector);
            if (target.length == 0 || $(target, this.element).length == 0) {
                return null;
            } else {
                var result = null;
                $.each(this.items, function(i, item) {
                    if (target.get(0) == item.element.get(0)) {
                        result = item;
                        return false;
                    }
                });
                return result;
            }
        }
    });

    var DATA_ATTR_NAME = 'data-validator-set';
    function stampItem(item) {
        var set = item.element.attr(DATA_ATTR_NAME);
        if (!set) {
            set = item.cid;
            item.element.attr(DATA_ATTR_NAME, set);
        }
        return set;
    }

    module.exports = Core;
});


// Thanks to Caolan McMahon. These codes blow come from his project Async(https://github.com/caolan/async).
define("#validator/0.8.4/async-debug", [], function(require, exports, module) {

    var async = {};

    module.exports = async;

    //// cross-browser compatiblity functions ////

    var _forEach = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        async.nextTick = function (fn) {
            setTimeout(fn, 0);
        };
    }
    else {
        async.nextTick = process.nextTick;
    }

    async.forEach = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _forEach(arr, function (x) {
            iterator(x, function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                }
            });
        });
    };

    async.forEachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };

    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEach].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

});


define("#validator/0.8.4/utils-debug", ["#zepto/0.9.0/zepto-debug", "#validator/0.8.4/rule-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug", "#validator/0.8.4/async-debug"], function(require, exports, module) {
    var $ = require("#zepto/0.9.0/zepto-debug"),
        Rule = require("#validator/0.8.4/rule-debug");

    var u_count = 0;
    function unique() {
        return '__anonymous__' + (u_count++);
    }

    function parseRule(str) {
        //eg. valueBetween{min: 1, max: 2}
        var match = str.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);

        return {
            name: match[1],
            param: parseJSON(match[2])
        };
    };

    // convent string such as {a: 1, b: 2}, {"a":1, b: '2'} to object
    function parseJSON(str) {
        if (!str)
            return null;

        var NOTICE = 'Invalid option object "' + str + '".';

        // remove braces
        str = str.slice(1, -1);

        var result = {};

        var arr = str.split(',');
        $.each(arr, function(i, v) {
            arr[i] = $.trim(v);
            if (!arr[i])
                throw new Error(NOTICE);

            var arr2 = arr[i].split(':');

            var key = $.trim(arr2[0]),
                value = $.trim(arr2[1]);

            if (!key || !value)
                throw new Error(NOTICE);

            result[getValue(key)] = $.trim(getValue(value));
        });

        // 'abc' -> 'abc'  '"abc"' -> 'abc'
        function getValue(str) {
            if (str[0] == '"' && str[str.length - 1] == '"' || str[0] == "'" && str[str.length - 1] == "'") {
                return eval(str);
            }
            return str;
        }

        return result;
    }

    function parseRules(str) {
        if (!str) return null;

        return str.match(/[a-zA-Z0-9\-\_]+(\{.*\})?/g);
    };

    function parseDom(field) {
        var field = $(field);

        var result = {};
        var arr = [];

        //parse required attribute
        var required = field.attr('required');
        if (required) {
            arr.push('required');
            result.required = true;
        }

        //parse type attribute
        var type = field.attr('type');
        if (type && type != 'submit' && type != 'cancel' && type != 'checkbox' && type != 'radio' && type != 'select' && type != 'select-one' && type != 'file' && type != 'hidden') {

            if (!Rule.getRule(type)) {
                throw new Error('Form field with type "' + type + '" not supported!');
            }

            arr.push(type);
        }

        //parse min attribute
        var min = field.attr('min');
        if (min) {
            arr.push('min{"min":"' + min + '"}');
        }

        //parse max attribute
        var max = field.attr('max');
        if (max) {
            arr.push('max{max:' + max + '}');
        }

        //parse minlength attribute
        var minlength = field.attr('minlength');
        if (minlength) {
            arr.push('minlength{min:' + minlength + '}');
        }

        //parse maxlength attribute
        var maxlength = field.attr('maxlength');
        if (maxlength) {
            arr.push('maxlength{max:' + maxlength + '}');
        }

        //parse pattern attribute
        var pattern = field.attr('pattern');
        if (pattern) {
            var regexp = new RegExp(pattern),
                name = unique();
            Rule.addRule(name, regexp);
            arr.push(name);
        }

        //parse data-rule attribute to get custom rules
        var rules = field.attr('data-rule');
        rules = rules && parseRules(rules);
        if (rules)
            arr = arr.concat(rules);

        result.rule = arr.length == 0 ? null : arr.join(' ');

        return result;
    };

    var helpers = {};
    function helper(name, fn) {
        if (fn) {
            helpers[name] = fn;
            return this;
        }

        return helpers[name];
    }

    module.exports = {
        parseRule: parseRule,
        parseRules: parseRules,
        parseDom: parseDom,
        helper: helper
    };

});


define("#validator/0.8.4/rule-debug", ["#zepto/0.9.0/zepto-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug", "#validator/0.8.4/async-debug"], function(require, exports, module) {
    var rules = {},
        messages = {},
		$ = require("#zepto/0.9.0/zepto-debug"),
        async = require("#validator/0.8.4/async-debug"),
        Widget = require("#widget/0.9.16/widget-mobile-debug");

    var Rule = Widget.extend({

        initialize: function(name, operator) {
            this.name = name;

                if (operator instanceof RegExp) {
                    this.operator =  function(opts, commit) {
                        var result = operator.test($(opts.element).val());
                        commit(result ? null : opts.rule, _getMsg(opts, result));
                    };
                } else if (typeof operator == 'function') {
                    this.operator = function(opts, commit) {
                        var result = operator(opts, commit);
                        if (result !== undefined)
                            commit(result ? null : opts.rule, _getMsg(opts, result));
                    };
                } else
                    throw new Error('The second argument must be a regexp or a function.');
        },

        and: function(name, options) {
            if (name instanceof Rule) {
                var target = name;
            } else {
                var target = getRule(name, options);
            }

            if (!target) {
                throw new Error('No rule with name "' + name + '" found.');
            }

            var that = this;
            var operator = function(opts, commit) {
                that.operator(opts, function(err, msg) {
                    if (err) {
                        commit(err, _getMsg(opts, !err));
                    } else {
                        target.operator(opts, commit);
                    }
                });
            }

            return new Rule(null, operator);
        },

        or: function(name, options) {
            if (name instanceof Rule) {
                var target = name;
            } else {
                var target = getRule(name, options);
            }

            if (!target) {
                throw new Error('No rule with name "' + name + '" found.');
            }

            var that = this;
            var operator = function(opts, commit) {
                that.operator(opts, function(err, msg) {
                    if (err) {
                        target.operator(opts, commit);
                    } else {
                        commit(null, _getMsg(opts, true));
                    }
                });
            }

            return new Rule(null, operator);
        },

        not: function(options) {
            var target = getRule(this.name, options);
            var operator = function(opts, commit) {
                target.operator(opts, function(err, msg) {
                    if (err) {
                        commit(null, _getMsg(opts, true));
                    } else {
                        commit(true, _getMsg(opts, false))
                    }
                });
            };

            return new Rule(null, operator);
        }
    });

    function addRule(name, operator, message) {
        if (rules[name]) {
            throw new Error('The rule with the same name has existed and overriding a rule is not allowed!');
        }

        if (operator instanceof Rule) {
            rules[name] = new Rule(name, operator.operator);
        } else {
            rules[name] = new Rule(name, operator);
        }
        setMessage(name, message);
    }

    function _getMsg(opts, b) {
        var ruleName = opts.rule;

        var msgtpl;
        if (opts.message) { // user specifies a message
            if ($.isPlainObject(opts.message)) {
                msgtpl = opts.message[b ? 'success' : 'failure'];
            } else {//just string
                msgtpl = b ? '' : opts.message
            }
        } else { // use default
            msgtpl = messages[ruleName][b ? 'success' : 'failure'];
        }

        return msgtpl ? compileTpl(opts, msgtpl) : msgtpl;
    }

    function setMessage(name, msg) {
        if ($.isPlainObject(msg)) {
            messages[name] = msg;
        } else {
            messages[name] = {
                failure: msg
            };
        }
    }

    function getOperator(name) {
        return rules[name].operator;
    }

    function getRule(name, opts) {
        if (opts) {
            var rule = rules[name];
            return new Rule(null, function(options, commit) {
                rule.operator($.extend(null, options, opts), commit);
            });
        } else {
            return rules[name];
        }
    }

    function compileTpl(obj, tpl) {
        var result = tpl;

        var regexp1 = /\{\{[^\{\}]*\}\}/g,
            regexp2 = /\{\{(.*)\}\}/;

        var arr = tpl.match(regexp1);
        arr && $.each(arr, function(i, v) {
            var key = v.match(regexp2)[1];
            var value = obj[$.trim(key)];
            result = result.replace(v, value);
        });
        return result;
    }

    addRule('required', function(options) {
        var element = $(options.element);

        var t = element.attr('type');
        switch (t) {
            case 'checkbox':
            case 'radio':
                var checked = false;
                element.each(function(i, item) {
                    if ($(item).prop('checked')) {
                        checked = true;
                        return false;
                    }
                });
                return checked;
            default:
                return Boolean(element.val());
        }
    }, '{{display}}不能为空。');

    addRule('email', /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, '{{display}}的格式不正确。');

    addRule('text', /.*/);

    addRule('password', /.*/);

    addRule('radio', /.*/);

    addRule('checkbox', /.*/);

    addRule('url', /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, '{{display}}的格式不正确。');

    addRule('number', /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/, '{{display}}的格式不正确。');

    addRule('date', /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/, '{{display}}的格式不正确。');

    addRule('min', function(options) {
        var element = options.element,
            min = options.min;
        return Number(element.val()) >= Number(min);
    }, '{{display}}必须大于或者等于{{min}}。');

    addRule('max', function(options) {
        var element = options.element,
            max = options.max;
        return Number(element.val()) <= Number(max);
    }, '{{display}}必须小于或者等于{{max}}。');

    addRule('minlength', function(options) {
        var element = options.element;
        var l = element.val().length;
        return l >= Number(options.min);
    }, '{{display}}的长度必须大于或等于{{min}}。');

    addRule('maxlength', function(options) {
        var element = options.element;
        var l = element.val().length;
        return l <= Number(options.max);
    }, '{{display}}长度必须小于或等于{{max}}。');

    addRule('mobile', /^1\d{10}$/, '请输入正确的{{display}}。');

    addRule('confirmation', function(options) {
        var element = options.element,
            target = $(options.target);
        return element.val() == target.val();
    }, '{{display}}的内容和{{name}}不同。');

    module.exports = {
        addRule: addRule,
        setMessage: setMessage,
        getRule: getRule,
        getOperator: getOperator
    };

});


define("#validator/0.8.4/item-debug", ["#zepto/0.9.0/zepto-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#events/0.9.1/events-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug", "#validator/0.8.4/utils-debug", "#validator/0.8.4/rule-debug", "#validator/0.8.4/async-debug"], function(require, exports, module) {
    var $ = require("#zepto/0.9.0/zepto-debug"),
        utils = require("#validator/0.8.4/utils-debug"),
        Widget = require("#widget/0.9.16/widget-mobile-debug"),
        async = require("#validator/0.8.4/async-debug"),
        Rule = require("#validator/0.8.4/rule-debug");

    var setterConfig = {
        value: function() {},
        setter: function(val) {
            return typeof val != 'function' ? utils.helper(val) : val;
        }
    };
    var Item = Widget.extend({
        attrs: {
            rule: '',
            display: null,
            triggerType: {
                setter: function(val) {
                    var element = $(this.get('element')),
                        type = element.attr('type');
                    
                    var b = element.get(0).tagName.toLowerCase().indexOf('select') > -1 || type == 'radio' || type == 'checkbox';
                    if (b && (val.indexOf('blur') > -1 || val.indexOf('key') > -1))
                        return 'change';
                    return val;
                }
            },
            required: false,
            checkNull: true,
            errormessage: null,
            onItemValidate: setterConfig,
            onItemValidated: setterConfig,
            showMessage: setterConfig,
            hideMessage: setterConfig
        },

        setup: function() {
            if (this.get('required')) {
                if (!this.get('rule') || this.get('rule').indexOf('required') < 0) {
                    this.set('rule', 'required ' + this.get('rule'));
                }
            }
        },

        execute: function(callback) {

            this.trigger('itemValidate', this.element);

            var rules = utils.parseRules(this.get('rule')),
                that = this;

            if (!rules) {
                callback && callback(null, '', this.element);
                return this;
            }

            _metaValidate(this.element, this.get('required'), rules, this.get('display'), function(err, msg) {
                if (err) {
                    var message = that.get('errormessage') || that.get('errormessage' + upperFirstLetter(err)) || msg;
                } else {
                    var message = msg;
                }
                that.trigger('itemValidated', err, message, that.element);
                callback && callback(err, message, that.element);
            });

            return this;
        }
    });

    function upperFirstLetter(str) {
        str = String(str);
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function _metaValidate(ele, required, rules, display, callback) {

        if (!required) {
            var truly = false;
            var t = ele.attr('type');
            switch (t) {
                case 'checkbox':
                case 'radio':
                    var checked = false;
                    ele.each(function(i, item) {
                        if ($(item).prop('checked')) {
                            checked = true;
                            return false;
                        }
                    });
                    truly = checked;
                    break;
                default:
                    truly = Boolean(ele.val());
            }

            if (!truly) {
                callback && callback(null, null);
                return;
            }
        }

        if (!$.isArray(rules))
            throw new Error('No validation rule specified or not specified as an array.');
        
        var tasks = [];

        $.each(rules, function(i, item) {

            var obj = utils.parseRule(item),
                ruleName = obj.name,
                param = obj.param;

            var rule = Rule.getOperator(ruleName);
            if (!rule)
                throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');

            var options = $.extend({}, param, {
                element: ele,
                display: (param && param.display) || display || $(ele).attr('name'),
                rule: ruleName
            });

            tasks.push(function(cb) {
                rule(options, cb);
            });
        });

        async.series(tasks, function(err, results) {
            callback && callback(err, results[results.length - 1]);
        });
    }

    module.exports = Item;
});


//业务处理
define("#temp/0.9.5/donation-debug", ["pageTransition/0.9.3/pageTransition-debug", "#events/0.9.1/events-debug", "#zepto/0.9.0/zepto-debug", "overlay/0.9.1/overlay-debug", "#position/0.9.0/position-debug", "#android-shim/0.9.0/android-shim-debug", "#widget/0.9.16/widget-mobile-debug", "#base/0.9.16/base-debug", "#class/0.9.2/class-debug", "#base/0.9.16/aspect-debug", "#base/0.9.16/attribute-debug", "#widget/0.9.16/daparser-mobile-debug", "#widget/0.9.16/auto-render-mobile-debug", "zepto/0.9.0/zepto-debug", "handlebars/1.0.0/handlebars-debug", "overlay/0.9.1/mask-debug", "#overlay/0.9.1/overlay-debug", "validator/0.8.4/core-debug", "#validator/0.8.4/async-debug", "#validator/0.8.4/utils-debug", "#validator/0.8.4/rule-debug", "#validator/0.8.4/item-debug"], function(require, exports, module) {
    var $ = require('#zepto/0.9.0/zepto-debug');
    var Handlebars = require('#handlebars/1.0.0/handlebars-debug');
    var PageTransition = require('#pageTransition/0.9.3/pageTransition-debug');
    var Validator = require('#validator/0.8.4/core-debug');
    var Overlay = require('#overlay/0.9.1/overlay-debug');
    var Mask = require('#overlay/0.9.1/mask-debug');
    /*
     *** 函数区
     */
    var renderLoading = function () {
        //配置loading
        var loading_tpl = $('#loading-tpl');
        if (loading_tpl.length) {
            var source = loading_tpl.html();
            var tpl = Handlebars.compile(source);
            $(document.body).prepend(tpl());
            loading_overlay = new Overlay({
                element: '#J-loading',
                align: {
                    selfXY: ['50%', '50%'],
                    baseXY: ['50%', '50%']
                }
            });
            loading_mask = new Mask();
            //配置到api接口上
            hybridapi.loading.set({
                show: function () {
                    refreshMask();
                    loading_mask.show();
                    loading_overlay.show();
                },
                hide: function () {
                    loading_mask.hide();
                    loading_overlay.hide();
                }
            });
        }
    },
        orientationEvent = function () {
            //页面旋转及缩放时的处理
            PT.sync();
            refreshMask();
        },
        refreshMask = function () {
            //重新渲染mask和loading
            loading_mask && loading_mask.set('style', {
                'width': $(document).width() + 'px',
                'height': $(document).height() + 'px'
            });
            //因为overlay的set方法有延迟，固放到延时函数中
            setTimeout(function () {
                loading_overlay && loading_overlay.set('align', loading_overlay.get('align'));
            }, 10);
        },
        renderMain = function () {
            //渲染主体
            var source, tpl;
            source = $('#page-box-tpl').html();
            tpl = Handlebars.compile(source);
            $('#main').prepend(tpl());
            source = $('#donationList-tpl').html();
            tpl = Handlebars.compile(source);
            $('#J-page-1').html(tpl());
        },
        renderDonationList = function () {
            //渲染列表
            var donationDataList = $('#J-donationDataList');
            var _success = function (body) {
                var serviceData = body.serviceData;
                if (serviceData.dataCount > 0) {
                    pagebar.dataCount = parseInt(serviceData.dataCount);
                    //更新分页数据
                    pagebar.refresh();
                    //
                    var html = '';
                    for (var i = 0; i < serviceData.dataList.length; i++) {
                        var source = $('#donationListItem-tpl').html(),
                            tpl = Handlebars.compile(source);
                        html += tpl({
                            data: serviceData.dataList[i],
                            datavalue: JSON.stringify(serviceData.dataList[i])
                        });
                    }
                    //第一页替换原有内容，后面的页追加
                    if (pagebar.pageNum == 1) {
                        donationDataList.html('');
                    }
                    donationDataList.append(html);
                    //客户端中隐藏更多内的回顶部
                    var moreTrigger = $('#J-moreTrigger');
                    if (hybridConfig.isAlipayClient) {
                        $('[data-action=more]', moreTrigger).css({
                            'border-right': '0',
                            'width': '100%'
                        });
                        //客户端去掉回顶部功能
                        $('[data-action=top]', moreTrigger).hide();
                    }
                    //显示更多
                    if (pagebar.pageCount > 1 && pagebar.pageNum < pagebar.pageCount) {
                        moreTrigger.removeClass('hide').addClass('btn-more');
                    } else {
                        //大于等于最大页数
                        if (hybridConfig.isAlipayClient) {
                            //客户端，隐藏更多
                            moreTrigger.removeClass('btn-more').addClass('hide');
                        } else {
                            //浏览器，隐藏更多，只显示回顶部
                            $('[data-action=top]', moreTrigger).css({
                                'border-right': '0',
                                'width': '100%'
                            });
                            //客户端去掉回顶部功能
                            $('[data-action=more]', moreTrigger).hide();
                        }
                    }
                    //第一页隐藏地址栏
                    if (pagebar.pageNum == 1) {
                        hybridapi.gotoTop();
                    }
                } else {
                    var source = $('#noDonationItem-tpl').html(),
                        tpl = Handlebars.compile(source);
                    donationDataList.html(tpl());
                }
            },
                _error = function (xhr, type) {},
                options = hybridapi.initAjaxOptions({
                    type: 'POST',
                    url: datasource.alias['donation-list'],
                    data: {
                        pageNum: pagebar.pageNum,
                        pageSize: pagebar.pageSize
                    },
                    dataType: 'json',
                    success: _success,
                    error: _error
                });
            $.ajax(options);
        },
        bindEvent = function () {
            //绑定更多
            $('#J-moreTrigger a[data-action=more]').live(TOUCH_EV, function (e) {
                e.preventDefault();
                pagebar.pageNum++;
                renderDonationList();
            });
            $('#J-moreTrigger a[data-action=top]').live(TOUCH_EV, function (e) {
                e.preventDefault();
                hybridapi.gotoTop();
            });
            //绑定捐赠条目
            $('#J-donationDataList [data-nextPage]').live(TOUCH_EV, function (e) {
                e.preventDefault();
                var el = $(this),
                    nextPage = el.attr('data-nextPage');
                //获取当前捐赠项目的值
                donationData = JSON.parse(el.attr('data-value'));
                var options = hybridapi.initAjaxOptions({
                    type: 'POST',
                    url: datasource.alias['donation-detail'],
                    data: {
                        donate_name: donationData.donate_name
                    },
                    dataType: 'json',
                    success: function (body) {
                        var source = $('#donationDetail-tpl').html(),
                            tpl = Handlebars.compile(source);
                        $(nextPage).html(tpl(body.serviceData));
                        pageflow.go(nextPage);
                        //初使化详情
                        $('.donation-detail').each(function () {
                            var self = $(this);
                            if (self.height() > 60) {
                                self.css({
                                    'height': '60px',
                                    'overflow': 'hidden'
                                });
                                self.next('.more').show();
                            }
                        });
                        renderDetailValidator();
                    },
                    error: function (xhr, type) {}
                });
                $.ajax(options);
            });
            //绑定确认捐赠按钮
            $('#J-donationApply-trigger').live(TOUCH_EV, function (e) {
                e.preventDefault();
                //验证整个表单
                Validator.query('#donationForm').execute();
            });
            //绑定确定支付按钮
            $('#J-pay-trigger').live(TOUCH_EV, function (e) {
                e.preventDefault();
                var el = $(this),
                    nextPage = el.attr('data-nextPage');
                var options = hybridapi.initAjaxOptions({
                    type: 'POST',
                    url: datasource.alias['donation-confirm'],
                    data: {
                        donate_name: donationData.donate_name,
                        amount: donationData.amount
                    },
                    dataType: 'json',
                    success: function (body) {},
                    error: function (xhr, type) {}
                });
                $.ajax(options);
            });
            //绑定查看详情
            $('.donation-detail ~ .more').live(TOUCH_EV, function () {
                $(this).hide();
                $('.donation-detail').css({
                    'height': 'auto',
                    'overflow': 'visible'
                });
            });
            //常用金额
            $('#donationForm [data-donationAmount]').live(TOUCH_EV, function () {
                $('#donationForm input[name=amount]').val($(this).attr('data-donationAmount'));
            });
        },
        renderDetailValidator = function () {
            //渲染详情页的验证
            try {
                //尝试销毁上一个Validator实例
                Validator.query('#donationForm').destroy();
            } catch (err) {};
            //添加validator
            var validator = new wapValidator({
                element: '#donationForm',
                //阻止表单验证通过后的自动提交，场景：手机虚拟键盘的"前往"会触发提交动作
                autoSubmit: false,
                onFormValidated: function (ele, err) {
                    var showMessage = Validator.query(ele).get('showMessage');
                    if (!err) {
                        var nextPage = $('#donationForm').attr('data-nextPage');
                        //必须放到excute中获取amount的值，否则amount四舍五入后的值获取不到
                        var amount = $('#donationForm input[name=amount]').val() || '';
                        donationData.amount = amount;
                        var options = hybridapi.initAjaxOptions({
                            type: 'POST',
                            url: datasource.alias['donation-apply'],
                            data: {
                                donate_name: donationData.donate_name,
                                amount: donationData.amount
                            },
                            dataType: 'json',
                            success: function (body) {
                                var fieldError = body.serviceData.fieldError;
                                if (body.errorCode == '501') {
                                    for (var i in fieldError) {
                                        showMessage.call(Validator.query(ele), fieldError[i], $('#donationForm [name=' + i + ']'));
                                    }
                                } else {
                                    var source = $('#donationApply-tpl').html(),
                                        tpl = Handlebars.compile(source);
                                    $(nextPage).html(tpl(body.serviceData));
                                    pageflow.go(nextPage);
                                }
                            },
                            error: function (xhr, type) {}
                        });
                        $.ajax(options);
                    }
                }
            });
            validator.addItem({
                element: '[name=amount]',
                required: true,
                rule: 'number amount max{max:2000}',
                display: '金额'
            });
        };
    /*
     *** 初使化区
     */
    /*
     *** 组件初使化
     */
    //规则不允许覆盖，所以在外层先添加规则
    Validator.addRule('amount', function (options) {
        var val = options.element.val();
        if (!isNaN(val)) {
            val = Math.round(val * 100) / 100;
            options.element.val(val);
            return /^[0-9]+(\.[0-9]{0,2})?$/.test(val);
        } else {
            return false;
        }
    }, '{{display}}格式有误。');
    //因为没有针对wap单独的validator,所以临时扩展一个
    var wapValidator = Validator.extend({
        getError: function (ele) {
            var itemNode = this.getItem(ele),
                errorNode = itemNode.find('.fm-error');
            if (errorNode.length == 0) {
                errorNode = $('<div class="fm-error"></div>').prependTo(itemNode);
            }
            return errorNode;
        },
        getItem: function (ele) {
            return ele.closest('.fm-item');
        },
        attrs: {
            triggerType: '',
            showMessage: function (msg, ele) {
                var errorNode = this.getError(ele);
                errorNode.html(msg).show();
            },
            hideMessage: function (msg, ele) {
                var errorNode = this.getError(ele);
                errorNode.html('').hide();
            }
        }
    }),
        //页面滚动组件
        PT = new PageTransition({
            element: '#J-page-box',
            duration: 0
        }),
        //初使化页面流
        pageflow = hybridapi.pageflow.set({
            first: '#J-page-1',
            go: function (page) {
                PT.transition(page);
            },
            back: function (page) {
                PT.back();
            }
        }),
        //分页
        pagebar = new hybridapi.Pagebar();
    /*
     *** 业务初使化
     */
    //合理选用事件，先暂时用click
    var TOUCH_EV = 'ontouchstart' in window ? 'click' : 'click';
    var datasource = hybridConfig.datasource,
        //保存捐赠的临时数据
        donationData;
    if (!hybridConfig.isAlipayClient) {
        var loading_overlay, loading_mask;
        renderLoading();
        //设备旋转
        var orientationchange = 'onorientationchange' in window ? 'orientationchange' : 'resize';
        $(document).bind(orientationchange, orientationEvent);
    }
    $(document).ready(function () {
        renderMain();
        PT.render();
        bindEvent();
        hybridapi.ready(function () {
            renderDonationList();
        });
    });
});

