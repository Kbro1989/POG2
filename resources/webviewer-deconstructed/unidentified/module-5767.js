// Module ID: 5767
// Category: unidentified
// Size: 902 bytes
// Parameters: e,t,n

"use strict"
;
var r=n(2682), i=n(9209), a=n(487), s=n(6556), o=n(5795), l=n(3628), c=s("Object.prototype.toString"), u=n(9092)(), h="undefined"==typeof globalThis?n.g:globalThis, d=i(), p=s("String.prototype.slice"), f=s("Array.prototype.indexOf", !0)||function(e, t) {
for(var n=0;
n<e.length;
n+=1)if(e[n]===t)return n;
return-1
}
, m= {
  __proto__:null
}
;
r(d, u&&o&&l?function(e) {
  var t=new h[e];
if(Symbol.toStringTag in t&&l) {
  var n=l(t), r=o(n, Symbol.toStringTag);
if(!r&&n) {
  var i=l(n);
r=o(i, Symbol.toStringTag)
}
m["$"+e]=a(r.get)
}
}
:function(e) {
  var t=new h[e], n=t.slice||t.set;
n&&(m["$"+e]=a(n))
}
), e.exports=function(e) {
  if(!e||"object"!=typeof e)return!1;
if(!u) {
  var t=p(c(e), 8, -1);
return f(d, t)>-1?t:"Object"===t&&function(e) {
  var t=!1;
return r(m, (function(n, r) {
  if(!t)try {
  n(e), 
t=p(r, 1)
}
catch(e) {
}
}
)), t
}
(e)
}
return o?function(e) {
  var t=!1;
return r(m, (function(n, r) {
  if(!t)try {
  "$"+n(e)===r&&(t=p(r, 1))
}
catch(e) {
}
}
)), t
}
(e):null
}

