// Module ID: 8287
// Category: property-descriptor
// Size: 25256 bytes
// Parameters: e,t,n

"use strict";
const r=n(7526), i=n(251), a="function"==typeof Symbol&&"function"==typeof Symbol.for?Symbol.for("nodejs.util.inspect.custom"):null;
t.Buffer=l, t.SlowBuffer=function(e) {
  return+e!=e&&(e=0), 
l.alloc(+e)
}
, t.INSPECT_MAX_BYTES=50;
const s=2147483647;
function o(e) {
  if(e>s)throw new RangeError('The value "'+e+'" is invalid for option "size"');
const t=new Uint8Array(e);
return Object.setPrototypeOf(t, l.prototype), t
}
function l(e, t, n) {
if("number"==typeof e) {
  if("string"==typeof t)throw new TypeError('The "string" argument must be of type string. Received type number');
return h(e)
}
return c(e, t, n)
}
function c(e, t, n) {
  if("string"==typeof e)return function(e, t) {
if("string"==typeof t&&""!==t||(t="utf8"), !l.isEncoding(t))throw new TypeError("Unknown encoding: "+t);
const n=0|m(e, t);
let r=o(n);
const i=r.write(e, t);
return i!==n&&(r=r.slice(0, i)), r
}
(e, t);
if(ArrayBuffer.isView(e))return function(e) {
if(Y(e, Uint8Array)) {
  const t=new Uint8Array(e);
return p(t.buffer, t.byteOffset, t.byteLength)
}
return d(e)
}
(e)
;
if(null==e)throw new TypeError("The first argument must be one of type string,  Buffer,  ArrayBuffer,  Array,  or Array-like Object. Received type "+typeof e);
if(Y(e, ArrayBuffer)||e&&Y(e.buffer, ArrayBuffer))return p(e, t, n)
;
if("undefined"!=typeof SharedArrayBuffer&&(Y(e, SharedArrayBuffer)||e&&Y(e.buffer, SharedArrayBuffer)))return p(e, t, n);
if("number"==typeof e)throw new TypeError('The "value" argument must not be of type number. Received type number')
;
const r=e.valueOf&&e.valueOf();
if(null!=r&&r!==e)return l.from(r, t, n);
const i=function(e) {
  if(l.isBuffer(e)) {
  const t=0|f(e.length), n=o(t);
return 0===n.length||e.copy(n, 0, 0, t), n
}
return void 0!==e.length?"number"!=typeof e.length||K(e.length)?o(0):d(e):"Buffer"===e.type&&Array.isArray(e.data)?d(e.data):void 0
}
(e);
if(i)return i
;
if("undefined"!=typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof e[Symbol.toPrimitive])return l.from(e[Symbol.toPrimitive]("string"), t, n)
;
throw new TypeError("The first argument must be one of type string,  Buffer,  ArrayBuffer,  Array,  or Array-like Object. Received type "+typeof e)
}
function u(e) {
  if("number"!=typeof e)throw new TypeError('"size" argument must be of type number')
;
if(e<0)throw new RangeError('The value "'+e+'" is invalid for option "size"')
}
function h(e) {
  return u(e), o(e<0?0:0|f(e))
}
function d(e) {
  const t=e.length<0?0:0|f(e.length), n=o(t);
for(let r=0;
r<t;
r+=1)n[r]=255&e[r];
return n
}
function p(e, t, n) {
if(t<0||e.byteLength<t)throw new RangeError('"offset" is outside of buffer bounds');
if(e.byteLength<t+(n||0))throw new RangeError('"length" is outside of buffer bounds');
let r
;
return r=void 0===t&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e, t):new Uint8Array(e, t, n), Object.setPrototypeOf(r, l.prototype), r
}
function f(e) {
if(e>=s)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+s.toString(16)+" bytes");
return 0|e
}
function m(e, t) {
  if(l.isBuffer(e))return e.length;
if(ArrayBuffer.isView(e)||Y(e, ArrayBuffer))return e.byteLength
;
if("string"!=typeof e)throw new TypeError('The "string" argument must be one of type string,  Buffer,  or ArrayBuffer. Received type '+typeof e);
const n=e.length, r=arguments.length>2&&!0===arguments[2];
if(!r&&0===n)return 0;
let i=!1;
for(;
;
)switch(t) {
case"ascii":case"latin1":case"binary":return n;
case"utf8":case"utf-8":return $(e).length;
case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*n;
case"hex":return n>>>1;
case"base64":return q(e).length;
default:if(i)return r?-1:$(e).length
;
t=(""+t).toLowerCase(), i=!0
}
}
function g(e, t, n) {
  let r=!1;
if((void 0===t||t<0)&&(t=0), t>this.length)return"";
if((void 0===n||n>this.length)&&(n=this.length), n<=0)return"";
if((n>>>=0)<=(t>>>=0))return"";
for(e||(e="utf8");
;
)switch(e) {
  case"hex":
return R(this, t, n);
case"utf8":case"utf-8":return A(this, t, n);
case"ascii":return M(this, t, n);
case"latin1":case"binary":return I(this, t, n);
case"base64":return T(this, t, n);
case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return k(this, t, n);
default:
if(r)throw new TypeError("Unknown encoding: "+e);
e=(e+"").toLowerCase(), r=!0
}
}
function _(e, t, n) {
  const r=e[t];
e[t]=e[n], e[n]=r
}
function v(e, t, n, r, i) {
  if(0===e.length)return-1;
if("string"==typeof n?(r=n, 
n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648), K(n=+n)&&(n=i?0:e.length-1), n<0&&(n=e.length+n), n>=e.length) {
  if(i)return-1;
n=e.length-1
}
else if(n<0) {
  if(!i)return-1;
n=0
}
if("string"==typeof t&&(t=l.from(t, r)), 
l.isBuffer(t))return 0===t.length?-1:y(e, t, n, r, i);
if("number"==typeof t)return t&=255, "function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(e, t, n):Uint8Array.prototype.lastIndexOf.call(e, t, n):y(e, [t], n, r, i)
;
throw new TypeError("val must be string,  number or Buffer")
}
function y(e, t, n, r, i) {
  let a, s=1, o=e.length, l=t.length;
if(void 0!==r&&("ucs2"===(r=String(r).toLowerCase())||"ucs-2"===r||"utf16le"===r||"utf-16le"===r)) {
  if(e.length<2||t.length<2)return-1
;
s=2, o/=2, l/=2, n/=2
}
function c(e, t) {
  return 1===s?e[t]:e.readUInt16BE(t*s)
}
if(i) {
  let r=-1;
for(a=n;
a<o;
a++)if(c(e, a)===c(t, -1===r?0:a-r)) {
  if(-1===r&&(r=a), a-r+1===l)return r*s
}
else-1!==r&&(a-=a-r), r=-1
}
else for(n+l>o&&(n=o-l), a=n;
a>=0;
a--) {
  let n=!0
;
for(let r=0;
r<l;
r++)if(c(e, a+r)!==c(t, r)) {
  n=!1;
break
}
if(n)return a
}
return-1
}
function b(e, t, n, r) {
  n=Number(n)||0;
const i=e.length-n;
r?(r=Number(r))>i&&(r=i):r=i;
const a=t.length;
let s;
for(r>a/2&&(r=a/2), s=0;
s<r;
++s) {
const r=parseInt(t.substr(2*s, 2), 16);
if(K(r))return s;
e[n+s]=r
}
return s
}
function x(e, t, n, r) {
  return X($(t, e.length-n), e, n, r)
}
function E(e, t, n, r) {
  return X(function(e) {
  const t=[];
for(let n=0;
n<e.length;
++n)t.push(255&e.charCodeAt(n));
return t
}
(t), e, n, r)
}
function w(e, t, n, r) {
  return X(q(t), e, n, r)
}
function S(e, t, n, r) {
  return X(function(e, t) {
  let n, r, i;
const a=[];
for(let s=0;
s<e.length&&!((t-=2)<0);
++s)n=e.charCodeAt(s), r=n>>8, i=n%256, a.push(i), a.push(r);
return a
}
(t, e.length-n), e, n, r)
}
function T(e, t, n) {
return 0===t&&n===e.length?r.fromByteArray(e):r.fromByteArray(e.slice(t, n))
}
function A(e, t, n) {
  n=Math.min(e.length, n);
const r=[];
let i=t;
for(;
i<n;
) {
  const t=e[i];
let a=null, s=t>239?4:t>223?3:t>191?2:1;
if(i+s<=n) {
  let n, r, o, l;
switch(s) {
  case 1:
t<128&&(a=t);
break;
case 2:n=e[i+1], 128==(192&n)&&(l=(31&t)<<6|63&n, l>127&&(a=l));
break;
case 3:n=e[i+1], r=e[i+2], 128==(192&n)&&128==(192&r)&&(l=(15&t)<<12|(63&n)<<6|63&r, l>2047&&(l<55296||l>57343)&&(a=l));
break;
case 4:n=e[i+1], r=e[i+2], o=e[i+3], 
128==(192&n)&&128==(192&r)&&128==(192&o)&&(l=(15&t)<<18|(63&n)<<12|(63&r)<<6|63&o, l>65535&&l<1114112&&(a=l))
}
}
null===a?(a=65533, s=1):a>65535&&(a-=65536, r.push(a>>>10&1023|55296), a=56320|1023&a), r.push(a), i+=s
}
return function(e) {
  const t=e.length
;
if(t<=C)return String.fromCharCode.apply(String, e);
let n="", r=0;
for(;
r<t;
)n+=String.fromCharCode.apply(String, e.slice(r, r+=C));
return n
}
(r)
}
t.kMaxLength=s, l.TYPED_ARRAY_SUPPORT=function() {
  try {
  const e=new Uint8Array(1), t= {
  foo:function() {
  return 42
}
}
;
return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(e, t), 42===e.foo()
}
catch(e) {
  return!1
}
}
(), 
l.TYPED_ARRAY_SUPPORT||"undefined"==typeof console||"function"!=typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), 
Object.defineProperty(l.prototype, "parent",  {
  enumerable:!0, get:function() {
  if(l.isBuffer(this))return this.buffer
}
}
), Object.defineProperty(l.prototype, "offset",  {
  enumerable:!0, get:function() {
  if(l.isBuffer(this))return this.byteOffset
}
}
), l.poolSize=8192, 
l.from=function(e, t, n) {
  return c(e, t, n)
}
, Object.setPrototypeOf(l.prototype, Uint8Array.prototype), Object.setPrototypeOf(l, Uint8Array), l.alloc=function(e, t, n) {
  return function(e, t, n) {
  return u(e), 
e<=0?o(e):void 0!==t?"string"==typeof n?o(e).fill(t, n):o(e).fill(t):o(e)
}
(e, t, n)
}
, l.allocUnsafe=function(e) {
  return h(e)
}
, l.allocUnsafeSlow=function(e) {
  return h(e)
}
, l.isBuffer=function(e) {
  return null!=e&&!0===e._isBuffer&&e!==l.prototype
}
, 
l.compare=function(e, t) {
  if(Y(e, Uint8Array)&&(e=l.from(e, e.offset, e.byteLength)), Y(t, Uint8Array)&&(t=l.from(t, t.offset, t.byteLength)), 
!l.isBuffer(e)||!l.isBuffer(t))throw new TypeError('The "buf1",  "buf2" arguments must be one of type Buffer or Uint8Array');
if(e===t)return 0;
let n=e.length, r=t.length;
for(let i=0, a=Math.min(n, r);
i<a;
++i)if(e[i]!==t[i]) {
  n=e[i], r=t[i];
break
}
return n<r?-1:r<n?1:0
}
, l.isEncoding=function(e) {
  switch(String(e).toLowerCase()) {
  case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;
default:return!1
}
}
, 
l.concat=function(e, t) {
  if(!Array.isArray(e))throw new TypeError('"list" argument must be an Array of Buffers');
if(0===e.length)return l.alloc(0);
let n;
if(void 0===t)for(t=0, n=0;
n<e.length;
++n)t+=e[n].length;
const r=l.allocUnsafe(t);
let i=0
;
for(n=0;
n<e.length;
++n) {
  let t=e[n];
if(Y(t, Uint8Array))i+t.length>r.length?(l.isBuffer(t)||(t=l.from(t)), t.copy(r, i)):Uint8Array.prototype.set.call(r, t, i);
else {
  if(!l.isBuffer(t))throw new TypeError('"list" argument must be an Array of Buffers')
;
t.copy(r, i)
}
i+=t.length
}
return r
}
, l.byteLength=m, l.prototype._isBuffer=!0, l.prototype.swap16=function() {
  const e=this.length;
if(e%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");
for(let t=0;
t<e;
t+=2)_(this, t, t+1);
return this
}
, 
l.prototype.swap32=function() {
  const e=this.length;
if(e%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");
for(let t=0;
t<e;
t+=4)_(this, t, t+3), _(this, t+1, t+2);
return this
}
, l.prototype.swap64=function() {
  const e=this.length
;
if(e%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");
for(let t=0;
t<e;
t+=8)_(this, t, t+7), _(this, t+1, t+6), _(this, t+2, t+5), _(this, t+3, t+4);
return this
}
, l.prototype.toString=function() {
  const e=this.length
;
return 0===e?"":0===arguments.length?A(this, 0, e):g.apply(this, arguments)
}
, l.prototype.toLocaleString=l.prototype.toString, l.prototype.equals=function(e) {
  if(!l.isBuffer(e))throw new TypeError("Argument must be a Buffer")
;
return this===e||0===l.compare(this, e)
}
, l.prototype.inspect=function() {
  let e="";
const n=t.INSPECT_MAX_BYTES;
return e=this.toString("hex", 0, n).replace(/(. {
  2
}
)/g, "$1 ").trim(), this.length>n&&(e+=" ... "), "<Buffer "+e+">"
}
, 
a&&(l.prototype[a]=l.prototype.inspect), l.prototype.compare=function(e, t, n, r, i) {
  if(Y(e, Uint8Array)&&(e=l.from(e, e.offset, e.byteLength)), 
!l.isBuffer(e))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof e);
if(void 0===t&&(t=0), void 0===n&&(n=e?e.length:0), void 0===r&&(r=0), void 0===i&&(i=this.length), 
t<0||n>e.length||r<0||i>this.length)throw new RangeError("out of range index");
if(r>=i&&t>=n)return 0;
if(r>=i)return-1;
if(t>=n)return 1;
if(this===e)return 0;
let a=(i>>>=0)-(r>>>=0), s=(n>>>=0)-(t>>>=0)
;
const o=Math.min(a, s), c=this.slice(r, i), u=e.slice(t, n);
for(let e=0;
e<o;
++e)if(c[e]!==u[e]) {
  a=c[e], s=u[e];
break
}
return a<s?-1:s<a?1:0
}
, l.prototype.includes=function(e, t, n) {
  return-1!==this.indexOf(e, t, n)
}
, l.prototype.indexOf=function(e, t, n) {
return v(this, e, t, n, !0)
}
, l.prototype.lastIndexOf=function(e, t, n) {
  return v(this, e, t, n, !1)
}
, l.prototype.write=function(e, t, n, r) {
  if(void 0===t)r="utf8", n=this.length, t=0;
else if(void 0===n&&"string"==typeof t)r=t, n=this.length, t=0;
else {
if(!isFinite(t))throw new Error("Buffer.write(string,  encoding,  offset[,  length]) is no longer supported");
t>>>=0, isFinite(n)?(n>>>=0, void 0===r&&(r="utf8")):(r=n, n=void 0)
}
const i=this.length-t;
if((void 0===n||n>i)&&(n=i), 
e.length>0&&(n<0||t<0)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");
r||(r="utf8");
let a=!1;
for(;
;
)switch(r) {
  case"hex":return b(this, e, t, n);
case"utf8":case"utf-8":return x(this, e, t, n);
case"ascii":case"latin1":
case"binary":return E(this, e, t, n);
case"base64":return w(this, e, t, n);
case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return S(this, e, t, n);
default:if(a)throw new TypeError("Unknown encoding: "+r);
r=(""+r).toLowerCase(), a=!0
}
}
, 
l.prototype.toJSON=function() {
  return {
  type:"Buffer", data:Array.prototype.slice.call(this._arr||this, 0)
}
}
;
const C=4096;
function M(e, t, n) {
  let r="";
n=Math.min(e.length, n);
for(let i=t;
i<n;
++i)r+=String.fromCharCode(127&e[i]);
return r
}
function I(e, t, n) {
let r="";
n=Math.min(e.length, n);
for(let i=t;
i<n;
++i)r+=String.fromCharCode(e[i]);
return r
}
function R(e, t, n) {
  const r=e.length;
(!t||t<0)&&(t=0), (!n||n<0||n>r)&&(n=r);
let i="";
for(let r=t;
r<n;
++r)i+=J[e[r]];
return i
}
function k(e, t, n) {
const r=e.slice(t, n);
let i="";
for(let e=0;
e<r.length-1;
e+=2)i+=String.fromCharCode(r[e]+256*r[e+1]);
return i
}
function N(e, t, n) {
  if(e%1!=0||e<0)throw new RangeError("offset is not uint")
;
if(e+t>n)throw new RangeError("Trying to access beyond buffer length")
}
function D(e, t, n, r, i, a) {
  if(!l.isBuffer(e))throw new TypeError('"buffer" argument must be a Buffer instance');
if(t>i||t<a)throw new RangeError('"value" argument is out of bounds')
;
if(n+r>e.length)throw new RangeError("Index out of range")
}
function L(e, t, n, r, i) {
  V(t, r, i, e, n, 7);
let a=Number(t&BigInt(4294967295));
e[n++]=a, a>>=8, e[n++]=a, a>>=8, e[n++]=a, a>>=8, e[n++]=a;
let s=Number(t>>BigInt(32)&BigInt(4294967295));
return e[n++]=s, 
s>>=8, e[n++]=s, s>>=8, e[n++]=s, s>>=8, e[n++]=s, n
}
function O(e, t, n, r, i) {
  V(t, r, i, e, n, 7);
let a=Number(t&BigInt(4294967295));
e[n+7]=a, a>>=8, e[n+6]=a, a>>=8, e[n+5]=a, a>>=8, e[n+4]=a;
let s=Number(t>>BigInt(32)&BigInt(4294967295));
return e[n+3]=s, s>>=8, 
e[n+2]=s, s>>=8, e[n+1]=s, s>>=8, e[n]=s, n+8
}
function P(e, t, n, r, i, a) {
  if(n+r>e.length)throw new RangeError("Index out of range");
if(n<0)throw new RangeError("Index out of range")
}
function F(e, t, n, r, a) {
  return t=+t, n>>>=0, a||P(e, 0, n, 4), 
i.write(e, t, n, r, 23, 4), n+4
}
function U(e, t, n, r, a) {
  return t=+t, n>>>=0, a||P(e, 0, n, 8), i.write(e, t, n, r, 52, 8), n+8
}
l.prototype.slice=function(e, t) {
  const n=this.length;
(e=~~e)<0?(e+=n)<0&&(e=0):e>n&&(e=n), (t=void 0===t?n:~~t)<0?(t+=n)<0&&(t=0):t>n&&(t=n), 
t<e&&(t=e);
const r=this.subarray(e, t);
return Object.setPrototypeOf(r, l.prototype), r
}
, l.prototype.readUintLE=l.prototype.readUIntLE=function(e, t, n) {
  e>>>=0, t>>>=0, n||N(e, t, this.length);
let r=this[e], i=1, a=0;
for(;
++a<t&&(i*=256);
)r+=this[e+a]*i;
return r
}
, l.prototype.readUintBE=l.prototype.readUIntBE=function(e, t, n) {
  e>>>=0, t>>>=0, n||N(e, t, this.length);
let r=this[e+--t], i=1;
for(;
t>0&&(i*=256);
)r+=this[e+--t]*i;
return r
}
, l.prototype.readUint8=l.prototype.readUInt8=function(e, t) {
  return e>>>=0, 
t||N(e, 1, this.length), this[e]
}
, l.prototype.readUint16LE=l.prototype.readUInt16LE=function(e, t) {
  return e>>>=0, t||N(e, 2, this.length), this[e]|this[e+1]<<8
}
, l.prototype.readUint16BE=l.prototype.readUInt16BE=function(e, t) {
  return e>>>=0, 
t||N(e, 2, this.length), this[e]<<8|this[e+1]
}
, l.prototype.readUint32LE=l.prototype.readUInt32LE=function(e, t) {
  return e>>>=0, t||N(e, 4, this.length), (this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]
}
, 
l.prototype.readUint32BE=l.prototype.readUInt32BE=function(e, t) {
  return e>>>=0, t||N(e, 4, this.length), 16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])
}
, l.prototype.readBigUInt64LE=Z((function(e) {
  H(e>>>=0, "offset");
const t=this[e], n=this[e+7]
;
void 0!==t&&void 0!==n||j(e, this.length-8);
const r=t+256*this[++e]+65536*this[++e]+this[++e]*2**24, i=this[++e]+256*this[++e]+65536*this[++e]+n*2**24;
return BigInt(r)+(BigInt(i)<<BigInt(32))
}
)), l.prototype.readBigUInt64BE=Z((function(e) {
H(e>>>=0, "offset");
const t=this[e], n=this[e+7];
void 0!==t&&void 0!==n||j(e, this.length-8);
const r=t*2**24+65536*this[++e]+256*this[++e]+this[++e], i=this[++e]*2**24+65536*this[++e]+256*this[++e]+n;
return(BigInt(r)<<BigInt(32))+BigInt(i)
}
)), 
l.prototype.readIntLE=function(e, t, n) {
  e>>>=0, t>>>=0, n||N(e, t, this.length);
let r=this[e], i=1, a=0;
for(;
++a<t&&(i*=256);
)r+=this[e+a]*i;
return i*=128, r>=i&&(r-=Math.pow(2, 8*t)), r
}
, l.prototype.readIntBE=function(e, t, n) {
  e>>>=0, t>>>=0, n||N(e, t, this.length)
;
let r=t, i=1, a=this[e+--r];
for(;
r>0&&(i*=256);
)a+=this[e+--r]*i;
return i*=128, a>=i&&(a-=Math.pow(2, 8*t)), a
}
, l.prototype.readInt8=function(e, t) {
  return e>>>=0, t||N(e, 1, this.length), 128&this[e]?-1*(255-this[e]+1):this[e]
}
, 
l.prototype.readInt16LE=function(e, t) {
  e>>>=0, t||N(e, 2, this.length);
const n=this[e]|this[e+1]<<8;
return 32768&n?4294901760|n:n
}
, l.prototype.readInt16BE=function(e, t) {
  e>>>=0, t||N(e, 2, this.length);
const n=this[e+1]|this[e]<<8
;
return 32768&n?4294901760|n:n
}
, l.prototype.readInt32LE=function(e, t) {
  return e>>>=0, t||N(e, 4, this.length), this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24
}
, l.prototype.readInt32BE=function(e, t) {
  return e>>>=0, t||N(e, 4, this.length), 
this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]
}
, l.prototype.readBigInt64LE=Z((function(e) {
  H(e>>>=0, "offset");
const t=this[e], n=this[e+7];
void 0!==t&&void 0!==n||j(e, this.length-8);
const r=this[e+4]+256*this[e+5]+65536*this[e+6]+(n<<24)
;
return(BigInt(r)<<BigInt(32))+BigInt(t+256*this[++e]+65536*this[++e]+this[++e]*2**24)
}
)), l.prototype.readBigInt64BE=Z((function(e) {
  H(e>>>=0, "offset");
const t=this[e], n=this[e+7];
void 0!==t&&void 0!==n||j(e, this.length-8)
;
const r=(t<<24)+65536*this[++e]+256*this[++e]+this[++e];
return(BigInt(r)<<BigInt(32))+BigInt(this[++e]*2**24+65536*this[++e]+256*this[++e]+n)
}
)), l.prototype.readFloatLE=function(e, t) {
  return e>>>=0, t||N(e, 4, this.length), i.read(this, e, !0, 23, 4)
}
, 
l.prototype.readFloatBE=function(e, t) {
  return e>>>=0, t||N(e, 4, this.length), i.read(this, e, !1, 23, 4)
}
, l.prototype.readDoubleLE=function(e, t) {
  return e>>>=0, t||N(e, 8, this.length), i.read(this, e, !0, 52, 8)
}
, l.prototype.readDoubleBE=function(e, t) {
  return e>>>=0, 
t||N(e, 8, this.length), i.read(this, e, !1, 52, 8)
}
, l.prototype.writeUintLE=l.prototype.writeUIntLE=function(e, t, n, r) {
  e=+e, t>>>=0, n>>>=0, r||D(this, e, t, n, Math.pow(2, 8*n)-1, 0);
let i=1, a=0;
for(this[t]=255&e;
++a<n&&(i*=256);
)this[t+a]=e/i&255;
return t+n
}
, 
l.prototype.writeUintBE=l.prototype.writeUIntBE=function(e, t, n, r) {
  e=+e, t>>>=0, n>>>=0, r||D(this, e, t, n, Math.pow(2, 8*n)-1, 0);
let i=n-1, a=1;
for(this[t+i]=255&e;
--i>=0&&(a*=256);
)this[t+i]=e/a&255;
return t+n
}
, 
l.prototype.writeUint8=l.prototype.writeUInt8=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 1, 255, 0), this[t]=255&e, t+1
}
, l.prototype.writeUint16LE=l.prototype.writeUInt16LE=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 2, 65535, 0), this[t]=255&e, 
this[t+1]=e>>>8, t+2
}
, l.prototype.writeUint16BE=l.prototype.writeUInt16BE=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 2, 65535, 0), this[t]=e>>>8, this[t+1]=255&e, t+2
}
, l.prototype.writeUint32LE=l.prototype.writeUInt32LE=function(e, t, n) {
  return e=+e, 
t>>>=0, n||D(this, e, t, 4, 4294967295, 0), this[t+3]=e>>>24, this[t+2]=e>>>16, this[t+1]=e>>>8, this[t]=255&e, t+4
}
, l.prototype.writeUint32BE=l.prototype.writeUInt32BE=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 4, 4294967295, 0), this[t]=e>>>24, 
this[t+1]=e>>>16, this[t+2]=e>>>8, this[t+3]=255&e, t+4
}
, l.prototype.writeBigUInt64LE=Z((function(e, t=0) {
  return L(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"))
}
)), l.prototype.writeBigUInt64BE=Z((function(e, t=0) {
return O(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"))
}
)), l.prototype.writeIntLE=function(e, t, n, r) {
  if(e=+e, t>>>=0, !r) {
  const r=Math.pow(2, 8*n-1);
D(this, e, t, n, r-1, -r)
}
let i=0, a=1, s=0
;
for(this[t]=255&e;
++i<n&&(a*=256);
)e<0&&0===s&&0!==this[t+i-1]&&(s=1), this[t+i]=(e/a|0)-s&255;
return t+n
}
, l.prototype.writeIntBE=function(e, t, n, r) {
  if(e=+e, t>>>=0, !r) {
  const r=Math.pow(2, 8*n-1);
D(this, e, t, n, r-1, -r)
}
let i=n-1, a=1, s=0
;
for(this[t+i]=255&e;
--i>=0&&(a*=256);
)e<0&&0===s&&0!==this[t+i+1]&&(s=1), this[t+i]=(e/a|0)-s&255;
return t+n
}
, l.prototype.writeInt8=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 1, 127, -128), e<0&&(e=255+e+1), this[t]=255&e, t+1
}
, 
l.prototype.writeInt16LE=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 2, 32767, -32768), this[t]=255&e, this[t+1]=e>>>8, t+2
}
, l.prototype.writeInt16BE=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 2, 32767, -32768), this[t]=e>>>8, this[t+1]=255&e, t+2
}
, 
l.prototype.writeInt32LE=function(e, t, n) {
  return e=+e, t>>>=0, n||D(this, e, t, 4, 2147483647, -2147483648), this[t]=255&e, this[t+1]=e>>>8, this[t+2]=e>>>16, this[t+3]=e>>>24, t+4
}
, l.prototype.writeInt32BE=function(e, t, n) {
  return e=+e, t>>>=0, 
n||D(this, e, t, 4, 2147483647, -2147483648), e<0&&(e=4294967295+e+1), this[t]=e>>>24, this[t+1]=e>>>16, this[t+2]=e>>>8, this[t+3]=255&e, t+4
}
, l.prototype.writeBigInt64LE=Z((function(e, t=0) {
return L(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"))
}
)), l.prototype.writeBigInt64BE=Z((function(e, t=0) {
  return O(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"))
}
)), l.prototype.writeFloatLE=function(e, t, n) {
return F(this, e, t, !0, n)
}
, l.prototype.writeFloatBE=function(e, t, n) {
  return F(this, e, t, !1, n)
}
, l.prototype.writeDoubleLE=function(e, t, n) {
  return U(this, e, t, !0, n)
}
, l.prototype.writeDoubleBE=function(e, t, n) {
  return U(this, e, t, !1, n)
}
, 
l.prototype.copy=function(e, t, n, r) {
  if(!l.isBuffer(e))throw new TypeError("argument should be a Buffer");
if(n||(n=0), r||0===r||(r=this.length), t>=e.length&&(t=e.length), t||(t=0), r>0&&r<n&&(r=n), r===n)return 0;
if(0===e.length||0===this.length)return 0
;
if(t<0)throw new RangeError("targetStart out of bounds");
if(n<0||n>=this.length)throw new RangeError("Index out of range");
if(r<0)throw new RangeError("sourceEnd out of bounds");
r>this.length&&(r=this.length), e.length-t<r-n&&(r=e.length-t+n)
;
const i=r-n;
return this===e&&"function"==typeof Uint8Array.prototype.copyWithin?this.copyWithin(t, n, r):Uint8Array.prototype.set.call(e, this.subarray(n, r), t), i
}
, l.prototype.fill=function(e, t, n, r) {
  if("string"==typeof e) {
  if("string"==typeof t?(r=t, t=0, 
n=this.length):"string"==typeof n&&(r=n, n=this.length), void 0!==r&&"string"!=typeof r)throw new TypeError("encoding must be a string");
if("string"==typeof r&&!l.isEncoding(r))throw new TypeError("Unknown encoding: "+r);
if(1===e.length) {
const t=e.charCodeAt(0);
("utf8"===r&&t<128||"latin1"===r)&&(e=t)
}
}
else"number"==typeof e?e&=255:"boolean"==typeof e&&(e=Number(e));
if(t<0||this.length<t||this.length<n)throw new RangeError("Out of range index");
if(n<=t)return this;
let i;
if(t>>>=0, 
n=void 0===n?this.length:n>>>0, e||(e=0), "number"==typeof e)for(i=t;
i<n;
++i)this[i]=e;
else {
  const a=l.isBuffer(e)?e:l.from(e, r), s=a.length;
if(0===s)throw new TypeError('The value "'+e+'" is invalid for argument "value"')
;
for(i=0;
i<n-t;
++i)this[i+t]=a[i%s]
}
return this
}
;
const B= {
}
;
function z(e, t, n) {
  B[e]=class extends n {
  constructor() {
  super(), Object.defineProperty(this, "message",  {
  value:t.apply(this, arguments), writable:!0, configurable:!0
}
), 
this.name=`$ {
  this.name
}
 [$ {
  e
}
]`, this.stack, delete this.name
}
get code() {
  return e
}
set code(e) {
  Object.defineProperty(this, "code",  {
  configurable:!0, enumerable:!0, value:e, writable:!0
}
)
}
toString() {
  return`$ {
  this.name
}
 [$ {
  e
}
]: $ {
  this.message
}
`
}
}
}
function G(e) {
  let t="", n=e.length;
const r="-"===e[0]?1:0;
for(;
n>=r+4;
n-=3)t=`_$ {
  e.slice(n-3, n)
}
$ {
  t
}
`;
return`$ {
  e.slice(0, n)
}
$ {
  t
}
`
}
function V(e, t, n, r, i, a) {
  if(e>n||e<t) {
  const r="bigint"==typeof t?"n":"";
let i
;
throw i=a>3?0===t||t===BigInt(0)?`>= 0$ {
  r
}
 and < 2$ {
  r
}
 ** $ {
  8*(a+1)
}
$ {
  r
}
`:`>= -(2$ {
  r
}
 ** $ {
  8*(a+1)-1
}
$ {
  r
}
) and < 2 ** $ {
  8*(a+1)-1
}
$ {
  r
}
`:`>= $ {
  t
}
$ {
  r
}
 and <= $ {
  n
}
$ {
  r
}
`, new B.ERR_OUT_OF_RANGE("value", i, e)
}
!function(e, t, n) {
  H(t, "offset"), 
void 0!==e[t]&&void 0!==e[t+n]||j(t, e.length-(n+1))
}
(r, i, a)
}
function H(e, t) {
  if("number"!=typeof e)throw new B.ERR_INVALID_ARG_TYPE(t, "number", e)
}
function j(e, t, n) {
  if(Math.floor(e)!==e)throw H(e, n), new B.ERR_OUT_OF_RANGE(n||"offset", "an integer", e)
;
if(t<0)throw new B.ERR_BUFFER_OUT_OF_BOUNDS;
throw new B.ERR_OUT_OF_RANGE(n||"offset", `>= $ {
  n?1:0
}
 and <= $ {
  t
}
`, e)
}
z("ERR_BUFFER_OUT_OF_BOUNDS", (function(e) {
  return e?`$ {
  e
}
 is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"
}
), RangeError), z("ERR_INVALID_ARG_TYPE", (function(e, t) {
  return`The "$ {
  e
}
" argument must be of type number. Received type $ {
  typeof t
}
`
}
), TypeError), z("ERR_OUT_OF_RANGE", (function(e, t, n) {
  let r=`The value of "$ {
  e
}
" is out of range.`, i=n
;
return Number.isInteger(n)&&Math.abs(n)>2**32?i=G(String(n)):"bigint"==typeof n&&(i=String(n), (n>BigInt(2)**BigInt(32)||n<-(BigInt(2)**BigInt(32)))&&(i=G(i)), i+="n"), r+=` It must be $ {
  t
}
. Received $ {
  i
}
`, r
}
), RangeError);
const W=/[^+/0-9A-Za-z-_]/g
;
function $(e, t) {
  let n;
t=t||1/0;
const r=e.length;
let i=null;
const a=[];
for(let s=0;
s<r;
++s) {
  if(n=e.charCodeAt(s), n>55295&&n<57344) {
  if(!i) {
  if(n>56319) {
  (t-=3)>-1&&a.push(239, 191, 189);
continue
}
if(s+1===r) {
  (t-=3)>-1&&a.push(239, 191, 189);
continue
}
i=n
;
continue
}
if(n<56320) {
  (t-=3)>-1&&a.push(239, 191, 189), i=n;
continue
}
n=65536+(i-55296<<10|n-56320)
}
else i&&(t-=3)>-1&&a.push(239, 191, 189);
if(i=null, n<128) {
  if((t-=1)<0)break;
a.push(n)
}
else if(n<2048) {
  if((t-=2)<0)break;
a.push(n>>6|192, 63&n|128)
}
else if(n<65536) {
  if((t-=3)<0)break;
a.push(n>>12|224, n>>6&63|128, 63&n|128)
}
else {
  if(!(n<1114112))throw new Error("Invalid code point");
if((t-=4)<0)break;
a.push(n>>18|240, n>>12&63|128, n>>6&63|128, 63&n|128)
}
}
return a
}
function q(e) {
return r.toByteArray(function(e) {
  if((e=(e=e.split("=")[0]).trim().replace(W, "")).length<2)return"";
for(;
e.length%4!=0;
)e+="=";
return e
}
(e))
}
function X(e, t, n, r) {
  let i;
for(i=0;
i<r&&!(i+n>=t.length||i>=e.length);
++i)t[i+n]=e[i];
return i
}
function Y(e, t) {
return e instanceof t||null!=e&&null!=e.constructor&&null!=e.constructor.name&&e.constructor.name===t.name
}
function K(e) {
  return e!=e
}
const J=function() {
  const e="0123456789abcdef", t=new Array(256);
for(let n=0;
n<16;
++n) {
  const r=16*n
;
for(let i=0;
i<16;
++i)t[r+i]=e[n]+e[i]
}
return t
}
();
function Z(e) {
  return"undefined"==typeof BigInt?Q:e
}
function Q() {
  throw new Error("BigInt not supported")
}

