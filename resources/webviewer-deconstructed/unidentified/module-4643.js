// Module ID: 4643
// Category: unidentified
// Size: 14730 bytes
// Parameters: e,t,n

function r(e) {
  try {
  if(!n.g.localStorage)return!1
}
catch(e) {
  return!1
}
var t=n.g.localStorage[e];
return null!=t&&"true"===String(t).toLowerCase()
}
e.exports=function(e, t) {
  if(r("noDeprecation"))return e;
var n=!1;
return function() {
  if(!n) {
  if(r("throwDeprecation"))throw new Error(t)
;
r("traceDeprecation")?console.trace(t):console.warn(t), n=!0
}
return e.apply(this, arguments)
}
}
}
, 4674:e=> {
  "use strict";
e.exports= {
  2:"need dictionary", 1:"stream end", 0:"", "-1":"file error", "-2":"stream error", "-3":"data error", 
"-4":"insufficient memory", "-5":"buffer error", "-6":"incompatible version"
}
}
, 4810:e=> {
  "use strict"
;
e.exports='//works from 500 to 932,  system is entirely different below 500\r\n["struct", \r\n    ["version", ["match", "buildnr",  {
  ">500":"byte", "other":-1
}
]], //-1, 3, 4, 5, 6, 9\r\n    ["type", "ubyte"], \r\n    ["name", ["opt", "type&0x80", "string"]], \r\n    ["contenttype", "ushort"], \r\n    ["baseposx", "short"], \r\n    ["baseposy", "short"], \r\n    ["basewidth", "short"], \r\n    ["baseheight", "short"], \r\n    ["aspectwidthtype", "byte"], \r\n    ["aspectheighttype", "byte"], \r\n    ["aspectxtype", "byte"], \r\n    ["aspectytype", "byte"], \r\n    ["parentid", "ushort"], \r\n    ["hidden", "ubyte"], \r\n    ["containerdata", ["opt", "type=0", ["struct", \r\n        ["layerwidth", "ushort"], \r\n        ["layerheight", "ushort"], \r\n        ["layerheightextra", ["opt", "layerheight&0x8000", "uint"]], //????\r\n        ["disablehover", ["opt", "version==-1", "bool"]], \r\n        ["v6unk1", ["opt", "version>=6", "uint"]], \r\n        ["v6unk2", ["opt", "version==6", "uint"]]\r\n    ]]], \r\n    ["figuredata", ["opt", "type=3", ["struct", \r\n        ["color", "uint"], \r\n        ["filled", "ubyte"], //more to this,  weird\r\n        ["trans", "byte"]\r\n    ]]], \r\n    ["textdata", ["opt", "type=4", ["struct", \r\n        ["fontid", "varuint"], \r\n        ["unk1", ["match",  {
  "version>=0":"ubyte", "other":false
}
]], \r\n        ["text", "string"], \r\n        ["unk2", "ubyte"], \r\n        ["alignhor", "ubyte"], \r\n        ["alignver", "ubyte"], \r\n        ["shadow", "bool"], \r\n        ["color", "uint"], \r\n        ["trans", "ubyte"], \r\n        ["multiline", ["opt", "version>=0", "ubyte"]]\r\n    ]]], \r\n    ["spritedata", ["opt", "type=5", ["struct", \r\n        ["spriteid", "int"], \r\n        ["rotation", "ushort"], \r\n        ["tiling", "ubyte"], \r\n        ["aspectwidthdata", ["match",  {
  "aspectwidthtype==4":"uint", "other":-1
}
]], \r\n        ["aspectheightdata", ["match",  {
  "aspectheighttype==4":"uint", "other":-1
}
]], \r\n        ["transparency", "ubyte"], \r\n        ["borderthickness", "ubyte"], \r\n        ["unk2", "int"], \r\n        ["vflip", "bool"], \r\n        ["hflip", "bool"], \r\n        ["color", "uint"], \r\n        ["clickmask", ["opt", "version>=0", "ubyte"]], \r\n        ["v6unk", ["opt", "version>=6", "uint"]]\r\n    ]]], \r\n    ["modeldata", ["opt", "type=6", ["struct", \r\n        ["modelid", ["match", "buildnr",  {
  ">616":"varuint", "other":"ushort"
}
]], \r\n        ["mode", ["match", "buildnr",  {
  ">616":"ubyte", "other":1
}
]], \r\n        ["positiondata", ["opt", "mode!=0", ["struct", \r\n            ["translate_x", "short"], \r\n            ["translate_y", "short"], \r\n            ["unkextra", ["opt", "mode=2", "short"]], \r\n            ["rotate_x", "ushort"], \r\n            ["rotate_y", "ushort"], \r\n            ["rotate_z", "ushort"], \r\n            ["zoom", "ushort"]//can be signed? if mode is 2\r\n        ]]], \r\n        ["animid", ["match", "buildnr",  {
  ">616":"varuint", "other":"ushort"
}
]], \r\n        ["unkdata", ["match", "buildnr",  {
  ">616":null, "other":["buffer", 6, "hex"]
}
]], \r\n        ["aspectwidthdata", ["match",  {
  "aspectwidthtype!=0":"ushort", "other":-1
}
]], \r\n        ["aspectheightdata", ["match",  {
  "aspectheighttype!=0":"ushort", "other":-1
}
]]\r\n    ]]], \r\n    ["linedata", ["opt", "type=9", ["struct", \r\n        ["width", "ubyte"], \r\n        ["color", "uint"], \r\n        ["dir", "bool"]\r\n    ]]], \r\n    ["unk10data", ["opt", "type=10", ["struct", \r\n        ["data", ["buffer", 41, "hex"]], \r\n        ["str1", "string"], \r\n        ["data2", ["buffer", 10, "hex"]]\r\n    ]]], \r\n    ["unk11data", ["opt", "type=11", ["struct", \r\n        ["data", ["buffer", 6, "hex"]]\r\n    ]]], \r\n    ["unk12data", ["opt", "type=12", ["struct", \r\n        ["data", ["buffer", 36, "hex"]], \r\n        ["str", "string"], \r\n        ["data2", ["buffer", 10, "hex"]]\r\n    ]]], \r\n    ["unk13data", ["opt", "type=13", ["struct", \r\n        ["data", ["buffer", 125, "hex"]]\r\n    ]]], \r\n    ["unk15data", ["opt", "type=15", ["struct", \r\n        ["data", ["buffer", 10, "hex"]]\r\n    ]]], \r\n    ["unk16data", ["opt", "type=16", ["struct", \r\n        ["data", ["buffer", 179, "hex"]]//or 188 or 238,  no clue how this works\r\n    ]]], \r\n    ["unkffff", ["opt", "version>=6", "uint"]], \r\n\r\n\r\n\r\n    ["optmask", "ushort"], \r\n    ["unk2", "ubyte"], \r\n    ["unkprepre3", ["opt", "version>=7", "ubyte"]], \r\n    ["unkpre3", ["opt", "version>=6", "ubyte"]], //might be style class\r\n    ["unk3", ["match",  {
  \r\n        "version==-1":["nullarray", "ubyte", ["buffer", 3, "hex"]], \r\n        "other":["struct", \r\n            ["op", "ubyte"], \r\n            ["data", ["opt", "op!=0", ["buffer", 4, "hex"]]\r\n        ]]\r\n    
}
]], \r\n    ["name2", "string"], \r\n    \r\n    ["menucounts", "ubyte"], \r\n    ["rightclickopts", ["array", ["ref", "menucounts", [0, 4]], "string"]], \r\n    ["rightclickcursors", ["array", ["ref", "menucounts", [4, 4]], ["struct", \r\n        ["op", "ubyte"], \r\n        ["cursor", "ushort"]\r\n    ]]], \r\n    ["unkstring1", ["opt", "optmask!&0x0400", "string"]], \r\n    ["unk4", "ubyte"], \r\n    ["bit4data", ["opt", "optmask&0x0400", "ubyte"]], \r\n    ["unk5", "ubyte"], \r\n    ["unk6", "ubyte"], \r\n    ["unkstuff123", "string"], \r\n    ["optmask1data_bit40", ["opt", "optmask&0x0240", ["buffer", 6, "hex"]]], \r\n    ["cursor", ["match",  {
  "version>=0":"ushort", "other":-1
}
]], \r\n    ["unkdata", ["opt", "version>=0", "ushort"]], \r\n    ["unkdatadata", ["opt", "version>=0 && unkdata!=0", ["buffer", 6, "hex"]]], \r\n\r\n    ["scripts", ["struct", \r\n        ["load", "uivalues"], \r\n        ["mousehover", "uivalues"], \r\n        ["mouseleave", "uivalues"], \r\n        ["unk0", "uivalues"], \r\n        ["unk1", "uivalues"], \r\n        ["unk2", "uivalues"], \r\n        ["unk3", "uivalues"], \r\n        ["unk4", "uivalues"], \r\n        ["unk5", "uivalues"], \r\n        ["unk6", "uivalues"], //triggerop\r\n        ["unk7", ["opt", "version>=0", "uivalues"]], \r\n        ["hovertext", "uivalues"], \r\n        ["unk8", "uivalues"], //mousedown\r\n        ["unk9", "uivalues"], \r\n        ["unk10", "uivalues"], //mouseup\r\n        ["unk11", "uivalues"], \r\n        ["unk12", "uivalues"], \r\n        ["unk13", "uivalues"], \r\n        ["unk14", "uivalues"], \r\n        ["unk15", "uivalues"], \r\n        ["unk16", "uivalues"], \r\n        ["unk17", ["opt", "version>=6", "uivalues"]], \r\n        ["unk18", ["opt", "version>=6", "uivalues"]], \r\n        ["unk19", ["opt", "version>=6", "uivalues"]], \r\n        ["unk20", ["opt", "version>=7", "uivalues"]], \r\n\r\n        ["v2unk0", "uivaluesint"], //"config"\r\n        ["v2unk1", "uivaluesint"], \r\n        ["v2unk2", "uivaluesint"], \r\n        ["v2unk3", "uivaluesint"], \r\n        ["v2unk4", "uivaluesint"]\r\n    ]]\r\n]'
}
, 4823:e=> {
  "use strict";
var t=function() {
  for(var e, t=[], n=0;
n<256;
n++) {
  e=n;
for(var r=0;
r<8;
r++)e=1&e?3988292384^e>>>1:e>>>1;
t[n]=e
}
return t
}
();
e.exports=function(e, n, r, i) {
  var a=t, s=i+r;
e^=-1;
for(var o=i;
o<s;
o++)e=e>>>8^a[255&(e^n[o])];
return~e
}
}
, 
4827:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                              "sprite",  "read": "varuint" 
}
, \r\n\t"0x02":  {
   "name":                        "sprite_hover",  "read": "varuint" 
}
, \r\n\t"0x03":  {
   "name":                                "text",  "read": "string" 
}
, \r\n\t"0x04":  {
   "name":                             "color_1",  "read": ["tuple", "ubyte", "ubyte", "ubyte"] 
}
, \r\n\t"0x05":  {
   "name":                             "color_2",  "read": ["tuple", "ubyte", "ubyte", "ubyte"] 
}
, \r\n\t"0x06":  {
   "name":                           "font_size",  "read": "ubyte" 
}
, \r\n\t"0x07":  {
   "name":                          "unknown_07",  "read": "ubyte" 
}
, \r\n\t"0x08":  {
   "name":                          "unknown_08",  "read": "ubyte" 
}
, \r\n\t"0x09":  {
   "name":                            "toggle_1",  "read": ["struct", \r\n                                                                        ["varbit", "ushort"], \r\n                                                                        ["varp", "ushort"], \r\n                                                                        ["lower", "uint"], \r\n                                                                        ["upper", "uint"]\r\n                                                                    ] 
}
, \r\n    "0x0a":  {
   "name":                        "rightclick_1",  "read": "string" 
}
, \r\n    "0x0b":  {
   "name":                          "unktext_0b",  "read": "string" 
}
, \r\n\t"0x0f":  {
   "name":                             "polygon",  "read": ["struct", \r\n                                                                        ["pointcount", "ubyte"], \r\n                                                                        ["points", ["array", ["ref", "pointcount"], ["struct", \r\n                                                                            ["x", "short"], \r\n                                                                            ["y", "short"]\r\n                                                                        ]]], \r\n                                                                        ["color", ["tuple", "ubyte", "ubyte", "ubyte", "ubyte"]], \r\n                                                                        ["always_1", ["match", "buildnr",  {
  ">=623":"ubyte", "other":1
}
]], \r\n                                                                        //back color and color are also flipped before 623\r\n                                                                        ["back_color", ["tuple", "ubyte", "ubyte", "ubyte", "ubyte"]], \r\n                                                                        ["pointplanes", ["match", "buildnr",  {
  \r\n                                                                            ">=629":["array", ["ref", "pointcount"], "ubyte"], \r\n                                                                            "other":null\r\n                                                                        
}
]]\r\n                                                                    ] 
}
, \r\n\t"0x11":  {
   "name":                        "rightclick_2",  "read": "string" 
}
, \r\n\t"0x13":  {
   "name":                            "category",  "read": "ushort" 
}
, \r\n\t"0x14":  {
   "name":                            "toggle_2",  "read": ["struct", \r\n                                                                        ["varbit", "ushort"], \r\n                                                                        ["varp", "ushort"], \r\n                                                                        ["lower", "uint"], \r\n                                                                        ["upper", "uint"]\r\n                                                                    ] 
}
, \r\n\t"0x15":  {
   "name":                          "unknown_15",  "read": "int" 
}
, \r\n\t"0x16":  {
   "name":                          "unknown_16",  "read": "int" 
}
, \r\n\t"0x19":  {
   "name":                   "background_sprite",  "read": "varuint" 
}
, \r\n\t"0x1a":  {
   "name":                       "legacy_switch",  "read": ["struct", \r\n                                                                        ["varbit", "ushort"], \r\n                                                                        ["varp", "ushort"], \r\n                                                                        ["value", "ubyte"], \r\n                                                                        ["default_ref", "ushort"], \r\n                                                                        ["legacy_ref", "ushort"]\r\n                                                                    ] 
}
, \r\n\t"0x1c":  {
   "name":                          "unknown_1c",  "read": "ubyte" 
}
, \r\n\t"0x1e":  {
   "name":                          "unknown_1e",  "read": "ubyte" 
}
, \r\n\t"0xF9":  {
   "name":                               "extra",  "read": "extrasmap" 
}
\r\n
}
'
}
, 4882:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["$flags", "ushort"], \r\n\t//can\'t use array since i don\'t have a way to ref array index in the flag...\r\n\t["slots", ["tuple", \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 0, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 1, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 2, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 3, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 4, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 5, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 6, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 7, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 8, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 9, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 10, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 11, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 12, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 13, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 14, "bitflag"], "playeritemedit"]]\r\n\t\t], \r\n\t\t["struct", \r\n\t\t\t["slot", ["itemvar", "ref"]], \r\n\t\t\t["cust", ["opt", ["$flags", 15, "bitflag"], "playeritemedit"]]\r\n\t\t]\r\n\t]], \r\n\t["haircol0", "ubyte"], \r\n\t["bodycol", "ubyte"], \r\n\t["legscol", "ubyte"], \r\n\t["bootscol", "ubyte"], \r\n\t["skincol0", "ubyte"], \r\n\t["skincol1", "ubyte"], \r\n\t["haircol1", "ubyte"], \r\n\t["unkbuf", ["buffer", 13, "hex"]], \r\n\t["stance", "ushort"]\r\n]'
