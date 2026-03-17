// Module ID: 6942
// Category: property-descriptor
// Size: 9207 bytes
// Parameters: e,t

var n;
!function() {
  "use strict";
var r= {
}
.hasOwnProperty;
function i() {
  for(var e="", t=0;
t<arguments.length;
t++) {
  var n=arguments[t];
n&&(e=s(e, a(n)))
}
return e
}
function a(e) {
  if("string"==typeof e||"number"==typeof e)return e
;
if("object"!=typeof e)return"";
if(Array.isArray(e))return i.apply(null, e);
if(e.toString!==Object.prototype.toString&&!e.toString.toString().includes("[native code]"))return e.toString();
var t="";
for(var n in e)r.call(e, n)&&e[n]&&(t=s(t, n));
return t
}
function s(e, t) {
  return t?e?e+" "+t:e+t:e
}
e.exports?(i.default=i, e.exports=i):void 0===(n=function() {
  return i
}
.apply(t, []))||(e.exports=n)
}
()
}
, 7007:e=> {
  "use strict"
;
var t, n="object"==typeof Reflect?Reflect:null, r=n&&"function"==typeof n.apply?n.apply:function(e, t, n) {
  return Function.prototype.apply.call(e, t, n)
}
;
t=n&&"function"==typeof n.ownKeys?n.ownKeys:Object.getOwnPropertySymbols?function(e) {
return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))
}
:function(e) {
  return Object.getOwnPropertyNames(e)
}
;
var i=Number.isNaN||function(e) {
  return e!=e
}
;
function a() {
  a.init.call(this)
}
e.exports=a, e.exports.once=function(e, t) {
return new Promise((function(n, r) {
  function i(n) {
  e.removeListener(t, a), r(n)
}
function a() {
  "function"==typeof e.removeListener&&e.removeListener("error", i), n([].slice.call(arguments))
}
m(e, t, a,  {
  once:!0
}
), "error"!==t&&function(e, t) {
"function"==typeof e.on&&m(e, "error", t,  {
  once:!0
}
)
}
(e, i)
}
))
}
, a.EventEmitter=a, a.prototype._events=void 0, a.prototype._eventsCount=0, a.prototype._maxListeners=void 0;
var s=10;
function o(e) {
if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e)
}
function l(e) {
  return void 0===e._maxListeners?a.defaultMaxListeners:e._maxListeners
}
function c(e, t, n, r) {
  var i, a, s, c;
if(o(n), 
void 0===(a=e._events)?(a=e._events=Object.create(null), e._eventsCount=0):(void 0!==a.newListener&&(e.emit("newListener", t, n.listener?n.listener:n), a=e._events), s=a[t]), void 0===s)s=a[t]=n, 
++e._eventsCount;
else if("function"==typeof s?s=a[t]=r?[n, s]:[s, n]:r?s.unshift(n):s.push(n), (i=l(e))>0&&s.length>i&&!s.warned) {
  s.warned=!0
;
var u=new Error("Possible EventEmitter memory leak detected. "+s.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");
u.name="MaxListenersExceededWarning", u.emitter=e, u.type=t, u.count=s.length, c=u, 
console&&console.warn&&console.warn(c)
}
return e
}
function u() {
  if(!this.fired)return this.target.removeListener(this.type, this.wrapFn), this.fired=!0, 0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target, arguments)
}
function h(e, t, n) {
  var r= {
  fired:!1, wrapFn:void 0, target:e, type:t, listener:n
}
, i=u.bind(r);
return i.listener=n, r.wrapFn=i, i
}
function d(e, t, n) {
  var r=e._events;
if(void 0===r)return[];
var i=r[t]
;
return void 0===i?[]:"function"==typeof i?n?[i.listener||i]:[i]:n?function(e) {
  for(var t=new Array(e.length), n=0;
n<t.length;
++n)t[n]=e[n].listener||e[n];
return t
}
(i):f(i, i.length)
}
function p(e) {
  var t=this._events;
if(void 0!==t) {
  var n=t[e]
;
if("function"==typeof n)return 1;
if(void 0!==n)return n.length
}
return 0
}
function f(e, t) {
  for(var n=new Array(t), r=0;
r<t;
++r)n[r]=e[r];
return n
}
function m(e, t, n, r) {
  if("function"==typeof e.on)r.once?e.once(t, n):e.on(t, n);
else {
if("function"!=typeof e.addEventListener)throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof e);
e.addEventListener(t, (function i(a) {
  r.once&&e.removeEventListener(t, i), n(a)
}
))
}
}
Object.defineProperty(a, "defaultMaxListeners",  {
  enumerable:!0, get:function() {
  return s
}
, set:function(e) {
if("number"!=typeof e||e<0||i(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");
s=e
}
}
), a.init=function() {
void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null), this._eventsCount=0), this._maxListeners=this._maxListeners||void 0
}
, a.prototype.setMaxListeners=function(e) {
if("number"!=typeof e||e<0||i(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");
return this._maxListeners=e, this
}
, a.prototype.getMaxListeners=function() {
  return l(this)
}
, 
a.prototype.emit=function(e) {
  for(var t=[], n=1;
n<arguments.length;
n++)t.push(arguments[n]);
var i="error"===e, a=this._events;
if(void 0!==a)i=i&&void 0===a.error;
else if(!i)return!1;
if(i) {
  var s;
if(t.length>0&&(s=t[0]), s instanceof Error)throw s
;
var o=new Error("Unhandled error."+(s?" ("+s.message+")":""));
throw o.context=s, o
}
var l=a[e];
if(void 0===l)return!1;
if("function"==typeof l)r(l, this, t);
else {
  var c=l.length, u=f(l, c);
for(n=0;
n<c;
++n)r(u[n], this, t)
}
return!0
}
, 
a.prototype.addListener=function(e, t) {
  return c(this, e, t, !1)
}
, a.prototype.on=a.prototype.addListener, a.prototype.prependListener=function(e, t) {
  return c(this, e, t, !0)
}
, a.prototype.once=function(e, t) {
  return o(t), this.on(e, h(this, e, t)), this
}
, 
a.prototype.prependOnceListener=function(e, t) {
  return o(t), this.prependListener(e, h(this, e, t)), this
}
, a.prototype.removeListener=function(e, t) {
  var n, r, i, a, s;
if(o(t), void 0===(r=this._events))return this;
if(void 0===(n=r[e]))return this
;
if(n===t||n.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete r[e], r.removeListener&&this.emit("removeListener", e, n.listener||t));
else if("function"!=typeof n) {
  for(i=-1, 
a=n.length-1;
a>=0;
a--)if(n[a]===t||n[a].listener===t) {
  s=n[a].listener, i=a;
break
}
if(i<0)return this;
0===i?n.shift():function(e, t) {
  for(;
t+1<e.length;
t++)e[t]=e[t+1];
e.pop()
}
(n, i), 1===n.length&&(r[e]=n[0]), 
void 0!==r.removeListener&&this.emit("removeListener", e, s||t)
}
return this
}
, a.prototype.off=a.prototype.removeListener, a.prototype.removeAllListeners=function(e) {
  var t, n, r;
if(void 0===(n=this._events))return this
;
if(void 0===n.removeListener)return 0===arguments.length?(this._events=Object.create(null), this._eventsCount=0):void 0!==n[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete n[e]), this;
if(0===arguments.length) {
  var i, a=Object.keys(n)
;
for(r=0;
r<a.length;
++r)"removeListener"!==(i=a[r])&&this.removeAllListeners(i);
return this.removeAllListeners("removeListener"), this._events=Object.create(null), this._eventsCount=0, this
}
if("function"==typeof(t=n[e]))this.removeListener(e, t);
else if(void 0!==t)for(r=t.length-1;
r>=0;
r--)this.removeListener(e, t[r]);
return this
}
, a.prototype.listeners=function(e) {
  return d(this, e, !0)
}
, a.prototype.rawListeners=function(e) {
return d(this, e, !1)
}
, a.listenerCount=function(e, t) {
  return"function"==typeof e.listenerCount?e.listenerCount(t):p.call(e, t)
}
, a.prototype.listenerCount=p, a.prototype.eventNames=function() {
  return this._eventsCount>0?t(this._events):[]
}
}
, 7119:e=> {
"use strict";
e.exports="undefined"!=typeof Reflect&&Reflect&&Reflect.apply
}
, 7135:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["version", "ubyte"], \r\n\t["width", "ushort"], \r\n\t["height", "ushort"], \r\n\t["unkhead", "ushort"], \r\n\t["elements", ["array", "ubyte", ["struct", \r\n\t\t["name", "paddedstring"], \r\n\t\t["start", "float"], \r\n\t\t["end", "float"], \r\n\t\t["flag0", "ubyte"], \r\n\t\t["graphics", ["array", ["ref", "flag0"], ["struct", \r\n\t\t\t["spritename", "paddedstring"], \r\n\t\t\t["height", "ushort"], \r\n\t\t\t["width", "ushort"], \r\n\t\t\t["unk", "ushort"], \r\n\t\t\t["spriteid", "ushort"], \r\n\t\t\t["opacityframes", ["array", "ubyte", ["tuple", "float", "float"]]], \r\n\t\t\t["rotateframes", ["array", "ubyte", ["tuple", "float", "float"]]], \r\n\t\t\t["translateframes", ["array", "ubyte", ["tuple", "float", "float", "float"]]], \r\n\t\t\t["scaleframes", ["array", "ubyte", ["tuple", "float", "float", "float"]]]\r\n\t\t]]], \r\n\t\t["flag1", "ubyte"], \r\n\t\t["sound", ["opt", "flag1!=0", "paddedstring"]], \r\n\t\t["flag2", "ubyte"], \r\n\t\t["subtitle", ["opt", "flag2!=0", "paddedstring"]], \r\n\t\t["unkbyte", ["opt", "flag0==0", "ubyte"]], \r\n\t\t["soundid", ["opt", "flag0==0", "ushort"]], \r\n\t\t["extraflags", ["match", ["ref", "flag0"],  {
  "0":"ubyte", "other":0
}
]], \r\n\t\t["extra_01", ["opt", "extraflags!=0", ["struct", ["start", "float"], ["end", "float"]]]]\r\n\t]]], \r\n\t["paddingbytes", ["buffer", ["bytesleft"], "ubyte"]]\r\n]'
}
, 7146:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":               "text",  "read": "string" 
}
, \r\n\t"0x02":  {
   "name":            "replies",  "read": ["array", "ubyte", "ushort"]
}
, \r\n\t"0x03":  {
   "name":            "inserts",  "read": ["array", "ubyte", ["struct", \r\n\t\t["type", "ushort"], \r\n\t\t["pickEnum", ["opt", ["type", 0], "ushort"]], \r\n\t\t["pickTtem", ["opt", ["type", 1], "true"]], \r\n\t\t["skillLevel", ["opt", ["type", 4], "ushort"]], \r\n\t\t["varplayerEnum", ["opt", ["type", 6], ["struct", ["enum", "ushort"], ["varbit", "ushort"]]]], \r\n\t\t["varplayer", ["opt", ["type", 8], "ushort"]], \r\n\t\t["varbit", ["opt", ["type", 9], "ushort"]], \r\n\t\t["pickTradeableItem", ["opt", ["type", 10], "true"]], \r\n\t\t["skillLevelEnum", ["opt", ["type", 11], ["struct", ["enum", "ushort"], ["skill", "ushort"]]]], \r\n\t\t["friendsChatCount", ["opt", ["type", 12], "true"]], \r\n\t\t["varWorld", ["opt", ["type", 14], "ushort"]], \r\n\t\t["combatlevel", ["opt", ["type", 15], "true"]], \r\n\t\t["varbitEnumstring", ["opt", ["type", 16], ["struct", ["enum", "ushort"], ["varbit", "ushort"]]]]\r\n\t]]
}
, \r\n\t"0x04":  {
   "name":      "nonsearchable",  "read": "true" 
}
\r\n
}
'
