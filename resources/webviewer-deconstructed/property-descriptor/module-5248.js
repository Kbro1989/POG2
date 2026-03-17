// Module ID: 5248
// Category: property-descriptor
// Size: 12009 bytes
// Parameters: e,t,n

"use strict"
;
const r=n(4083),  {
  stdout:i, stderr:a
}
=n(2747),  {
  stringReplaceAll:s, stringEncaseCRLFWithFirstIndex:o
}
=n(4058),  {
  isArray:l
}
=Array, c=["ansi", "ansi", "ansi256", "ansi16m"], u=Object.create(null);
class h {
  constructor(e) {
  return d(e)
}
}
const d=e=> {
  const t= {
}
;
return((e, t= {
}
)=> {
  if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");
const n=i?i.level:0;
e.level=void 0===t.level?n:t.level
}
)(t, e), 
t.template=(...e)=>b(t.template, ...e), Object.setPrototypeOf(t, p.prototype), Object.setPrototypeOf(t.template, t), t.template.constructor=()=> {
  throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.")
}
, 
t.template.Instance=h, t.template
}
;
function p(e) {
  return d(e)
}
for(const[e, t]of Object.entries(r))u[e]= {
  get() {
  const n=_(this, g(t.open, t.close, this._styler), this._isEmpty);
return Object.defineProperty(this, e,  {
  value:n
}
), n
}
}
;
u.visible= {
  get() {
const e=_(this, this._styler, !0);
return Object.defineProperty(this, "visible",  {
  value:e
}
), e
}
}
;
const f=["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
for(const e of f)u[e]= {
  get() {
  const {
  level:t
}
=this;
return function(...n) {
const i=g(r.color[c[t]][e](...n), r.color.close, this._styler);
return _(this, i, this._isEmpty)
}
}
}
;
for(const e of f)u["bg"+e[0].toUpperCase()+e.slice(1)]= {
  get() {
  const {
  level:t
}
=this;
return function(...n) {
const i=g(r.bgColor[c[t]][e](...n), r.bgColor.close, this._styler);
return _(this, i, this._isEmpty)
}
}
}
;
const m=Object.defineProperties((()=> {
}
),  {
  ...u, level: {
  enumerable:!0, get() {
  return this._generator.level
}
, set(e) {
  this._generator.level=e
}
}
}
), g=(e, t, n)=> {
let r, i;
return void 0===n?(r=e, i=t):(r=n.openAll+e, i=t+n.closeAll),  {
  open:e, close:t, openAll:r, closeAll:i, parent:n
}
}
, _=(e, t, n)=> {
  const r=(...e)=>l(e[0])&&l(e[0].raw)?v(r, b(r, ...e)):v(r, 1===e.length?""+e[0]:e.join(" "))
;
return Object.setPrototypeOf(r, m), r._generator=e, r._styler=t, r._isEmpty=n, r
}
, v=(e, t)=> {
  if(e.level<=0||!t)return e._isEmpty?"":t;
let n=e._styler;
if(void 0===n)return t;
const {
  openAll:r, closeAll:i
}
=n
;
if(-1!==t.indexOf("\x1b"))for(;
void 0!==n;
)t=s(t, n.close, n.open), n=n.parent;
const a=t.indexOf("\n");
return-1!==a&&(t=o(t, i, r, a)), r+t+i
}
;
let y;
const b=(e, ...t)=> {
  const[r]=t;
if(!l(r)||!l(r.raw))return t.join(" ");
const i=t.slice(1), a=[r.raw[0]]
;
for(let e=1;
e<r.length;
e++)a.push(String(i[e-1]).replace(/[ {
}
\\]/g, "\\$&"), String(r.raw[e]));
return void 0===y&&(y=n(2991)), y(e, a.join(""))
}
;
Object.defineProperties(p.prototype, u);
const x=p();
x.supportsColor=i, x.stderr=p( {
  level:a?a.level:0
}
), 
x.stderr.supportsColor=a, e.exports=x
}
, 5258:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                              "models",  "read": [ "array",  ["match", "buildnr",  {
  ">=669":"varuint", ">=0":"ushort" 
}
]]
}
, \r\n\t"0x02":  {
   "name":                                "name",  "read": "string" 
}
, \r\n\t"0x03":  {
   "name":                             "examine",  "read": "string" 
}
, //last used 2006\r\n\t"0x08":  {
   "name":                          "unknown_08",  "read": "unsigned byte" 
}
, //might be wrong and part of other op\r\n\t"0x0B":  {
   "name":                          "unknown_0B",  "read": "unsigned byte" 
}
, //might be wrong and part of other op\r\n\t"0x0C":  {
   "name":                           "boundSize",  "read": "unsigned byte" 
}
, \r\n\t"0x0D":  {
   "name":                              "unk_0D",  "read": "ushort" 
}
, //last used 2006\r\n\t"0x0E":  {
   "name":                              "unk_0E",  "read": "ushort" 
}
, //last used 2006\r\n\t"0x11":  {
   "name":                              "unk_11",  "read": ["array", 4, "ushort"]
}
, //last used 2006\r\n\t"0x1E":  {
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
   "name":                     "recolor_indices",  "read": "unsigned short" 
}
, \r\n\t"0x2D":  {
   "name":                   "retexture_indices",  "read": "unsigned short" 
}
, \r\n\t"0x3C":  {
   "name":                          "headModels",  "read": [ "array",  ["match", "buildnr",  {
  ">=669":"varuint", ">=0":"ushort" 
}
] ] 
}
, \r\n\t"0x5D":  {
   "name":                          "drawMapDot",  "read": "false" 
}
, \r\n\t"0x5F":  {
   "name":                              "combat",  "read": "unsigned short" 
}
, \r\n\t"0x61":  {
   "name":                             "scaleXZ",  "read": "unsigned short" 
}
, \r\n\t"0x62":  {
   "name":                              "scaleY",  "read": "unsigned short" 
}
, \r\n\t"0x63":  {
   "name":                          "unknown_63",  "read": "true" 
}
, \r\n\t"0x64":  {
   "name":                            "ambience",  "read": "byte" 
}
, \r\n\t"0x65":  {
   "name":                       "modelContract",  "read": "byte" 
}
, \r\n\t"0x66":  {
   "name":                      "head_icon_data",  "read": "unsigned short" 
}
, \r\n\t"0x67":  {
   "name":                          "unknown_67",  "read": "unsigned short" 
}
, \r\n\t"0x6A":  {
   "name":                            "morphs_1",  "read": [ "struct",  \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk1",  "unsigned int"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk2",  [ "array",  ["match", "buildnr",  {
  ">=910":"varushort", ">=0":"ubyte"
}
],  "unsigned short" ]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk3",  ["match", "buildnr",  {
  ">=525":"uint", ">=0":"ushort"
}
]] ] 
}
, \r\n\t"0x6B":  {
   "name":                          "unknown_6B",  "read": "false" 
}
, \r\n\t"0x6D":  {
   "name":                            "slowWalk",  "read": "false" 
}
, \r\n\t"0x6F":  {
   "name":                         "animateIdle",  "read": "false" 
}
, \r\n\t"0x71":  {
   "name":                              "shadow",  "read": [ "struct",  ["SrcColor",  "unsigned short"],  ["DstColor",  "unsigned short"] ] 
}
, \r\n\t"0x72":  {
   "name":                "shadowAlphaIntensity",  "read": [ "struct",  ["Src",  "byte"],  ["Dst",  "byte"] ] 
}
, \r\n\t"0x73":  {
   "name":                          "unknown_73",  "read": ["tuple", "ubyte", "ubyte"] 
}
, //removed in 2010\r\n\t"0x76":  {
   "name":                            "morphs_2",  "read": [ "struct", \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk1",  "unsigned int"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk2",  "unsigned short"], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk3",  [ "array", ["match", "buildnr",  {
  ">=910":"varushort", ">=0":"ubyte"
}
],  "unsigned short" ]], \r\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t["unk4",  "unsigned int"] ] 
}
, \r\n\t"0x77":  {
   "name":                "movementCapabilities",  "read": "byte" 
}
, \r\n\t"0x78":  {
   "name":                          "unknown_78",  "read": ["tuple", "ushort", "ushort", "ushort", "ubyte"] 
}
, \r\n\t"0x79":  {
   "name":                        "translations",  "read": [ "array",  ["buffer", 4, "hex"] ] 
}
, \r\n\t"0x7A":  {
   "name":                              "unk_7A",  "read": "unsigned short" 
}
, //removed in 2013\r\n\t"0x7B":  {
   "name":                          "iconHeight",  "read": "unsigned short" 
}
, \r\n\t"0x7D":  {
   "name":                    "respawnDirection",  "read": "byte" 
}
, \r\n\t"0x7F":  {
   "name":                     "animation_group",  "read": "unsigned short" 
}
, \r\n\t"0x80":  {
   "name":                        "movementType",  "read": "byte" 
}
, \r\n\t"0x86":  {
   "name":                       "ambient_sound",  "read": [ "struct",  ["unk1",  "unsigned short"],  ["unk2",  "unsigned short"],  ["unk3",  "unsigned short"],  ["unk4",  "unsigned short"],  ["unk45",  "unsigned byte"] ] 
}
, \r\n\t"0x87":  {
   "name":                           "oldCursor",  "read": [ "struct",  ["Op",  "unsigned byte"],  ["Cursor",  "unsigned short"] ] 
}
, \r\n\t"0x88":  {
   "name":                          "oldCursor2",  "read": [ "struct",  ["Op",  "unsigned byte"],  ["Cursor",  "unsigned short"] ] 
}
, \r\n\t"0x89":  {
   "name":                        "attackCursor",  "read": "unsigned short" 
}
, \r\n\t"0x8A":  {
   "name":                            "armyIcon",  "read": "variable int" 
}
, \r\n\t"0x8C":  {
   "name":                          "unknown_8C",  "read": "unsigned byte" 
}
, \r\n\t"0x8D":  {
   "name":                          "unknown_8D",  "read": "true" 
}
, \r\n\t"0x8E":  {
   "name":                         "mapFunction",  "read": "unsigned short" 
}
, \r\n\t"0x8F":  {
   "name":                          "unknown_8F",  "read": "true" 
}
, \r\n\t"0x96":  {
   "name":                   "members_actions_0",  "read": "string" 
}
, \r\n\t"0x97":  {
   "name":                   "members_actions_1",  "read": "string" 
}
, \r\n\t"0x98":  {
   "name":                   "members_actions_2",  "read": "string" 
}
, \r\n\t"0x99":  {
   "name":                   "members_actions_3",  "read": "string" 
}
, \r\n\t"0x9A":  {
   "name":                   "members_actions_4",  "read": "string" 
}
, \r\n\t"0x9B":  {
   "name":                          "unknown_9B",  "read": [ "struct",  ["unknown_1",  "byte"],  ["unknown_2",  "byte"],  ["unknown_3",  "byte"],  ["unknown_4",  "byte"] ] 
}
, \r\n\t"0x9E":  {
   "name":                     "aByte3076_set_1",  "read": "true" 
}
, \r\n\t"0x9F":  {
   "name":                     "aByte3076_set_0",  "read": "false" 
}
, \r\n\t"0xA0":  {
   "name":                              "quests",  "read": [ "array",  "unsigned short" ] 
}
, \r\n\t"0xA2":  {
   "name":                             "dummy_1",  "read": "true" 
}
, \r\n\t"0xA3":  {
   "name":                          "unknown_A3",  "read": "unsigned byte" 
}
, \r\n\t"0xA4":  {
   "name":                          "unknown_A4",  "read": [ "struct",  ["unknown_1",  "unsigned short"],  ["unknown_2",  "unsigned short"] ] 
}
, \r\n\t"0xA5":  {
   "name":                          "unknown_A5",  "read": "unsigned byte" 
}
, \r\n\t"0xA8":  {
   "name":                          "unknown_A8",  "read": "unsigned byte" 
}
, \r\n\t"0xA9":  {
   "name":                          "unknown_A9",  "read": "false" 
}
, \r\n\t"0xAA":  {
   "name":                    "action_cursors_0",  "read": "unsigned short" 
}
, \r\n\t"0xAB":  {
   "name":                    "action_cursors_1",  "read": "unsigned short" 
}
, \r\n\t"0xAC":  {
   "name":                    "action_cursors_2",  "read": "unsigned short" 
}
, \r\n\t"0xAD":  {
   "name":                    "action_cursors_3",  "read": "unsigned short" 
}
, \r\n\t"0xAE":  {
   "name":                    "action_cursors_4",  "read": "unsigned short" 
}
, \r\n\t"0xAF":  {
   "name":                    "action_cursors_5",  "read": "unsigned short" 
}
, \r\n\t"0xB2":  {
   "name":                             "dummy_2",  "read": "true" 
}
, \r\n\t"0xB3":  {
   "name":                          "unknown_B3",  "read": [ "struct",  ["unknown_1",  "variable short"],  ["unknown_2",  "variable short"],  ["unknown_3",  "variable short"],  ["unknown_4",  "variable short"],  ["unknown_5",  "variable short"],  ["unknown_6",  "variable short"] ] 
}
, \r\n\t"0xB4":  {
   "name":                          "unknown_B4",  "read": "unsigned byte" 
}
, \r\n\t"0xB5":  {
   "name":                          "unknown_B5",  "read": [ "struct",  ["unknown_1",  "unsigned short"],  ["unknown_2",  "unsigned byte"] ] 
}
, \r\n\t"0xB6":  {
   "name":                          "unknown_B6",  "read": "true" 
}
, \r\n\t"0xB7":  {
   "name":                          "unknown_B7",  "read": "unsigned byte" 
}
, //might be wrong and part of other op\r\n\t"0xB8":  {
   "name":                          "unknown_B8",  "read": "unsigned byte" 
}
, \r\n\t"0xB9":  {
   "name":                          "unknown_B9",  "read": "true" 
}
, \r\n\t"0xBA":  {
   "name":                          "unknown_BA",  "read": "modelmorphs"
}
, \r\n\t"0xDB":  {
   "name":                          "unknown_DB",  "read": "ubyte" 
}
, //might be wrong and part of other op\r\n\t"0xF9":  {
   "name":                               "extra",  "read": "extrasmap" 
}
, \r\n\t"0xFD":  {
   "name":                          "unknown_FD",  "read": "ubyte" 
}
//probably render priority\r\n
}
'
