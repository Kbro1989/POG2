// Module ID: 537
// Category: property-descriptor
// Size: 7866 bytes
// Parameters: e,t,n

var r=n(5606), i=Object.getOwnPropertyDescriptors||function(e) {
  for(var t=Object.keys(e), n= {
}
, r=0;
r<t.length;
r++)n[t[r]]=Object.getOwnPropertyDescriptor(e, t[r]);
return n
}
, a=/%[sdj%]/g;
t.format=function(e) {
  if(!y(e)) {
for(var t=[], n=0;
n<arguments.length;
n++)t.push(c(arguments[n]));
return t.join(" ")
}
n=1;
for(var r=arguments, i=r.length, s=String(e).replace(a, (function(e) {
  if("%%"===e)return"%";
if(n>=i)return e;
switch(e) {
  case"%s":return String(r[n++]);
case"%d":
return Number(r[n++]);
case"%j":try {
  return JSON.stringify(r[n++])
}
catch(e) {
  return"[Circular]"
}
default:return e
}
}
)), o=r[n];
n<i;
o=r[++n])_(o)||!E(o)?s+=" "+o:s+=" "+c(o);
return s
}
, t.deprecate=function(e, n) {
  if(void 0!==r&&!0===r.noDeprecation)return e
;
if(void 0===r)return function() {
  return t.deprecate(e, n).apply(this, arguments)
}
;
var i=!1;
return function() {
  if(!i) {
  if(r.throwDeprecation)throw new Error(n);
r.traceDeprecation?console.trace(n):console.error(n), i=!0
}
return e.apply(this, arguments)
}
}
;
var s= {
}
, o=/^$/;
if(r.env.NODE_DEBUG) {
  var l=r.env.NODE_DEBUG;
l=l.replace(/[|\\ {
}
()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/, /g, "$|^").toUpperCase(), o=new RegExp("^"+l+"$", "i")
}
function c(e, n) {
  var r= {
  seen:[], stylize:h
}
;
return arguments.length>=3&&(r.depth=arguments[2]), arguments.length>=4&&(r.colors=arguments[3]), g(n)?r.showHidden=n:n&&t._extend(r, n), b(r.showHidden)&&(r.showHidden=!1), b(r.depth)&&(r.depth=2), b(r.colors)&&(r.colors=!1), 
b(r.customInspect)&&(r.customInspect=!0), r.colors&&(r.stylize=u), d(r, e, r.depth)
}
function u(e, t) {
  var n=c.styles[t];
return n?"\x1b["+c.colors[n][0]+"m"+e+"\x1b["+c.colors[n][1]+"m":e
}
function h(e, t) {
  return e
}
function d(e, n, r) {
if(e.customInspect&&n&&T(n.inspect)&&n.inspect!==t.inspect&&(!n.constructor||n.constructor.prototype!==n)) {
  var i=n.inspect(r, e);
return y(i)||(i=d(e, i, r)), i
}
var a=function(e, t) {
  if(b(t))return e.stylize("undefined", "undefined");
if(y(t)) {
var n="'"+JSON.stringify(t).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"')+"'";
return e.stylize(n, "string")
}
return v(t)?e.stylize(""+t, "number"):g(t)?e.stylize(""+t, "boolean"):_(t)?e.stylize("null", "null"):void 0
}
(e, n);
if(a)return a
;
var s=Object.keys(n), o=function(e) {
  var t= {
}
;
return e.forEach((function(e, n) {
  t[e]=!0
}
)), t
}
(s);
if(e.showHidden&&(s=Object.getOwnPropertyNames(n)), S(n)&&(s.indexOf("message")>=0||s.indexOf("description")>=0))return p(n);
if(0===s.length) {
  if(T(n)) {
var l=n.name?": "+n.name:"";
return e.stylize("[Function"+l+"]", "special")
}
if(x(n))return e.stylize(RegExp.prototype.toString.call(n), "regexp");
if(w(n))return e.stylize(Date.prototype.toString.call(n), "date");
if(S(n))return p(n)
}
var c, u="", h=!1, E=[" {
  ", "
}
"];
return m(n)&&(h=!0, E=["[", "]"]), T(n)&&(u=" [Function"+(n.name?": "+n.name:"")+"]"), x(n)&&(u=" "+RegExp.prototype.toString.call(n)), w(n)&&(u=" "+Date.prototype.toUTCString.call(n)), S(n)&&(u=" "+p(n)), 
0!==s.length||h&&0!=n.length?r<0?x(n)?e.stylize(RegExp.prototype.toString.call(n), "regexp"):e.stylize("[Object]", "special"):(e.seen.push(n), c=h?function(e, t, n, r, i) {
for(var a=[], s=0, o=t.length;
s<o;
++s)I(t, String(s))?a.push(f(e, t, n, r, String(s), !0)):a.push("");
return i.forEach((function(i) {
  i.match(/^\d+$/)||a.push(f(e, t, n, r, i, !0))
}
)), a
}
(e, n, r, o, s):s.map((function(t) {
  return f(e, n, r, o, t, h)
}
)), e.seen.pop(), 
function(e, t, n) {
  return e.reduce((function(e, t) {
  return t.indexOf("\n"), e+t.replace(/\u001b\[\d\d?m/g, "").length+1
}
), 0)>60?n[0]+(""===t?"":t+"\n ")+" "+e.join(", \n  ")+" "+n[1]:n[0]+t+" "+e.join(",  ")+" "+n[1]
}
(c, u, E)):E[0]+u+E[1]
}
function p(e) {
return"["+Error.prototype.toString.call(e)+"]"
}
function f(e, t, n, r, i, a) {
  var s, o, l;
if((l=Object.getOwnPropertyDescriptor(t, i)|| {
  value:t[i]
}
).get?o=l.set?e.stylize("[Getter/Setter]", "special"):e.stylize("[Getter]", "special"):l.set&&(o=e.stylize("[Setter]", "special")), I(r, i)||(s="["+i+"]"), 
o||(e.seen.indexOf(l.value)<0?(o=_(n)?d(e, l.value, null):d(e, l.value, n-1)).indexOf("\n")>-1&&(o=a?o.split("\n").map((function(e) {
  return"  "+e
}
)).join("\n").slice(2):"\n"+o.split("\n").map((function(e) {
  return"   "+e
}
)).join("\n")):o=e.stylize("[Circular]", "special")), b(s)) {
  if(a&&i.match(/^\d+$/))return o;
(s=JSON.stringify(""+i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(s=s.slice(1, -1), 
s=e.stylize(s, "name")):(s=s.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), s=e.stylize(s, "string"))
}
return s+": "+o
}
function m(e) {
  return Array.isArray(e)
}
function g(e) {
  return"boolean"==typeof e
}
function _(e) {
  return null===e
}
function v(e) {
  return"number"==typeof e
}
function y(e) {
  return"string"==typeof e
}
function b(e) {
  return void 0===e
}
function x(e) {
  return E(e)&&"[object RegExp]"===A(e)
}
function E(e) {
  return"object"==typeof e&&null!==e
}
function w(e) {
return E(e)&&"[object Date]"===A(e)
}
function S(e) {
  return E(e)&&("[object Error]"===A(e)||e instanceof Error)
}
function T(e) {
  return"function"==typeof e
}
function A(e) {
  return Object.prototype.toString.call(e)
}
function C(e) {
return e<10?"0"+e.toString(10):e.toString(10)
}
t.debuglog=function(e) {
  if(e=e.toUpperCase(), !s[e])if(o.test(e)) {
  var n=r.pid;
s[e]=function() {
  var r=t.format.apply(t, arguments);
console.error("%s %d: %s", e, n, r)
}
}
else s[e]=function() {
}
;
return s[e]
}
, 
t.inspect=c, c.colors= {
  bold:[1, 22], italic:[3, 23], underline:[4, 24], inverse:[7, 27], white:[37, 39], grey:[90, 39], black:[30, 39], blue:[34, 39], cyan:[36, 39], green:[32, 39], magenta:[35, 39], red:[31, 39], yellow:[33, 39]
}
, c.styles= {
  special:"cyan", number:"yellow", 
boolean:"yellow", undefined:"grey", null:"bold", string:"green", date:"magenta", regexp:"red"
}
, t.types=n(9032), t.isArray=m, t.isBoolean=g, t.isNull=_, t.isNullOrUndefined=function(e) {
  return null==e
}
, t.isNumber=v, t.isString=y, t.isSymbol=function(e) {
return"symbol"==typeof e
}
, t.isUndefined=b, t.isRegExp=x, t.types.isRegExp=x, t.isObject=E, t.isDate=w, t.types.isDate=w, t.isError=S, t.types.isNativeError=S, t.isFunction=T, t.isPrimitive=function(e) {
return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e
}
, t.isBuffer=n(1135);
var M=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function I(e, t) {
return Object.prototype.hasOwnProperty.call(e, t)
}
t.log=function() {
  var e, n;
console.log("%s - %s", (n=[C((e=new Date).getHours()), C(e.getMinutes()), C(e.getSeconds())].join(":"), [e.getDate(), M[e.getMonth()], n].join(" ")), t.format.apply(t, arguments))
}
, 
t.inherits=n(4317), t._extend=function(e, t) {
  if(!t||!E(t))return e;
for(var n=Object.keys(t), r=n.length;
r--;
)e[n[r]]=t[n[r]];
return e
}
;
var R="undefined"!=typeof Symbol?Symbol("util.promisify.custom"):void 0;
function k(e, t) {
  if(!e) {
var n=new Error("Promise was rejected with a falsy value");
n.reason=e, e=n
}
return t(e)
}
t.promisify=function(e) {
  if("function"!=typeof e)throw new TypeError('The "original" argument must be of type Function');
if(R&&e[R]) {
  var t
;
if("function"!=typeof(t=e[R]))throw new TypeError('The "util.promisify.custom" argument must be of type Function');
return Object.defineProperty(t, R,  {
  value:t, enumerable:!1, writable:!1, configurable:!0
}
), t
}
function t() {
for(var t, n, r=new Promise((function(e, r) {
  t=e, n=r
}
)), i=[], a=0;
a<arguments.length;
a++)i.push(arguments[a]);
i.push((function(e, r) {
  e?n(e):t(r)
}
));
try {
  e.apply(this, i)
}
catch(e) {
  n(e)
}
return r
}
return Object.setPrototypeOf(t, Object.getPrototypeOf(e)), 
R&&Object.defineProperty(t, R,  {
  value:t, enumerable:!1, writable:!1, configurable:!0
}
), Object.defineProperties(t, i(e))
}
, t.promisify.custom=R, t.callbackify=function(e) {
if("function"!=typeof e)throw new TypeError('The "original" argument must be of type Function');
function t() {
  for(var t=[], n=0;
n<arguments.length;
n++)t.push(arguments[n]);
var i=t.pop()
;
if("function"!=typeof i)throw new TypeError("The last argument must be of type Function");
var a=this, s=function() {
  return i.apply(a, arguments)
}
;
e.apply(this, t).then((function(e) {
  r.nextTick(s.bind(null, null, e))
}
), (function(e) {
r.nextTick(k.bind(null, e, s))
}
))
}
return Object.setPrototypeOf(t, Object.getPrototypeOf(e)), Object.defineProperties(t, i(e)), t
}

