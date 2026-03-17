// Module ID: 2299
// Category: unidentified
// Size: 7613 bytes
// Parameters: e,t,n

"use strict";
function r(e, t) {
  return function(e) {
  if(Array.isArray(e))return e
}
(e)||function(e, t) {
  var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];
if(null!=n) {
  var r, i, a, s, o=[], l=!0, c=!1;
try {
if(a=(n=n.call(e)).next, 0===t) {
  if(Object(n)!==n)return;
l=!1
}
else for(;
!(l=(r=a.call(n)).done)&&(o.push(r.value), o.length!==t);
l=!0);
}
catch(e) {
  c=!0, i=e
}
finally {
  try {
  if(!l&&null!=n.return&&(s=n.return(), Object(s)!==s))return
}
finally {
  if(c)throw i
}
}
return o
}
}
(e, t)||function(e, t) {
  if(e) {
  if("string"==typeof e)return i(e, t);
var n=Object.prototype.toString.call(e).slice(8, -1);
return"Object"===n&&e.constructor&&(n=e.constructor.name), 
"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?i(e, t):void 0
}
}
(e, t)||function() {
throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable,  non-array objects must have a [Symbol.iterator]() method.")
}
()
}
function i(e, t) {
  (null==t||t>e.length)&&(t=e.length)
;
for(var n=0, r=new Array(t);
n<t;
n++)r[n]=e[n];
return r
}
function a(e) {
  return a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e) {
  return typeof e
}
:function(e) {
return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e
}
, a(e)
}
var s=void 0!==/a/g.flags, o=function(e) {
  var t=[];
return e.forEach((function(e) {
  return t.push(e)
}
)), t
}
, l=function(e) {
  var t=[]
;
return e.forEach((function(e, n) {
  return t.push([n, e])
}
)), t
}
, c=Object.is?Object.is:n(7653), u=Object.getOwnPropertySymbols?Object.getOwnPropertySymbols:function() {
  return[]
}
, h=Number.isNaN?Number.isNaN:n(4133);
function d(e) {
  return e.call.bind(e)
}
var p=d(Object.prototype.hasOwnProperty), f=d(Object.prototype.propertyIsEnumerable), m=d(Object.prototype.toString), g=n(537).types, _=g.isAnyArrayBuffer, v=g.isArrayBufferView, y=g.isDate, b=g.isMap, x=g.isRegExp, E=g.isSet, w=g.isNativeError, S=g.isBoxedPrimitive, T=g.isNumberObject, A=g.isStringObject, C=g.isBooleanObject, M=g.isBigIntObject, I=g.isSymbolObject, R=g.isFloat32Array, k=g.isFloat64Array
;
function N(e) {
  if(0===e.length||e.length>10)return!0;
for(var t=0;
t<e.length;
t++) {
  var n=e.charCodeAt(t);
if(n<48||n>57)return!0
}
return 10===e.length&&e>=Math.pow(2, 32)
}
function D(e) {
return Object.keys(e).filter(N).concat(u(e).filter(Object.prototype.propertyIsEnumerable.bind(e)))
}
function L(e, t) {
  if(e===t)return 0;
for(var n=e.length, r=t.length, i=0, a=Math.min(n, r);
i<a;
++i)if(e[i]!==t[i]) {
  n=e[i], r=t[i];
break
}
return n<r?-1:r<n?1:0
}
function O(e, t, n, r) {
  if(e===t)return 0!==e||!n||c(e, t);
if(n) {
  if("object"!==a(e))return"number"==typeof e&&h(e)&&h(t);
if("object"!==a(t)||null===e||null===t)return!1;
if(Object.getPrototypeOf(e)!==Object.getPrototypeOf(t))return!1
}
else {
if(null===e||"object"!==a(e))return(null===t||"object"!==a(t))&&e==t;
if(null===t||"object"!==a(t))return!1
}
var i, o, l, u, d=m(e);
if(d!==m(t))return!1;
if(Array.isArray(e)) {
  if(e.length!==t.length)return!1;
var p=D(e), f=D(t)
;
return p.length===f.length&&F(e, t, n, r, 1, p)
}
if("[object Object]"===d&&(!b(e)&&b(t)||!E(e)&&E(t)))return!1;
if(y(e)) {
  if(!y(t)||Date.prototype.getTime.call(e)!==Date.prototype.getTime.call(t))return!1
}
else if(x(e)) {
  if(!x(t)||(l=e, u=t, 
!(s?l.source===u.source&&l.flags===u.flags:RegExp.prototype.toString.call(l)===RegExp.prototype.toString.call(u))))return!1
}
else if(w(e)||e instanceof Error) {
  if(e.message!==t.message||e.name!==t.name)return!1
}
else {
  if(v(e)) {
  if(n||!R(e)&&!k(e)) {
if(!function(e, t) {
  return e.byteLength===t.byteLength&&0===L(new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new Uint8Array(t.buffer, t.byteOffset, t.byteLength))
}
(e, t))return!1
}
else if(!function(e, t) {
  if(e.byteLength!==t.byteLength)return!1
;
for(var n=0;
n<e.byteLength;
n++)if(e[n]!==t[n])return!1;
return!0
}
(e, t))return!1;
var g=D(e), N=D(t);
return g.length===N.length&&F(e, t, n, r, 0, g)
}
if(E(e))return!(!E(t)||e.size!==t.size)&&F(e, t, n, r, 2);
if(b(e))return!(!b(t)||e.size!==t.size)&&F(e, t, n, r, 3)
;
if(_(e)) {
  if(o=t, (i=e).byteLength!==o.byteLength||0!==L(new Uint8Array(i), new Uint8Array(o)))return!1
}
else if(S(e)&&!function(e, t) {
return T(e)?T(t)&&c(Number.prototype.valueOf.call(e), Number.prototype.valueOf.call(t)):A(e)?A(t)&&String.prototype.valueOf.call(e)===String.prototype.valueOf.call(t):C(e)?C(t)&&Boolean.prototype.valueOf.call(e)===Boolean.prototype.valueOf.call(t):M(e)?M(t)&&BigInt.prototype.valueOf.call(e)===BigInt.prototype.valueOf.call(t):I(t)&&Symbol.prototype.valueOf.call(e)===Symbol.prototype.valueOf.call(t)
}
(e, t))return!1
}
return F(e, t, n, r, 0)
}
function P(e, t) {
  return t.filter((function(t) {
  return f(e, t)
}
))
}
function F(e, t, n, i, s, c) {
  if(5===arguments.length) {
  c=Object.keys(e);
var h=Object.keys(t);
if(c.length!==h.length)return!1
}
for(var d=0;
d<c.length;
d++)if(!p(t, c[d]))return!1;
if(n&&5===arguments.length) {
  var m=u(e);
if(0!==m.length) {
  var g=0;
for(d=0;
d<m.length;
d++) {
  var _=m[d];
if(f(e, _)) {
  if(!f(t, _))return!1;
c.push(_), g++
}
else if(f(t, _))return!1
}
var v=u(t)
;
if(m.length!==v.length&&P(t, v).length!==g)return!1
}
else {
  var y=u(t);
if(0!==y.length&&0!==P(t, y).length)return!1
}
}
if(0===c.length&&(0===s||1===s&&0===e.length||0===e.size))return!0;
if(void 0===i)i= {
  val1:new Map, val2:new Map, position:0
}
;
else {
var b=i.val1.get(e);
if(void 0!==b) {
  var x=i.val2.get(t);
if(void 0!==x)return b===x
}
i.position++
}
i.val1.set(e, i.position), i.val2.set(t, i.position);
var E=function(e, t, n, i, s, c) {
  var u=0;
if(2===c) {
  if(!function(e, t, n, r) {
for(var i=null, s=o(e), l=0;
l<s.length;
l++) {
  var c=s[l];
if("object"===a(c)&&null!==c)null===i&&(i=new Set), i.add(c);
else if(!t.has(c)) {
  if(n)return!1;
if(!z(e, t, c))return!1;
null===i&&(i=new Set), i.add(c)
}
}
if(null!==i) {
  for(var u=o(t), h=0;
h<u.length;
h++) {
var d=u[h];
if("object"===a(d)&&null!==d) {
  if(!U(i, d, n, r))return!1
}
else if(!n&&!e.has(d)&&!U(i, d, n, r))return!1
}
return 0===i.size
}
return!0
}
(e, t, n, s))return!1
}
else if(3===c) {
  if(!function(e, t, n, i) {
  for(var s=null, o=l(e), c=0;
c<o.length;
c++) {
var u=r(o[c], 2), h=u[0], d=u[1];
if("object"===a(h)&&null!==h)null===s&&(s=new Set), s.add(h);
else {
  var p=t.get(h);
if(void 0===p&&!t.has(h)||!O(d, p, n, i)) {
  if(n)return!1;
if(!G(e, t, h, d, i))return!1;
null===s&&(s=new Set), s.add(h)
}
}
}
if(null!==s) {
for(var f=l(t), m=0;
m<f.length;
m++) {
  var g=r(f[m], 2), _=g[0], v=g[1];
if("object"===a(_)&&null!==_) {
  if(!V(s, e, _, v, n, i))return!1
}
else if(!(n||e.has(_)&&O(e.get(_), v, !1, i)||V(s, e, _, v, !1, i)))return!1
}
return 0===s.size
}
return!0
}
(e, t, n, s))return!1
}
else if(1===c)for(;
u<e.length;
u++) {
  if(!p(e, u)) {
  if(p(t, u))return!1;
for(var h=Object.keys(e);
u<h.length;
u++) {
  var d=h[u];
if(!p(t, d)||!O(e[d], t[d], n, s))return!1
}
return h.length===Object.keys(t).length
}
if(!p(t, u)||!O(e[u], t[u], n, s))return!1
}
for(u=0;
u<i.length;
u++) {
  var f=i[u];
if(!O(e[f], t[f], n, s))return!1
}
return!0
}
(e, t, n, c, i, s);
return i.val1.delete(e), i.val2.delete(t), E
}
function U(e, t, n, r) {
  for(var i=o(e), a=0;
a<i.length;
a++) {
  var s=i[a];
if(O(t, s, n, r))return e.delete(s), !0
}
return!1
}
function B(e) {
  switch(a(e)) {
  case"undefined":return null;
case"object":return;
case"symbol":return!1;
case"string":e=+e;
case"number":if(h(e))return!1
}
return!0
}
function z(e, t, n) {
  var r=B(n);
return null!=r?r:t.has(r)&&!e.has(r)
}
function G(e, t, n, r, i) {
var a=B(n);
if(null!=a)return a;
var s=t.get(a);
return!(void 0===s&&!t.has(a)||!O(r, s, !1, i))&&!e.has(a)&&O(r, s, !1, i)
}
function V(e, t, n, r, i, a) {
  for(var s=o(e), l=0;
l<s.length;
l++) {
  var c=s[l];
if(O(n, c, i, a)&&O(r, t.get(c), i, a))return e.delete(c), !0
}
return!1
}
e.exports= {
  isDeepEqual:function(e, t) {
  return O(e, t, !1)
}
, isDeepStrictEqual:function(e, t) {
  return O(e, t, !0)
}
}
}
, 2390:e=> {
  "use strict"
;
e.exports='["struct", \r\n    ["color", "ushort"], \r\n    ["bool0", "bool"], \r\n    ["bool1", "bool"], //always true\r\n    ["spriteid", "ushort"], \r\n    ["always00", ["buffer", 6, "hex"]]\r\n]'
