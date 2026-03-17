// Module ID: 9032
// Category: property-descriptor
// Size: 3819 bytes
// Parameters: e,t,n

"use strict";
var r=n(7244), i=n(8184), a=n(5767), s=n(5680);
function o(e) {
  return e.call.bind(e)
}
var l="undefined"!=typeof BigInt, c="undefined"!=typeof Symbol, u=o(Object.prototype.toString), h=o(Number.prototype.valueOf), d=o(String.prototype.valueOf), p=o(Boolean.prototype.valueOf);
if(l)var f=o(BigInt.prototype.valueOf)
;
if(c)var m=o(Symbol.prototype.valueOf);
function g(e, t) {
  if("object"!=typeof e)return!1;
try {
  return t(e), !0
}
catch(e) {
  return!1
}
}
function _(e) {
  return"[object Map]"===u(e)
}
function v(e) {
  return"[object Set]"===u(e)
}
function y(e) {
return"[object WeakMap]"===u(e)
}
function b(e) {
  return"[object WeakSet]"===u(e)
}
function x(e) {
  return"[object ArrayBuffer]"===u(e)
}
function E(e) {
  return"undefined"!=typeof ArrayBuffer&&(x.working?x(e):e instanceof ArrayBuffer)
}
function w(e) {
return"[object DataView]"===u(e)
}
function S(e) {
  return"undefined"!=typeof DataView&&(w.working?w(e):e instanceof DataView)
}
t.isArgumentsObject=r, t.isGeneratorFunction=i, t.isTypedArray=s, t.isPromise=function(e) {
return"undefined"!=typeof Promise&&e instanceof Promise||null!==e&&"object"==typeof e&&"function"==typeof e.then&&"function"==typeof e.catch
}
, t.isArrayBufferView=function(e) {
return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):s(e)||S(e)
}
, t.isUint8Array=function(e) {
  return"Uint8Array"===a(e)
}
, t.isUint8ClampedArray=function(e) {
  return"Uint8ClampedArray"===a(e)
}
, t.isUint16Array=function(e) {
return"Uint16Array"===a(e)
}
, t.isUint32Array=function(e) {
  return"Uint32Array"===a(e)
}
, t.isInt8Array=function(e) {
  return"Int8Array"===a(e)
}
, t.isInt16Array=function(e) {
  return"Int16Array"===a(e)
}
, t.isInt32Array=function(e) {
  return"Int32Array"===a(e)
}
, 
t.isFloat32Array=function(e) {
  return"Float32Array"===a(e)
}
, t.isFloat64Array=function(e) {
  return"Float64Array"===a(e)
}
, t.isBigInt64Array=function(e) {
  return"BigInt64Array"===a(e)
}
, t.isBigUint64Array=function(e) {
  return"BigUint64Array"===a(e)
}
, 
_.working="undefined"!=typeof Map&&_(new Map), t.isMap=function(e) {
  return"undefined"!=typeof Map&&(_.working?_(e):e instanceof Map)
}
, v.working="undefined"!=typeof Set&&v(new Set), t.isSet=function(e) {
return"undefined"!=typeof Set&&(v.working?v(e):e instanceof Set)
}
, y.working="undefined"!=typeof WeakMap&&y(new WeakMap), t.isWeakMap=function(e) {
  return"undefined"!=typeof WeakMap&&(y.working?y(e):e instanceof WeakMap)
}
, 
b.working="undefined"!=typeof WeakSet&&b(new WeakSet), t.isWeakSet=function(e) {
  return b(e)
}
, x.working="undefined"!=typeof ArrayBuffer&&x(new ArrayBuffer), t.isArrayBuffer=E, 
w.working="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof DataView&&w(new DataView(new ArrayBuffer(1), 0, 1)), t.isDataView=S;
var T="undefined"!=typeof SharedArrayBuffer?SharedArrayBuffer:void 0;
function A(e) {
return"[object SharedArrayBuffer]"===u(e)
}
function C(e) {
  return void 0!==T&&(void 0===A.working&&(A.working=A(new T)), A.working?A(e):e instanceof T)
}
function M(e) {
  return g(e, h)
}
function I(e) {
  return g(e, d)
}
function R(e) {
  return g(e, p)
}
function k(e) {
return l&&g(e, f)
}
function N(e) {
  return c&&g(e, m)
}
t.isSharedArrayBuffer=C, t.isAsyncFunction=function(e) {
  return"[object AsyncFunction]"===u(e)
}
, t.isMapIterator=function(e) {
  return"[object Map Iterator]"===u(e)
}
, t.isSetIterator=function(e) {
return"[object Set Iterator]"===u(e)
}
, t.isGeneratorObject=function(e) {
  return"[object Generator]"===u(e)
}
, t.isWebAssemblyCompiledModule=function(e) {
  return"[object WebAssembly.Module]"===u(e)
}
, t.isNumberObject=M, t.isStringObject=I, t.isBooleanObject=R, 
t.isBigIntObject=k, t.isSymbolObject=N, t.isBoxedPrimitive=function(e) {
  return M(e)||I(e)||R(e)||k(e)||N(e)
}
, t.isAnyArrayBuffer=function(e) {
  return"undefined"!=typeof Uint8Array&&(E(e)||C(e))
}
, 
["isProxy", "isExternal", "isModuleNamespaceObject"].forEach((function(e) {
  Object.defineProperty(t, e,  {
  enumerable:!1, value:function() {
  throw new Error(e+" is not supported in userland")
}
}
)
}
))
