// Module ID: 3903
// Category: unidentified
// Size: 5177 bytes
// Parameters: 


}
, 3908:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["format", "ubyte"], \r\n\t["version", "ubyte"], \r\n\t["always_0f", "ubyte"], \r\n\r\n\t["meshCount", "ubyte"], \r\n\t["unkCount0", "ubyte"], \r\n\t["unkCount1", "ubyte"], \r\n\t["unkCount2", "ubyte"], \r\n\t["unkCount3", "ubyte"], \r\n\t["unkCount4", ["match",  {
  "version>=5":"ubyte", "other":0
}
]], \r\n\r\n\t["meshes", ["opt", "version<=3", ["array", ["ref", "meshCount"], ["struct", \r\n\t\t["$groupFlags", "ubyte"], \r\n\t\t["unkint", "uint"], \r\n\t\t["materialArgument", "ushort le"], \r\n\t\t["faceCount", "ushort le"], \r\n\r\n\t\t["hasVertices", ["ref", "$groupFlags", [0, 1]]], \r\n\t\t["hasVertexAlpha", ["ref", "$groupFlags", [1, 1]]], \r\n\t\t["hasFaceBones", ["ref", "$groupFlags", [2, 1]]], \r\n\t\t["hasBoneIds", ["ref", "$groupFlags", [3, 1]]], \r\n\t\t["isHidden", ["ref", "$groupFlags", [4, 1]]], \r\n\t\t["hasSkin", ["ref", "$groupFlags", [5, 1]]], \r\n\r\n\t\t\r\n\t\t["colourBuffer", ["opt", ["hasVertices", 1], ["buffer", ["ref", "faceCount"], "ushort"]]], \r\n\t\t["alphaBuffer", ["opt", ["hasVertexAlpha", 1], ["buffer", ["ref", "faceCount"], "ubyte"]]], \r\n\t\t["faceboneidBuffer", ["opt", ["hasFaceBones", 1], ["buffer", ["ref", "faceCount"], "ushort"]]], \r\n\r\n\t\t//the length field for the indexbuffer can overflow when the model has >22k faces!!\r\n\t\t//unclear if the the client has some alternative way to get it\r\n\t\t["indexBuffers", ["array", "ubyte", ["buffer", "ushort le", "ushort"]]], \r\n\r\n\t\t["vertexCount", ["match", ["ref", "hasVertices"],  {
  "=1":"ushort le", "=0":0
}
]], \r\n\t\t["positionBuffer", ["opt", ["hasVertices", 1], ["buffer", ["ref", "vertexCount"], "short", 3]]], \r\n\t\t["normalBuffer", ["opt", ["hasVertices", 1], ["match", "buildnr",  {
  \r\n\t\t\t">=887":["buffer", ["ref", "vertexCount"], "byte", 3], \r\n\t\t\t">=0":["buffer", ["ref", "vertexCount"], "short", 3]\r\n\t\t
}
]]], \r\n\t\t["tagentBuffer", ["opt", ["hasVertices", 1], ["match", "buildnr",  {
  \r\n\t\t\t//TODO exact buildnr unknown\r\n\t\t\t">=906":["buffer", ["ref", "vertexCount"], "short", 2], \r\n\t\t\t">=0":"null"\r\n\t\t
}
]]], \r\n\t\t["uvBuffer", ["opt", ["hasVertices", 1], ["match", "buildnr",  {
  \r\n\t\t\t">=887":["buffer", ["ref", "vertexCount"], "ushort", 2], \r\n\t\t\t">=0":["buffer", ["ref", "vertexCount"], "float", 2]\r\n\t\t
}
]]], \r\n\t\t["boneidBuffer", ["opt", ["hasBoneIds", 1], ["buffer", ["ref", "vertexCount"], "ushort"]]], \r\n\t\t\r\n\t\t["skin", ["opt", ["hasSkin", 1], ["struct", \r\n\t\t\t["skinWeightCount", "uint le"], \r\n\t\t\t["skinBoneBuffer", ["buffer", ["ref", "skinWeightCount"], "ushort", 1]], \r\n\t\t\t["skinWeightBuffer", ["buffer", ["ref", "skinWeightCount"], "ubyte", 1]]\r\n\t\t]]]\r\n\t]]]], \r\n\t["meshdata", ["opt", "version>3", ["struct", \r\n\t\t["$groupFlags", "ubyte"], \r\n\t\t["unkint", "ubyte"], \r\n\t\t["faceCount", "ushort le"], \r\n\r\n\t\t["hasVertices", ["ref", "$groupFlags", [0, 1]]], \r\n\t\t["hasVertexAlpha", ["ref", "$groupFlags", [1, 1]]], \r\n\t\t["hasFaceBones", ["ref", "$groupFlags", [2, 1]]], \r\n\t\t["hasBoneIds", ["ref", "$groupFlags", [3, 1]]], \r\n\t\t["isHidden", ["ref", "$groupFlags", [4, 1]]], \r\n\t\t["hasSkin", ["ref", "$groupFlags", [5, 1]]], \r\n\r\n\t\t["vertexCount", "uint le"], \r\n\t\t["positionBuffer", ["opt", ["hasVertices", 1], ["buffer", ["ref", "vertexCount"], "short", 3]]], \r\n\t\t["normalBuffer", ["opt", ["hasVertices", 1], ["buffer", ["ref", "vertexCount"], "byte", 3]]], \r\n\t\t["tagentBuffer", ["opt", ["hasVertices", 1], ["buffer", ["ref", "vertexCount"], "short", 2]]], \r\n\t\t["uvBuffer", ["opt", ["hasVertices", 1], ["buffer", ["ref", "vertexCount"], "ushort", 2]]], \r\n\t\t["boneidBuffer", ["opt", ["hasBoneIds", 1], ["buffer", ["ref", "vertexCount"], "ushort"]]], \r\n\t\t\r\n\t\t["skin", ["opt", "hasSkin==1", ["array", ["ref", "vertexCount"], ["struct", \r\n\t\t\t["ids", ["array", "ushort le", "ushort le"]], \r\n\t\t\t["weights", ["array", "ushort le", "ubyte"]]\r\n\t\t]]]], \r\n\t\t["vertexColours", ["opt", "hasVertices==1", ["buffer", ["ref", "vertexCount"], "ushort"]]], \r\n\t\t["vertexAlpha", ["opt", "hasVertices==1", ["buffer", ["ref", "vertexCount"], "ubyte"]]], \r\n\t\t["vertexFacebones", ["opt", "hasFaceBones==1", ["buffer", ["ref", "vertexCount"], "ushort"]]], \r\n\t\t["renders", ["array", ["ref", "meshCount"], ["struct", \r\n\t\t\t["$groupFlags", "ubyte"], \r\n\t\t\t["hasVertices", ["ref", "$groupFlags", [0, 1]]], \r\n\t\t\t["hasVertexAlpha", ["ref", "$groupFlags", [1, 1]]], \r\n\t\t\t["hasFaceBones", ["ref", "$groupFlags", [2, 1]]], \r\n\t\t\t["hasBoneIds", ["ref", "$groupFlags", [3, 1]]], \r\n\t\t\t["isHidden", ["ref", "$groupFlags", [4, 1]]], \r\n\t\t\t["hasSkin", ["ref", "$groupFlags", [5, 1]]], \r\n\t\t\t\r\n\t\t\t["unkint", "uint"], \r\n\t\t\t["materialArgument", "ushort le"], \r\n\t\t\t["unkbyte2", "ubyte"], \r\n\t\t\t//this might be groupflags&0x80 for uint indexbuffer\r\n\t\t\t["buf", ["match",  {
  \r\n\t\t\t\t"vertexCount<=0xffff":["buffer", "ushort le", "ushort"], //u16 little endian\r\n\t\t\t\t"other":["buffer", "ushort le", "uint"]//u32 big endian?????\r\n\t\t\t
}
]]\r\n\t\t]]]\r\n\t]]], \r\n\r\n\t["unk1Buffer", ["array", ["ref", "unkCount1"], ["buffer", ["match", "buildnr",  {
  ">=923":39, ">=0":37
}
], "hex"]]], \r\n\t["unk2Buffer", ["array", ["ref", "unkCount2"], ["buffer", ["match", "buildnr",  {
  ">=923":50, ">=0":44
}
], "hex"]]], \r\n\t["unk3Buffer", ["array", ["ref", "unkCount3"], ["buffer", ["match", "buildnr",  {
  ">=923":18, ">=0":16
}
], "hex"]]], \r\n\t["unk4Buffer", ["array", ["ref", "unkCount4"], ["buffer", 0]]]\r\n]'
