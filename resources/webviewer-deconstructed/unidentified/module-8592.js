// Module ID: 8592
// Category: unidentified
// Size: 2439 bytes
// Parameters: e,t,n

"use strict";
e.exports=n.p+"generated/7b294c2a03379d2c633d.js"
}
, 8648:e=> {
"use strict";
e.exports="undefined"!=typeof Reflect&&Reflect.getPrototypeOf||null
}
, 8707:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["$idcounter", "-1"], \r\n\t["locations", ["nullarray", "tailed unsigned short", ["struct", \r\n\t\t["id", ["accum", "$idcounter", ["ref", "$opcode"]]], \r\n\t\t["$location", "0"], \r\n\t\t["uses", ["nullarray", "variable unsigned short", ["struct", \r\n\t\t\t["$loc", ["accum", "$location", ["ref", "$opcode"], "add-1"]], \r\n\t\t\t["y", ["ref", "$loc", [0, 6]]], \r\n\t\t\t["x", ["ref", "$loc", [6, 6]]], \r\n\t\t\t["plane", ["ref", "$loc", [12, 2]]], \r\n\t\t\t["$data", "unsigned byte"], \r\n\t\t\t["rotation", ["ref", "$data", [0, 2]]], \r\n\t\t\t["type", ["ref", "$data", [2, 5]]], \r\n\t\t\t["extra", ["opt", ["$data", 7, "bitflag"], ["struct", \r\n\t\t\t\t["flags", "unsigned byte"], \r\n\t\t\t\t["rotation", ["opt", ["flags", 0, "bitflag"], ["array", 4, "short"]]], \r\n\t\t\t\t["translateX", ["opt", ["flags", 1, "bitflag"], "short"]], \r\n\t\t\t\t["translateY", ["opt", ["flags", 2, "bitflag"], "short"]], \r\n\t\t\t\t["translateZ", ["opt", ["flags", 3, "bitflag"], "short"]], \r\n\t\t\t\t["scale", ["opt", ["flags", 4, "bitflag"], "unsigned short"]], \r\n\t\t\t\t["scaleX", ["opt", ["flags", 5, "bitflag"], "unsigned short"]], \r\n\t\t\t\t["scaleY", ["opt", ["flags", 6, "bitflag"], "unsigned short"]], \r\n\t\t\t\t["scaleZ", ["opt", ["flags", 7, "bitflag"], "unsigned short"]]\r\n\t\t\t]]]\r\n\t\t]]]\r\n\t]]]\r\n]'
}
, 8795:e=> {
  "use strict"
;
e.exports=' {
  \r\n    "0x03": {
  "name":"unk01", "read":["struct", \r\n        ["cols", "ubyte"], \r\n        ["columndata", ["nullarray", "ubyte", 255, ["struct", \r\n            ["id", ["ref", "$opcode", [0, 6]]], \r\n            ["flags", ["ref", "$opcode", [6, 2]]], \r\n            ["$rowcount", -1], \r\n            ["columns", ["chunkedarray", "ubyte", [\r\n                ["type", "varushort"]\r\n            ], [\r\n                ["$initrowcount", ["match", ["ref", "$rowcount"],  {
  \r\n                    "-1":["accum", "$rowcount", "ubyte", "hold"], \r\n                    "other":["ref", "$rowcount"]\r\n                
}
]], \r\n                //this is currently wrong,  the values are interweaved in the other direction\r\n                ["value", ["array", ["ref", "$rowcount"], ["match", ["ref", "type"],  {
  \r\n                    "0x24":"string", \r\n                    "other":"int"\r\n                
}
]]]\r\n            ]]]\r\n        ]]]\r\n    ]
}
, \r\n    "0x04": {
  "name":"table", "read":"varushort"
}
\r\n
}
'
