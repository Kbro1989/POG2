// Module ID: 1064
// Category: unidentified
// Size: 5473 bytes
// Parameters: e,t,n

"use strict";
var r=n(9612);
e.exports=r.getPrototypeOf||null
}
, 1092:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["header", "ubyte"], \r\n\t["framebase", "ushort"], \r\n\t["endtime", "uint"], \r\n\t["unk_always0", "ubyte"], \r\n\t["tracks", ["array", "ushort", ["struct", \r\n\t\t//seems to correlate to action type \r\n\t\t//1=standard bone(1-9) 2=unknown(7x 3,  14x 7,  14x 8),  3=unknown(10-15),  3=unknown(16)\r\n\t\t["unk_1to4", "ubyte"], \r\n\t\t//boneid+0x40,  or boneid+0x4040 if 2 byte//TODO is this smartShortBias?\r\n\t\t["boneid", "varushort"], \r\n\t\t//animation type 1-3=rotatexyz,  4-6=translatexyz 7-9=scalexyz\r\n\t\t["type_0to9", "ubyte"], \r\n\t\t["$packetlength", "ushort"], \r\n\t\t//interpolation mode? 0=euler,  1=linear,  3lin/log???\r\n\t\t//0=rotation (1, 2, 3),  1=translation (4, 5, 6, 13, 14, 15, some 16),  3=scale (7, 8, 9, 10, 11, 12, some 16, some 3)\r\n\t\t["bonetype_01or3", "ubyte"], \r\n\t\t["always0", "ushort"], \r\n\t\t["flag2", "bool"], \r\n\t\t["chunks", ["array", ["ref", "$packetlength"], ["struct", \r\n\t\t\t["time", "ushort"], \r\n\t\t\t["value", ["array", 5, "float"]]\r\n\t\t]]]\r\n\t]]]\r\n]'
}
, 1093:e=> {
  "use strict";
var t=Object.prototype.toString;
e.exports=function(e) {
  var n=t.call(e), r="[object Arguments]"===n
;
return r||(r="[object Array]"!==n&&null!==e&&"object"==typeof e&&"number"==typeof e.length&&e.length>=0&&"[object Function]"===t.call(e.callee)), r
}
}
, 1135:e=> {
  e.exports=function(e) {
return e&&"object"==typeof e&&"function"==typeof e.copy&&"function"==typeof e.fill&&"function"==typeof e.readUInt8
}
}
, 1140:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x04":  {
   "name":              "unk04",  "read": "true" 
}
, \r\n\t"0x65":  {
   "name":              "type",  "read": ["struct", \r\n\t\t["vartype", "varushort"], \r\n\t\t["$primitive", "ubyte"], \r\n\t\t["defaultint", ["opt", ["$primitive", 2], "int"]], \r\n\t\t["defaultstring", ["opt", ["$primitive", 5], "string"]]\r\n\t] 
}
\r\n
}
'
}
, 1171:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                              "frames",  "read": ["chunkedarray", "unsigned short", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[["framelength", "unsigned short"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[["frameidlow", "unsigned short"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[["frameidhi", "unsigned short"]]\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t]
}
, \r\n\t"0x02":  {
   "name":                          "unknown_02",  "read": "ushort" 
}
, \r\n\t"0x03":  {
   "name":                          "unknown_03",  "read": ["array", "ubyte", "ubyte"] 
}
, \r\n\t"0x04":  {
   "name":                          "unknown_04",  "read": "true" 
}
, \r\n\t"0x05":  {
   "name":                          "unknown_05",  "read": "ubyte" 
}
, \r\n\t"0x06":  {
   "name":                          "unknown_06",  "read": "ushort" 
}
, \r\n\t"0x07":  {
   "name":                          "unknown_07",  "read": "ushort" 
}
, \r\n\t"0x08":  {
   "name":                          "unknown_08",  "read": "ubyte" 
}
, \r\n\t"0x09":  {
   "name":                          "unknown_09",  "read": "ubyte" 
}
, \r\n\t"0x0A":  {
   "name":                          "unknown_0A",  "read": "ubyte" 
}
, \r\n\t"0x0B":  {
   "name":                          "unknown_0B",  "read": "ubyte" 
}
, \r\n\t"0x0C":  {
   "name":                          "unknown_0C",  "read": ["chunkedarray", "ubyte", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[["framelength", "unsigned short"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[["frameidlow", "unsigned short"]]\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t]
}
, \r\n\t"0x0D":  {
   "name":                          "unknown_0D",  "read": ["array", "unsigned short", ["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["$keys", "unsigned byte"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["default", ["opt", ["$keys", 0, "eqnot"], "unsigned short"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["weirdbyte", ["opt", ["$keys", 0, "eqnot"], "unsigned byte"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["extras", ["array", ["ref", "$keys", null, -1], "unsigned short"]] \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t]]
}
, \r\n\t"0x0E":  {
   "name":                          "unknown_0E",  "read": "true" 
}
, \r\n\t"0x0F":  {
   "name":                          "unknown_0F",  "read": "true" 
}
, \r\n\t"0x10":  {
   "name":                          "unknown_10",  "read": "true" 
}
, \r\n\t"0x11":  {
   "name":                          "unknown_11",  "read": "ubyte" 
}
, \r\n\t"0x12":  {
   "name":                          "unknown_12",  "read": "true" 
}
, \r\n\t"0x13":  {
   "name":                          "unknown_13",  "read": "unsigned short" 
}
, \r\n\t"0x14":  {
   "name":                          "unknown_14",  "read": ["buffer", 5, "hex"] 
}
, \r\n\t"0x16":  {
   "name":                          "unknown_16",  "read": "unsigned byte" 
}
, \r\n\t"0x18":  {
   "name":                          "unknown_18",  "read": "unsigned short" 
}
, \r\n\t"0x19":  {
   "name":                  "skeletal_animation",  "read": "unsigned short" 
}
, \r\n\t"0x1a":  {
   "name":                      "skeletal_range",  "read": ["tuple", "ushort", "ushort"] 
}
, \t\r\n\t"0x1b":  {
   "name":                          "unknown_1B",  "read": "ubyte" 
}
, \t\r\n\r\n\t"0x70":  {
   "name":                          "unknown_70",  "read": ["chunkedarray", "unsigned short", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[["intlow", "unsigned short"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[["maybe_file", "unsigned short"]]] 
}
, \r\n\t"0x77":  {
   "name":                          "unknown_77",  "read": ["tuple", "unsigned short", "unsigned byte"] 
}
, \r\n\t"0x78":  {
   "name":                          "unknown_78",  "read": ["tuple", "unsigned short", "unsigned short", "unsigned short"] 
}
, \r\n\r\n\t"0xF9":  {
   "name":                               "extra",  "read": "extrasmap" 
}
\r\n
}
'
