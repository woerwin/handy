define("#widget/0.9.16/daparser-mobile",["#zepto/1.0.0/zepto"],function(a,b){function f(a){var b=[];for(var c=0,d=a.length;c<d;c++){var e=a[c];e.nodeType===1&&b.push(e)}return b}function g(a){var b=a.outerHTML;if(b)return b.indexOf(" data-")!==-1;var c=a.innerHTML;if(c&&c.indexOf(" data-")!==-1)return!0;var d=e.parseElement(a);for(var f in d)return!0;return!1}function i(a){return a.toLowerCase().replace(h,function(a,b){return(b+"").toUpperCase()})}function k(){return"daparser-"+j++}var c=a("#zepto/1.0.0/zepto"),d="data-daparser-cid",e=b;e.parseBlock=function(a){a=c(a)[0];var b={};if(!g(a))return b;var h=f(a.getElementsByTagName("*"));h.unshift(a);for(var i=0,j=h.length;i<j;i++){var k=h[i],l=e.parseElement(k),m=k.getAttribute(d);for(var n in l){m||(m=e.stamp(k));var o=l[n],p=b[n]||(b[n]={});p[o]||(p[o]=""),p[o]+=(p[o]?",":"")+"."+m}}return b},e.parseElement=function(a){a=c(a)[0];if(a.dataset)return c.extend({},a.dataset);var b={},d=a.attributes;for(var e=0,f=d.length;e<f;e++){var g=d[e],h=g.name;h.indexOf("data-")===0&&(h=i(h.substring(5)),b[h]=g.value)}return b},e.stamp=function(a){a=c(a)[0];var b=a.getAttribute(d);return b||(b=k(),a.setAttribute(d,b),a.className+=" "+b),b};var h=/-([a-z])/g,j=0});