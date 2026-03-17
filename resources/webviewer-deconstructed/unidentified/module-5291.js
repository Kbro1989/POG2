// Module ID: 5291
// Category: unidentified
// Size: 324 bytes
// Parameters: e,t,n

"use strict";
var r=n(6048).F.ERR_INVALID_OPT_VALUE;
e.exports= {
  getHighWaterMark:function(e, t, n, i) {
  var a=function(e, t, n) {
  return null!=e.highWaterMark?e.highWaterMark:t?e[n]:null
}
(t, i, n);
if(null!=a) {
  if(!isFinite(a)||Math.floor(a)!==a||a<0)throw new r(i?n:"highWaterMark", a);
return Math.floor(a)
}
return e.objectMode?16:16384
}
}

