// Module ID: 4035
// Category: unidentified
// Size: 504 bytes
// Parameters: e,t,n

"use strict";
var r, i=n(6556), a=n(9092)(), s=n(9957), o=n(5795);
if(a) {
  var l=i("RegExp.prototype.exec"), c= {
}
, u=function() {
  throw c
}
, h= {
  toString:u, 
valueOf:u
}
;
"symbol"==typeof Symbol.toPrimitive&&(h[Symbol.toPrimitive]=u), r=function(e) {
  if(!e||"object"!=typeof e)return!1;
var t=o(e, "lastIndex");
if(!t||!s(t, "value"))return!1;
try {
  l(e, h)
}
catch(e) {
  return e===c
}
}
}
else {
var d=i("Object.prototype.toString");
r=function(e) {
  return!(!e||"object"!=typeof e&&"function"!=typeof e)&&"[object RegExp]"===d(e)
}
}
e.exports=r
