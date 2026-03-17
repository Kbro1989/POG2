// Module ID: 6708
// Category: property-descriptor
// Size: 7373 bytes
// Parameters: e,t,n

"use strict";
var r, i=n(5606);
function a(e) {
  var t=this;
this.next=null, this.entry=null, this.finish=function() {
  !function(e, t) {
  var n=e.entry;
for(e.entry=null;
n;
) {
  var r=n.callback;
t.pendingcb--, 
r(void 0), n=n.next
}
t.corkedRequestsFree.next=e
}
(t, e)
}
}
e.exports=T, T.WritableState=S;
var s, o= {
  deprecate:n(4643)
}
, l=n(345), c=n(8287).Buffer, u=(void 0!==n.g?n.g:"undefined"!=typeof window?window:"undefined"!=typeof self?self: {
}
).Uint8Array||function() {
}
, h=n(5896), d=n(5291).getHighWaterMark, p=n(6048).F, f=p.ERR_INVALID_ARG_TYPE, m=p.ERR_METHOD_NOT_IMPLEMENTED, g=p.ERR_MULTIPLE_CALLBACK, _=p.ERR_STREAM_CANNOT_PIPE, v=p.ERR_STREAM_DESTROYED, y=p.ERR_STREAM_NULL_VALUES, b=p.ERR_STREAM_WRITE_AFTER_END, x=p.ERR_UNKNOWN_ENCODING, E=h.errorOrDestroy
;
function w() {
}
function S(e, t, s) {
  r=r||n(5382), e=e|| {
}
, "boolean"!=typeof s&&(s=t instanceof r), this.objectMode=!!e.objectMode, s&&(this.objectMode=this.objectMode||!!e.writableObjectMode), this.highWaterMark=d(this, e, "writableHighWaterMark", s), 
this.finalCalled=!1, this.needDrain=!1, this.ending=!1, this.ended=!1, this.finished=!1, this.destroyed=!1;
var o=!1===e.decodeStrings;
this.decodeStrings=!o, this.defaultEncoding=e.defaultEncoding||"utf8", this.length=0, this.writing=!1, this.corked=0, 
this.sync=!0, this.bufferProcessing=!1, this.onwrite=function(e) {
  !function(e, t) {
  var n=e._writableState, r=n.sync, a=n.writecb;
if("function"!=typeof a)throw new g;
if(function(e) {
  e.writing=!1, e.writecb=null, e.length-=e.writelen, e.writelen=0
}
(n), 
t)!function(e, t, n, r, a) {
  --t.pendingcb, n?(i.nextTick(a, r), i.nextTick(k, e, t), e._writableState.errorEmitted=!0, E(e, r)):(a(r), e._writableState.errorEmitted=!0, E(e, r), k(e, t))
}
(e, n, r, t, a);
else {
  var s=I(n)||e.destroyed
;
s||n.corked||n.bufferProcessing||!n.bufferedRequest||M(e, n), r?i.nextTick(C, e, n, s, a):C(e, n, s, a)
}
}
(t, e)
}
, this.writecb=null, this.writelen=0, this.bufferedRequest=null, this.lastBufferedRequest=null, this.pendingcb=0, this.prefinished=!1, 
this.errorEmitted=!1, this.emitClose=!1!==e.emitClose, this.autoDestroy=!!e.autoDestroy, this.bufferedRequestCount=0, this.corkedRequestsFree=new a(this)
}
function T(e) {
  var t=this instanceof(r=r||n(5382));
if(!t&&!s.call(T, this))return new T(e)
;
this._writableState=new S(e, this, t), this.writable=!0, e&&("function"==typeof e.write&&(this._write=e.write), "function"==typeof e.writev&&(this._writev=e.writev), "function"==typeof e.destroy&&(this._destroy=e.destroy), 
"function"==typeof e.final&&(this._final=e.final)), l.call(this)
}
function A(e, t, n, r, i, a, s) {
  t.writelen=r, t.writecb=s, t.writing=!0, t.sync=!0, t.destroyed?t.onwrite(new v("write")):n?e._writev(i, t.onwrite):e._write(i, a, t.onwrite), t.sync=!1
}
function C(e, t, n, r) {
  n||function(e, t) {
  0===t.length&&t.needDrain&&(t.needDrain=!1, e.emit("drain"))
}
(e, t), t.pendingcb--, r(), k(e, t)
}
function M(e, t) {
  t.bufferProcessing=!0;
var n=t.bufferedRequest;
if(e._writev&&n&&n.next) {
var r=t.bufferedRequestCount, i=new Array(r), s=t.corkedRequestsFree;
s.entry=n;
for(var o=0, l=!0;
n;
)i[o]=n, n.isBuf||(l=!1), n=n.next, o+=1;
i.allBuffers=l, A(e, t, !0, t.length, i, "", s.finish), t.pendingcb++, t.lastBufferedRequest=null, 
s.next?(t.corkedRequestsFree=s.next, s.next=null):t.corkedRequestsFree=new a(t), t.bufferedRequestCount=0
}
else {
  for(;
n;
) {
  var c=n.chunk, u=n.encoding, h=n.callback;
if(A(e, t, !1, t.objectMode?1:c.length, c, u, h), n=n.next, t.bufferedRequestCount--, t.writing)break
}
null===n&&(t.lastBufferedRequest=null)
}
t.bufferedRequest=n, t.bufferProcessing=!1
}
function I(e) {
  return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing
}
function R(e, t) {
  e._final((function(n) {
  t.pendingcb--, n&&E(e, n), 
t.prefinished=!0, e.emit("prefinish"), k(e, t)
}
))
}
function k(e, t) {
  var n=I(t);
if(n&&(function(e, t) {
  t.prefinished||t.finalCalled||("function"!=typeof e._final||t.destroyed?(t.prefinished=!0, e.emit("prefinish")):(t.pendingcb++, t.finalCalled=!0, 
i.nextTick(R, e, t)))
}
(e, t), 0===t.pendingcb&&(t.finished=!0, e.emit("finish"), t.autoDestroy))) {
  var r=e._readableState;
(!r||r.autoDestroy&&r.endEmitted)&&e.destroy()
}
return n
}
n(4317)(T, l), S.prototype.getBuffer=function() {
for(var e=this.bufferedRequest, t=[];
e;
)t.push(e), e=e.next;
return t
}
, function() {
  try {
  Object.defineProperty(S.prototype, "buffer",  {
  get:o.deprecate((function() {
  return this.getBuffer()
}
), "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
}
)
}
catch(e) {
}
}
(), 
"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(s=Function.prototype[Symbol.hasInstance], Object.defineProperty(T, Symbol.hasInstance,  {
  value:function(e) {
return!!s.call(this, e)||this===T&&e&&e._writableState instanceof S
}
}
)):s=function(e) {
  return e instanceof this
}
, T.prototype.pipe=function() {
  E(this, new _)
}
, T.prototype.write=function(e, t, n) {
  var r, a=this._writableState, s=!1, o=!a.objectMode&&(r=e, 
c.isBuffer(r)||r instanceof u);
return o&&!c.isBuffer(e)&&(e=function(e) {
  return c.from(e)
}
(e)), "function"==typeof t&&(n=t, t=null), o?t="buffer":t||(t=a.defaultEncoding), "function"!=typeof n&&(n=w), a.ending?function(e, t) {
  var n=new b;
E(e, n), 
i.nextTick(t, n)
}
(this, n):(o||function(e, t, n, r) {
  var a;
return null===n?a=new y:"string"==typeof n||t.objectMode||(a=new f("chunk", ["string", "Buffer"], n)), !a||(E(e, a), i.nextTick(r, a), !1)
}
(this, a, e, n))&&(a.pendingcb++, s=function(e, t, n, r, i, a) {
  if(!n) {
var s=function(e, t, n) {
  return e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=c.from(t, n)), t
}
(t, r, i);
r!==s&&(n=!0, i="buffer", r=s)
}
var o=t.objectMode?1:r.length;
t.length+=o;
var l=t.length<t.highWaterMark;
if(l||(t.needDrain=!0), 
t.writing||t.corked) {
  var u=t.lastBufferedRequest;
t.lastBufferedRequest= {
  chunk:r, encoding:i, isBuf:n, callback:a, next:null
}
, u?u.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest, t.bufferedRequestCount+=1
}
else A(e, t, !1, o, r, i, a);
return l
}
(this, a, o, e, t, n)), s
}
, T.prototype.cork=function() {
  this._writableState.corked++
}
, T.prototype.uncork=function() {
  var e=this._writableState;
e.corked&&(e.corked--, e.writing||e.corked||e.bufferProcessing||!e.bufferedRequest||M(this, e))
}
, 
T.prototype.setDefaultEncoding=function(e) {
  if("string"==typeof e&&(e=e.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e+"").toLowerCase())>-1))throw new x(e)
;
return this._writableState.defaultEncoding=e, this
}
, Object.defineProperty(T.prototype, "writableBuffer",  {
  enumerable:!1, get:function() {
  return this._writableState&&this._writableState.getBuffer()
}
}
), 
Object.defineProperty(T.prototype, "writableHighWaterMark",  {
  enumerable:!1, get:function() {
  return this._writableState.highWaterMark
}
}
), T.prototype._write=function(e, t, n) {
  n(new m("_write()"))
}
, T.prototype._writev=null, T.prototype.end=function(e, t, n) {
var r=this._writableState;
return"function"==typeof e?(n=e, e=null, t=null):"function"==typeof t&&(n=t, t=null), null!=e&&this.write(e, t), r.corked&&(r.corked=1, this.uncork()), r.ending||function(e, t, n) {
  t.ending=!0, k(e, t), 
n&&(t.finished?i.nextTick(n):e.once("finish", n)), t.ended=!0, e.writable=!1
}
(this, r, n), this
}
, Object.defineProperty(T.prototype, "writableLength",  {
  enumerable:!1, get:function() {
  return this._writableState.length
}
}
), 
Object.defineProperty(T.prototype, "destroyed",  {
  enumerable:!1, get:function() {
  return void 0!==this._writableState&&this._writableState.destroyed
}
, set:function(e) {
  this._writableState&&(this._writableState.destroyed=e)
}
}
), T.prototype.destroy=h.destroy, 
T.prototype._undestroy=h.undestroy, T.prototype._destroy=function(e, t) {
  t(e)
}

