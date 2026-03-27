// Module ID: 453
// Category: property-descriptor
// Size: 9245 bytes
// Parameters: e,t,n

"use strict"
;
var r, i=n(9612), a=n(9383), s=n(1237), o=n(9290), l=n(9538), c=n(8068), u=n(9675), h=n(5345), d=n(1514), p=n(8968), f=n(6188), m=n(8002), g=n(5880), _=n(414), v=n(3093), y=Function, b=function(e) {
  try {
  return y('"use strict";, 
 return  ('+e+").constructor;
")()
}
catch(e) {
}
}
, x=n(5795), E=n(655), w=function() {
  throw new u
}
, S=x?function() {
  try {
  return w
}
catch(e) {
  try {
  return x(arguments, "callee").get
}
catch(e) {
  return w
}
}
}
():w, T=n(4039)(), A=n(3628), C=n(1064), M=n(8648), I=n(1002), R=n(76), k= {
}
, N="undefined"!=typeof Uint8Array&&A?A(Uint8Array):r, D= {
  __proto__:null, "%AggregateError%":"undefined"==typeof AggregateError?r:AggregateError, "%Array%":Array, 
"%ArrayBuffer%":"undefined"==typeof ArrayBuffer?r:ArrayBuffer, "%ArrayIteratorPrototype%":T&&A?A([][Symbol.iterator]()):r, "%AsyncFromSyncIteratorPrototype%":r, "%AsyncFunction%":k, "%AsyncGenerator%":k, "%AsyncGeneratorFunction%":k, 
"%AsyncIteratorPrototype%":k, "%Atomics%":"undefined"==typeof Atomics?r:Atomics, "%BigInt%":"undefined"==typeof BigInt?r:BigInt, "%BigInt64Array%":"undefined"==typeof BigInt64Array?r:BigInt64Array, 
"%BigUint64Array%":"undefined"==typeof BigUint64Array?r:BigUint64Array, "%Boolean%":Boolean, "%DataView%":"undefined"==typeof DataView?r:DataView, "%Date%":Date, "%decodeURI%":decodeURI, "%decodeURIComponent%":decodeURIComponent, "%encodeURI%":encodeURI, 
"%encodeURIComponent%":encodeURIComponent, "%Error%":a, "%eval%":eval, "%EvalError%":s, "%Float16Array%":"undefined"==typeof Float16Array?r:Float16Array, "%Float32Array%":"undefined"==typeof Float32Array?r:Float32Array, 
"%Float64Array%":"undefined"==typeof Float64Array?r:Float64Array, "%FinalizationRegistry%":"undefined"==typeof FinalizationRegistry?r:FinalizationRegistry, "%Function%":y, "%GeneratorFunction%":k, "%Int8Array%":"undefined"==typeof Int8Array?r:Int8Array, 
"%Int16Array%":"undefined"==typeof Int16Array?r:Int16Array, "%Int32Array%":"undefined"==typeof Int32Array?r:Int32Array, "%isFinite%":isFinite, "%isNaN%":isNaN, "%IteratorPrototype%":T&&A?A(A([][Symbol.iterator]())):r, 
"%JSON%":"object"==typeof JSON?JSON:r, "%Map%":"undefined"==typeof Map?r:Map, "%MapIteratorPrototype%":"undefined"!=typeof Map&&T&&A?A((new Map)[Symbol.iterator]()):r, "%Math%":Math, "%Number%":Number, "%Object%":i, "%Object.getOwnPropertyDescriptor%":x, 
"%parseFloat%":parseFloat, "%parseInt%":parseInt, "%Promise%":"undefined"==typeof Promise?r:Promise, "%Proxy%":"undefined"==typeof Proxy?r:Proxy, "%RangeError%":o, "%ReferenceError%":l, "%Reflect%":"undefined"==typeof Reflect?r:Reflect, "%RegExp%":RegExp, 
"%Set%":"undefined"==typeof Set?r:Set, "%SetIteratorPrototype%":"undefined"!=typeof Set&&T&&A?A((new Set)[Symbol.iterator]()):r, "%SharedArrayBuffer%":"undefined"==typeof SharedArrayBuffer?r:SharedArrayBuffer, "%String%":String, 
"%StringIteratorPrototype%":T&&A?A(""[Symbol.iterator]()):r, "%Symbol%":T?Symbol:r, "%SyntaxError%":c, "%ThrowTypeError%":S, "%TypedArray%":N, "%TypeError%":u, "%Uint8Array%":"undefined"==typeof Uint8Array?r:Uint8Array, 
"%Uint8ClampedArray%":"undefined"==typeof Uint8ClampedArray?r:Uint8ClampedArray, "%Uint16Array%":"undefined"==typeof Uint16Array?r:Uint16Array, "%Uint32Array%":"undefined"==typeof Uint32Array?r:Uint32Array, "%URIError%":h, 
"%WeakMap%":"undefined"==typeof WeakMap?r:WeakMap, "%WeakRef%":"undefined"==typeof WeakRef?r:WeakRef, "%WeakSet%":"undefined"==typeof WeakSet?r:WeakSet, "%Function.prototype.call%":R, "%Function.prototype.apply%":I, "%Object.defineProperty%":E, 
"%Object.getPrototypeOf%":C, "%Math.abs%":d, "%Math.floor%":p, "%Math.max%":f, "%Math.min%":m, "%Math.pow%":g, "%Math.round%":_, "%Math.sign%":v, "%Reflect.getPrototypeOf%":M
}
;
if(A)try {
  null.error
}
catch(e) {
  var L=A(A(e));
D["%Error.prototype%"]=L
}
var O=function e(t) {
  var n;
if("%AsyncFunction%"===t)n=b("async function ()  {
}
");
else if("%GeneratorFunction%"===t)n=b("function* ()  {
}
");
else if("%AsyncGeneratorFunction%"===t)n=b("async function* ()  {
}
");
else if("%AsyncGenerator%"===t) {
var r=e("%AsyncGeneratorFunction%");
r&&(n=r.prototype)
}
else if("%AsyncIteratorPrototype%"===t) {
  var i=e("%AsyncGenerator%");
i&&A&&(n=A(i.prototype))
}
return D[t]=n, n
}
, P= {
  __proto__:null, "%ArrayBufferPrototype%":["ArrayBuffer", "prototype"], 
"%ArrayPrototype%":["Array", "prototype"], "%ArrayProto_entries%":["Array", "prototype", "entries"], "%ArrayProto_forEach%":["Array", "prototype", "forEach"], "%ArrayProto_keys%":["Array", "prototype", "keys"], 
"%ArrayProto_values%":["Array", "prototype", "values"], "%AsyncFunctionPrototype%":["AsyncFunction", "prototype"], "%AsyncGenerator%":["AsyncGeneratorFunction", "prototype"], "%AsyncGeneratorPrototype%":["AsyncGeneratorFunction", "prototype", "prototype"], 
"%BooleanPrototype%":["Boolean", "prototype"], "%DataViewPrototype%":["DataView", "prototype"], "%DatePrototype%":["Date", "prototype"], "%ErrorPrototype%":["Error", "prototype"], "%EvalErrorPrototype%":["EvalError", "prototype"], 
"%Float32ArrayPrototype%":["Float32Array", "prototype"], "%Float64ArrayPrototype%":["Float64Array", "prototype"], "%FunctionPrototype%":["Function", "prototype"], "%Generator%":["GeneratorFunction", "prototype"], 
"%GeneratorPrototype%":["GeneratorFunction", "prototype", "prototype"], "%Int8ArrayPrototype%":["Int8Array", "prototype"], "%Int16ArrayPrototype%":["Int16Array", "prototype"], "%Int32ArrayPrototype%":["Int32Array", "prototype"], 
"%JSONParse%":["JSON", "parse"], "%JSONStringify%":["JSON", "stringify"], "%MapPrototype%":["Map", "prototype"], "%NumberPrototype%":["Number", "prototype"], "%ObjectPrototype%":["Object", "prototype"], "%ObjProto_toString%":["Object", "prototype", "toString"], 
"%ObjProto_valueOf%":["Object", "prototype", "valueOf"], "%PromisePrototype%":["Promise", "prototype"], "%PromiseProto_then%":["Promise", "prototype", "then"], "%Promise_all%":["Promise", "all"], "%Promise_reject%":["Promise", "reject"], 
"%Promise_resolve%":["Promise", "resolve"], "%RangeErrorPrototype%":["RangeError", "prototype"], "%ReferenceErrorPrototype%":["ReferenceError", "prototype"], "%RegExpPrototype%":["RegExp", "prototype"], "%SetPrototype%":["Set", "prototype"], 
"%SharedArrayBufferPrototype%":["SharedArrayBuffer", "prototype"], "%StringPrototype%":["String", "prototype"], "%SymbolPrototype%":["Symbol", "prototype"], "%SyntaxErrorPrototype%":["SyntaxError", "prototype"], 
"%TypedArrayPrototype%":["TypedArray", "prototype"], "%TypeErrorPrototype%":["TypeError", "prototype"], "%Uint8ArrayPrototype%":["Uint8Array", "prototype"], "%Uint8ClampedArrayPrototype%":["Uint8ClampedArray", "prototype"], 
"%Uint16ArrayPrototype%":["Uint16Array", "prototype"], "%Uint32ArrayPrototype%":["Uint32Array", "prototype"], "%URIErrorPrototype%":["URIError", "prototype"], "%WeakMapPrototype%":["WeakMap", "prototype"], "%WeakSetPrototype%":["WeakSet", "prototype"]
}
, F=n(6743), U=n(9957), B=F.call(R, Array.prototype.concat), z=F.call(I, Array.prototype.splice), G=F.call(R, String.prototype.replace), V=F.call(R, String.prototype.slice), H=F.call(R, RegExp.prototype.exec), j=/[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, W=/\\(\\)?/g, $=function(e, t) {
var n, r=e;
if(U(P, r)&&(r="%"+(n=P[r])[0]+"%"), U(D, r)) {
  var i=D[r];
if(i===k&&(i=O(r)), void 0===i&&!t)throw new u("intrinsic "+e+" exists,  but is not available. Please file an issue!");
return {
  alias:n, name:r, value:i
}
}
throw new c("intrinsic "+e+" does not exist!")
}
;
e.exports=function(e, t) {
  if("string"!=typeof e||0===e.length)throw new u("intrinsic name must be a non-empty string")
;
if(arguments.length>1&&"boolean"!=typeof t)throw new u('"allowMissing" argument must be a boolean');
if(null===H(/^%?[^%]*%?$/, e))throw new c("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
var n=function(e) {
var t=V(e, 0, 1), n=V(e, -1);
if("%"===t&&"%"!==n)throw new c("invalid intrinsic syntax,  expected closing `%`");
if("%"===n&&"%"!==t)throw new c("invalid intrinsic syntax,  expected opening `%`");
var r=[];
return G(e, j, (function(e, t, n, i) {
r[r.length]=n?G(i, W, "$1"):t||e
}
)), r
}
(e), r=n.length>0?n[0]:"", i=$("%"+r+"%", t), a=i.name, s=i.value, o=!1, l=i.alias;
l&&(r=l[0], z(n, B([0, 1], l)));
for(var h=1, d=!0;
h<n.length;
h+=1) {
  var p=n[h], f=V(p, 0, 1), m=V(p, -1)
;
if(('"'===f||"'"===f||"`"===f||'"'===m||"'"===m||"`"===m)&&f!==m)throw new c("property names with quotes must have matching quotes");
if("constructor"!==p&&d||(o=!0), U(D, a="%"+(r+="."+p)+"%"))s=D[a];
else if(null!=s) {
  if(!(p in s)) {
if(!t)throw new u("base intrinsic for "+e+" exists,  but the property is not available.");
return
}
if(x&&h+1>=n.length) {
  var g=x(s, p);
s=(d=!!g)&&"get"in g&&!("originalValue"in g.get)?g.get:s[p]
}
else d=U(s, p), s=s[p];
d&&!o&&(D[a]=s)
}
}
return s
}
}
, 466:e=> {
"use strict"
;
e.exports='["struct", \r\n\t["gender", "ubyte"], \r\n\t["$avatype", "playeritem"], \r\n\t["player", ["opt", ["$avatype", -1, "eqnot"], ["struct", \r\n\t\t["slots", ["tuple", \r\n\t\t\t["ref", "$avatype"], \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem", \r\n\t\t\t"playeritem"\r\n\t\t]], \r\n\t\t["rest", ["buffer", ["bytesleft"], "hex"]]\r\n\t]]], \r\n\t["npc", ["opt", ["$avatype", -1], ["struct", \r\n\t\t["id", "ushort"], \r\n\t\t["buf", ["buffer", 21, "hex"]], \r\n\t\t["unkff", "ushort"]\r\n\t]]]\r\n]'
