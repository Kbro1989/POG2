// Module ID: 8559
// Category: property-descriptor
// Size: 8030 bytes
// Parameters: e,t,n

"use strict"
;
var r=n(5606), i=n(8287).Buffer, a=n(8310).Transform, s=n(5974), o=n(537), l=n(4148).ok, c=n(8287).kMaxLength, u="Cannot create final Buffer. It would be larger than 0x"+c.toString(16)+" bytes";
s.Z_MIN_WINDOWBITS=8, s.Z_MAX_WINDOWBITS=15, 
s.Z_DEFAULT_WINDOWBITS=15, s.Z_MIN_CHUNK=64, s.Z_MAX_CHUNK=1/0, s.Z_DEFAULT_CHUNK=16384, s.Z_MIN_MEMLEVEL=1, s.Z_MAX_MEMLEVEL=9, s.Z_DEFAULT_MEMLEVEL=8, s.Z_MIN_LEVEL=-1, s.Z_MAX_LEVEL=9, s.Z_DEFAULT_LEVEL=s.Z_DEFAULT_COMPRESSION
;
for(var h=Object.keys(s), d=0;
d<h.length;
d++) {
  var p=h[d];
p.match(/^Z/)&&Object.defineProperty(t, p,  {
  enumerable:!0, value:s[p], writable:!1
}
)
}
for(var f= {
  Z_OK:s.Z_OK, Z_STREAM_END:s.Z_STREAM_END, Z_NEED_DICT:s.Z_NEED_DICT, Z_ERRNO:s.Z_ERRNO, 
Z_STREAM_ERROR:s.Z_STREAM_ERROR, Z_DATA_ERROR:s.Z_DATA_ERROR, Z_MEM_ERROR:s.Z_MEM_ERROR, Z_BUF_ERROR:s.Z_BUF_ERROR, Z_VERSION_ERROR:s.Z_VERSION_ERROR
}
, m=Object.keys(f), g=0;
g<m.length;
g++) {
  var _=m[g];
f[f[_]]=_
}
function v(e, t, n) {
  var r=[], a=0;
function s() {
for(var t;
null!==(t=e.read());
)r.push(t), a+=t.length;
e.once("readable", s)
}
function o() {
  var t, s=null;
a>=c?s=new RangeError(u):t=i.concat(r, a), r=[], e.close(), n(s, t)
}
e.on("error", (function(t) {
  e.removeListener("end", o), e.removeListener("readable", s), n(t)
}
)), e.on("end", o), e.end(t), s()
}
function y(e, t) {
  if("string"==typeof t&&(t=i.from(t)), !i.isBuffer(t))throw new TypeError("Not a string or buffer");
var n=e._finishFlushFlag;
return e._processChunk(t, n)
}
function b(e) {
if(!(this instanceof b))return new b(e);
M.call(this, e, s.DEFLATE)
}
function x(e) {
  if(!(this instanceof x))return new x(e);
M.call(this, e, s.INFLATE)
}
function E(e) {
  if(!(this instanceof E))return new E(e);
M.call(this, e, s.GZIP)
}
function w(e) {
if(!(this instanceof w))return new w(e);
M.call(this, e, s.GUNZIP)
}
function S(e) {
  if(!(this instanceof S))return new S(e);
M.call(this, e, s.DEFLATERAW)
}
function T(e) {
  if(!(this instanceof T))return new T(e);
M.call(this, e, s.INFLATERAW)
}
function A(e) {
if(!(this instanceof A))return new A(e);
M.call(this, e, s.UNZIP)
}
function C(e) {
  return e===s.Z_NO_FLUSH||e===s.Z_PARTIAL_FLUSH||e===s.Z_SYNC_FLUSH||e===s.Z_FULL_FLUSH||e===s.Z_FINISH||e===s.Z_BLOCK
}
function M(e, n) {
  var r=this;
if(this._opts=e=e|| {
}
, 
this._chunkSize=e.chunkSize||t.Z_DEFAULT_CHUNK, a.call(this, e), e.flush&&!C(e.flush))throw new Error("Invalid flush flag: "+e.flush);
if(e.finishFlush&&!C(e.finishFlush))throw new Error("Invalid flush flag: "+e.finishFlush)
;
if(this._flushFlag=e.flush||s.Z_NO_FLUSH, this._finishFlushFlag=void 0!==e.finishFlush?e.finishFlush:s.Z_FINISH, e.chunkSize&&(e.chunkSize<t.Z_MIN_CHUNK||e.chunkSize>t.Z_MAX_CHUNK))throw new Error("Invalid chunk size: "+e.chunkSize)
;
if(e.windowBits&&(e.windowBits<t.Z_MIN_WINDOWBITS||e.windowBits>t.Z_MAX_WINDOWBITS))throw new Error("Invalid windowBits: "+e.windowBits)
;
if(e.level&&(e.level<t.Z_MIN_LEVEL||e.level>t.Z_MAX_LEVEL))throw new Error("Invalid compression level: "+e.level);
if(e.memLevel&&(e.memLevel<t.Z_MIN_MEMLEVEL||e.memLevel>t.Z_MAX_MEMLEVEL))throw new Error("Invalid memLevel: "+e.memLevel)
;
if(e.strategy&&e.strategy!=t.Z_FILTERED&&e.strategy!=t.Z_HUFFMAN_ONLY&&e.strategy!=t.Z_RLE&&e.strategy!=t.Z_FIXED&&e.strategy!=t.Z_DEFAULT_STRATEGY)throw new Error("Invalid strategy: "+e.strategy)
;
if(e.dictionary&&!i.isBuffer(e.dictionary))throw new Error("Invalid dictionary: it should be a Buffer instance");
this._handle=new s.Zlib(n);
var o=this;
this._hadError=!1, this._handle.onerror=function(e, n) {
  I(o), o._hadError=!0;
var r=new Error(e)
;
r.errno=n, r.code=t.codes[n], o.emit("error", r)
}
;
var l=t.Z_DEFAULT_COMPRESSION;
"number"==typeof e.level&&(l=e.level);
var c=t.Z_DEFAULT_STRATEGY;
"number"==typeof e.strategy&&(c=e.strategy), 
this._handle.init(e.windowBits||t.Z_DEFAULT_WINDOWBITS, l, e.memLevel||t.Z_DEFAULT_MEMLEVEL, c, e.dictionary), this._buffer=i.allocUnsafe(this._chunkSize), this._offset=0, this._level=l, this._strategy=c, this.once("end", this.close), 
Object.defineProperty(this, "_closed",  {
  get:function() {
  return!r._handle
}
, configurable:!0, enumerable:!0
}
)
}
function I(e, t) {
  t&&r.nextTick(t), e._handle&&(e._handle.close(), e._handle=null)
}
function R(e) {
  e.emit("close")
}
Object.defineProperty(t, "codes",  {
enumerable:!0, value:Object.freeze(f), writable:!1
}
), t.Deflate=b, t.Inflate=x, t.Gzip=E, t.Gunzip=w, t.DeflateRaw=S, t.InflateRaw=T, t.Unzip=A, t.createDeflate=function(e) {
  return new b(e)
}
, t.createInflate=function(e) {
  return new x(e)
}
, 
t.createDeflateRaw=function(e) {
  return new S(e)
}
, t.createInflateRaw=function(e) {
  return new T(e)
}
, t.createGzip=function(e) {
  return new E(e)
}
, t.createGunzip=function(e) {
  return new w(e)
}
, t.createUnzip=function(e) {
  return new A(e)
}
, 
t.deflate=function(e, t, n) {
  return"function"==typeof t&&(n=t, t= {
}
), v(new b(t), e, n)
}
, t.deflateSync=function(e, t) {
  return y(new b(t), e)
}
, t.gzip=function(e, t, n) {
  return"function"==typeof t&&(n=t, t= {
}
), v(new E(t), e, n)
}
, t.gzipSync=function(e, t) {
return y(new E(t), e)
}
, t.deflateRaw=function(e, t, n) {
  return"function"==typeof t&&(n=t, t= {
}
), v(new S(t), e, n)
}
, t.deflateRawSync=function(e, t) {
  return y(new S(t), e)
}
, t.unzip=function(e, t, n) {
  return"function"==typeof t&&(n=t, t= {
}
), v(new A(t), e, n)
}
, 
t.unzipSync=function(e, t) {
  return y(new A(t), e)
}
, t.inflate=function(e, t, n) {
  return"function"==typeof t&&(n=t, t= {
}
), v(new x(t), e, n)
}
, t.inflateSync=function(e, t) {
  return y(new x(t), e)
}
, t.gunzip=function(e, t, n) {
  return"function"==typeof t&&(n=t, t= {
}
), 
v(new w(t), e, n)
}
, t.gunzipSync=function(e, t) {
  return y(new w(t), e)
}
, t.inflateRaw=function(e, t, n) {
  return"function"==typeof t&&(n=t, t= {
}
), v(new T(t), e, n)
}
, t.inflateRawSync=function(e, t) {
  return y(new T(t), e)
}
, o.inherits(M, a), 
M.prototype.params=function(e, n, i) {
  if(e<t.Z_MIN_LEVEL||e>t.Z_MAX_LEVEL)throw new RangeError("Invalid compression level: "+e)
;
if(n!=t.Z_FILTERED&&n!=t.Z_HUFFMAN_ONLY&&n!=t.Z_RLE&&n!=t.Z_FIXED&&n!=t.Z_DEFAULT_STRATEGY)throw new TypeError("Invalid strategy: "+n);
if(this._level!==e||this._strategy!==n) {
  var a=this;
this.flush(s.Z_SYNC_FLUSH, (function() {
l(a._handle, "zlib binding closed"), a._handle.params(e, n), a._hadError||(a._level=e, a._strategy=n, i&&i())
}
))
}
else r.nextTick(i)
}
, M.prototype.reset=function() {
  return l(this._handle, "zlib binding closed"), this._handle.reset()
}
, 
M.prototype._flush=function(e) {
  this._transform(i.alloc(0), "", e)
}
, M.prototype.flush=function(e, t) {
  var n=this, a=this._writableState;
("function"==typeof e||void 0===e&&!t)&&(t=e, e=s.Z_FULL_FLUSH), 
a.ended?t&&r.nextTick(t):a.ending?t&&this.once("end", t):a.needDrain?t&&this.once("drain", (function() {
  return n.flush(e, t)
}
)):(this._flushFlag=e, this.write(i.alloc(0), "", t))
}
, M.prototype.close=function(e) {
  I(this, e), r.nextTick(R, this)
}
, 
M.prototype._transform=function(e, t, n) {
  var r, a=this._writableState, o=(a.ending||a.ended)&&(!e||a.length===e.length);
return null===e||i.isBuffer(e)?this._handle?(o?r=this._finishFlushFlag:(r=this._flushFlag, 
e.length>=a.length&&(this._flushFlag=this._opts.flush||s.Z_NO_FLUSH)), void this._processChunk(e, r, n)):n(new Error("zlib binding closed")):n(new Error("invalid input"))
}
, M.prototype._processChunk=function(e, t, n) {
var r=e&&e.length, a=this._chunkSize-this._offset, s=0, o=this, h="function"==typeof n;
if(!h) {
  var d, p=[], f=0;
this.on("error", (function(e) {
  d=e
}
)), l(this._handle, "zlib binding closed");
do {
  var m=this._handle.writeSync(t, e, s, r, this._buffer, this._offset, a)
}
while(!this._hadError&&v(m[0], m[1]));
if(this._hadError)throw d;
if(f>=c)throw I(this), new RangeError(u);
var g=i.concat(p, f);
return I(this), g
}
l(this._handle, "zlib binding closed");
var _=this._handle.write(t, e, s, r, this._buffer, this._offset, a)
;
function v(c, u) {
  if(this&&(this.buffer=null, this.callback=null), !o._hadError) {
  var d=a-u;
if(l(d>=0, "have should not go down"), d>0) {
  var m=o._buffer.slice(o._offset, o._offset+d);
o._offset+=d, h?o.push(m):(p.push(m), f+=m.length)
}
if((0===u||o._offset>=o._chunkSize)&&(a=o._chunkSize, o._offset=0, o._buffer=i.allocUnsafe(o._chunkSize)), 0===u) {
  if(s+=r-c, r=c, !h)return!0;
var g=o._handle.write(t, e, s, r, o._buffer, o._offset, o._chunkSize);
return g.callback=v, void(g.buffer=e)
}
if(!h)return!1;
n()
}
}
_.buffer=e, _.callback=v
}
, o.inherits(b, M), o.inherits(x, M), o.inherits(E, M), o.inherits(w, M), o.inherits(S, M), o.inherits(T, M), o.inherits(A, M)
