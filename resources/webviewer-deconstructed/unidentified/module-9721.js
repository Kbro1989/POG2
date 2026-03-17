// Module ID: 9721
// Category: unidentified
// Size: 1199 bytes
// Parameters: e,t,n

"use strict";
var r=n(6556), i=n(4035), a=r("RegExp.prototype.exec"), s=n(9675);
e.exports=function(e) {
  if(!i(e))throw new s("`regex` must be a RegExp");
return function(t) {
  return null!==a(e, t)
}
}
}
, 9774:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["data", ["chunkedarray", "ushort", \r\n\t\t[["type", "ubyte"]], \r\n\t\t[["unknown", "bool"]], \r\n\t\t[["unknown_always_FFFF", "ushort"]], \r\n\t\t[["length", "varushort"]], \r\n\t\t[["data", ["array", ["ref", "length"], "varushort"]]]\r\n\t]], \r\n\t["skeleton", ["chunkedarray", "ushort", \r\n\t\t[\r\n\t\t\t["parentbone", "ubyte"], //TODO this is wrong,  this byte is part of dataq from the previous bone\r\n\t\t\t["nonskinboneid", "ushort"], \r\n\t\t\t["bonematrix", ["array", 16, "float"]], \r\n\t\t\t//unknown,  always the same for all bones in a skeleton\r\n\t\t\t["dataq", ["buffer", 11, "hex"]]\r\n\t\t]\r\n\t]], \r\n\t\r\n\t//exact use unknown\r\n\t//contains more entries that the skeleton list\r\n\t//seems to be a list of "short le"\r\n\t//highest possible rounded up to 16 for first bone,  always counts down to 2 on bones after that\r\n\t//but also some times starts at 0 or a different number and not always unique\r\n\t["activebones", ["buffer", ["bytesleft"], "hex"]]\r\n]'
