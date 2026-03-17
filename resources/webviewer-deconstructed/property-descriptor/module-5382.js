// Module ID: 5382
// Category: property-descriptor
// Size: 1335 bytes
// Parameters: e,t,n

"use strict";
var r=n(5606), i=Object.keys||function(e) {
  var t=[];
for(var n in e)t.push(n);
return t
}
;
e.exports=u;
var a=n(5412), s=n(6708);
n(4317)(u, a);
for(var o=i(s.prototype), l=0;
l<o.length;
l++) {
  var c=o[l]
;
u.prototype[c]||(u.prototype[c]=s.prototype[c])
}
function u(e) {
  if(!(this instanceof u))return new u(e);
a.call(this, e), s.call(this, e), this.allowHalfOpen=!0, e&&(!1===e.readable&&(this.readable=!1), !1===e.writable&&(this.writable=!1), 
!1===e.allowHalfOpen&&(this.allowHalfOpen=!1, this.once("end", h)))
}
function h() {
  this._writableState.ended||r.nextTick(d, this)
}
function d(e) {
  e.end()
}
Object.defineProperty(u.prototype, "writableHighWaterMark",  {
  enumerable:!1, get:function() {
return this._writableState.highWaterMark
}
}
), Object.defineProperty(u.prototype, "writableBuffer",  {
  enumerable:!1, get:function() {
  return this._writableState&&this._writableState.getBuffer()
}
}
), Object.defineProperty(u.prototype, "writableLength",  {
enumerable:!1, get:function() {
  return this._writableState.length
}
}
), Object.defineProperty(u.prototype, "destroyed",  {
  enumerable:!1, get:function() {
return void 0!==this._readableState&&void 0!==this._writableState&&this._readableState.destroyed&&this._writableState.destroyed
}
, set:function(e) {
  void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=e, 
this._writableState.destroyed=e)
}
}
)
