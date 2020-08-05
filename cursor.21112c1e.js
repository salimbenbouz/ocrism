parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"klra":[function(require,module,exports) {
"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var r=function(){function t(){e(this,t)}return n(t,null,[{key:"throttle",value:function(e){var t,n,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:200,u=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this;return function(){var o=+new Date,l=arguments;t&&o<t+r?(clearTimeout(n),n=setTimeout(function(){t=o,e.apply(u,l)},r)):(t=o,e.apply(u,l))}}},{key:"debounce",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:200,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this,r=null,u=null,o=function(){return e.apply(n,u)};return function(){u=arguments,clearTimeout(r),r=setTimeout(o,t)}}},{key:"addEventListenerBySelector",value:function(e,t,n){for(var r=document.querySelectorAll(e),u=0,o=r.length;u<o;u++)r[u].addEventListener(t,n,!1)}},{key:"lerp",value:function(e,t,n){return(1-n)*e+n*t}},{key:"map",value:function(e,t,n,r,u){return(e-t)*(u-r)/(n-t)+r}}]),t}(),u=r;exports.default=u;
},{}],"LMRJ":[function(require,module,exports) {
"use strict";var e=t(require("./utils/util"));function t(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function o(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}var i=function(){function t(){r(this,t),this.initCursor(),this.initCanvas(),this.initHovers()}return o(t,[{key:"initCursor",value:function(){var e=this;this.clientX=-100,this.clientY=-100,this.innerCursor=document.querySelector(".circle-cursor--inner"),this.outerCursor=document.querySelector(".circle-cursor--outer"),this.outerCursorSpeed=1,this.lastX=0,this.lastY=0,this.isStuck=!1,this.isHidden=!1,this.showCursor=!1;var t=window.paper,r=function(r){e.group.position=new t.Point(r.clientX,r.clientY),setTimeout(function(){e.outerCursorSpeed=.3},100),e.showCursor=!0};document.addEventListener("mousemove",r),document.addEventListener("mousemove",function(t){e.clientX=t.clientX,e.clientY=t.clientY});requestAnimationFrame(function t(){TweenMax.set(e.innerCursor,{x:e.clientX,y:e.clientY}),e.showCursor&&document.removeEventListener("mousemove",r),requestAnimationFrame(t)})}},{key:"initCanvas",value:function(){var t=this,r=window,n=r.paper,o=r.SimplexNoise,i=document.querySelector(".circle-cursor--outer"),s=80;n.setup(i);var u=!1,a=new n.Path.RegularPolygon(new n.Point(0,0),8,15);a.strokeColor="#22B573",a.strokeWidth=2,a.smooth(),this.group=new n.Group([a]),this.group.applyMatrix=!1;var c=a.segments.map(function(){return new o}),l=[];n.view.onFrame=function(r){if(t.isStuck?t.isStuck&&(t.lastX=e.default.lerp(t.lastX,t.stuckX,t.outerCursorSpeed),t.lastY=e.default.lerp(t.lastY,t.stuckY,t.outerCursorSpeed),t.group.position=new n.Point(t.lastX,t.lastY)):(t.lastX=e.default.lerp(t.lastX,t.clientX,t.outerCursorSpeed),t.lastY=e.default.lerp(t.lastY,t.clientY,t.outerCursorSpeed),t.group.position=new n.Point(t.lastX,t.lastY)),t.isStuck&&a.bounds.width<s)a.scale(1.08);else if(!t.isStuck&&a.bounds.width>30){u&&(a.segments.forEach(function(e,t){e.point.set(l[t][0],l[t][1])}),u=!1,l=[]);a.scale(.92)}t.isStuck&&a.bounds.width>=s&&(u=!0,0===l.length&&a.segments.forEach(function(e,t){l[t]=[e.point.x,e.point.y]}),a.segments.forEach(function(t,n){var o=c[n].noise2D(r.count/100,0),i=c[n].noise2D(r.count/100,1),s=e.default.map(o,-1,1,-4,4),u=e.default.map(i,-1,1,-4,4),a=l[n][0]+s,d=l[n][1]+u;t.point.set(a,d)})),t.fillOuterCursor&&"#22B573"!==a.fillColor?(a.fillColor="#22B573",a.strokeColor="transparent"):t.fillOuterCursor||"transparent"===a.fillColor||(a.strokeColor="#22B573",a.fillColor="transparent"),t.isHidden?(a.strokeColor="transparent",a.fillColor="transparent"):t.isHidden||(a.strokeColor="#22B573"),a.smooth()}}},{key:"initHovers",value:function(){var e=this,t=function(t){var r=t.currentTarget.getBoundingClientRect();e.stuckX=Math.round(r.left+r.width/2),e.stuckY=Math.round(r.top+r.height/2),e.isStuck=!0,TweenMax.to(e.innerCursor,.2,{opacity:0})},r=function(){e.isStuck=!1,TweenMax.to(e.innerCursor,.2,{opacity:1})};document.querySelectorAll("a[data-cursor='magnetic']").forEach(function(e){e.addEventListener("mouseenter",t),e.addEventListener("mouseleave",r)});var n=function(){e.fillOuterCursor=!0,e.outerCursor.classList.add("filled"),TweenMax.to(e.innerCursor,.1,{opacity:0})},o=function(){e.fillOuterCursor=!1,e.outerCursor.classList.remove("filled"),TweenMax.to(e.innerCursor,.1,{opacity:1})};document.querySelectorAll("a[data-cursor='link']").forEach(function(e){e.addEventListener("mouseenter",n),e.addEventListener("mouseleave",o)});var i=function(){TweenMax.to(e.innerCursor,.1,{opacity:0}),e.isHidden=!0},s=function(){TweenMax.to(e.innerCursor,.1,{opacity:1}),e.isHidden=!1};document.querySelectorAll("a[data-cursor='hide']").forEach(function(e){e.addEventListener("mouseenter",i),e.addEventListener("mouseleave",s)})}}]),t}(),s=document.createElement("div");s.classList.add("circle-cursor","circle-cursor--inner");var u=document.createElement("canvas");u.classList.add("circle-cursor","circle-cursor--outer"),u.setAttribute("resize","true"),document.body.prepend(u),document.body.prepend(s);
},{"./utils/util":"klra"}]},{},["LMRJ"], null)
//# sourceMappingURL=/cursor.21112c1e.js.map