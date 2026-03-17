// Module ID: 6576
// Category: unidentified
// Size: 1664 bytes
// Parameters: e,t,n

"use strict";
var r=n(9394), i=n(8452);
e.exports=function() {
  var e=r()
;
return i(Object,  {
  is:e
}
,  {
  is:function() {
  return Object.is!==e
}
}
), e
}
}
, 6578:e=> {
  "use strict"
;
e.exports=["Float16Array", "Float32Array", "Float64Array", "Int8Array", "Int16Array", "Int32Array", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "BigInt64Array", "BigUint64Array"]
}
, 6585:e=> {
  var t=1e3, n=60*t, r=60*n, i=24*r, a=7*i
;
function s(e, t, n, r) {
  var i=t>=1.5*n;
return Math.round(e/n)+" "+r+(i?"s":"")
}
e.exports=function(e, o) {
  o=o|| {
}
;
var l, c, u=typeof e;
if("string"===u&&e.length>0)return function(e) {
  if(!((e=String(e)).length>100)) {
var s=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e);
if(s) {
  var o=parseFloat(s[1]);
switch((s[2]||"ms").toLowerCase()) {
  case"years":case"year":case"yrs":
case"yr":case"y":return 315576e5*o;
case"weeks":case"week":case"w":return o*a;
case"days":case"day":case"d":return o*i;
case"hours":case"hour":case"hrs":case"hr":case"h":return o*r;
case"minutes":case"minute":case"mins":case"min":case"m":return o*n
;
case"seconds":case"second":case"secs":case"sec":case"s":return o*t;
case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return o;
default:return
}
}
}
}
(e);
if("number"===u&&isFinite(e))return o.long?(l=e, 
(c=Math.abs(l))>=i?s(l, c, i, "day"):c>=r?s(l, c, r, "hour"):c>=n?s(l, c, n, "minute"):c>=t?s(l, c, t, "second"):l+" ms"):function(e) {
  var a=Math.abs(e)
;
return a>=i?Math.round(e/i)+"d":a>=r?Math.round(e/r)+"h":a>=n?Math.round(e/n)+"m":a>=t?Math.round(e/t)+"s":e+"ms"
}
(e);
throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))
}

