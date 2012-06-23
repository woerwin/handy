define("#switchable/0.9.5/accordion-debug", ["./switchable"], function(require, exports, module) {

    var Switchable = require('./switchable');


    // 手风琴组件
    var Accordion = Switchable.extend({

        attrs: {
            // 是否运行展开多个
            multiple: false
        }
    });

    module.exports = Accordion;

});
