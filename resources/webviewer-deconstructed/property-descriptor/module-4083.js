// Module ID: 4083
// Category: property-descriptor
// Size: 7157 bytes
// Parameters: e,t,n

"use strict";
e=n.nmd(e);
const r=(e, t)=>(...n)=>`\x1b[$ {
  e(...n)+t
}
m`, i=(e, t)=>(...n)=> {
  const r=e(...n);
return`\x1b[$ {
  38+t
}
;
5;
$ {
  r
}
m`
}
, a=(e, t)=>(...n)=> {
  const r=e(...n)
;
return`\x1b[$ {
  38+t
}
;
2;
$ {
  r[0]
}
;
$ {
  r[1]
}
;
$ {
  r[2]
}
m`
}
, s=e=>e, o=(e, t, n)=>[e, t, n], l=(e, t, n)=> {
  Object.defineProperty(e, t,  {
  get:()=> {
  const r=n();
return Object.defineProperty(e, t,  {
  value:r, enumerable:!0, configurable:!0
}
), r
}
, enumerable:!0, configurable:!0
}
)
}
;
let c;
const u=(e, t, r, i)=> {
  void 0===c&&(c=n(734));
const a=i?10:0, s= {
}
;
for(const[n, i]of Object.entries(c)) {
  const o="ansi16"===n?"ansi":n;
n===t?s[o]=e(r, a):"object"==typeof i&&(s[o]=e(i[t], a))
}
return s
}
;
Object.defineProperty(e, "exports",  {
  enumerable:!0, 
get:function() {
  const e=new Map, t= {
  modifier: {
  reset:[0, 0], bold:[1, 22], dim:[2, 22], italic:[3, 23], underline:[4, 24], inverse:[7, 27], hidden:[8, 28], strikethrough:[9, 29]
}
, color: {
  black:[30, 39], red:[31, 39], green:[32, 39], yellow:[33, 39], blue:[34, 39], 
magenta:[35, 39], cyan:[36, 39], white:[37, 39], blackBright:[90, 39], redBright:[91, 39], greenBright:[92, 39], yellowBright:[93, 39], blueBright:[94, 39], magentaBright:[95, 39], cyanBright:[96, 39], whiteBright:[97, 39]
}
, bgColor: {
  bgBlack:[40, 49], bgRed:[41, 49], 
bgGreen:[42, 49], bgYellow:[43, 49], bgBlue:[44, 49], bgMagenta:[45, 49], bgCyan:[46, 49], bgWhite:[47, 49], bgBlackBright:[100, 49], bgRedBright:[101, 49], bgGreenBright:[102, 49], bgYellowBright:[103, 49], bgBlueBright:[104, 49], bgMagentaBright:[105, 49], 
bgCyanBright:[106, 49], bgWhiteBright:[107, 49]
}
}
;
t.color.gray=t.color.blackBright, t.bgColor.bgGray=t.bgColor.bgBlackBright, t.color.grey=t.color.blackBright, t.bgColor.bgGrey=t.bgColor.bgBlackBright;
for(const[n, r]of Object.entries(t)) {
for(const[n, i]of Object.entries(r))t[n]= {
  open:`\x1b[$ {
  i[0]
}
m`, close:`\x1b[$ {
  i[1]
}
m`
}
, r[n]=t[n], e.set(i[0], i[1]);
Object.defineProperty(t, n,  {
  value:r, enumerable:!1
}
)
}
return Object.defineProperty(t, "codes",  {
  value:e, enumerable:!1
}
), 
t.color.close="\x1b[39m", t.bgColor.close="\x1b[49m", l(t.color, "ansi", (()=>u(r, "ansi16", s, !1))), l(t.color, "ansi256", (()=>u(i, "ansi256", s, !1))), l(t.color, "ansi16m", (()=>u(a, "rgb", o, !1))), l(t.bgColor, "ansi", (()=>u(r, "ansi16", s, !0))), 
l(t.bgColor, "ansi256", (()=>u(i, "ansi256", s, !0))), l(t.bgColor, "ansi16m", (()=>u(a, "rgb", o, !0))), t
}
}
)
}
, 4094:e=> {
  "use strict"
;
e.exports='\r\n\r\n {
  \r\n\t"0x01":  {
   "name":                           "name",  "read": "paddedstring"
}
, \r\n\t"0x02":  {
   "name":                    "description",  "read": ["struct", \r\n\t\t["hasironman",  "unsigned byte"], \r\n\t\t["unk0", "unsigned byte"], \r\n\t\t["descr", "paddedstring"], \r\n\t\t["unk1", ["opt", ["hasironman", 2], "unsigned byte"]], \r\n\t\t["descr_ironman", ["opt", ["hasironman", 2], "paddedstring"]]\r\n\t]
}
, \r\n\t"0x03":  {
   "name":                       "category",  "read": "unsigned short"
}
, \r\n\t"0x04":  {
   "name":                       "spriteId",  "read": "variable unsigned int"
}
, \r\n\t"0x05":  {
   "name":                      "runescore",  "read": "unsigned byte"
}
, \r\n\t"0x06":  {
   "name":                   "unknown_0x06",  "read": "unsigned short"
}
, \r\n\t"0x07":  {
   "name":                     "rewardtext",  "read": "paddedstring"
}
, \r\n\t"0x08":  {
   "name":                  "subach_skills",  "read": ["array", "variable unsigned short",  ["struct", \r\n\t\t["ironman", "unsigned byte"], \r\n\t\t["level", "unsigned byte"], \r\n\t\t["text", "paddedstring"], \r\n\t\t["unk_0", "unsigned byte"], \r\n\t\t["unk_1", "unsigned byte"], \r\n\t\t["skill", "unsigned byte"]\r\n\t]]
}
, \r\n\t"0x09":  {
   "name":                 "subach_varbits",  "read": ["array",  ["struct", \r\n\t\t["type", "unsigned byte"], \r\n\t\t["value", "variable unsigned int"], \r\n\t\t["name", "paddedstring"], \r\n\t\t["stepsize", "unsigned byte"], \r\n\t\t["varbit", "unsigned short"]\r\n\t]]
}
, \r\n\t"0x0A":  {
   "name":           "varbit_partial_state",  "read": ["array",  ["struct", \r\n\t\t["type", "unsigned byte"], \r\n\t\t["value", "variable unsigned int"], \r\n\t\t["name", "paddedstring"], \r\n\t\t["stepsize", "unsigned byte"], \r\n\t\t["varbit", "unsigned short"]\r\n\t]]
}
, \r\n\t"0x0B":  {
   "name":          "previous_achievements",  "read": ["array",  "unsigned tribyte"]
}
, \r\n\t"0x0C":  {
   "name":                   "skill_reqs_2",  "read": ["array",  "variable unsigned short",  ["struct", \r\n\t\t["unk0", "unsigned byte"], \r\n\t\t["level", "unsigned byte"], \r\n\t\t["name", "paddedstring"], \r\n\t\t["unk1", "unsigned byte"], \r\n\t\t["skill", "unsigned short"]\r\n\t]]
}
, \r\n\t"0x0E":  {
   "name":                "progress_states",  "read": ["array",  "variable unsigned short",  ["struct", \r\n\t\t["unk0", "unsigned byte"], \r\n\t\t["value", "variable unsigned int"], \r\n\t\t["name", "paddedstring"], \r\n\t\t["varbits", ["array", "unsigned short"]]\r\n\t]]
}
, \r\n\t"0x0D":  {
   "name":                        "subreqs",  "read": ["array",  "variable unsigned short",  ["struct", \r\n\t\t["unk0", "unsigned byte"], \r\n\t\t["value", "variable unsigned int"], \r\n\t\t["name", "paddedstring"], \r\n\t\t["varbits", ["array", "unsigned short"]]\r\n\t]]
}
, \r\n\t"0x0F":  {
   "name":               "sub_achievements",  "read": ["array",  "variable unsigned short",  ["struct", \r\n\t\t["unk0", "unsigned byte"], \r\n\t\t["achievement", "unsigned short"]\r\n\t]]
}
, \r\n\t"0x10":  {
   "name":                    "subcategory",  "read": "unsigned short"
}
, \r\n\t//only used for subachievements of "find all the hidden Zygomites on Anachronia."\r\n\t"0x11":  {
   "name":                        "unk0x11",  "read": "true"
}
, \r\n\t"0x12":  {
   "name":                         "hidden",  "read": "unsigned byte"
}
, \r\n\t"0x13":  {
   "name":                            "f2p",  "read": "true"
}
, \r\n\t"0x14":  {
   "name":       "quest_req_for_miniquests",  "read": ["array",  "unsigned tribyte"]
}
, \r\n\t"0x15":  {
   "name":                      "quest_ids",  "read": ["array",  "unsigned tribyte"]
}
, \r\n\t"0x17":  {
   "name":                         "reqs23",  "read": ["array",  "variable unsigned short", ["struct", \r\n\t\t["type", "unsigned byte"], \r\n\t\t["varbit", "unsigned short"], \r\n\t\t["stepsize", "unsigned byte"], \r\n\t\t["name", ["opt", ["type", 0], "paddedstring"]], \r\n\t\t["requirement", ["opt", ["type", 1], "unsigned short"]], \r\n\t\t["subbit", "unsigned byte"]\r\n\t]]
}
, \r\n\t"0x19":  {
   "name":                         "reqs25",  "read": ["array",  "variable unsigned short", ["struct", \r\n\t\t["type", "unsigned byte"], \r\n\t\t["varbit", "unsigned short"], \r\n\t\t["value", "unsigned byte"], \r\n\t\t["name", ["opt", ["type", 0], "paddedstring"]], \r\n\t\t["requirement", ["opt", ["type", 1], "unsigned short"]], \r\n\t\t["subbit", "unsigned byte"]\r\n\t]]
}
, \r\n\t"0x1B":  {
   "name":                   "unknown_0x13",  "read": "true"
}
, \r\n\t"0x1C":  {
   "name":                "skill_req_count",  "read": ["array",  "unsigned byte"]
}
, \r\n\t"0x1D":  {
   "name":                   "unknown_0x1D",  "read": "unsigned byte"
}
, \r\n\t"0x1E":  {
   "name":                   "subreq_count",  "read": ["array",  "variable unsigned short"]
}
, \r\n\t"0x1F":  {
   "name":                   "unknown_0x1F",  "read": "unsigned byte"
}
, \r\n\t"0x20":  {
   "name":                   "unknown_0x20",  "read": "unsigned tribyte"
}
, \r\n\t"0x23":  {
   "name":                   "unknown_0x23",  "read": "true"
}
, \r\n\t"0x25":  {
   "name":                   "unknown_0x25",  "read": "unsigned byte"
}
, \r\n\t"0x26":  {
   "name":                   "unknown_0x26",  "read": "true"
}
\r\n
}
\r\n'
