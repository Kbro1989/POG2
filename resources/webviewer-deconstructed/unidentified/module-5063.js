// Module ID: 5063
// Category: unidentified
// Size: 3213 bytes
// Parameters: 


}
, 5157:e=> {
  e.exports=function() {
  throw new Error("Readable.from is not available in the browser")
}
}
, 5191:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                            "baseAnims",  "read": ["struct", ["idle", "animid"], ["walk", "animid"]] 
}
, \r\n\t"0x02":  {
   "name":                           "unknown_02",  "read": "animid" 
}
, //also walk?\r\n\t"0x03":  {
   "name":                           "unknown_03",  "read": "animid" 
}
, \r\n\t"0x05":  {
   "name":                           "unknown_05",  "read": "animid" 
}
, \r\n\t"0x04":  {
   "name":                           "unknown_04",  "read": "animid" 
}
, \r\n\t"0x06":  {
   "name":                                  "run",  "read": "animid" 
}
, \r\n\t"0x07":  {
   "name":                           "unknown_07",  "read": "animid" 
}
, \r\n\t"0x08":  {
   "name":                           "unknown_08",  "read": "animid" 
}
, \r\n\t"0x09":  {
   "name":                           "unknown_09",  "read": "animid" 
}
, \r\n\t"0x1a":  {
   "name":                           "unknown_1a",  "read": ["tuple", "ubyte", "ubyte"] 
}
, \r\n\t"0x1b":  {
   "name":                           "unknown_1b",  "read": "animid" 
}
, \r\n\t"0x26":  {
   "name":                           "unknown_26",  "read": "animid" 
}
, //walk\r\n\t"0x27":  {
   "name":                           "unknown_27",  "read": "animid" 
}
, //walk\r\n\t"0x28":  {
   "name":                           "unknown_28",  "read": "animid" 
}
, //backward walk??\r\n\t"0x29":  {
   "name":                           "unknown_29",  "read": "animid" 
}
, //walk sideways left\r\n\t"0x2a":  {
   "name":                           "unknown_2a",  "read": "animid" 
}
, //walk sideways right\r\n\t"0x2b":  {
   "name":                           "unknown_2b",  "read": "animid" 
}
, \r\n\t"0x2c":  {
   "name":                           "unknown_2c",  "read": "animid" 
}
, \r\n\t"0x2d":  {
   "name":                           "unknown_2d",  "read": "animid" 
}
, \r\n\t"0x2e":  {
   "name":                           "unknown_2e",  "read": "animid" 
}
, \r\n\t"0x2f":  {
   "name":                           "unknown_2f",  "read": "animid" 
}
, \r\n\t"0x30":  {
   "name":                           "unknown_30",  "read": "animid" 
}
, \r\n\t"0x31":  {
   "name":                           "unknown_31",  "read": "animid" 
}
, \r\n\t"0x32":  {
   "name":                           "unknown_32",  "read": "animid" 
}
, //also walk\r\n\t"0x33":  {
   "name":                           "unknown_33",  "read": "animid" 
}
, //also walk\r\n\t"0x34":  {
   "name":                           "idleVariations",  "read": ["array", "ubyte", ["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t["animid", "animid"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t["probably_chance", "ubyte"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t["always0", ["match", "buildnr",  {
  ">=916":"ubyte", "other":0
}
]]\r\n\t\t\t\t\t\t\t\t\t\t\t\t]] 
}
, \r\n\t"0x35":  {
   "name":                           "unknown_35",  "read": "true" 
}
, \r\n\t"0x36":  {
   "name":                           "unknown_36",  "read": ["tuple", "ubyte", "ubyte"] 
}
\r\n
}
'
}
, 5208:e=> {
  "use strict";
var t, n="";
e.exports=function(e, r) {
  if("string"!=typeof e)throw new TypeError("expected a string");
if(1===r)return e;
if(2===r)return e+e;
var i=e.length*r;
if(t!==e||void 0===t)t=e, n="";
else if(n.length>=i)return n.substr(0, i)
;
for(;
i>n.length&&r>1;
)1&r&&(n+=e), r>>=1, e+=e;
return n=(n+=e).substr(0, i)
}

