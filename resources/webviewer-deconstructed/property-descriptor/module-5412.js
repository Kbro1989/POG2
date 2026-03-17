// Module ID: 5412
// Category: property-descriptor
// Size: 18264 bytes
// Parameters: e,t,n

"use strict";
var r, i=n(5606);
e.exports=T, T.ReadableState=S, n(7007).EventEmitter;
var a, s=function(e, t) {
  return e.listeners(t).length
}
, o=n(345), l=n(8287).Buffer, c=(void 0!==n.g?n.g:"undefined"!=typeof window?window:"undefined"!=typeof self?self: {
}
).Uint8Array||function() {
}
, u=n(9838);
a=u&&u.debuglog?u.debuglog("stream"):function() {
}
;
var h, d, p, f=n(2726), m=n(5896), g=n(5291).getHighWaterMark, _=n(6048).F, v=_.ERR_INVALID_ARG_TYPE, y=_.ERR_STREAM_PUSH_AFTER_EOF, b=_.ERR_METHOD_NOT_IMPLEMENTED, x=_.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
n(4317)(T, o)
;
var E=m.errorOrDestroy, w=["error", "close", "destroy", "pause", "resume"];
function S(e, t, i) {
  r=r||n(5382), e=e|| {
}
, "boolean"!=typeof i&&(i=t instanceof r), this.objectMode=!!e.objectMode, i&&(this.objectMode=this.objectMode||!!e.readableObjectMode), 
this.highWaterMark=g(this, e, "readableHighWaterMark", i), this.buffer=new f, this.length=0, this.pipes=null, this.pipesCount=0, this.flowing=null, this.ended=!1, this.endEmitted=!1, this.reading=!1, this.sync=!0, this.needReadable=!1, this.emittedReadable=!1, 
this.readableListening=!1, this.resumeScheduled=!1, this.paused=!0, this.emitClose=!1!==e.emitClose, this.autoDestroy=!!e.autoDestroy, this.destroyed=!1, this.defaultEncoding=e.defaultEncoding||"utf8", this.awaitDrain=0, this.readingMore=!1, 
this.decoder=null, this.encoding=null, e.encoding&&(h||(h=n(3141).I), this.decoder=new h(e.encoding), this.encoding=e.encoding)
}
function T(e) {
  if(r=r||n(5382), !(this instanceof T))return new T(e);
var t=this instanceof r
;
this._readableState=new S(e, this, t), this.readable=!0, e&&("function"==typeof e.read&&(this._read=e.read), "function"==typeof e.destroy&&(this._destroy=e.destroy)), o.call(this)
}
function A(e, t, n, r, i) {
  a("readableAddChunk", t);
var s, o=e._readableState
;
if(null===t)o.reading=!1, function(e, t) {
  if(a("onEofChunk"), !t.ended) {
  if(t.decoder) {
  var n=t.decoder.end();
n&&n.length&&(t.buffer.push(n), t.length+=t.objectMode?1:n.length)
}
t.ended=!0, t.sync?R(e):(t.needReadable=!1, 
t.emittedReadable||(t.emittedReadable=!0, k(e)))
}
}
(e, o);
else if(i||(s=function(e, t) {
  var n, r;
return r=t, l.isBuffer(r)||r instanceof c||"string"==typeof t||void 0===t||e.objectMode||(n=new v("chunk", ["string", "Buffer", "Uint8Array"], t)), n
}
(o, t)), 
s)E(e, s);
else if(o.objectMode||t&&t.length>0)if("string"==typeof t||o.objectMode||Object.getPrototypeOf(t)===l.prototype||(t=function(e) {
  return l.from(e)
}
(t)), r)o.endEmitted?E(e, new x):C(e, o, t, !0);
else if(o.ended)E(e, new y);
else {
if(o.destroyed)return!1;
o.reading=!1, o.decoder&&!n?(t=o.decoder.write(t), o.objectMode||0!==t.length?C(e, o, t, !1):N(e, o)):C(e, o, t, !1)
}
else r||(o.reading=!1, N(e, o));
return!o.ended&&(o.length<o.highWaterMark||0===o.length)
}
function C(e, t, n, r) {
t.flowing&&0===t.length&&!t.sync?(t.awaitDrain=0, e.emit("data", n)):(t.length+=t.objectMode?1:n.length, r?t.buffer.unshift(n):t.buffer.push(n), t.needReadable&&R(e)), N(e, t)
}
Object.defineProperty(T.prototype, "destroyed",  {
  enumerable:!1, get:function() {
return void 0!==this._readableState&&this._readableState.destroyed
}
, set:function(e) {
  this._readableState&&(this._readableState.destroyed=e)
}
}
), T.prototype.destroy=m.destroy, T.prototype._undestroy=m.undestroy, T.prototype._destroy=function(e, t) {
  t(e)
}
, 
T.prototype.push=function(e, t) {
  var n, r=this._readableState;
return r.objectMode?n=!0:"string"==typeof e&&((t=t||r.defaultEncoding)!==r.encoding&&(e=l.from(e, t), t=""), n=!0), A(this, e, t, !1, n)
}
, T.prototype.unshift=function(e) {
  return A(this, e, null, !0, !1)
}
, 
T.prototype.isPaused=function() {
  return!1===this._readableState.flowing
}
, T.prototype.setEncoding=function(e) {
  h||(h=n(3141).I);
var t=new h(e);
this._readableState.decoder=t, this._readableState.encoding=this._readableState.decoder.encoding
;
for(var r=this._readableState.buffer.head, i="";
null!==r;
)i+=t.write(r.data), r=r.next;
return this._readableState.buffer.clear(), ""!==i&&this._readableState.buffer.push(i), this._readableState.length=i.length, this
}
;
var M=1073741824;
function I(e, t) {
return e<=0||0===t.length&&t.ended?0:t.objectMode?1:e!=e?t.flowing&&t.length?t.buffer.head.data.length:t.length:(e>t.highWaterMark&&(t.highWaterMark=function(e) {
  return e>=M?e=M:(e--, e|=e>>>1, e|=e>>>2, e|=e>>>4, e|=e>>>8, e|=e>>>16, e++), e
}
(e)), 
e<=t.length?e:t.ended?t.length:(t.needReadable=!0, 0))
}
function R(e) {
  var t=e._readableState;
a("emitReadable", t.needReadable, t.emittedReadable), t.needReadable=!1, t.emittedReadable||(a("emitReadable", t.flowing), t.emittedReadable=!0, i.nextTick(k, e))
}
function k(e) {
  var t=e._readableState;
a("emitReadable_", t.destroyed, t.length, t.ended), t.destroyed||!t.length&&!t.ended||(e.emit("readable"), t.emittedReadable=!1), t.needReadable=!t.flowing&&!t.ended&&t.length<=t.highWaterMark, F(e)
}
function N(e, t) {
t.readingMore||(t.readingMore=!0, i.nextTick(D, e, t))
}
function D(e, t) {
  for(;
!t.reading&&!t.ended&&(t.length<t.highWaterMark||t.flowing&&0===t.length);
) {
  var n=t.length;
if(a("maybeReadMore read 0"), e.read(0), n===t.length)break
}
t.readingMore=!1
}
function L(e) {
  var t=e._readableState;
t.readableListening=e.listenerCount("readable")>0, t.resumeScheduled&&!t.paused?t.flowing=!0:e.listenerCount("data")>0&&e.resume()
}
function O(e) {
  a("readable nexttick read 0"), e.read(0)
}
function P(e, t) {
a("resume", t.reading), t.reading||e.read(0), t.resumeScheduled=!1, e.emit("resume"), F(e), t.flowing&&!t.reading&&e.read(0)
}
function F(e) {
  var t=e._readableState;
for(a("flow", t.flowing);
t.flowing&&null!==e.read();
);
}
function U(e, t) {
return 0===t.length?null:(t.objectMode?n=t.buffer.shift():!e||e>=t.length?(n=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.first():t.buffer.concat(t.length), t.buffer.clear()):n=t.buffer.consume(e, t.decoder), n);
var n
}
function B(e) {
var t=e._readableState;
a("endReadable", t.endEmitted), t.endEmitted||(t.ended=!0, i.nextTick(z, t, e))
}
function z(e, t) {
  if(a("endReadableNT", e.endEmitted, e.length), !e.endEmitted&&0===e.length&&(e.endEmitted=!0, t.readable=!1, t.emit("end"), e.autoDestroy)) {
var n=t._writableState;
(!n||n.autoDestroy&&n.finished)&&t.destroy()
}
}
function G(e, t) {
  for(var n=0, r=e.length;
n<r;
n++)if(e[n]===t)return n;
return-1
}
T.prototype.read=function(e) {
  a("read", e), e=parseInt(e, 10);
var t=this._readableState, n=e
;
if(0!==e&&(t.emittedReadable=!1), 0===e&&t.needReadable&&((0!==t.highWaterMark?t.length>=t.highWaterMark:t.length>0)||t.ended))return a("read: emitReadable", t.length, t.ended), 0===t.length&&t.ended?B(this):R(this), null
;
if(0===(e=I(e, t))&&t.ended)return 0===t.length&&B(this), null;
var r, i=t.needReadable;
return a("need readable", i), (0===t.length||t.length-e<t.highWaterMark)&&a("length less than watermark", i=!0), 
t.ended||t.reading?a("reading or ended", i=!1):i&&(a("do read"), t.reading=!0, t.sync=!0, 0===t.length&&(t.needReadable=!0), this._read(t.highWaterMark), t.sync=!1, t.reading||(e=I(n, t))), null===(r=e>0?U(e, t):null)?(t.needReadable=t.length<=t.highWaterMark, 
e=0):(t.length-=e, t.awaitDrain=0), 0===t.length&&(t.ended||(t.needReadable=!0), n!==e&&t.ended&&B(this)), null!==r&&this.emit("data", r), r
}
, T.prototype._read=function(e) {
  E(this, new b("_read()"))
}
, T.prototype.pipe=function(e, t) {
var n=this, r=this._readableState;
switch(r.pipesCount) {
  case 0:r.pipes=e;
break;
case 1:r.pipes=[r.pipes, e];
break;
default:r.pipes.push(e)
}
r.pipesCount+=1, a("pipe count=%d opts=%j", r.pipesCount, t);
var o=t&&!1===t.end||e===i.stdout||e===i.stderr?m:l
;
function l() {
  a("onend"), e.end()
}
r.endEmitted?i.nextTick(o):n.once("end", o), e.on("unpipe", (function t(i, s) {
  a("onunpipe"), i===n&&s&&!1===s.hasUnpiped&&(s.hasUnpiped=!0, a("cleanup"), e.removeListener("close", p), e.removeListener("finish", f), 
e.removeListener("drain", c), e.removeListener("error", d), e.removeListener("unpipe", t), n.removeListener("end", l), n.removeListener("end", m), n.removeListener("data", h), u=!0, !r.awaitDrain||e._writableState&&!e._writableState.needDrain||c())
}
))
;
var c=function(e) {
  return function() {
  var t=e._readableState;
a("pipeOnDrain", t.awaitDrain), t.awaitDrain&&t.awaitDrain--, 0===t.awaitDrain&&s(e, "data")&&(t.flowing=!0, F(e))
}
}
(n);
e.on("drain", c);
var u=!1;
function h(t) {
  a("ondata");
var i=e.write(t)
;
a("dest.write", i), !1===i&&((1===r.pipesCount&&r.pipes===e||r.pipesCount>1&&-1!==G(r.pipes, e))&&!u&&(a("false write response,  pause", r.awaitDrain), r.awaitDrain++), n.pause())
}
function d(t) {
  a("onerror", t), m(), e.removeListener("error", d), 
0===s(e, "error")&&E(e, t)
}
function p() {
  e.removeListener("finish", f), m()
}
function f() {
  a("onfinish"), e.removeListener("close", p), m()
}
function m() {
  a("unpipe"), n.unpipe(e)
}
return n.on("data", h), function(e, t, n) {
if("function"==typeof e.prependListener)return e.prependListener(t, n);
e._events&&e._events[t]?Array.isArray(e._events[t])?e._events[t].unshift(n):e._events[t]=[n, e._events[t]]:e.on(t, n)
}
(e, "error", d), e.once("close", p), e.once("finish", f), 
e.emit("pipe", n), r.flowing||(a("pipe resume"), n.resume()), e
}
, T.prototype.unpipe=function(e) {
  var t=this._readableState, n= {
  hasUnpiped:!1
}
;
if(0===t.pipesCount)return this;
if(1===t.pipesCount)return e&&e!==t.pipes||(e||(e=t.pipes), t.pipes=null, 
t.pipesCount=0, t.flowing=!1, e&&e.emit("unpipe", this, n)), this;
if(!e) {
  var r=t.pipes, i=t.pipesCount;
t.pipes=null, t.pipesCount=0, t.flowing=!1;
for(var a=0;
a<i;
a++)r[a].emit("unpipe", this,  {
  hasUnpiped:!1
}
);
return this
}
var s=G(t.pipes, e)
;
return-1===s||(t.pipes.splice(s, 1), t.pipesCount-=1, 1===t.pipesCount&&(t.pipes=t.pipes[0]), e.emit("unpipe", this, n)), this
}
, T.prototype.on=function(e, t) {
  var n=o.prototype.on.call(this, e, t), r=this._readableState
;
return"data"===e?(r.readableListening=this.listenerCount("readable")>0, !1!==r.flowing&&this.resume()):"readable"===e&&(r.endEmitted||r.readableListening||(r.readableListening=r.needReadable=!0, r.flowing=!1, r.emittedReadable=!1, 
a("on readable", r.length, r.reading), r.length?R(this):r.reading||i.nextTick(O, this))), n
}
, T.prototype.addListener=T.prototype.on, T.prototype.removeListener=function(e, t) {
  var n=o.prototype.removeListener.call(this, e, t)
;
return"readable"===e&&i.nextTick(L, this), n
}
, T.prototype.removeAllListeners=function(e) {
  var t=o.prototype.removeAllListeners.apply(this, arguments);
return"readable"!==e&&void 0!==e||i.nextTick(L, this), t
}
, T.prototype.resume=function() {
var e=this._readableState;
return e.flowing||(a("resume"), e.flowing=!e.readableListening, function(e, t) {
  t.resumeScheduled||(t.resumeScheduled=!0, i.nextTick(P, e, t))
}
(this, e)), e.paused=!1, this
}
, T.prototype.pause=function() {
return a("call pause flowing=%j", this._readableState.flowing), !1!==this._readableState.flowing&&(a("pause"), this._readableState.flowing=!1, this.emit("pause")), this._readableState.paused=!0, this
}
, T.prototype.wrap=function(e) {
var t=this, n=this._readableState, r=!1;
for(var i in e.on("end", (function() {
  if(a("wrapped end"), n.decoder&&!n.ended) {
  var e=n.decoder.end();
e&&e.length&&t.push(e)
}
t.push(null)
}
)), e.on("data", (function(i) {
  a("wrapped data"), 
n.decoder&&(i=n.decoder.write(i)), n.objectMode&&null==i||(n.objectMode||i&&i.length)&&(t.push(i)||(r=!0, e.pause()))
}
)), e)void 0===this[i]&&"function"==typeof e[i]&&(this[i]=function(t) {
  return function() {
  return e[t].apply(e, arguments)
}
}
(i))
;
for(var s=0;
s<w.length;
s++)e.on(w[s], this.emit.bind(this, w[s]));
return this._read=function(t) {
  a("wrapped _read", t), r&&(r=!1, e.resume())
}
, this
}
, "function"==typeof Symbol&&(T.prototype[Symbol.asyncIterator]=function() {
  return void 0===d&&(d=n(2955)), 
d(this)
}
), Object.defineProperty(T.prototype, "readableHighWaterMark",  {
  enumerable:!1, get:function() {
  return this._readableState.highWaterMark
}
}
), Object.defineProperty(T.prototype, "readableBuffer",  {
  enumerable:!1, get:function() {
return this._readableState&&this._readableState.buffer
}
}
), Object.defineProperty(T.prototype, "readableFlowing",  {
  enumerable:!1, get:function() {
  return this._readableState.flowing
}
, set:function(e) {
  this._readableState&&(this._readableState.flowing=e)
}
}
), 
T._fromList=U, Object.defineProperty(T.prototype, "readableLength",  {
  enumerable:!1, get:function() {
  return this._readableState.length
}
}
), "function"==typeof Symbol&&(T.from=function(e, t) {
  return void 0===p&&(p=n(5157)), p(T, e, t)
}
)
}
, 5543:function(e, t) {
  var n
;
n=function() {
  return function() {
  var e=n;
e.Integer= {
  type:"integer"
}
;
var t= {
  String, Boolean, Number, Object, Array, Date
}
;
function n(e, t) {
  return n(e, t,  {
  changing:!1
}
)
}
e.validate=n, e.checkPropertyChange=function(e, t, r) {
  return n(e, t,  {
  changing:r||"property"
}
)
}
;
var n=e._validate=function(e, n, r) {
  r||(r= {
}
);
var i=r.changing;
function a(e) {
  return e.type||t[e.name]==e&&e.name.toLowerCase()
}
var s=[];
function o(e, t, n, l) {
  var c;
function u(e) {
  s.push( {
  property:n, message:e
}
)
}
if(n+=n?"number"==typeof l?"["+l+"]":void 0===l?"":"."+l:l, 
("object"!=typeof t||t instanceof Array)&&(n||"function"!=typeof t)&&(!t||!a(t)))return"function"==typeof t?e instanceof t||u("is not an instance of the class/constructor "+t.name):t&&u("Invalid schema/property definition "+t), null;
function h(e, t) {
if(e) {
  if(!("string"!=typeof e||"any"==e||("null"==e?null===t:typeof t==e)||t instanceof Array&&"array"==e||t instanceof Date&&"date"==e||"integer"==e&&t%1==0))return[ {
  property:n, message:t+" - "+typeof t+" value found,  but a "+e+" is required"
}
]
;
if(e instanceof Array) {
  for(var r=[], i=0;
i<e.length&&(r=h(e[i], t)).length;
i++);
if(r.length)return r
}
else if("object"==typeof e) {
  var a=s;
s=[], o(t, e, n);
var l=s;
return s=a, l
}
}
return[]
}
if(i&&t.readonly&&u("is a readonly field,  it can not be changed"), 
t.extends&&o(e, t.extends, n, l), void 0===e)t.required&&u("is missing and it is required");
else if(s=s.concat(h(a(t), e)), t.disallow&&!h(t.disallow, e).length&&u(" disallowed value was matched"), null!==e) {
  if(e instanceof Array) {
  if(t.items) {
var d=t.items instanceof Array, p=t.items;
for(l=0, c=e.length;
l<c;
l+=1)d&&(p=t.items[l]), r.coerce&&(e[l]=r.coerce(e[l], p)), s.concat(o(e[l], p, n, l))
}
t.minItems&&e.length<t.minItems&&u("There must be a minimum of "+t.minItems+" in the array"), 
t.maxItems&&e.length>t.maxItems&&u("There must be a maximum of "+t.maxItems+" in the array")
}
else(t.properties||t.additionalProperties)&&s.concat(function(e, t, n, a) {
  if("object"==typeof t)for(var l in("object"!=typeof e||e instanceof Array)&&s.push( {
property:n, message:"an object is required"
}
), t)if(t.hasOwnProperty(l)&&"__proto__"!=l&&"constructor"!=l) {
  var c=e.hasOwnProperty(l)?e[l]:void 0;
if(void 0===c&&r.existingOnly)continue;
var u=t[l];
void 0===c&&u.default&&(c=e[l]=u.default), 
r.coerce&&l in e&&(c=e[l]=r.coerce(c, u)), o(c, u, n, l)
}
for(l in e) {
  if(e.hasOwnProperty(l)&&("_"!=l.charAt(0)||"_"!=l.charAt(1))&&t&&!t[l]&&!1===a) {
  if(r.filter) {
  delete e[l];
continue
}
s.push( {
  property:n, 
message:"The property "+l+" is not defined in the schema and the schema does not allow additional properties"
}
)
}
var h=t&&t[l]&&t[l].requires;
h&&!(h in e)&&s.push( {
  property:n, 
message:"the presence of the property "+l+" requires that "+h+" also be present"
}
), c=e[l], !a||t&&"object"==typeof t&&l in t||(r.coerce&&(c=e[l]=r.coerce(c, a)), o(c, a, n, l)), !i&&c&&c.$schema&&(s=s.concat(o(c, c.$schema, n, l)))
}
return s
}
(e, t.properties, n, t.additionalProperties));
if(t.pattern&&"string"==typeof e&&!e.match(t.pattern)&&u("does not match the regex pattern "+t.pattern), 
t.maxLength&&"string"==typeof e&&e.length>t.maxLength&&u("may only be "+t.maxLength+" characters long"), t.minLength&&"string"==typeof e&&e.length<t.minLength&&u("must be at least "+t.minLength+" characters long"), 
void 0!==t.minimum&&typeof e==typeof t.minimum&&t.minimum>e&&u("must have a minimum value of "+t.minimum), void 0!==t.maximum&&typeof e==typeof t.maximum&&t.maximum<e&&u("must have a maximum value of "+t.maximum), t.enum) {
  var f, m=t.enum;
c=m.length
;
for(var g=0;
g<c;
g++)if(m[g]===e) {
  f=1;
break
}
f||u("does not have a value in the enumeration "+m.join(",  "))
}
"number"==typeof t.maxDecimal&&e.toString().match(new RegExp("\\.[0-9] {
  "+(t.maxDecimal+1)+", 
}
"))&&u("may only have "+t.maxDecimal+" digits of decimal places")
}
return null
}
return n&&o(e, n, "", i||""), !i&&e&&e.$schema&&o(e, e.$schema, "", ""),  {
valid:!s.length, errors:s
}
}
;
return e.mustBeValid=function(e) {
  if(!e.valid)throw new TypeError(e.errors.map((function(e) {
  return"for property "+e.property+": "+e.message
}
)).join(",  \n"))
}
, e
}
()
}
.apply(t, []), void 0===n||(e.exports=n)
}
, 5602:e=> {
  "use strict"
;
e.exports='["struct", \r\n    ["vertexcount", "ushort"], \r\n    ["facecount", "ushort"], \r\n    ["xpos", ["array", ["ref", "vertexcount"], "short"]], \r\n    ["ypos", ["array", ["ref", "vertexcount"], "short"]], \r\n    ["zpos", ["array", ["ref", "vertexcount"], "short"]], \r\n    ["faces", ["chunkedarray", ["ref", "facecount"], [\r\n        ["$nverts", "ubyte"]\r\n    ], [\r\n        ["color", "ushort"]\r\n    ], [\r\n        ["backcolor", "ushort"]\r\n    ], [\r\n        ["intensity", "ubyte"]\r\n    ], [\r\n        ["verts", ["array", ["ref", "$nverts"], ["match", ["ref", "vertexcount"],  {
  \r\n            "<256":"ubyte", \r\n            "other":"ushort"\r\n        
}
]]]\r\n    ]]]\r\n]'
}
, 5606:e=> {
  var t, n, r=e.exports= {
}
;
function i() {
  throw new Error("setTimeout has not been defined")
}
function a() {
  throw new Error("clearTimeout has not been defined")
}
function s(e) {
  if(t===setTimeout)return setTimeout(e, 0)
;
if((t===i||!t)&&setTimeout)return t=setTimeout, setTimeout(e, 0);
try {
  return t(e, 0)
}
catch(n) {
  try {
  return t.call(null, e, 0)
}
catch(n) {
  return t.call(this, e, 0)
}
}
}
!function() {
  try {
  t="function"==typeof setTimeout?setTimeout:i
}
catch(e) {
  t=i
}
try {
n="function"==typeof clearTimeout?clearTimeout:a
}
catch(e) {
  n=a
}
}
();
var o, l=[], c=!1, u=-1;
function h() {
  c&&o&&(c=!1, o.length?l=o.concat(l):u=-1, l.length&&d())
}
function d() {
  if(!c) {
  var e=s(h);
c=!0;
for(var t=l.length;
t;
) {
  for(o=l, l=[];
++u<t;
)o&&o[u].run()
;
u=-1, t=l.length
}
o=null, c=!1, function(e) {
  if(n===clearTimeout)return clearTimeout(e);
if((n===a||!n)&&clearTimeout)return n=clearTimeout, clearTimeout(e);
try {
  return n(e)
}
catch(t) {
  try {
  return n.call(null, e)
}
catch(t) {
  return n.call(this, e)
}
}
}
(e)
}
}
function p(e, t) {
  this.fun=e, this.array=t
}
function f() {
}
r.nextTick=function(e) {
  var t=new Array(arguments.length-1);
if(arguments.length>1)for(var n=1;
n<arguments.length;
n++)t[n-1]=arguments[n];
l.push(new p(e, t)), 1!==l.length||c||s(d)
}
, 
p.prototype.run=function() {
  this.fun.apply(null, this.array)
}
, r.title="browser", r.browser=!0, r.env= {
}
, r.argv=[], r.version="", r.versions= {
}
, r.on=f, r.addListener=f, r.once=f, r.off=f, r.removeListener=f, r.removeAllListeners=f, r.emit=f, r.prependListener=f, 
r.prependOnceListener=f, r.listeners=function(e) {
  return[]
}
, r.binding=function(e) {
  throw new Error("process.binding is not supported")
}
, r.cwd=function() {
  return"/"
}
, r.chdir=function(e) {
  throw new Error("process.chdir is not supported")
}
, 
r.umask=function() {
  return 0
}

