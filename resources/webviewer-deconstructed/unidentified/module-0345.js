// Module ID: 345
// Category: unidentified
// Size: 943 bytes
// Parameters: e,t,n

e.exports=n(7007).EventEmitter
}
, 366:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["byte0", ["match", "buildnr",  {
  ">458":"ubyte", "other":0
}
]], \r\n\t["switchsize", ["match", "buildnr",  {
  ">=495":["footer", 2, "ushort"], "other":0
}
]], \r\n\t["switches", ["footer", ["ref", "switchsize"], \r\n\t\t["array", ["match", "buildnr",  {
  ">=495":"ubyte", "other":0
}
], ["array", "ushort", ["struct", \r\n\t\t\t["value", "int"], \r\n\t\t\t["jump", "uint"]\r\n\t\t]]]\r\n\t]], \r\n\t["longargcount", ["match", "buildnr",  {
  ">641":["footer", 2, "ushort"], "other":0
}
]], \r\n\t["stringargcount", ["footer", 2, "ushort"]], \r\n\t["intargcount", ["footer", 2, "ushort"]], \r\n\t["locallongcount", ["match", "buildnr",  {
  ">641":["footer", 2, "ushort"], "other":0
}
]], \r\n\t["localstringcount", ["footer", 2, "ushort"]], \r\n\t["localintcount", ["footer", 2, "ushort"]], \r\n\t["instructioncount", ["footer", 4, "uint"]], \r\n\t["opcodedata", ["buffer", ["bytesleft"], "buffer"]]\r\n]'
}
, 414:e=> {
  "use strict";
e.exports=Math.round
