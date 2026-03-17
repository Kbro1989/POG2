// Module ID: 2205
// Category: unidentified
// Size: 13159 bytes
// Parameters: e,t,n

"use strict"
;
var r=n(6743), i=n(1002), a=n(3144);
e.exports=function() {
  return a(r, i, arguments)
}
}
, 2230:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t//male   0head, 1jaw/beard, 2body, 3arms, 4hands, 5legs, 6feet, \r\n\t//female 7head, 9body, 10arms, 11hands, 12legs, 13feet, \r\n\t//also a couple of values in 70-74 range for some reason,  bugged?\r\n\t"0x01":  {
   "name":  "bodypart",  "read": "ubyte" 
}
, \r\n\t"0x02":  {
   "name":    "models",  "read": ["array", "ubyte", "varuint"]
}
, \r\n\t"0x03":  {
   "name":    "iscopy",  "read": "true" 
}
, \r\n\t"0x28":  {
   "name":   "recolor",  "read": ["array", "ubyte", ["tuple", "ushort", "ushort"]] 
}
, \r\n\t"0x3c":  {
   "name": "headmodel",  "read": "varuint" 
}
, \r\n\t// seems to be hair style related\r\n\t"0x3d":  {
   "name":   "unknown",  "read": "varuint" 
}
\r\n
}
'
}
, 2244:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t//TODO build nr for count arg unknown\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\r\n\t"0x01":  {
   "name":                              "models",  "read":["match", "buildnr",  {
  \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t">=582":["array", "ubyte", ["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["type", "ubyte"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["values", ["array", "ubyte", "item_modelid"]]\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t"other":["array", "ubyte", ["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["values", ["array", 1, "item_modelid"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["type", "ubyte"]\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t]]
}
]
}
, \r\n\t"0x02":  {
   "name":                                "name",  "read": "string" 
}
, \r\n\t"0x03":  {
   "name":                             "examine",  "read": "string" 
}
, //removed in jun 2006\r\n\t//not sure what this is but they seem identical\r\n\t"0x05":  {
   "name":                           "models_05",  "read":["match", "buildnr",  {
  \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t">=582":["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["models",  ["array", "ubyte", ["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["type", "ubyte"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["values", ["array", "ubyte", "item_modelid"]]\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t]]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unktail", ["array", "ubyte", ["tuple", "item_modelid", "item_modelid"]]]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t"other":["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["models", ["array", 1, ["struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["type", 10], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["values", ["array", "ubyte", "item_modelid"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unktail", ["array", 0, ["tuple", "item_modelid", "item_modelid"]]]\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t]]]]\r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t
}
]
}
, \r\n\t"0x0E":  {
   "name":                               "width",  "read": "unsigned byte" 
}
, \r\n\t"0x0F":  {
   "name":                              "length",  "read": "unsigned byte" 
}
, \r\n\t"0x11":  {
   "name":                "probably_nocollision",  "read": "true" 
}
, \r\n\t"0x12":  {
   "name":            "maybe_allows_lineofsight",  "read": "true" 
}
, \r\n\t"0x13":  {
   "name":                           "deletable",  "read": "boolean" 
}
, \r\n\t"0x15":  {
   "name":                 "probably_morphFloor",  "read": "true" 
}
, \r\n\t"0x16":  {
   "name":                          "unknown_16",  "read": "true" 
}
, \r\n\t"0x17":  {
   "name":                          "occludes_1",  "read": "false" 
}
, \r\n\t"0x18":  {
   "name":                  "probably_animation",  "read": "variable unsigned int" 
}
, \r\n\t"0x1B":  {
   "name":               "maybe_blocks_movement",  "read": "true" 
}
, \r\n\t"0x1C":  {
   "name":                  "wallkit_related_1C",  "read": "unsigned byte" 
}
, \r\n\t"0x1D":  {
   "name":                             "ambient",  "read": "ubyte" 
}
, \r\n\t"0x1E":  {
   "name":                           "actions_0",  "read": "string" 
}
, \r\n\t"0x1F":  {
   "name":                           "actions_1",  "read": "string" 
}
, \r\n\t"0x20":  {
   "name":                           "actions_2",  "read": "string" 
}
, \r\n\t"0x21":  {
   "name":                           "actions_3",  "read": "string" 
}
, \r\n\t"0x22":  {
   "name":                           "actions_4",  "read": "string" 
}
, \r\n\t"0x27":  {
   "name":                            "contrast",  "read": "byte" 
}
, \r\n\t"0x28":  {
   "name":                  "color_replacements",  "read": [ "array",  ["tuple",  "unsigned short",  "unsigned short"] ] 
}
, \r\n\t"0x29":  {
   "name":               "material_replacements",  "read": [ "array",  ["tuple",  "unsigned short",  "unsigned short"] ] 
}
, \r\n\t"0x2A":  {
   "name":                     "recolourPalette",  "read": [ "array",  "byte" ] 
}
, \r\n\t"0x2C":  {
   "name":                          "unknown_2C",  "read": "unsigned short" 
}
, \r\n\t"0x2D":  {
   "name":                          "unknown_2D",  "read": "unsigned short" 
}
, \r\n\t"0x36":  {
   "name":                          "unknown_36",  "read": "true" 
}
, \r\n\t"0x37":  {
   "name":                          "unknown_37",  "read": "true" 
}
, \r\n\t"0x38":  {
   "name":                          "unknown_38",  "read": "true" 
}
, \r\n\t"0x39":  {
   "name":                          "unknown_39",  "read": "true" 
}
, \r\n\t"0x3C":  {
   "name":                          "unknown_3c",  "read": "ushort" 
}
, //replaced by mapfunction 6B later in ~2010\r\n\t"0x3E":  {
   "name":                              "mirror",  "read": "true" 
}
, \r\n\t"0x40":  {
   "name":                          "unknown_40",  "read": "true" 
}
, \r\n\t"0x41":  {
   "name":                              "scaleX",  "read": "short" 
}
, \r\n\t"0x42":  {
   "name":                              "scaleY",  "read": "short" 
}
, \r\n\t"0x43":  {
   "name":                              "scaleZ",  "read": "short" 
}
, \r\n\t"0x44":  {
   "name":                        "mapscene_old",  "read": "unsigned short" 
}
, //replaced by 0x66\r\n\t"0x45":  {
   "name":                            "dummy_45",  "read": "unsigned byte" 
}
, \r\n\t"0x46":  {
   "name":                          "translateX",  "read": "short" 
}
, \r\n\t"0x47":  {
   "name":                          "translateY",  "read": "short" 
}
, \r\n\t"0x48":  {
   "name":                          "translateZ",  "read": "short" 
}
, \r\n\t"0x49":  {
   "name":                          "unknown_49",  "read": "true" 
}
, \r\n\t"0x4A":  {
   "name":                          "unknown_4A",  "read": "true" 
}
, \r\n\t"0x4B":  {
   "name":                          "unknown_4B",  "read": "unsigned byte" 
}
, \r\n\t"0x4D":  {
   "name":                            "morphs_1",  "read": [ "struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk1",  "unsigned int"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk2",  [ "array", ["match", "buildnr",  {
  ">=910":"varushort", ">=0":"ubyte"
}
], "item_modelid"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk3",  "item_modelid"] ] 
}
, \r\n\t"0x4E":  {
   "name":             "light_source_related_4E",  "read": [ "struct",  ["maybe_color",  "unsigned short"],  ["maybe_radius",  "unsigned byte"] ] 
}
, \r\n\t"0x4F":  {
   "name":                          "unknown_4F",  "read": [ "struct",  ["unknown_1",  "unsigned short"],  ["unknown_2",  "unsigned short"],  ["unknown_3",  "unsigned byte"],  ["unknown_4",  ["array",  "unsigned short"]] ] 
}
, \r\n\t"0x51":  {
   "name":                          "unknown_51",  "read": "unsigned byte" 
}
, \r\n\t"0x52":  {
   "name":                          "unknown_52",  "read": "true" 
}
, \r\n\t"0x58":  {
   "name":                          "is_members",  "read": "true" 
}
, \r\n\t"0x59":  {
   "name":                          "unknown_59",  "read": "true" 
}
, \r\n\t"0x5A":  {
   "name":                          "unknown_5A",  "read": "true" 
}
, \r\n\t"0x5B":  {
   "name":                           "isMembers",  "read": "true" 
}
, \r\n\t"0x5C":  {
   "name":                            "morphs_2",  "read": [ "struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk1",  "unsigned int"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk2",  "item_modelid"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk3",  [ "array",  ["match", "buildnr",  {
  ">=910":"varushort", ">=0":"ubyte"
}
], "item_modelid"]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk4",  "item_modelid"] ] 
}
, \r\n\t"0x5D":  {
   "name":                             "tilt_xz",  "read": [ "tuple",  "byte",  "byte"] 
}
, \r\n\t"0x5E":  {
   "name":                         "under_water",  "read": "true" 
}
, \r\n\t"0x5F":  {
   "name":         "probably_morphCeilingOffset",  "read": ["match", "buildnr",  {
  ">=596":"short", "other":0
}
]
}
, //TODO buildnr somewhere between 580-728\r\n\t"0x60":  {
   "name":                          "unknown_60",  "read": "true" 
}
, \r\n\t"0x61":  {
   "name":        "ground_decoration_related_61",  "read": "true" 
}
, \r\n\t"0x62":  {
   "name":                "has_animated_texture",  "read": "true" 
}
, \r\n\t"0x63":  {
   "name":                            "dummy_63",  "read": [ "struct",  ["unknown_2",  "unsigned byte"],  ["unknown_1",  "unsigned short"] ] 
}
, \r\n\t"0x64":  {
   "name":                            "dummy_64",  "read": [ "struct",  ["unknown_2",  "unsigned byte"],  ["unknown_1",  "unsigned short"] ] 
}
, \r\n\t"0x65":  {
   "name":                           "unused_65",  "read": "unsigned byte" 
}
, \r\n\t"0x66":  {
   "name":                            "mapscene",  "read": "unsigned short" 
}
, \r\n\t"0x67":  {
   "name":                          "occludes_2",  "read": "false" 
}
, \r\n\t"0x68":  {
   "name":             "interactable_related_68",  "read": "unsigned byte" 
}
, \r\n\t"0x69":  {
   "name":                      "invertMapScene",  "read": "true" 
}
, \r\n\t"0x6A":  {
   "name":                          "headModels",  "read": [ "array",  ["struct",  ["model",  "varuint"],  ["unknown_2",  "unsigned byte"]] ] 
}
, \r\n\t"0x6B":  {
   "name":                         "mapFunction",  "read": "unsigned short" 
}
, \r\n\t"0x71":  {
   "name":                          "unknown_71",  "read": "unsigned byte" 
}
, \r\n\t"0x96":  {
   "name":                    "members_action_1",  "read": "string" 
}
, \r\n\t"0x97":  {
   "name":                    "members_action_2",  "read": "string" 
}
, \r\n\t"0x98":  {
   "name":                    "members_action_3",  "read": "string" 
}
, \r\n\t"0x99":  {
   "name":                    "members_action_4",  "read": "string" 
}
, \r\n\t"0x9A":  {
   "name":                    "members_action_5",  "read": "string" 
}
, \r\n\t"0xA0":  {
   "name":                          "unknown_A0",  "read": [ "array",  "unsigned short" ] 
}
, \r\n\t"0xA2":  {
   "name":                        "singleuse_A2",  "read": "int" 
}
, \r\n\t"0xA3":  {
   "name":                          "unknown_A3",  "read": [ "struct",  ["unknown_1",  "byte"],  ["unknown_2",  "byte"],  ["unknown_3",  "byte"],  ["unknown_4",  "byte"] ] 
}
, \r\n\t"0xA4":  {
   "name":                        "singleuse_A4",  "read": "short" 
}
, \r\n\t"0xA5":  {
   "name":                        "singleuse_A5",  "read": "short" 
}
, \r\n\t"0xA6":  {
   "name":                        "singleuse_A6",  "read": "unsigned short" 
}
, \r\n\t"0xA7":  {
   "name":                     "floor_thickness",  "read": "unsigned short" 
}
, \r\n\t"0xA8":  {
   "name":                           "unused_a8",  "read": "true" 
}
, \r\n\t"0xA9":  {
   "name":                           "unused_a9",  "read": "true" 
}
, \r\n\t"0xAA":  {
   "name":                  "wallkit_related_AA",  "read": "variable unsigned short" 
}
, \r\n\t"0xAB":  {
   "name":            "possibly_wallkit_skew_AB",  "read": "variable unsigned short" 
}
, \r\n\t"0xAD":  {
   "name":              "lightsource_related_AD",  "read": [ "struct",  ["unknown_1",  "unsigned short"],  ["unknown_2",  "unsigned short"] ] 
}
, \r\n\t"0xB1":  {
   "name":                    "can_change_color",  "read": "true" 
}
, \r\n\t"0xB2":  {
   "name":                          "unknown_B2",  "read": "unsigned byte" 
}
, \r\n\t"0xBA":  {
   "name":                          "unknown_BA",  "read": "unsigned byte" 
}
, \r\n\t"0xBC":  {
   "name":                            "dummy_bc",  "read": "true" 
}
, \r\n\t"0xBD":  {
   "name":                   "treerockordoor_BD",  "read": "true" 
}
, \r\n\t"0xBE":  {
   "name":                    "action_cursors_0",  "read": "unsigned short" 
}
, \r\n\t"0xBF":  {
   "name":                    "action_cursors_1",  "read": "unsigned short" 
}
, \r\n\t"0xC0":  {
   "name":                    "action_cursors_2",  "read": "unsigned short" 
}
, \r\n\t"0xC1":  {
   "name":                    "action_cursors_3",  "read": "unsigned short" 
}
, \r\n\t"0xC2":  {
   "name":                    "action_cursors_4",  "read": "unsigned short" 
}
, \r\n\t"0xC3":  {
   "name":                    "action_cursors_5",  "read": "unsigned short" 
}
, \r\n\t"0xC4":  {
   "name":            "tileplacement_related_c4",  "read": "unsigned byte" 
}
, \r\n\t"0xC5":  {
   "name":                     "clan_citadel_C5",  "read": "unsigned byte" 
}
, \r\n\t"0xC6":  {
   "name":                        "invisible_c6",  "read": "true" 
}
, \r\n\t"0xC7":  {
   "name":                     "flooroverlay_c7",  "read": "true" 
}
, \r\n\t"0xC8":  {
   "name":                        "singleuse_C8",  "read": "true" 
}
, \r\n\t"0xC9":  {
   "name":                          "unknown_C9",  "read": [ "struct",  ["unknown_1",  "variable short"],  ["unknown_2",  "variable short"],  ["unknown_3",  "variable short"],  ["unknown_4",  "variable short"],  ["unknown_5",  "variable short"],  ["unknown_6",  "variable short"] ] 
}
, \r\n\t"0xCA":  {
   "name":\t\t\t\t\t\t "singleuse_CA",  "read": "unsigned byte" 
}
, \r\n\t"0xCB":  {
   "name":\t\t\t\t\t\t   "unknown_CB",  "read": "true" 
}
, \r\n\t"0xCC":  {
   "name":\t\t\t\t\t\t   "unknown_CC",  "read": ["array", "ubyte", ["buffer", 27, "hex"]] 
}
, \r\n\t"0xCD":  {
   "name":\t\t\t\t\t\t   "unknown_CD",  "read": "modelmorphs" 
}
, \r\n\t"0xF9":  {
   "name":                               "extra",  "read": "extrasmap" 
}
\r\n
}
'
