// Module ID: 8184
// Category: unidentified
// Size: 430 bytes
// Parameters: e,t,n

"use strict";
var r, i=n(6556), a=n(9721)(/^\s*(?:function)?\*/), s=n(9092)(), o=n(3628), l=i("Object.prototype.toString"), c=i("Function.prototype.toString")
;
e.exports=function(e) {
  if("function"!=typeof e)return!1;
if(a(c(e)))return!0;
if(!s)return"[object GeneratorFunction]"===l(e);
if(!o)return!1;
if(void 0===r) {
  var t=function() {
  if(!s)return!1;
try {
  return Function("return function*()  {
}
")()
}
catch(e) {
}
}
()
;
r=!!t&&o(t)
}
return o(e)===r
}

