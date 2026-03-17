// Module ID: 7653
// Category: unidentified
// Size: 2942 bytes
// Parameters: e,t,n

"use strict"
;
var r=n(8452), i=n(487), a=n(9211), s=n(9394), o=n(6576), l=i(s(), Object);
r(l,  {
  getPolyfill:s, implementation:a, shim:o
}
), e.exports=l
}
, 7689:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["magic", ["match", "buildnr",  {
  ">=936":["tuple", "uint", "ubyte"], "other":null
}
]], //always "jagx\\01"\r\n\t["tiles", ["array", 16384, \r\n\t\t["match", "buildnr",  {
  \r\n\t\t\t">=750":["struct", \r\n\t\t\t\t["flags", "unsigned byte"], \r\n\t\t\t\t["shape", ["opt", ["flags", 0, "bitflag"], "unsigned byte"]], \r\n\t\t\t\t["overlay", ["opt", ["flags", 0, "bitflag"], "variable unsigned short"]], \r\n\t\t\t\t["settings", ["opt", ["flags", 1, "bitflag"], "unsigned byte"]], \r\n\t\t\t\t["underlay", ["opt", ["flags", 2, "bitflag"], "variable unsigned short"]], \r\n\t\t\t\t["height", ["opt", ["flags", 3, "bitflag"], ["match", "buildnr",  {
  ">=936":"ushort", "other":"ubyte"
}
]]]\r\n\t\t\t], \r\n\t\t\t"other":["legacy_maptile"]\r\n\t\t
}
]\r\n\t]], \r\n\t["olddata", ["match", "buildnr",  {
  ">=498":null, "other":["buffer", ["bytesleft"], "hex"]
}
]], \r\n\t//1 bit per 8x8 subarea,  starting southwest,  going north and wrapping east\r\n\t["nonmembarea", ["match", "buildnr",  {
  ">=765":["buffer", 8, "hex"], "other":null
}
]], \r\n\t["extra",  {
  \r\n\t\t"0x00":  {
   "name": "unk00",  "read":["struct", \r\n\t\t\t["flags", "ubyte"], \r\n\t\t\t["unk01", ["opt", ["flags", 0, "bitflag"], ["array", 4, "ubyte"]]], //probably sun intensity+color\r\n\t\t\t["unk02", ["opt", ["flags", 1, "bitflag"], "ushort"]], \r\n\t\t\t["unk04", ["opt", ["flags", 2, "bitflag"], "ushort"]], \r\n\t\t\t["unk08", ["opt", ["flags", 3, "bitflag"], "ushort"]], \r\n\t\t\t["unk10", ["opt", ["flags", 4, "bitflag"], ["tuple", "ushort", "ushort", "ushort"]]], \r\n\t\t\t["unk20", ["opt", ["flags", 5, "bitflag"], ["array", 4, "ubyte"]]], \r\n\t\t\t["unk40", ["opt", ["flags", 6, "bitflag"], "ushort"]], \r\n\t\t\t["unk80", ["opt", ["flags", 7, "bitflag"], ["match", "buildnr",  {
  ">=759":"ushort", "other":["array", 6, "ushort"]
}
]]]\r\n\t\t]
}
, \r\n\t\t"0x01":  {
   "name": "unk01",  "read":["array", "ubyte", ["struct", \r\n\t\t\t["byte2", "ubyte"], \r\n\t\t\t["short0", "ushort"], \r\n\t\t\t["short1", "ushort"], \r\n\t\t\t["short2", "ushort"], \r\n\t\t\t["array5", ["array", "ubyte", ["array", 4, "ubyte"]]], \r\n\t\t\t["short3", "ushort"], \r\n\t\t\t["short4", "ushort"], \r\n\t\t\t["extraflags", "ubyte"], \r\n\t\t\t["extra08", ["match", "buildnr",  {
  ">=804":"ushort", "other":0
}
]], //always ffff?\r\n\t\t\t["extra1f", ["opt", ["extraflags", 31, "bitand"], "ushort"]]\r\n\t\t]]
}
, \r\n\t\t"0x02":  {
   "name": "unk02",  "read":["array", 3, ["match", "buildnr",  {
  ">=780":"float", "other":"byte"
}
]]
}
, \r\n\t\t"0x03":  {
   "name": "unk03",  "read":["tuple", "short", "float"]
}
, \r\n\t\t"0x80":  {
   "name": "unk80",  "read":["struct", \r\n\t\t\t["environment", "ushort"], \r\n\t\t\t["always00", ["buffer", 8, "hex"]]\r\n\t\t]
}
, \r\n\t\t"0x81":  {
   "name": "unk81",  "read":["array", 4, ["struct", \r\n\t\t\t["flag", "ubyte"], \r\n\t\t\t["data", ["opt", ["flag", 0, "bitflag"], ["buffer", 256, "hex"]]]\r\n\t\t]]
}
, \r\n\t\t"0x82":  {
   "name": "unk82",  "read":"true" 
}
//changable skybox/lighting?\r\n\t
}
]\r\n]'
