// Module ID: 9597
// Category: property-descriptor
// Size: 5389 bytes
// Parameters: e,t,n

"use strict";
function r(e) {
  return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e) {
  return typeof e
}
:function(e) {
return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e
}
, r(e)
}
function i(e, t) {
  return i=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e, t) {
  return e.__proto__=t, e
}
, i(e, t)
}
function a(e) {
return a=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e) {
  return e.__proto__||Object.getPrototypeOf(e)
}
, a(e)
}
var s, o, l= {
}
;
function c(e, t, n) {
  n||(n=Error);
var s=function(n) {
  !function(e, t) {
if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");
e.prototype=Object.create(t&&t.prototype,  {
  constructor: {
  value:e, writable:!0, configurable:!0
}
}
), Object.defineProperty(e, "prototype",  {
  writable:!1
}
), t&&i(e, t)
}
(u, n);
var s, o, l, c=(o=u, l=function() {
  if("undefined"==typeof Reflect||!Reflect.construct)return!1;
if(Reflect.construct.sham)return!1;
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
(), function() {
  var e, t=a(o);
if(l) {
  var n=a(this).constructor;
e=Reflect.construct(t, arguments, n)
}
else e=t.apply(this, arguments)
;
return function(e, t) {
  if(t&&("object"===r(t)||"function"==typeof t))return t;
if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");
return function(e) {
if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
return e
}
(e)
}
(this, e)
}
);
function u(n, r, i) {
  var a;
return function(e, t) {
  if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")
}
(this, u), a=c.call(this, function(e, n, r) {
  return"string"==typeof t?t:t(e, n, r)
}
(n, r, i)), a.code=e, a
}
return s=u, Object.defineProperty(s, "prototype",  {
  writable:!1
}
), s
}
(n);
l[e]=s
}
function u(e, t) {
  if(Array.isArray(e)) {
  var n=e.length
;
return e=e.map((function(e) {
  return String(e)
}
)), n>2?"one of ".concat(t, " ").concat(e.slice(0, n-1).join(",  "), ",  or ")+e[n-1]:2===n?"one of ".concat(t, " ").concat(e[0], " or ").concat(e[1]):"of ".concat(t, " ").concat(e[0])
}
return"of ".concat(t, " ").concat(String(e))
}
c("ERR_AMBIGUOUS_ARGUMENT", 'The "%s" argument is ambiguous. %s', TypeError), c("ERR_INVALID_ARG_TYPE", (function(e, t, i) {
  var a, o, l, c;
if(void 0===s&&(s=n(4148)), s("string"==typeof e, "'name' must be a string"), 
"string"==typeof t&&"not "===t.substr(0, 4)?(a="must not be", t=t.replace(/^not /, "")):a="must be", function(e, t, n) {
  return(void 0===n||n>e.length)&&(n=e.length), " argument"===e.substring(n-9, n)
}
(e))o="The ".concat(e, " ").concat(a, " ").concat(u(t, "type"));
else {
  var h=("number"!=typeof c&&(c=0), c+1>(l=e).length||-1===l.indexOf(".", c)?"argument":"property");
o='The "'.concat(e, '" ').concat(h, " ").concat(a, " ").concat(u(t, "type"))
}
return o+". Received type ".concat(r(i))
}
), TypeError), c("ERR_INVALID_ARG_VALUE", (function(e, t) {
  var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"is invalid";
void 0===o&&(o=n(537));
var i=o.inspect(t)
;
return i.length>128&&(i="".concat(i.slice(0, 128), "...")), "The argument '".concat(e, "' ").concat(r, ". Received ").concat(i)
}
), TypeError, RangeError), c("ERR_INVALID_RETURN_VALUE", (function(e, t, n) {
  var i
;
return i=n&&n.constructor&&n.constructor.name?"instance of ".concat(n.constructor.name):"type ".concat(r(n)), "Expected ".concat(e, ' to be returned from the "').concat(t, '"')+" function but got ".concat(i, ".")
}
), TypeError), 
c("ERR_MISSING_ARGS", (function() {
  for(var e=arguments.length, t=new Array(e), r=0;
r<e;
r++)t[r]=arguments[r];
void 0===s&&(s=n(4148)), s(t.length>0, "At least one arg needs to be specified");
var i="The ", a=t.length;
switch(t=t.map((function(e) {
return'"'.concat(e, '"')
}
)), a) {
  case 1:i+="".concat(t[0], " argument");
break;
case 2:i+="".concat(t[0], " and ").concat(t[1], " arguments");
break;
default:i+=t.slice(0, a-1).join(",  "), i+=",  and ".concat(t[a-1], " arguments")
}
return"".concat(i, " must be specified")
}
), TypeError), e.exports.codes=l
}
, 9600:e=> {
  "use strict";
var t, n, r=Function.prototype.toString, i="object"==typeof Reflect&&null!==Reflect&&Reflect.apply
;
if("function"==typeof i&&"function"==typeof Object.defineProperty)try {
  t=Object.defineProperty( {
}
, "length",  {
  get:function() {
  throw n
}
}
), n= {
}
, i((function() {
  throw 42
}
), null, t)
}
catch(e) {
  e!==n&&(i=null)
}
else i=null;
var a=/^\s*class\b/, s=function(e) {
  try {
var t=r.call(e);
return a.test(t)
}
catch(e) {
  return!1
}
}
, o=function(e) {
  try {
  return!s(e)&&(r.call(e), !0)
}
catch(e) {
  return!1
}
}
, l=Object.prototype.toString, c="function"==typeof Symbol&&!!Symbol.toStringTag, u=!(0 in[, ]), h=function() {
  return!1
}
;
if("object"==typeof document) {
  var d=document.all;
l.call(d)===l.call(document.all)&&(h=function(e) {
  if((u||!e)&&(void 0===e||"object"==typeof e))try {
  var t=l.call(e)
;
return("[object HTMLAllCollection]"===t||"[object HTML document.all class]"===t||"[object HTMLCollection]"===t||"[object Object]"===t)&&null==e("")
}
catch(e) {
}
return!1
}
)
}
e.exports=i?function(e) {
  if(h(e))return!0;
if(!e)return!1
;
if("function"!=typeof e&&"object"!=typeof e)return!1;
try {
  i(e, null, t)
}
catch(e) {
  if(e!==n)return!1
}
return!s(e)&&o(e)
}
:function(e) {
  if(h(e))return!0;
if(!e)return!1;
if("function"!=typeof e&&"object"!=typeof e)return!1;
if(c)return o(e);
if(s(e))return!1
;
var t=l.call(e);
return!("[object Function]"!==t&&"[object GeneratorFunction]"!==t&&!/^\[object HTML/.test(t))&&o(e)
}
}
, 9612:e=> {
  "use strict";
e.exports=Object
