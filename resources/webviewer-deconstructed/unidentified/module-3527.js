// Module ID: 3527
// Category: unidentified
// Size: 6391 bytes
// Parameters: e,t,n

const {
  isArray:r
}
=n(5622),  {
  sort:i
}
=n(648),  {
  SYMBOL_PREFIXES:a, UNDEFINED:s, symbol:o, copy_comments:l, swap_comments:c
}
=n(4373), u=(e, t, n, r, i)=> {
  l(e, t, n+r, n, i)
}
, h=(e, t, n, r, i, a)=> {
  if(i>0) {
  let s=r;
for(;
s-- >0;
)u(e, t, n+s, i, a);
return
}
let s=0;
for(;
s<r;
) {
  const r=s++;
u(e, t, n+r, i, a)
}
}
, d=(e, t)=> {
  a.forEach((n=> {
  const r=o(n, t);
delete e[r]
}
))
}
;
class p extends Array {
  splice(...e) {
const {
  length:t
}
=this, n=super.splice(...e);
let[r, i, ...a]=e;
r<0&&(r+=t), i=1===arguments.length?t-r:Math.min(t-r, i);
const {
  length:s
}
=a, o=r+i;
return h(this, this, o, t-o, s-i, !0), n
}
slice(...e) {
  const {
  length:t
}
=this, n=super.slice(...e);
if(!n.length)return new p
;
let[r, i]=e;
return i===s?i=t:i<0&&(i+=t), r<0?r+=t:r===s&&(r=0), h(n, this, r, i-r, -r), n
}
unshift(...e) {
  const {
  length:t
}
=this, n=super.unshift(...e),  {
  length:r
}
=e;
return r>0&&h(this, this, 0, t, r, !0), n
}
shift() {
  const e=super.shift(),  {
  length:t
}
=this
;
return d(this, 0), h(this, this, 1, t, -1, !0), e
}
reverse() {
  return super.reverse(), (e=> {
  const {
  length:t
}
=e;
let n=0;
const r=t/2;
for(;
n<r;
n++)c(e, n, t-n-1)
}
)(this), this
}
pop() {
  const e=super.pop();
return d(this, this.length), e
}
concat(...e) {
  let {
  length:t
}
=this
;
const n=super.concat(...e);
return e.length?(h(n, this, 0, this.length, 0), e.forEach((e=> {
  const i=t;
t+=r(e)?e.length:1, e instanceof p&&h(n, e, 0, e.length, i)
}
)), n):n
}
sort(...e) {
  const t=i(this, ...e.slice(0, 1)), n=Object.create(null);
return t.forEach(((e, t)=> {
if(e===t)return;
const r=((e, t)=> {
  let n=t;
for(;
n in e;
)n=e[n];
return n
}
)(n, e);
r!==t&&(n[t]=r, c(this, t, r))
}
)), this
}
}
e.exports= {
  CommentArray:p
}
}
, 3537:e=> {
  "use strict"
;
e.exports=' {
  \r\n    "variable unsigned long":   "varuint", \r\n    "variable unsigned int":    "varuint", \r\n    "variable unsigned short":  "varushort", \r\n    "unsigned variable long":   "varuint", \r\n    "unsigned variable int":    "varuint", \r\n    "unsigned variable short":  "varushort", \r\n\r\n    "variable long":    "varint", \r\n    "variable int":     "varint", \r\n    "variable short":   "varshort", \r\n\r\n    "unsigned long":    "uint", \r\n    "unsigned int":     "uint", \r\n    "unsigned short":   "ushort", \r\n    "unsigned byte":    "ubyte", \r\n\r\n    "long":             "int", \r\n\t\r\n    "ushort le":        "ushort_le", \r\n    "uint le":          "uint_le", \r\n\r\n\t"playeritem":       ["playeritem"], \r\n\r\n\t"playeritemedit":   ["struct", \r\n\t\t["$type", "ubyte"], \r\n\t\t["model", ["opt", ["$type", 0, "bitflag"], ["array", ["itemvar", "modelcount"], "varuint"]]], \r\n\t\t["flag2", ["opt", ["$type", 1, "bitflag"], "true"]], \r\n\t\t["color", ["opt", ["$type", 2, "bitflag"], ["struct", \r\n\t\t\t["$coltype", "ushort"], \r\n\t\t\t["col2", ["opt", ["$coltype", 12816], ["array", ["itemvar", "colorcount"], "ushort"]]], \r\n\t\t\t["col4", ["opt", ["$coltype", 8719], ["array", 4, ["tuple", "ushort", "ushort"]]]]\r\n\t\t]]], \r\n\t\t["material", ["opt", ["$type", 3, "bitflag"], ["struct", \r\n\t\t\t["header", "ubyte"], \r\n\t\t\t["materials", ["array", ["itemvar", "matcount"], "ushort"]]\r\n\t\t]]]\r\n\t], \r\n\t"modelmorphs":      ["struct", \r\n\t\t["unk0", "ushort"], \r\n\t\t["varbit", "ushort"], \r\n\t\t["varp", "ushort"], \r\n\t\t["flags", "ubyte"], \r\n\t\t["multimodel", ["opt", "flags&1", ["array", "ubyte", ["struct", \r\n\t\t\t["value", "ubyte"], \r\n\t\t\t["models", ["array", "ubyte", ["struct", \r\n\t\t\t\t["unk1", "ushort"], \r\n\t\t\t\t["unk2", "ushort"], \r\n\t\t\t\t["unk3", "varuint"], \r\n\t\t\t\t["extracount", "ubyte"], \r\n\t\t\t\t["extra1", ["opt", "extracount>=1", "ubyte"]], \r\n\t\t\t\t["extra2", ["opt", "extracount>=2", "ubyte"]], \r\n\t\t\t\t["extra3", ["opt", "extracount>=3", "ubyte"]]\r\n\t\t\t]]]\r\n\t\t]]]], \r\n\t\t["multiheadmodel", ["opt", "flags&2", ["array", "ubyte", ["struct", \r\n\t\t\t["value", "ubyte"], \r\n\t\t\t["models", ["array", "ubyte", ["struct", \r\n\t\t\t\t["unk1", "ushort"], \r\n\t\t\t\t["unk2", "ushort"], \r\n\t\t\t\t["unk3", "varuint"]\r\n\t\t\t]]]\r\n\t\t]]]], \r\n\t\t["multiretex", ["opt", "flags&4", ["array", "ubyte", ["struct", \r\n\t\t\t["value", "ubyte"], \r\n\t\t\t["models", ["array", "ubyte", ["struct", \r\n\t\t\t\t["unk1", "ushort"], \r\n\t\t\t\t["unk2", "ushort"], \r\n\t\t\t\t["unk3", "ushort"], \r\n\t\t\t\t["unk4", "ushort"]\r\n\t\t\t]]]\r\n\t\t]]]], \r\n\t\t["multirecol", ["opt", "flags&8", ["array", "ubyte", ["struct", \r\n\t\t\t["value", "ubyte"], \r\n\t\t\t["models", ["array", "ubyte", ["struct", \r\n\t\t\t\t["unk1", "ushort"], \r\n\t\t\t\t["unk2", "ushort"], \r\n\t\t\t\t["unk3", "ushort"], \r\n\t\t\t\t["unk4", "ushort"]\r\n\t\t\t]]]\r\n\t\t]]]], \r\n\t\t["multiretint", ["opt", "flags&16", ["array", "ubyte", ["struct", \r\n\t\t\t["value", "ubyte"], \r\n\t\t\t["models", ["array", "ubyte", ["struct", \r\n\t\t\t\t["unk1", "ushort"], \r\n\t\t\t\t["unk2", "ushort"], \r\n\t\t\t\t["unk3", "uint"]\r\n\t\t\t]]]\r\n\t\t]]]], \r\n\t\t["default", "ushort"]\r\n\t], \r\n\r\n\t"ubyte":            "unsigned byte", \r\n\t"ushort":           "unsigned short", \r\n\t"uint":             "unsigned int", \r\n\t"varushort":        "variable unsigned short", \r\n\t"varuint":          "variable unsigned int", \r\n\t"varshort":         "variable short", \r\n\t"varint":           "variable int", \r\n\r\n    "unsigned tribyte": "utribyte", \r\n\t\r\n    "tailed unsigned short":  ["tailed varushort"], \r\n\r\n    "boolean":          "bool", \r\n\r\n    //obsolete backward compat\r\n    "true":             true, \r\n    "false":            false, \r\n    "0":                0, \r\n    "1":                1, \r\n    "-1":               -1, \r\n    "null":             null, \r\n\r\n\t"extrasmap":        [ "array", "ubyte", ["struct", \r\n\t\t["$type", "unsigned byte"], \r\n\t\t["prop", "unsigned tribyte"], \r\n\t\t["intvalue", ["opt", ["$type", 0], "int"]], \r\n\t\t["stringvalue", ["opt", ["$type", 1], "string"]]\r\n\t]], \r\n\r\n\t"buildnr":          ["buildnr"], //needs to be in array to get invoked as function\r\n\r\n\t"item_modelid":     ["match", "buildnr",  {
  ">=670":"varuint", ">=0":"ushort"
}
], \r\n\t"animid":           ["match", "buildnr",  {
  ">=670":"varnullint", ">=0":"ushort"
}
], \r\n\r\n\t"uivalues":         ["array", "ubyte", ["match", "ubyte",  {
  "0":"int", "1":"string"
}
]], \r\n\t"uivaluesint":\t\t["array", "ubyte", "int"]\r\n
}
'
}
, 3599:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                     "text",  "read": "string" 
}
, \r\n\t"0x02":  {
   "name":            "subcategories",  "read": ["array", "ubyte", ["struct", ["id", "ushort"], ["hotkey", "ubyte"]]]
}
, \r\n\t"0x03":  {
   "name":                    "lines",  "read": ["array", "ubyte", ["struct", ["id", "ushort"], ["hotkey", "ubyte"]]]
}
, \r\n\t"0x04":  {
   "name":            "nonsearchable",  "read": "true" 
}
\r\n
}
'
