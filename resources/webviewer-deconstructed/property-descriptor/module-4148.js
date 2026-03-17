// Module ID: 4148
// Category: property-descriptor
// Size: 8897 bytes
// Parameters: e,t,n

"use strict";
var r=n(5606);
function i(e) {
return i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e) {
  return typeof e
}
:function(e) {
  return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e
}
, i(e)
}
function a(e, t) {
for(var n=0;
n<t.length;
n++) {
  var r=t[n];
r.enumerable=r.enumerable||!1, r.configurable=!0, "value"in r&&(r.writable=!0), Object.defineProperty(e, s(r.key), r)
}
}
function s(e) {
  var t=function(e) {
  if("object"!==i(e)||null===e)return e;
var t=e[Symbol.toPrimitive]
;
if(void 0!==t) {
  var n=t.call(e, "string");
if("object"!==i(n))return n;
throw new TypeError("@@toPrimitive must return a primitive value.")
}
return String(e)
}
(e);
return"symbol"===i(t)?t:String(t)
}
var o, l, c=n(9597).codes, u=c.ERR_AMBIGUOUS_ARGUMENT, h=c.ERR_INVALID_ARG_TYPE, d=c.ERR_INVALID_ARG_VALUE, p=c.ERR_INVALID_RETURN_VALUE, f=c.ERR_MISSING_ARGS, m=n(3918), g=n(537).inspect, _=n(537).types, v=_.isPromise, y=_.isRegExp, b=n(9133)(), x=n(9394)(), E=n(8075)("RegExp.prototype.test")
;
function w() {
  var e=n(2299);
o=e.isDeepEqual, l=e.isDeepStrictEqual
}
new Map;
var S=!1, T=e.exports=I, A= {
}
;
function C(e) {
  if(e.message instanceof Error)throw e.message;
throw new m(e)
}
function M(e, t, n, r) {
  if(!n) {
  var i=!1;
if(0===t)i=!0, 
r="No value argument passed to `assert.ok()`";
else if(r instanceof Error)throw r;
var a=new m( {
  actual:n, expected:!0, message:r, operator:"==", stackStartFn:e
}
);
throw a.generatedMessage=i, a
}
}
function I() {
for(var e=arguments.length, t=new Array(e), n=0;
n<e;
n++)t[n]=arguments[n];
M.apply(void 0, [I, t.length].concat(t))
}
T.fail=function e(t, n, i, a, s) {
  var o, l=arguments.length;
if(0===l?o="Failed":1===l?(i=t, t=void 0):(!1===S&&(S=!0, 
(r.emitWarning?r.emitWarning:console.warn.bind(console))("assert.fail() with more than one argument is deprecated. Please use assert.strictEqual() instead or only pass a message.", "DeprecationWarning", "DEP0094")), 2===l&&(a="!=")), 
i instanceof Error)throw i;
var c= {
  actual:t, expected:n, operator:void 0===a?"fail":a, stackStartFn:s||e
}
;
void 0!==i&&(c.message=i);
var u=new m(c);
throw o&&(u.message=o, u.generatedMessage=!0), u
}
, T.AssertionError=m, T.ok=I, T.equal=function e(t, n, r) {
if(arguments.length<2)throw new f("actual", "expected");
t!=n&&C( {
  actual:t, expected:n, message:r, operator:"==", stackStartFn:e
}
)
}
, T.notEqual=function e(t, n, r) {
  if(arguments.length<2)throw new f("actual", "expected");
t==n&&C( {
  actual:t, expected:n, message:r, 
operator:"!=", stackStartFn:e
}
)
}
, T.deepEqual=function e(t, n, r) {
  if(arguments.length<2)throw new f("actual", "expected");
void 0===o&&w(), o(t, n)||C( {
  actual:t, expected:n, message:r, operator:"deepEqual", stackStartFn:e
}
)
}
, T.notDeepEqual=function e(t, n, r) {
if(arguments.length<2)throw new f("actual", "expected");
void 0===o&&w(), o(t, n)&&C( {
  actual:t, expected:n, message:r, operator:"notDeepEqual", stackStartFn:e
}
)
}
, T.deepStrictEqual=function e(t, n, r) {
  if(arguments.length<2)throw new f("actual", "expected")
;
void 0===o&&w(), l(t, n)||C( {
  actual:t, expected:n, message:r, operator:"deepStrictEqual", stackStartFn:e
}
)
}
, T.notDeepStrictEqual=function e(t, n, r) {
  if(arguments.length<2)throw new f("actual", "expected");
void 0===o&&w(), l(t, n)&&C( {
  actual:t, expected:n, 
message:r, operator:"notDeepStrictEqual", stackStartFn:e
}
)
}
, T.strictEqual=function e(t, n, r) {
  if(arguments.length<2)throw new f("actual", "expected");
x(t, n)||C( {
  actual:t, expected:n, message:r, operator:"strictEqual", stackStartFn:e
}
)
}
, 
T.notStrictEqual=function e(t, n, r) {
  if(arguments.length<2)throw new f("actual", "expected");
x(t, n)&&C( {
  actual:t, expected:n, message:r, operator:"notStrictEqual", stackStartFn:e
}
)
}
;
var R=function(e, t, n) {
  return t&&a(e.prototype, t), n&&a(e, n), 
Object.defineProperty(e, "prototype",  {
  writable:!1
}
), e
}
((function e(t, n, r) {
  var i=this;
!function(e, t) {
  if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")
}
(this, e), n.forEach((function(e) {
e in t&&(void 0!==r&&"string"==typeof r[e]&&y(t[e])&&E(t[e], r[e])?i[e]=r[e]:i[e]=t[e])
}
))
}
));
function k(e, t, n, r) {
  if("function"!=typeof t) {
  if(y(t))return E(t, e);
if(2===arguments.length)throw new h("expected", ["Function", "RegExp"], t)
;
if("object"!==i(e)||null===e) {
  var a=new m( {
  actual:e, expected:t, message:n, operator:"deepStrictEqual", stackStartFn:r
}
);
throw a.operator=r.name, a
}
var s=Object.keys(t)
;
if(t instanceof Error)s.push("name", "message");
else if(0===s.length)throw new d("error", t, "may not be an empty object");
return void 0===o&&w(), s.forEach((function(i) {
  "string"==typeof e[i]&&y(t[i])&&E(t[i], e[i])||function(e, t, n, r, i, a) {
if(!(n in e)||!l(e[n], t[n])) {
  if(!r) {
  var s=new R(e, i), o=new R(t, i, e), c=new m( {
  actual:s, expected:o, operator:"deepStrictEqual", stackStartFn:a
}
);
throw c.actual=e, c.expected=t, c.operator=a.name, c
}
C( {
  actual:e, expected:t, message:r, operator:a.name, 
stackStartFn:a
}
)
}
}
(e, t, i, n, s, r)
}
)), !0
}
return void 0!==t.prototype&&e instanceof t||!Error.isPrototypeOf(t)&&!0===t.call( {
}
, e)
}
function N(e) {
  if("function"!=typeof e)throw new h("fn", "Function", e);
try {
  e()
}
catch(e) {
  return e
}
return A
}
function D(e) {
return v(e)||null!==e&&"object"===i(e)&&"function"==typeof e.then&&"function"==typeof e.catch
}
function L(e) {
  return Promise.resolve().then((function() {
  var t;
if("function"==typeof e) {
  if(!D(t=e()))throw new p("instance of Promise", "promiseFn", t)
}
else {
if(!D(e))throw new h("promiseFn", ["Function", "Promise"], e);
t=e
}
return Promise.resolve().then((function() {
  return t
}
)).then((function() {
  return A
}
)).catch((function(e) {
  return e
}
))
}
))
}
function O(e, t, n, r) {
  if("string"==typeof n) {
if(4===arguments.length)throw new h("error", ["Object", "Error", "Function", "RegExp"], n);
if("object"===i(t)&&null!==t) {
  if(t.message===n)throw new u("error/message", 'The error message "'.concat(t.message, '" is identical to the message.'))
}
else if(t===n)throw new u("error/message", 'The error "'.concat(t, '" is identical to the message.'));
r=n, n=void 0
}
else if(null!=n&&"object"!==i(n)&&"function"!=typeof n)throw new h("error", ["Object", "Error", "Function", "RegExp"], n);
if(t===A) {
  var a=""
;
n&&n.name&&(a+=" (".concat(n.name, ")")), a+=r?": ".concat(r):".";
var s="rejects"===e.name?"rejection":"exception";
C( {
  actual:void 0, expected:n, operator:e.name, message:"Missing expected ".concat(s).concat(a), stackStartFn:e
}
)
}
if(n&&!k(t, n, r, e))throw t
}
function P(e, t, n, r) {
  if(t!==A) {
  if("string"==typeof n&&(r=n, n=void 0), !n||k(t, n)) {
  var i=r?": ".concat(r):".", a="doesNotReject"===e.name?"rejection":"exception";
C( {
  actual:t, expected:n, operator:e.name, 
message:"Got unwanted ".concat(a).concat(i, "\n")+'Actual message: "'.concat(t&&t.message, '"'), stackStartFn:e
}
)
}
throw t
}
}
function F(e, t, n, r, a) {
  if(!y(t))throw new h("regexp", "RegExp", t);
var s="match"===a;
if("string"!=typeof e||E(t, e)!==s) {
if(n instanceof Error)throw n;
var o=!n
;
n=n||("string"!=typeof e?'The "string" argument must be of type string. Received type '+"".concat(i(e), " (").concat(g(e), ")"):(s?"The input did not match the regular expression ":"The input was expected to not match the regular expression ")+"".concat(g(t), ". Input:\n\n").concat(g(e), "\n"))
;
var l=new m( {
  actual:e, expected:t, message:n, operator:a, stackStartFn:r
}
);
throw l.generatedMessage=o, l
}
}
function U() {
  for(var e=arguments.length, t=new Array(e), n=0;
n<e;
n++)t[n]=arguments[n];
M.apply(void 0, [U, t.length].concat(t))
}
T.throws=function e(t) {
for(var n=arguments.length, r=new Array(n>1?n-1:0), i=1;
i<n;
i++)r[i-1]=arguments[i];
O.apply(void 0, [e, N(t)].concat(r))
}
, T.rejects=function e(t) {
  for(var n=arguments.length, r=new Array(n>1?n-1:0), i=1;
i<n;
i++)r[i-1]=arguments[i]
;
return L(t).then((function(t) {
  return O.apply(void 0, [e, t].concat(r))
}
))
}
, T.doesNotThrow=function e(t) {
  for(var n=arguments.length, r=new Array(n>1?n-1:0), i=1;
i<n;
i++)r[i-1]=arguments[i];
P.apply(void 0, [e, N(t)].concat(r))
}
, 
T.doesNotReject=function e(t) {
  for(var n=arguments.length, r=new Array(n>1?n-1:0), i=1;
i<n;
i++)r[i-1]=arguments[i];
return L(t).then((function(t) {
  return P.apply(void 0, [e, t].concat(r))
}
))
}
, T.ifError=function e(t) {
  if(null!=t) {
var n="ifError got unwanted exception: ";
"object"===i(t)&&"string"==typeof t.message?0===t.message.length&&t.constructor?n+=t.constructor.name:n+=t.message:n+=g(t);
var r=new m( {
  actual:t, expected:null, operator:"ifError", message:n, stackStartFn:e
}
), a=t.stack;
if("string"==typeof a) {
  var s=a.split("\n");
s.shift();
for(var o=r.stack.split("\n"), l=0;
l<s.length;
l++) {
  var c=o.indexOf(s[l]);
if(-1!==c) {
  o=o.slice(0, c);
break
}
}
r.stack="".concat(o.join("\n"), "\n").concat(s.join("\n"))
}
throw r
}
}
, 
T.match=function e(t, n, r) {
  F(t, n, r, e, "match")
}
, T.doesNotMatch=function e(t, n, r) {
  F(t, n, r, e, "doesNotMatch")
}
, T.strict=b(U, T,  {
  equal:T.strictEqual, deepEqual:T.deepStrictEqual, notEqual:T.notStrictEqual, notDeepEqual:T.notDeepStrictEqual
}
), 
T.strict.strict=T.strict
}
, 4317:e=> {
  "function"==typeof Object.create?e.exports=function(e, t) {
  t&&(e.super_=t, e.prototype=Object.create(t.prototype,  {
  constructor: {
  value:e, enumerable:!1, writable:!0, configurable:!0
}
}
))
}
:e.exports=function(e, t) {
  if(t) {
e.super_=t;
var n=function() {
}
;
n.prototype=t.prototype, e.prototype=new n, e.prototype.constructor=e
}
}

