// Module ID: 3918
// Category: property-descriptor
// Size: 9139 bytes
// Parameters: e,t,n

"use strict";
var r=n(5606);
function i(e, t) {
  var n=Object.keys(e);
if(Object.getOwnPropertySymbols) {
  var r=Object.getOwnPropertySymbols(e);
t&&(r=r.filter((function(t) {
  return Object.getOwnPropertyDescriptor(e, t).enumerable
}
))), 
n.push.apply(n, r)
}
return n
}
function a(e) {
  for(var t=1;
t<arguments.length;
t++) {
  var n=null!=arguments[t]?arguments[t]: {
}
;
t%2?i(Object(n), !0).forEach((function(t) {
  var r, i, a;
r=e, i=t, a=n[t], (i=o(i))in r?Object.defineProperty(r, i,  {
  value:a, enumerable:!0, 
configurable:!0, writable:!0
}
):r[i]=a
}
)):Object.getOwnPropertyDescriptors?Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t) {
  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
}
))
}
return e
}
function s(e, t) {
  for(var n=0;
n<t.length;
n++) {
  var r=t[n];
r.enumerable=r.enumerable||!1, r.configurable=!0, "value"in r&&(r.writable=!0), Object.defineProperty(e, o(r.key), r)
}
}
function o(e) {
  var t=function(e) {
  if("object"!==m(e)||null===e)return e
;
var t=e[Symbol.toPrimitive];
if(void 0!==t) {
  var n=t.call(e, "string");
if("object"!==m(n))return n;
throw new TypeError("@@toPrimitive must return a primitive value.")
}
return String(e)
}
(e);
return"symbol"===m(t)?t:String(t)
}
function l(e, t) {
if(t&&("object"===m(t)||"function"==typeof t))return t;
if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");
return c(e)
}
function c(e) {
if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
return e
}
function u(e) {
  var t="function"==typeof Map?new Map:void 0;
return u=function(e) {
  if(null===e||(n=e, 
-1===Function.toString.call(n).indexOf("[native code]")))return e;
var n;
if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");
if(void 0!==t) {
  if(t.has(e))return t.get(e);
t.set(e, r)
}
function r() {
return h(e, arguments, f(this).constructor)
}
return r.prototype=Object.create(e.prototype,  {
  constructor: {
  value:r, enumerable:!1, writable:!0, configurable:!0
}
}
), p(r, e)
}
, u(e)
}
function h(e, t, n) {
  return h=d()?Reflect.construct.bind():function(e, t, n) {
var r=[null];
r.push.apply(r, t);
var i=new(Function.bind.apply(e, r));
return n&&p(i, n.prototype), i
}
, h.apply(null, arguments)
}
function d() {
  if("undefined"==typeof Reflect||!Reflect.construct)return!1;
if(Reflect.construct.sham)return!1
;
if("function"==typeof Proxy)return!0;
try {
  return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {
}
))), !0
}
catch(e) {
  return!1
}
}
function p(e, t) {
  return p=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e, t) {
return e.__proto__=t, e
}
, p(e, t)
}
function f(e) {
  return f=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e) {
  return e.__proto__||Object.getPrototypeOf(e)
}
, f(e)
}
function m(e) {
return m="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e) {
  return typeof e
}
:function(e) {
  return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e
}
, m(e)
}
var g=n(537).inspect, _=n(9597).codes.ERR_INVALID_ARG_TYPE;
function v(e, t, n) {
  return(void 0===n||n>e.length)&&(n=e.length), e.substring(n-t.length, n)===t
}
var y="", b="", x="", E="", w= {
  deepStrictEqual:"Expected values to be strictly deep-equal:", 
strictEqual:"Expected values to be strictly equal:", strictEqualObject:'Expected "actual" to be reference-equal to "expected":', deepEqual:"Expected values to be loosely deep-equal:", equal:"Expected values to be loosely equal:", 
notDeepStrictEqual:'Expected "actual" not to be strictly deep-equal to:', notStrictEqual:'Expected "actual" to be strictly unequal to:', notStrictEqualObject:'Expected "actual" not to be reference-equal to "expected":', 
notDeepEqual:'Expected "actual" not to be loosely deep-equal to:', notEqual:'Expected "actual" to be loosely unequal to:', notIdentical:"Values identical but not reference-equal:"
}
;
function S(e) {
var t=Object.keys(e), n=Object.create(Object.getPrototypeOf(e));
return t.forEach((function(t) {
  n[t]=e[t]
}
)), Object.defineProperty(n, "message",  {
  value:e.message
}
), n
}
function T(e) {
  return g(e,  {
  compact:!1, customInspect:!1, depth:1e3, maxArrayLength:1/0, 
showHidden:!1, breakLength:1/0, showProxy:!1, sorted:!0, getters:!0
}
)
}
var A=function(e, t) {
  !function(e, t) {
  if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function")
;
e.prototype=Object.create(t&&t.prototype,  {
  constructor: {
  value:e, writable:!0, configurable:!0
}
}
), Object.defineProperty(e, "prototype",  {
  writable:!1
}
), t&&p(e, t)
}
(A, e);
var n, i, o, u, h=(n=A, i=d(), function() {
  var e, t=f(n);
if(i) {
  var r=f(this).constructor
;
e=Reflect.construct(t, arguments, r)
}
else e=t.apply(this, arguments);
return l(this, e)
}
);
function A(e) {
  var t;
if(function(e, t) {
  if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")
}
(this, A), 
"object"!==m(e)||null===e)throw new _("options", "Object", e);
var n=e.message, i=e.operator, a=e.stackStartFn, s=e.actual, o=e.expected, u=Error.stackTraceLimit;
if(Error.stackTraceLimit=0, 
null!=n)t=h.call(this, String(n));
else if(r.stderr&&r.stderr.isTTY&&(r.stderr&&r.stderr.getColorDepth&&1!==r.stderr.getColorDepth()?(y="\x1b[34m", b="\x1b[32m", E="\x1b[39m", x="\x1b[31m"):(y="", b="", E="", x="")), 
"object"===m(s)&&null!==s&&"object"===m(o)&&null!==o&&"stack"in s&&s instanceof Error&&"stack"in o&&o instanceof Error&&(s=S(s), o=S(o)), "deepStrictEqual"===i||"strictEqual"===i)t=h.call(this, function(e, t, n) {
var i="", a="", s=0, o="", l=!1, c=T(e), u=c.split("\n"), h=T(t).split("\n"), d=0, p="";
if("strictEqual"===n&&"object"===m(e)&&"object"===m(t)&&null!==e&&null!==t&&(n="strictEqualObject"), 1===u.length&&1===h.length&&u[0]!==h[0]) {
  var f=u[0].length+h[0].length
;
if(f<=10) {
  if(!("object"===m(e)&&null!==e||"object"===m(t)&&null!==t||0===e&&0===t))return"".concat(w[n], "\n\n")+"".concat(u[0], " !== ").concat(h[0], "\n")
}
else if("strictEqualObject"!==n&&f<(r.stderr&&r.stderr.isTTY?r.stderr.columns:80)) {
for(;
u[0][d]===h[0][d];
)d++;
d>2&&(p="\n  ".concat(function(e, t) {
  if(t=Math.floor(t), 0==e.length||0==t)return"";
var n=e.length*t;
for(t=Math.floor(Math.log(t)/Math.log(2));
t;
)e+=e, t--;
return e+e.substring(0, n-e.length)
}
(" ", d), "^"), d=0)
}
}
for(var g=u[u.length-1], _=h[h.length-1];
g===_&&(d++<2?o="\n  ".concat(g).concat(o):i=g, u.pop(), h.pop(), 0!==u.length&&0!==h.length);
)g=u[u.length-1], _=h[h.length-1];
var S=Math.max(u.length, h.length);
if(0===S) {
  var A=c.split("\n")
;
if(A.length>30)for(A[26]="".concat(y, "...").concat(E);
A.length>27;
)A.pop();
return"".concat(w.notIdentical, "\n\n").concat(A.join("\n"), "\n")
}
d>3&&(o="\n".concat(y, "...").concat(E).concat(o), l=!0), ""!==i&&(o="\n  ".concat(i).concat(o), i="")
;
var C=0, M=w[n]+"\n".concat(b, "+ actual").concat(E, " ").concat(x, "- expected").concat(E), I=" ".concat(y, "...").concat(E, " Lines skipped");
for(d=0;
d<S;
d++) {
  var R=d-s;
if(u.length<d+1)R>1&&d>2&&(R>4?(a+="\n".concat(y, "...").concat(E), 
l=!0):R>3&&(a+="\n  ".concat(h[d-2]), C++), a+="\n  ".concat(h[d-1]), C++), s=d, i+="\n".concat(x, "-").concat(E, " ").concat(h[d]), C++;
else if(h.length<d+1)R>1&&d>2&&(R>4?(a+="\n".concat(y, "...").concat(E), l=!0):R>3&&(a+="\n  ".concat(u[d-2]), C++), 
a+="\n  ".concat(u[d-1]), C++), s=d, a+="\n".concat(b, "+").concat(E, " ").concat(u[d]), C++;
else {
  var k=h[d], N=u[d], D=N!==k&&(!v(N, ", ")||N.slice(0, -1)!==k);
D&&v(k, ", ")&&k.slice(0, -1)===N&&(D=!1, N+=", "), D?(R>1&&d>2&&(R>4?(a+="\n".concat(y, "...").concat(E), 
l=!0):R>3&&(a+="\n  ".concat(u[d-2]), C++), a+="\n  ".concat(u[d-1]), C++), s=d, a+="\n".concat(b, "+").concat(E, " ").concat(N), i+="\n".concat(x, "-").concat(E, " ").concat(k), C+=2):(a+=i, i="", 1!==R&&0!==d||(a+="\n  ".concat(N), C++))
}
if(C>20&&d<S-2)return"".concat(M).concat(I, "\n").concat(a, "\n").concat(y, "...").concat(E).concat(i, "\n")+"".concat(y, "...").concat(E)
}
return"".concat(M).concat(l?I:"", "\n").concat(a).concat(i).concat(o).concat(p)
}
(s, o, i));
else if("notDeepStrictEqual"===i||"notStrictEqual"===i) {
  var d=w[i], p=T(s).split("\n");
if("notStrictEqual"===i&&"object"===m(s)&&null!==s&&(d=w.notStrictEqualObject), p.length>30)for(p[26]="".concat(y, "...").concat(E);
p.length>27;
)p.pop()
;
t=1===p.length?h.call(this, "".concat(d, " ").concat(p[0])):h.call(this, "".concat(d, "\n\n").concat(p.join("\n"), "\n"))
}
else {
  var f=T(s), g="", C=w[i]
;
"notDeepEqual"===i||"notEqual"===i?(f="".concat(w[i], "\n\n").concat(f)).length>1024&&(f="".concat(f.slice(0, 1021), "...")):(g="".concat(T(o)), f.length>512&&(f="".concat(f.slice(0, 509), "...")), g.length>512&&(g="".concat(g.slice(0, 509), "...")), 
"deepEqual"===i||"equal"===i?f="".concat(C, "\n\n").concat(f, "\n\nshould equal\n\n"):g=" ".concat(i, " ").concat(g)), t=h.call(this, "".concat(f).concat(g))
}
return Error.stackTraceLimit=u, t.generatedMessage=!n, Object.defineProperty(c(t), "name",  {
value:"AssertionError [ERR_ASSERTION]", enumerable:!1, writable:!0, configurable:!0
}
), t.code="ERR_ASSERTION", t.actual=s, t.expected=o, t.operator=i, Error.captureStackTrace&&Error.captureStackTrace(c(t), a), t.stack, t.name="AssertionError", l(t)
}
return o=A, 
(u=[ {
  key:"toString", value:function() {
  return"".concat(this.name, " [").concat(this.code, "]: ").concat(this.message)
}
}
,  {
  key:t, value:function(e, t) {
  return g(this, a(a( {
}
, t),  {
}
,  {
  customInspect:!1, depth:0
}
))
}
}
])&&s(o.prototype, u), 
Object.defineProperty(o, "prototype",  {
  writable:!1
}
), A
}
(u(Error), g.custom);
e.exports=A
