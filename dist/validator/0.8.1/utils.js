define("#validator/0.8.1/utils",["#zepto/0.9.0/zepto","#validator/0.8.1/rule","#widget/0.9.16/widget-mobile","#base/0.9.16/base","#class/0.9.2/class","#events/0.9.1/events","#base/0.9.16/aspect","#base/0.9.16/attribute","#widget/0.9.16/daparser-mobile","#widget/0.9.16/auto-render-mobile","#validator/0.8.1/async"],function(require,exports,module){function unique(){return"__anonymous__"+u_count++}function parseRule(e){var t=e.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);return{name:t[1],param:parseJSON(t[2])}}function parseJSON(str){function getValue(str){return str[0]=='"'&&str[str.length-1]=='"'||str[0]=="'"&&str[str.length-1]=="'"?eval(str):str}if(!str)return null;var NOTICE='Invalid option object "'+str+'".';str=str.slice(1,-1);var result={},arr=str.split(",");return $.each(arr,function(e,t){arr[e]=$.trim(t);if(!arr[e])throw new Error(NOTICE);var n=arr[e].split(":"),r=$.trim(n[0]),i=$.trim(n[1]);if(!r||!i)throw new Error(NOTICE);result[getValue(r)]=$.trim(getValue(i))}),result}function parseRules(e){return e?e.match(/[a-zA-Z0-9\-\_]+(\{.*\})?/g):null}function parseDom(e){var e=$(e),t={},n=[],r=e.attr("required");r&&(n.push("required"),t.required=!0);var i=e.attr("type");if(i&&i!="submit"&&i!="cancel"&&i!="checkbox"&&i!="radio"&&i!="select"&&i!="select-one"){if(!Rule.getRule(i))throw new Error('Form field with type "'+i+'" not supported!');n.push(i)}var s=e.attr("min");s&&n.push('min{"min":"'+s+'"}');var o=e.attr("max");o&&n.push("max{max:"+o+"}");var u=e.attr("minlength");u&&n.push("minlength{min:"+u+"}");var a=e.attr("maxlength");a&&n.push("maxlength{max:"+a+"}");var f=e.attr("pattern");if(f){var l=new RegExp(f),c=unique();Rule.addRule(c,l),n.push(c)}var h=e.attr("data-rule");return h=h&&parseRules(h),h&&(n=n.concat(h)),t.rule=n.length==0?null:n.join(" "),t}function helper(e,t){return t?(helpers[e]=t,this):helpers[e]}var $=require("#zepto/0.9.0/zepto"),Rule=require("#validator/0.8.1/rule"),u_count=0,helpers={};module.exports={parseRule:parseRule,parseRules:parseRules,parseDom:parseDom,helper:helper}});