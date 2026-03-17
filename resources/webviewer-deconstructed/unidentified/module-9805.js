// Module ID: 9805
// Category: unidentified
// Size: 3075 bytes
// Parameters: e,t

"use strict";
var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;
function r(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t)
}
t.assign=function(e) {
for(var t=Array.prototype.slice.call(arguments, 1);
t.length;
) {
  var n=t.shift();
if(n) {
  if("object"!=typeof n)throw new TypeError(n+"must be non-object");
for(var i in n)r(n, i)&&(e[i]=n[i])
}
}
return e
}
, t.shrinkBuf=function(e, t) {
return e.length===t?e:e.subarray?e.subarray(0, t):(e.length=t, e)
}
;
var i= {
  arraySet:function(e, t, n, r, i) {
  if(t.subarray&&e.subarray)e.set(t.subarray(n, n+r), i);
else for(var a=0;
a<r;
a++)e[i+a]=t[n+a]
}
, flattenChunks:function(e) {
  var t, n, r, i, a, s;
for(r=0, t=0, 
n=e.length;
t<n;
t++)r+=e[t].length;
for(s=new Uint8Array(r), i=0, t=0, n=e.length;
t<n;
t++)a=e[t], s.set(a, i), i+=a.length;
return s
}
}
, a= {
  arraySet:function(e, t, n, r, i) {
  for(var a=0;
a<r;
a++)e[i+a]=t[n+a]
}
, flattenChunks:function(e) {
  return[].concat.apply([], e)
}
}
;
t.setTyped=function(e) {
  e?(t.Buf8=Uint8Array, t.Buf16=Uint16Array, t.Buf32=Int32Array, t.assign(t, i)):(t.Buf8=Array, t.Buf16=Array, t.Buf32=Array, t.assign(t, a))
}
, t.setTyped(n)
}
, 9833:e=> {
  "use strict"
;
e.exports='["struct", \r\n    ["$idcount", 0], \r\n    ["mats", ["chunkedarray", "ushort", \r\n        [["id", ["accum", "$idcount", 1, "postadd"]]], \r\n        [["hasprops", "ubyte"]], //always 1,  rarely 0\r\n        [["unk1", ["opt", ["hasprops", 0, "eqnot"], "ubyte"]]], //1 or 0\r\n        [["unk2", ["opt", ["hasprops", 0, "eqnot"], "ubyte"]]], //1 or 0       \r\n        [["unk3", ["match", "buildnr",  {
  ">627":null, "other":["opt", ["hasprops", 0, "eqnot"], "ubyte"]
}
]]], //mostly 00,  1x 0001 1x 0080\r\n        [["unk4", ["opt", ["hasprops", 0, "eqnot"], "ushort"]]], //mostly 00,  1x 0001 1x 0080\r\n        [["basecolorfraction", ["opt", ["hasprops", 0, "eqnot"], "ubyte"]]], //00,  or ff,  some in between\r\n        [["unk6", ["opt", ["hasprops", 0, "eqnot"], "ubyte"]]], //0-5\r\n        [["unk7", ["opt", ["hasprops", 0, "eqnot"], "ubyte"]]], //0-4 1x 82\r\n        [["basecolor", ["opt", ["hasprops", 0, "eqnot"], "ushort"]]], \r\n        [["unk10", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk11", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk20", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk21", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk30", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk31", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk32", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk33", ["match", "buildnr",  {
  ">554":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]], \r\n        [["unk40", ["match", "buildnr",  {
  ">578":["opt", ["hasprops", 0, "eqnot"], ["buffer", 5, "hex"]], "other":null
}
]]], \r\n        [["unk41", ["match", "buildnr",  {
  ">597":["opt", ["hasprops", 0, "eqnot"], "ubyte"], "other":null
}
]]]\r\n    ]]\r\n]'
