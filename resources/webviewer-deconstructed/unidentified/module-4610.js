// Module ID: 4610
// Category: unidentified
// Size: 1925 bytes
// Parameters: e,t,n

"use strict";
e.exports=u
;
var r=n(6048).F, i=r.ERR_METHOD_NOT_IMPLEMENTED, a=r.ERR_MULTIPLE_CALLBACK, s=r.ERR_TRANSFORM_ALREADY_TRANSFORMING, o=r.ERR_TRANSFORM_WITH_LENGTH_0, l=n(5382);
function c(e, t) {
  var n=this._transformState;
n.transforming=!1;
var r=n.writecb
;
if(null===r)return this.emit("error", new a);
n.writechunk=null, n.writecb=null, null!=t&&this.push(t), r(e);
var i=this._readableState;
i.reading=!1, (i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)
}
function u(e) {
if(!(this instanceof u))return new u(e);
l.call(this, e), this._transformState= {
  afterTransform:c.bind(this), needTransform:!1, transforming:!1, writecb:null, writechunk:null, writeencoding:null
}
, this._readableState.needReadable=!0, 
this._readableState.sync=!1, e&&("function"==typeof e.transform&&(this._transform=e.transform), "function"==typeof e.flush&&(this._flush=e.flush)), this.on("prefinish", h)
}
function h() {
  var e=this
;
"function"!=typeof this._flush||this._readableState.destroyed?d(this, null, null):this._flush((function(t, n) {
  d(e, t, n)
}
))
}
function d(e, t, n) {
  if(t)return e.emit("error", t);
if(null!=n&&e.push(n), e._writableState.length)throw new o
;
if(e._transformState.transforming)throw new s;
return e.push(null)
}
n(4317)(u, l), u.prototype.push=function(e, t) {
  return this._transformState.needTransform=!1, l.prototype.push.call(this, e, t)
}
, u.prototype._transform=function(e, t, n) {
n(new i("_transform()"))
}
, u.prototype._write=function(e, t, n) {
  var r=this._transformState;
if(r.writecb=n, r.writechunk=e, r.writeencoding=t, !r.transforming) {
  var i=this._readableState
;
(r.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)
}
}
, u.prototype._read=function(e) {
  var t=this._transformState;
null===t.writechunk||t.transforming?t.needTransform=!0:(t.transforming=!0, 
this._transform(t.writechunk, t.writeencoding, t.afterTransform))
}
, u.prototype._destroy=function(e, t) {
  l.prototype._destroy.call(this, e, (function(e) {
  t(e)
}
))
}

