// Module ID: 6455
// Category: unidentified
// Size: 1106 bytes
// Parameters: 


}
, 6502:e=> {
  "use strict"
;
e.exports='["struct", \r\n    ["type", "ubyte"], \r\n    ["sprite", ["opt", "type!=2", ["struct", \r\n        ["complexkerning", "ubyte"], \r\n        ["sourceid", ["match", ["ref", "type"],  {
  "1":"int", "other":-1
}
]], \r\n        ["chars", ["chunkedarray", 256, [\r\n            ["width", "ubyte"]\r\n        ], [\r\n            ["height", "ubyte"]\r\n        ], [\r\n            ["bearingy", "ubyte"]\r\n        ]]], \r\n        ["sheetwidth", "ushort"], \r\n        ["sheetheight", "ushort"], \r\n        ["positions", ["chunkedarray", 256, [\r\n            ["x", "ushort"]\r\n        ], [\r\n            ["y", "ushort"]\r\n        ]]], \r\n        ["baseline", ["match", ["ref", "complexkerning"],  {
  "1":0, "other":"byte"
}
]], \r\n        ["uppercaseascent", "ubyte"], \r\n        ["median", "ubyte"], \r\n        ["maxascent", "ubyte"], \r\n        ["maxdescent", "ubyte"], \r\n        ["scale", "ubyte"]\r\n    ]]], \r\n    ["vector", ["opt", "type==2", ["struct", \r\n        ["sourceid", "uint"], \r\n        ["size", "ubyte"]\r\n    ]]]\r\n]'
}
, 6508:e=> {
  "use strict";
e.exports='["struct", \r\n    //TODO\r\n    ["unk", "ubyte"]\r\n]'
