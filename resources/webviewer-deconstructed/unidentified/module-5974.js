// Module ID: 5974
// Category: unidentified
// Size: 10805 bytes
// Parameters: e,t,n

"use strict";
var r=n(8287).Buffer, i=n(5606), a=n(4148), s=n(4442), o=n(8411), l=n(1447), c=n(9681);
for(var u in c)t[u]=c[u];
function h(e) {
  if("number"!=typeof e||e<t.DEFLATE||e>t.UNZIP)throw new TypeError("Bad argument")
;
this.dictionary=null, this.err=0, this.flush=0, this.init_done=!1, this.level=0, this.memLevel=0, this.mode=e, this.strategy=0, this.windowBits=0, this.write_in_progress=!1, this.pending_close=!1, this.gzip_id_bytes_read=0
}
t.NONE=0, t.DEFLATE=1, t.INFLATE=2, 
t.GZIP=3, t.GUNZIP=4, t.DEFLATERAW=5, t.INFLATERAW=6, t.UNZIP=7, h.prototype.close=function() {
  this.write_in_progress?this.pending_close=!0:(this.pending_close=!1, a(this.init_done, "close before init"), a(this.mode<=t.UNZIP), 
this.mode===t.DEFLATE||this.mode===t.GZIP||this.mode===t.DEFLATERAW?o.deflateEnd(this.strm):this.mode!==t.INFLATE&&this.mode!==t.GUNZIP&&this.mode!==t.INFLATERAW&&this.mode!==t.UNZIP||l.inflateEnd(this.strm), this.mode=t.NONE, this.dictionary=null)
}
, 
h.prototype.write=function(e, t, n, r, i, a, s) {
  return this._write(!0, e, t, n, r, i, a, s)
}
, h.prototype.writeSync=function(e, t, n, r, i, a, s) {
  return this._write(!1, e, t, n, r, i, a, s)
}
, h.prototype._write=function(e, n, s, o, l, c, u, h) {
  if(a.equal(arguments.length, 8), 
a(this.init_done, "write before init"), a(this.mode!==t.NONE, "already finalized"), a.equal(!1, this.write_in_progress, "write already in progress"), a.equal(!1, this.pending_close, "close is pending"), this.write_in_progress=!0, 
a.equal(!1, void 0===n, "must provide flush value"), this.write_in_progress=!0, n!==t.Z_NO_FLUSH&&n!==t.Z_PARTIAL_FLUSH&&n!==t.Z_SYNC_FLUSH&&n!==t.Z_FULL_FLUSH&&n!==t.Z_FINISH&&n!==t.Z_BLOCK)throw new Error("Invalid flush value")
;
if(null==s&&(s=r.alloc(0), l=0, o=0), this.strm.avail_in=l, this.strm.input=s, this.strm.next_in=o, this.strm.avail_out=h, this.strm.output=c, this.strm.next_out=u, this.flush=n, !e)return this._process(), this._checkError()?this._afterSync():void 0;
var d=this
;
return i.nextTick((function() {
  d._process(), d._after()
}
)), this
}
, h.prototype._afterSync=function() {
  var e=this.strm.avail_out, t=this.strm.avail_in;
return this.write_in_progress=!1, [t, e]
}
, h.prototype._process=function() {
  var e=null;
switch(this.mode) {
case t.DEFLATE:case t.GZIP:case t.DEFLATERAW:this.err=o.deflate(this.strm, this.flush);
break;
case t.UNZIP:switch(this.strm.avail_in>0&&(e=this.strm.next_in), this.gzip_id_bytes_read) {
  case 0:if(null===e)break;
if(31!==this.strm.input[e]) {
this.mode=t.INFLATE;
break
}
if(this.gzip_id_bytes_read=1, e++, 1===this.strm.avail_in)break;
case 1:if(null===e)break;
139===this.strm.input[e]?(this.gzip_id_bytes_read=2, this.mode=t.GUNZIP):this.mode=t.INFLATE;
break;
default:
throw new Error("invalid number of gzip magic number bytes read")
}
case t.INFLATE:case t.GUNZIP:case t.INFLATERAW:for(this.err=l.inflate(this.strm, this.flush), 
this.err===t.Z_NEED_DICT&&this.dictionary&&(this.err=l.inflateSetDictionary(this.strm, this.dictionary), 
this.err===t.Z_OK?this.err=l.inflate(this.strm, this.flush):this.err===t.Z_DATA_ERROR&&(this.err=t.Z_NEED_DICT));
this.strm.avail_in>0&&this.mode===t.GUNZIP&&this.err===t.Z_STREAM_END&&0!==this.strm.next_in[0];
)this.reset(), 
this.err=l.inflate(this.strm, this.flush);
break;
default:throw new Error("Unknown mode "+this.mode)
}
}
, h.prototype._checkError=function() {
  switch(this.err) {
  case t.Z_OK:case t.Z_BUF_ERROR:
if(0!==this.strm.avail_out&&this.flush===t.Z_FINISH)return this._error("unexpected end of file"), !1;
break;
case t.Z_STREAM_END:break;
case t.Z_NEED_DICT:return null==this.dictionary?this._error("Missing dictionary"):this._error("Bad dictionary"), !1
;
default:return this._error("Zlib error"), !1
}
return!0
}
, h.prototype._after=function() {
  if(this._checkError()) {
  var e=this.strm.avail_out, t=this.strm.avail_in;
this.write_in_progress=!1, this.callback(t, e), this.pending_close&&this.close()
}
}
, 
h.prototype._error=function(e) {
  this.strm.msg&&(e=this.strm.msg), this.onerror(e, this.err), this.write_in_progress=!1, this.pending_close&&this.close()
}
, h.prototype.init=function(e, n, r, i, s) {
a(4===arguments.length||5===arguments.length, "init(windowBits,  level,  memLevel,  strategy,  [dictionary])"), a(e>=8&&e<=15, "invalid windowBits"), a(n>=-1&&n<=9, "invalid compression level"), a(r>=1&&r<=9, "invalid memlevel"), 
a(i===t.Z_FILTERED||i===t.Z_HUFFMAN_ONLY||i===t.Z_RLE||i===t.Z_FIXED||i===t.Z_DEFAULT_STRATEGY, "invalid strategy"), this._init(n, e, r, i, s), this._setDictionary()
}
, h.prototype.params=function() {
  throw new Error("deflateParams Not supported")
}
, 
h.prototype.reset=function() {
  this._reset(), this._setDictionary()
}
, h.prototype._init=function(e, n, r, i, a) {
  switch(this.level=e, this.windowBits=n, this.memLevel=r, this.strategy=i, this.flush=t.Z_NO_FLUSH, this.err=t.Z_OK, 
this.mode!==t.GZIP&&this.mode!==t.GUNZIP||(this.windowBits+=16), this.mode===t.UNZIP&&(this.windowBits+=32), this.mode!==t.DEFLATERAW&&this.mode!==t.INFLATERAW||(this.windowBits=-1*this.windowBits), this.strm=new s, this.mode) {
  case t.DEFLATE:case t.GZIP:
case t.DEFLATERAW:this.err=o.deflateInit2(this.strm, this.level, t.Z_DEFLATED, this.windowBits, this.memLevel, this.strategy);
break;
case t.INFLATE:case t.GUNZIP:case t.INFLATERAW:case t.UNZIP:this.err=l.inflateInit2(this.strm, this.windowBits);
break
;
default:throw new Error("Unknown mode "+this.mode)
}
this.err!==t.Z_OK&&this._error("Init error"), this.dictionary=a, this.write_in_progress=!1, this.init_done=!0
}
, h.prototype._setDictionary=function() {
  if(null!=this.dictionary) {
  switch(this.err=t.Z_OK, 
this.mode) {
  case t.DEFLATE:case t.DEFLATERAW:this.err=o.deflateSetDictionary(this.strm, this.dictionary)
}
this.err!==t.Z_OK&&this._error("Failed to set dictionary")
}
}
, h.prototype._reset=function() {
  switch(this.err=t.Z_OK, this.mode) {
  case t.DEFLATE:
case t.DEFLATERAW:case t.GZIP:this.err=o.deflateReset(this.strm);
break;
case t.INFLATE:case t.INFLATERAW:case t.GUNZIP:this.err=l.inflateReset(this.strm)
}
this.err!==t.Z_OK&&this._error("Failed to reset stream")
}
, t.Zlib=h
}
, 6048:e=> {
  "use strict"
;
var t= {
}
;
function n(e, n, r) {
  r||(r=Error);
var i=function(e) {
  var t, r;
function i(t, r, i) {
  return e.call(this, function(e, t, r) {
  return"string"==typeof n?n:n(e, t, r)
}
(t, r, i))||this
}
return r=e, (t=i).prototype=Object.create(r.prototype), 
t.prototype.constructor=t, t.__proto__=r, i
}
(r);
i.prototype.name=r.name, i.prototype.code=e, t[e]=i
}
function r(e, t) {
  if(Array.isArray(e)) {
  var n=e.length;
return e=e.map((function(e) {
  return String(e)
}
)), 
n>2?"one of ".concat(t, " ").concat(e.slice(0, n-1).join(",  "), ",  or ")+e[n-1]:2===n?"one of ".concat(t, " ").concat(e[0], " or ").concat(e[1]):"of ".concat(t, " ").concat(e[0])
}
return"of ".concat(t, " ").concat(String(e))
}
n("ERR_INVALID_OPT_VALUE", (function(e, t) {
  return'The value "'+t+'" is invalid for option "'+e+'"'
}
), TypeError), n("ERR_INVALID_ARG_TYPE", (function(e, t, n) {
  var i, a, s, o;
if("string"==typeof t&&"not "===t.substr(0, 4)?(i="must not be", 
t=t.replace(/^not /, "")):i="must be", function(e, t, n) {
  return(void 0===n||n>e.length)&&(n=e.length), " argument"===e.substring(n-9, n)
}
(e))a="The ".concat(e, " ").concat(i, " ").concat(r(t, "type"));
else {
  var l=("number"!=typeof o&&(o=0), 
o+1>(s=e).length||-1===s.indexOf(".", o)?"argument":"property");
a='The "'.concat(e, '" ').concat(l, " ").concat(i, " ").concat(r(t, "type"))
}
return a+". Received type ".concat(typeof n)
}
), TypeError), 
n("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), n("ERR_METHOD_NOT_IMPLEMENTED", (function(e) {
  return"The "+e+" method is not implemented"
}
)), n("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), n("ERR_STREAM_DESTROYED", (function(e) {
return"Cannot call "+e+" after a stream was destroyed"
}
)), n("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), n("ERR_STREAM_CANNOT_PIPE", "Cannot pipe,  not readable"), n("ERR_STREAM_WRITE_AFTER_END", "write after end"), 
n("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), n("ERR_UNKNOWN_ENCODING", (function(e) {
  return"Unknown encoding: "+e
}
), TypeError), n("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), e.exports.F=t
}
, 
6188:e=> {
  "use strict";
e.exports=Math.max
}
, 6222:e=> {
  "use strict"
;
e.exports=' {
  \r\n"0x6a": {
  "name":"magic", "read":"uint"
}
, //"jagx\\01" as header for buildnr>=936\r\n"0x00": {
  "name":"level0", "read":["array", 4356, ["struct", \r\n\t["flags", "ubyte"], //1visible, 2blocking, 4bridge/flag2, 8roofed, 16water, 32forcedraw, 64roofoverhang\r\n\t["height", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]], \r\n\t["rest", ["opt", ["flags", 0, "bitflag"], ["struct", \r\n\t\t["waterheight", ["opt", "flags&16", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]]], \r\n\t\t["underlay", "varushort"], \r\n\t\t["underlaycolor", ["opt", "underlay!=0", "ushort"]], \r\n\t\t["overlay", "varushort"], \r\n\t\t["overlay_under", ["opt", "flags&16", "varushort"]], \r\n\t\t["shape", ["opt", "overlay!=0", "ubyte"]], \r\n\t\t["underlay_under", ["opt", "overlay!=0 && flags&16", "varushort"]]\r\n\t]]]\r\n]]
}
, \r\n"0x01": {
  "name":"level1", "read":["array", 4356, ["struct", \r\n\t["flags", "ubyte"], //1visible, 2blocking, 4bridge/flag2, 8roofed, 16water, 32forcedraw, 64roofoverhang\r\n\t["height", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]], \r\n\t["rest", ["opt", ["flags", 0, "bitflag"], ["struct", \r\n\t\t["waterheight", ["opt", "flags&16", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]]], \r\n\t\t["underlay", "varushort"], \r\n\t\t["underlaycolor", ["opt", "underlay!=0", "ushort"]], \r\n\t\t["overlay", "varushort"], \r\n\t\t["overlay_under", ["opt", "flags&16", "varushort"]], \r\n\t\t["shape", ["opt", "overlay!=0", "ubyte"]], \r\n\t\t["underlay_under", ["opt", "overlay!=0 && flags&16", "varushort"]]\r\n\t]]]\r\n]]
}
, \r\n"0x02": {
  "name":"level2", "read":["array", 4356, ["struct", \r\n\t["flags", "ubyte"], //1visible, 2blocking, 4bridge/flag2, 8roofed, 16water, 32forcedraw, 64roofoverhang\r\n\t["height", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]], \r\n\t["rest", ["opt", ["flags", 0, "bitflag"], ["struct", \r\n\t\t["waterheight", ["opt", "flags&16", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]]], \r\n\t\t["underlay", "varushort"], \r\n\t\t["underlaycolor", ["opt", "underlay!=0", "ushort"]], \r\n\t\t["overlay", "varushort"], \r\n\t\t["overlay_under", ["opt", "flags&16", "varushort"]], \r\n\t\t["shape", ["opt", "overlay!=0", "ubyte"]], \r\n\t\t["underlay_under", ["opt", "overlay!=0 && flags&16", "varushort"]]\r\n\t]]]\r\n]]
}
, \r\n"0x03": {
  "name":"level3", "read":["array", 4356, ["struct", \r\n\t["flags", "ubyte"], //1visible, 2blocking, 4bridge/flag2, 8roofed, 16water, 32forcedraw, 64roofoverhang\r\n\t["height", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]], \r\n\t["rest", ["opt", ["flags", 0, "bitflag"], ["struct", \r\n\t\t["waterheight", ["opt", "flags&16", ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]]], \r\n\t\t["underlay", "varushort"], \r\n\t\t["underlaycolor", ["opt", "underlay!=0", "ushort"]], \r\n\t\t["overlay", "varushort"], \r\n\t\t["overlay_under", ["opt", "flags&16", "varushort"]], \r\n\t\t["shape", ["opt", "overlay!=0", "ubyte"]], \r\n\t\t["underlay_under", ["opt", "overlay!=0 && flags&16", "varushort"]]\r\n\t]]]\r\n]]
}
\r\n
}
'
