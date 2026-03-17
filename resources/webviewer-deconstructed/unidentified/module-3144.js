// Module ID: 3144
// Category: unidentified
// Size: 1530 bytes
// Parameters: e,t,n

"use strict";
var r=n(6743), i=n(1002), a=n(76), s=n(7119);
e.exports=s||r.call(a, i)
}
, 3269:e=> {
"use strict";
e.exports=function(e, t, n, r) {
  for(var i=65535&e, a=e>>>16&65535, s=0;
0!==n;
) {
  n-=s=n>2e3?2e3:n;
do {
  a=a+(i=i+t[r++]|0)|0
}
while(--s);
i%=65521, a%=65521
}
return i|a<<16
}
}
, 3417:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["format", "unsigned byte"], \r\n\t["timestamp", ["match", ["ref", "format"],  {
  ">=6":"uint", "other":0
}
]], \r\n\t["flags", "unsigned byte"], \r\n\t["$minorindex", "0"], \r\n\t["indices", ["chunkedarray", ["match", ["ref", "format"],  {
  ">=7":"varuint", "other":"ushort"
}
], \r\n\t\t[\r\n\t\t\t["minor", ["accum", "$minorindex", "unsigned short"]]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["name", ["opt", ["flags", 0, "bitflag"], "unsigned int"]]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["crc", "unsigned int"]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["uncompressed_crc", ["opt", ["flags", 2, "bitflag"], "unsigned int"]]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["size", ["opt", ["flags", 2, "bitflag"], "unsigned int"]], \r\n\t\t\t["uncompressed_size", ["opt", ["flags", 2, "bitflag"], "unsigned int"]]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["encryption_or_hash", ["opt", ["flags", 1, "bitflag"], ["buffer", 64, "hex"]]]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["version", "unsigned int"]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["subindexcount", "variable unsigned int"]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["$subindex", "0"], \r\n\t\t\t["subindices", ["array", ["ref", "subindexcount"], ["accum", "$subindex", "unsigned short"]]]\r\n\t\t], \r\n\t\t[\r\n\t\t\t["subnames", ["opt", ["flags", 0, "bitflag"], ["array", ["ref", "subindexcount"], "uint"]]]\r\n\t\t]\r\n\t]]\r\n]'
