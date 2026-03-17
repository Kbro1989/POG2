// Module ID: 7758
// Category: unidentified
// Size: 982 bytes
// Parameters: e,t,n

"use strict";
var r, i=n(6048).F, a=i.ERR_MISSING_ARGS, s=i.ERR_STREAM_DESTROYED;
function o(e) {
  if(e)throw e
}
function l(e) {
  e()
}
function c(e, t) {
  return e.pipe(t)
}
e.exports=function() {
for(var e=arguments.length, t=new Array(e), i=0;
i<e;
i++)t[i]=arguments[i];
var u, h=function(e) {
  return e.length?"function"!=typeof e[e.length-1]?o:e.pop():o
}
(t);
if(Array.isArray(t[0])&&(t=t[0]), t.length<2)throw new a("streams")
;
var d=t.map((function(e, i) {
  var a=i<t.length-1;
return function(e, t, i, a) {
  a=function(e) {
  var t=!1;
return function() {
  t||(t=!0, e.apply(void 0, arguments))
}
}
(a);
var o=!1;
e.on("close", (function() {
  o=!0
}
)), void 0===r&&(r=n(6238)), r(e,  {
  readable:t, writable:i
}
, (function(e) {
  if(e)return a(e);
o=!0, a()
}
));
var l=!1;
return function(t) {
  if(!o&&!l)return l=!0, function(e) {
  return e.setHeader&&"function"==typeof e.abort
}
(e)?e.abort():"function"==typeof e.destroy?e.destroy():void a(t||new s("pipe"))
}
}
(e, a, i>0, (function(e) {
  u||(u=e), e&&d.forEach(l), a||(d.forEach(l), h(u))
}
))
}
));
return t.reduce(c)
}

