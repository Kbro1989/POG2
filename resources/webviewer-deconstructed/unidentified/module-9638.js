// Module ID: 9638
// Category: unidentified
// Size: 994 bytes
// Parameters: e,t,n

"use strict";
e.exports=n.p+"generated/b582dc588329efcd7868.mp4"
}
, 9675:e=> {
"use strict";
e.exports=TypeError
}
, 9681:e=> {
  "use strict";
e.exports= {
  Z_NO_FLUSH:0, Z_PARTIAL_FLUSH:1, Z_SYNC_FLUSH:2, Z_FULL_FLUSH:3, Z_FINISH:4, Z_BLOCK:5, Z_TREES:6, Z_OK:0, Z_STREAM_END:1, Z_NEED_DICT:2, Z_ERRNO:-1, Z_STREAM_ERROR:-2, Z_DATA_ERROR:-3, 
Z_BUF_ERROR:-5, Z_NO_COMPRESSION:0, Z_BEST_SPEED:1, Z_BEST_COMPRESSION:9, Z_DEFAULT_COMPRESSION:-1, Z_FILTERED:1, Z_HUFFMAN_ONLY:2, Z_RLE:3, Z_FIXED:4, Z_DEFAULT_STRATEGY:0, Z_BINARY:0, Z_TEXT:1, Z_UNKNOWN:2, Z_DEFLATED:8
}
}
, 9694:e=> {
  "use strict"
;
e.exports='["struct", \r\n    ["magic", ["buffer", 4, "hex"]], //always "JAGA"\r\n    ["unk_1", "uint"], \r\n    ["unk_2", "uint"], //uncompressed size?\r\n    ["samplefreq", "uint"], \r\n    ["unk_3", "uint"], \r\n    ["chunks", ["chunkedarray", "uint", \r\n        [\r\n            ["len", "uint"], \r\n            ["fileid", "uint"]\r\n        ], [\r\n            ["data", ["opt", ["fileid", 0], ["buffer", ["ref", "len"], "buffer"]]]\r\n        ]\r\n    ]]\r\n]'
