// Module ID: 3628
// Category: unidentified
// Size: 705 bytes
// Parameters: e,t,n

"use strict";
var r=n(8648), i=n(1064), a=n(7176)
;
e.exports=r?function(e) {
  return r(e)
}
:i?function(e) {
  if(!e||"object"!=typeof e&&"function"!=typeof e)throw new TypeError("getProto: not an object");
return i(e)
}
:a?function(e) {
  return a(e)
}
:null
}
, 3653:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                           "color",  "read": ["array", 3, "unsigned byte"] 
}
, \r\n\t"0x02":  {
   "name":                        "material",  "read": "unsigned short" 
}
, \r\n\t"0x03":  {
   "name":                 "material_tiling",  "read": "unsigned short" 
}
, \r\n\t"0x04":  {
   "name":                    "unknown_0x04",  "read": "true" 
}
, \r\n\t"0x05":  {
   "name":                    "unknown_0x05",  "read": "true" 
}
\r\n
}
'
