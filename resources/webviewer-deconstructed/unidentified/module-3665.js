// Module ID: 3665
// Category: unidentified
// Size: 22505 bytes
// Parameters: e,t,n

"use strict";
var r=n(9805);
function i(e) {
  for(var t=e.length;
--t>=0;
)e[t]=0
}
var a=[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], s=[0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], o=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], l=[16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], c=new Array(576)
;
i(c);
var u=new Array(60);
i(u);
var h=new Array(512);
i(h);
var d=new Array(256);
i(d);
var p=new Array(29);
i(p);
var f, m, g, _=new Array(30);
function v(e, t, n, r, i) {
  this.static_tree=e, this.extra_bits=t, this.extra_base=n, this.elems=r, this.max_length=i, 
this.has_stree=e&&e.length
}
function y(e, t) {
  this.dyn_tree=e, this.max_code=0, this.stat_desc=t
}
function b(e) {
  return e<256?h[e]:h[256+(e>>>7)]
}
function x(e, t) {
  e.pending_buf[e.pending++]=255&t, e.pending_buf[e.pending++]=t>>>8&255
}
function E(e, t, n) {
e.bi_valid>16-n?(e.bi_buf|=t<<e.bi_valid&65535, x(e, e.bi_buf), e.bi_buf=t>>16-e.bi_valid, e.bi_valid+=n-16):(e.bi_buf|=t<<e.bi_valid&65535, e.bi_valid+=n)
}
function w(e, t, n) {
  E(e, n[2*t], n[2*t+1])
}
function S(e, t) {
  var n=0;
do {
  n|=1&e, e>>>=1, n<<=1
}
while(--t>0)
;
return n>>>1
}
function T(e, t, n) {
  var r, i, a=new Array(16), s=0;
for(r=1;
r<=15;
r++)a[r]=s=s+n[r-1]<<1;
for(i=0;
i<=t;
i++) {
  var o=e[2*i+1];
0!==o&&(e[2*i]=S(a[o]++, o))
}
}
function A(e) {
  var t;
for(t=0;
t<286;
t++)e.dyn_ltree[2*t]=0
;
for(t=0;
t<30;
t++)e.dyn_dtree[2*t]=0;
for(t=0;
t<19;
t++)e.bl_tree[2*t]=0;
e.dyn_ltree[512]=1, e.opt_len=e.static_len=0, e.last_lit=e.matches=0
}
function C(e) {
  e.bi_valid>8?x(e, e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf), e.bi_buf=0, 
e.bi_valid=0
}
function M(e, t, n, r) {
  var i=2*t, a=2*n;
return e[i]<e[a]||e[i]===e[a]&&r[t]<=r[n]
}
function I(e, t, n) {
  for(var r=e.heap[n], i=n<<1;
i<=e.heap_len&&(i<e.heap_len&&M(t, e.heap[i+1], e.heap[i], e.depth)&&i++, 
!M(t, r, e.heap[i], e.depth));
)e.heap[n]=e.heap[i], n=i, i<<=1;
e.heap[n]=r
}
function R(e, t, n) {
  var r, i, o, l, c=0;
if(0!==e.last_lit)do {
  r=e.pending_buf[e.d_buf+2*c]<<8|e.pending_buf[e.d_buf+2*c+1], i=e.pending_buf[e.l_buf+c], c++, 
0===r?w(e, i, t):(w(e, (o=d[i])+256+1, t), 0!==(l=a[o])&&E(e, i-=p[o], l), w(e, o=b(--r), n), 0!==(l=s[o])&&E(e, r-=_[o], l))
}
while(c<e.last_lit);
w(e, 256, t)
}
function k(e, t) {
var n, r, i, a=t.dyn_tree, s=t.stat_desc.static_tree, o=t.stat_desc.has_stree, l=t.stat_desc.elems, c=-1;
for(e.heap_len=0, e.heap_max=573, n=0;
n<l;
n++)0!==a[2*n]?(e.heap[++e.heap_len]=c=n, e.depth[n]=0):a[2*n+1]=0
;
for(;
e.heap_len<2;
)a[2*(i=e.heap[++e.heap_len]=c<2?++c:0)]=1, e.depth[i]=0, e.opt_len--, o&&(e.static_len-=s[2*i+1]);
for(t.max_code=c, n=e.heap_len>>1;
n>=1;
n--)I(e, a, n);
i=l;
do {
  n=e.heap[1], e.heap[1]=e.heap[e.heap_len--], I(e, a, 1), r=e.heap[1], 
e.heap[--e.heap_max]=n, e.heap[--e.heap_max]=r, a[2*i]=a[2*n]+a[2*r], e.depth[i]=(e.depth[n]>=e.depth[r]?e.depth[n]:e.depth[r])+1, a[2*n+1]=a[2*r+1]=i, e.heap[1]=i++, I(e, a, 1)
}
while(e.heap_len>=2);
e.heap[--e.heap_max]=e.heap[1], function(e, t) {
var n, r, i, a, s, o, l=t.dyn_tree, c=t.max_code, u=t.stat_desc.static_tree, h=t.stat_desc.has_stree, d=t.stat_desc.extra_bits, p=t.stat_desc.extra_base, f=t.stat_desc.max_length, m=0;
for(a=0;
a<=15;
a++)e.bl_count[a]=0;
for(l[2*e.heap[e.heap_max]+1]=0, 
n=e.heap_max+1;
n<573;
n++)(a=l[2*l[2*(r=e.heap[n])+1]+1]+1)>f&&(a=f, m++), l[2*r+1]=a, r>c||(e.bl_count[a]++, s=0, r>=p&&(s=d[r-p]), o=l[2*r], e.opt_len+=o*(a+s), h&&(e.static_len+=o*(u[2*r+1]+s)));
if(0!==m) {
  do {
  for(a=f-1;
0===e.bl_count[a];
)a--
;
e.bl_count[a]--, e.bl_count[a+1]+=2, e.bl_count[f]--, m-=2
}
while(m>0);
for(a=f;
0!==a;
a--)for(r=e.bl_count[a];
0!==r;
)(i=e.heap[--n])>c||(l[2*i+1]!==a&&(e.opt_len+=(a-l[2*i+1])*l[2*i], l[2*i+1]=a), r--)
}
}
(e, t), T(a, c, e.bl_count)
}
function N(e, t, n) {
var r, i, a=-1, s=t[1], o=0, l=7, c=4;
for(0===s&&(l=138, c=3), t[2*(n+1)+1]=65535, r=0;
r<=n;
r++)i=s, s=t[2*(r+1)+1], ++o<l&&i===s||(o<c?e.bl_tree[2*i]+=o:0!==i?(i!==a&&e.bl_tree[2*i]++, e.bl_tree[32]++):o<=10?e.bl_tree[34]++:e.bl_tree[36]++, o=0, a=i, 0===s?(l=138, 
c=3):i===s?(l=6, c=3):(l=7, c=4))
}
function D(e, t, n) {
  var r, i, a=-1, s=t[1], o=0, l=7, c=4;
for(0===s&&(l=138, c=3), r=0;
r<=n;
r++)if(i=s, s=t[2*(r+1)+1], !(++o<l&&i===s)) {
  if(o<c)do {
  w(e, i, e.bl_tree)
}
while(0!=--o);
else 0!==i?(i!==a&&(w(e, i, e.bl_tree), o--), 
w(e, 16, e.bl_tree), E(e, o-3, 2)):o<=10?(w(e, 17, e.bl_tree), E(e, o-3, 3)):(w(e, 18, e.bl_tree), E(e, o-11, 7));
o=0, a=i, 0===s?(l=138, c=3):i===s?(l=6, c=3):(l=7, c=4)
}
}
i(_);
var L=!1;
function O(e, t, n, i) {
  E(e, 0+(i?1:0), 3), function(e, t, n) {
  C(e), x(e, n), x(e, ~n), 
r.arraySet(e.pending_buf, e.window, t, n, e.pending), e.pending+=n
}
(e, t, n)
}
t._tr_init=function(e) {
  L||(function() {
  var e, t, n, r, i, l=new Array(16);
for(n=0, r=0;
r<28;
r++)for(p[r]=n, e=0;
e<1<<a[r];
e++)d[n++]=r;
for(d[n-1]=r, i=0, r=0;
r<16;
r++)for(_[r]=i, 
e=0;
e<1<<s[r];
e++)h[i++]=r;
for(i>>=7;
r<30;
r++)for(_[r]=i<<7, e=0;
e<1<<s[r]-7;
e++)h[256+i++]=r;
for(t=0;
t<=15;
t++)l[t]=0;
for(e=0;
e<=143;
)c[2*e+1]=8, e++, l[8]++;
for(;
e<=255;
)c[2*e+1]=9, e++, l[9]++;
for(;
e<=279;
)c[2*e+1]=7, e++, l[7]++;
for(;
e<=287;
)c[2*e+1]=8, 
e++, l[8]++;
for(T(c, 287, l), e=0;
e<30;
e++)u[2*e+1]=5, u[2*e]=S(e, 5);
f=new v(c, a, 257, 286, 15), m=new v(u, s, 0, 30, 15), g=new v(new Array(0), o, 0, 19, 7)
}
(), L=!0), e.l_desc=new y(e.dyn_ltree, f), e.d_desc=new y(e.dyn_dtree, m), e.bl_desc=new y(e.bl_tree, g), e.bi_buf=0, 
e.bi_valid=0, A(e)
}
, t._tr_stored_block=O, t._tr_flush_block=function(e, t, n, r) {
  var i, a, s=0;
e.level>0?(2===e.strm.data_type&&(e.strm.data_type=function(e) {
  var t, n=4093624447;
for(t=0;
t<=31;
t++, n>>>=1)if(1&n&&0!==e.dyn_ltree[2*t])return 0
;
if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return 1;
for(t=32;
t<256;
t++)if(0!==e.dyn_ltree[2*t])return 1;
return 0
}
(e)), k(e, e.l_desc), k(e, e.d_desc), s=function(e) {
  var t;
for(N(e, e.dyn_ltree, e.l_desc.max_code), 
N(e, e.dyn_dtree, e.d_desc.max_code), k(e, e.bl_desc), t=18;
t>=3&&0===e.bl_tree[2*l[t]+1];
t--);
return e.opt_len+=3*(t+1)+5+5+4, t
}
(e), i=e.opt_len+3+7>>>3, (a=e.static_len+3+7>>>3)<=i&&(i=a)):i=a=n+5, 
n+4<=i&&-1!==t?O(e, t, n, r):4===e.strategy||a===i?(E(e, 2+(r?1:0), 3), R(e, c, u)):(E(e, 4+(r?1:0), 3), function(e, t, n, r) {
  var i;
for(E(e, t-257, 5), E(e, n-1, 5), E(e, r-4, 4), i=0;
i<r;
i++)E(e, e.bl_tree[2*l[i]+1], 3);
D(e, e.dyn_ltree, t-1), D(e, e.dyn_dtree, n-1)
}
(e, e.l_desc.max_code+1, e.d_desc.max_code+1, s+1), R(e, e.dyn_ltree, e.dyn_dtree)), A(e), r&&C(e)
}
, t._tr_tally=function(e, t, n) {
  return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255, e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t, 
e.pending_buf[e.l_buf+e.last_lit]=255&n, e.last_lit++, 0===t?e.dyn_ltree[2*n]++:(e.matches++, t--, e.dyn_ltree[2*(d[n]+256+1)]++, e.dyn_dtree[2*b(t)]++), e.last_lit===e.lit_bufsize-1
}
, t._tr_align=function(e) {
  E(e, 2, 3), w(e, 256, c), function(e) {
16===e.bi_valid?(x(e, e.bi_buf), e.bi_buf=0, e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=255&e.bi_buf, e.bi_buf>>=8, e.bi_valid-=8)
}
(e)
}
}
, 3688:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x00":  {
   "name":                             "nullopt",  "read": "true" 
}
, \r\n\t"0x01":  {
   "name":                           "baseModel",  "read": "item_modelid" 
}
, \r\n\t"0x02":  {
   "name":                                "name",  "read": "string" 
}
, \r\n\t"0x03":  {
   "name":                         "buff_effect",  "read": "string" 
}
, \r\n\t"0x04":  {
   "name":                          "model_zoom",  "read": "unsigned short" 
}
, \r\n\t"0x05":  {
   "name":                          "rotation_0",  "read": "unsigned short" 
}
, \r\n\t"0x06":  {
   "name":                          "rotation_1",  "read": "unsigned short" 
}
, \r\n\t"0x07":  {
   "name":                    "modelTranslate_0",  "read": "short" 
}
, \r\n\t"0x08":  {
   "name":                    "modelTranslate_1",  "read": "short" 
}
, \r\n\t"0x0A":  {
   "name":                          "unknown_0A",  "read": "ushort" 
}
, \r\n\t"0x0B":  {
   "name":                         "stackable_1",  "read": "true" 
}
, \r\n\t"0x0C":  {
   "name":                               "value",  "read": "int" 
}
, \r\n\t"0x0D":  {
   "name":                         "equipSlotId",  "read": "unsigned byte" 
}
, \r\n\t"0x0E":  {
   "name":                             "equipId",  "read": "unsigned byte" 
}
, \r\n\t"0x0F":  {
   "name":                          "unknown_0F",  "read": "true" 
}
, \r\n\t"0x10":  {
   "name":                             "members",  "read": "true" 
}
, \r\n\t"0x12":  {
   "name":                      "multiStackSize",  "read": "unsigned short" 
}
, \r\n\t"0x17":  {
   "name":                        "maleModels_0",  "read": ["struct", ["id", "item_modelid"], ["type", ["match", "buildnr",  {
  ">=502":0, "other":"ubyte"
}
]]] 
}
, \r\n\t"0x18":  {
   "name":                        "maleModels_1",  "read": "item_modelid" 
}
, \r\n\t"0x19":  {
   "name":                      "femaleModels_0",  "read": ["struct", ["id", "item_modelid"], ["type", ["match", "buildnr",  {
  ">=502":0, "other":"ubyte"
}
]]] 
}
, \r\n\t"0x1A":  {
   "name":                      "femaleModels_1",  "read": "item_modelid" 
}
, \r\n\t"0x1B":  {
   "name":                          "unknown_1B",  "read": "unsigned byte" 
}
, \r\n\t"0x1E":  {
   "name":                    "ground_actions_0",  "read": "string" 
}
, \r\n\t"0x1F":  {
   "name":                    "ground_actions_1",  "read": "string" 
}
, \r\n\t"0x20":  {
   "name":                    "ground_actions_2",  "read": "string" 
}
, \r\n\t"0x21":  {
   "name":                    "ground_actions_3",  "read": "string" 
}
, \r\n\t"0x22":  {
   "name":                    "ground_actions_4",  "read": "string" 
}
, \r\n\t"0x23":  {
   "name":                    "widget_actions_0",  "read": "string" 
}
, \r\n\t"0x24":  {
   "name":                    "widget_actions_1",  "read": "string" 
}
, \r\n\t"0x25":  {
   "name":                    "widget_actions_2",  "read": "string" 
}
, \r\n\t"0x26":  {
   "name":                    "widget_actions_3",  "read": "string" 
}
, \r\n\t"0x27":  {
   "name":                    "widget_actions_4",  "read": "string" 
}
, \r\n\t"0x28":  {
   "name":                  "color_replacements",  "read": [ "array",  [ "tuple",  "unsigned short",  "unsigned short"] ] 
}
, \r\n\t"0x29":  {
   "name":               "material_replacements",  "read": [ "array",  [ "tuple",  "unsigned short",  "unsigned short"] ] 
}
, \r\n\t"0x2A":  {
   "name":                     "recolourPalette",  "read": [ "array",  [ "tuple",  "unsigned byte",  "byte"] ] 
}
, \r\n\t"0x2B":  {
   "name":                           "nameColor",  "read": "int" 
}
, \r\n\t"0x2C":  {
   "name":                   "recolorDstIndices",  "read": "unsigned short" 
}
, \r\n\t"0x2D":  {
   "name":                 "retextureDstIndices",  "read": "unsigned short" 
}
, \r\n\t"0x41":  {
   "name":                           "tradeable",  "read": "true" 
}
, \r\n\t"0x45":  {
   "name":                           "buy_limit",  "read": "int" 
}
, \r\n\t"0x4E":  {
   "name":                        "maleModels_2",  "read": "item_modelid" 
}
, \r\n\t"0x4F":  {
   "name":                      "femaleModels_2",  "read": "item_modelid" 
}
, \r\n\t"0x5A":  {
   "name":                         "maleHeads_0",  "read": "item_modelid" 
}
, \r\n\t"0x5B":  {
   "name":                       "femaleHeads_0",  "read": "item_modelid" 
}
, \r\n\t"0x5C":  {
   "name":                         "maleHeads_1",  "read": "item_modelid" 
}
, \r\n\t"0x5D":  {
   "name":                       "femaleHeads_1",  "read": "item_modelid" 
}
, \r\n\t"0x5E":  {
   "name":                            "category",  "read": "unsigned short" 
}
, \r\n\t"0x5F":  {
   "name":                          "rotation_2",  "read": "unsigned short" 
}
, \r\n\t"0x60":  {
   "name":                           "dummyItem",  "read": "unsigned byte" 
}
, \r\n\t"0x61":  {
   "name":                            "noteData",  "read": "unsigned short" 
}
, \r\n\t"0x62":  {
   "name":                        "noteTemplate",  "read": "unsigned short" 
}
, \r\n\t"0x64":  {
   "name":                        "stack_info_0",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x65":  {
   "name":                        "stack_info_1",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x66":  {
   "name":                        "stack_info_2",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x67":  {
   "name":                        "stack_info_3",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x68":  {
   "name":                        "stack_info_4",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x69":  {
   "name":                        "stack_info_5",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x6A":  {
   "name":                        "stack_info_6",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x6B":  {
   "name":                        "stack_info_7",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x6C":  {
   "name":                        "stack_info_8",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x6D":  {
   "name":                        "stack_info_9",  "read": [ "tuple",  "unsigned short",  "unsigned short" ] 
}
, \r\n\t"0x6E":  {
   "name":                             "scale_0",  "read": "unsigned short" 
}
, \r\n\t"0x6F":  {
   "name":                             "scale_1",  "read": "unsigned short" 
}
, \r\n\t"0x70":  {
   "name":                             "scale_2",  "read": "unsigned short" 
}
, \r\n\t"0x71":  {
   "name":                            "ambiance",  "read": "byte" 
}
, \r\n\t"0x72":  {
   "name":                            "contrast",  "read": "byte" 
}
, \r\n\t"0x73":  {
   "name":                                "team",  "read": "unsigned byte" 
}
, \r\n\t"0x79":  {
   "name":                              "loanId",  "read": "unsigned short" 
}
, \r\n\t"0x7A":  {
   "name":                        "loanTemplate",  "read": "unsigned short" 
}
, \r\n\t"0x7D":  {
   "name":                      "male_translate",  "read": [ "tuple",  "unsigned byte",  "unsigned byte",  "unsigned byte" ] 
}
, \r\n\t"0x7E":  {
   "name":                    "female_translate",  "read": [ "tuple",  "unsigned byte",  "unsigned byte",  "unsigned byte" ] 
}
, \r\n\t"0x7F":  {
   "name":                          "unknown_7F",  "read": [ "tuple",  "unsigned byte",  "unsigned short" ] 
}
, \r\n\t"0x80":  {
   "name":                          "unknown_80",  "read": [ "tuple",  "unsigned byte",  "unsigned short" ] 
}
, \r\n\t"0x81":  {
   "name":                          "unknown_81",  "read": [ "tuple",  "unsigned byte",  "unsigned short" ] 
}
, \r\n\t"0x82":  {
   "name":                          "unknown_82",  "read": [ "tuple",  "unsigned byte",  "unsigned short" ] 
}
, \r\n\t"0x84":  {
   "name":                              "quests",  "read": [ "array",  [ "tuple", "unsigned byte",  "unsigned short"] ] 
}
, \r\n\t"0x86":  {
   "name":                       "pickSizeShift",  "read": "unsigned byte" 
}
, \r\n\t"0x8B":  {
   "name":                            "bindLink",  "read": "unsigned short" 
}
, \r\n\t"0x8C":  {
   "name":                        "bindTemplate",  "read": "unsigned short" 
}
, \r\n\t"0x8E":  {
   "name":             "ground_actions_cursor_0",  "read": "unsigned short" 
}
, \r\n\t"0x8F":  {
   "name":             "ground_actions_cursor_1",  "read": "unsigned short" 
}
, \r\n\t"0x90":  {
   "name":             "ground_actions_cursor_2",  "read": "unsigned short" 
}
, \r\n\t"0x91":  {
   "name":             "ground_actions_cursor_3",  "read": "unsigned short" 
}
, \r\n\t"0x92":  {
   "name":             "ground_actions_cursor_4",  "read": "unsigned short" 
}
, \r\n\t"0x96":  {
   "name":             "widget_actions_cursor_0",  "read": "unsigned short" 
}
, \r\n\t"0x97":  {
   "name":             "widget_actions_cursor_1",  "read": "unsigned short" 
}
, \r\n\t"0x98":  {
   "name":             "widget_actions_cursor_2",  "read": "unsigned short" 
}
, \r\n\t"0x99":  {
   "name":             "widget_actions_cursor_3",  "read": "unsigned short" 
}
, \r\n\t"0x9A":  {
   "name":             "widget_actions_cursor_4",  "read": "unsigned short" 
}
, \r\n\t"0x9C":  {
   "name":                               "dummy",  "read": "true" 
}
, \r\n\t"0x9D":  {
   "name":                  "randomizeGroundPos",  "read": "true" 
}
, \r\n\t"0xA1":  {
   "name":                        "combine_info",  "read": "unsigned short" 
}
, \r\n\t"0xA2":  {
   "name":                    "combine_template",  "read": "unsigned short" 
}
, \r\n\t"0xA3":  {
   "name":                "combine_num_required",  "read": "unsigned short" 
}
, \r\n\t"0xA4":  {
   "name":                  "combine_shard_name",  "read": "string" 
}
, \r\n\t"0xA5":  {
   "name":                      "neverStackable",  "read": "true" 
}
, \r\n\t"0xA7":  {
   "name":                          "unknown_A7",  "read": "true" 
}
, \r\n\t"0xA8":  {
   "name":                          "unknown_A8",  "read": "true" 
}
, \r\n\t"0xB2":  {
   "name":                          "unknown_B2",  "read": "true" 
}
, //seems to always be set when config has a "big_Value"\r\n\t"0xB5":  {
   "name":                           "big_value",  "read": ["tuple", "int", "int"] 
}
, //to be comfirmed if this is int64,  or int32*1e9+int32 like the coin pouch is\r\n\t"0xF9":  {
   "name":                               "extra",  "read": "extrasmap" 
}
\r\n
}
'
}
, 3813:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t["footbytes", ["match", "buildnr",  {
  ">=764":65535, ">=0":["footer", 2, "ushort"]
}
]], \r\n\t["colanimcount", ["match", "buildnr",  {
  ">=764":["footer", 2, "ushort"], ">=0":0
}
]], \r\n\t["unkcount0", ["match", "buildnr",  {
  ">=764":["footer", 2, "ushort"], ">=0":0
}
]], \r\n\t["uvcount", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":["footer", 2, "ushort"], \r\n\t\t"other":0\r\n\t
}
]], \r\n\t["indexbufsize", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":["footer", 2, "ushort"], \r\n\t\t"other":["ref", "footbytes"]\r\n\t
}
]], \r\n\t["zsize", ["footer", 2, "ushort"]], \r\n\t["ysize", ["footer", 2, "ushort"]], \r\n\t["xsize", ["footer", 2, "ushort"]], \r\n\t["hasbones", ["footer", 1, "bool"]], \r\n\t["hasmaterials", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":["footer", 1, "bool"], \r\n\t\t"other":false\r\n\t
}
]], \r\n\t["flag3", ["footer", 1, "bool"]], //called transgroups in runelite\r\n\t["hasalpha", ["footer", 1, "bool"]], \r\n\t["priority", ["footer", 1, "ubyte"]], \r\n\t["extraflags", ["footer", 1, "ubyte"]], \r\n\t["texmapcount", ["match", "buildnr",  {
  ">=764":["footer", 2, "ushort"], ">=0":["footer", 1, "ubyte"]
}
]], \r\n\t["facecount", ["footer", 2, "ushort"]], \r\n\t["vertcount", ["footer", 2, "ushort"]], \r\n\r\n\t["header1", ["match", "buildnr",  {
  ">=754":"ubyte", ">=0":0
}
]], \r\n\t["header2", ["match", "buildnr",  {
  ">=764":"ubyte", ">=0":0
}
]], \r\n\t["modelversion", ["match", "buildnr",  {
  \r\n\t\t">=764":"ubyte", \r\n\t\t"other":["match", ["ref", "extraflags"],  {
  \r\n\t\t\t"&8":["footer", 1, "ubyte"], \r\n\t\t\t"other":0\r\n\t\t
}
]\r\n\t
}
]], \r\n\t["vertdatasize", ["match", "buildnr",  {
  \r\n\t\t">=764":["ref", "unkcount0"], \r\n\t\t"other":["match", ["ref", "extraflags"],  {
  \r\n\t\t\t"&0x10":["footer", 2, "ushort"], \r\n\t\t\t"other":["ref", "vertcount"]\r\n\t\t
}
]\r\n\t
}
]], \r\n\r\n\t["texmap_vertcount", 0], \r\n\t["texmap_projectioncount", 0], \r\n\t["texmap_transsize", 0], \r\n\t["texflags", ["array", ["ref", "texmapcount"], \r\n\t\t["match", ["match", ["ref", "footbytes"],  {
  "65535":"ubyte", "other":0
}
],  {
  \r\n\t\t\t"0":["struct", \r\n\t\t\t\t["type", 0], \r\n\t\t\t\t["vertindex", ["accum", "texmap_vertcount", 1, "postadd"]]\r\n\t\t\t], \r\n\t\t\t"1":["struct", \r\n\t\t\t\t["type", 1], \r\n\t\t\t\t["projection", ["accum", "texmap_projectioncount", 1, "postadd"]], \r\n\t\t\t\t["speed", ["accum", "texmap_transsize", 1, "postadd"]]\r\n\t\t\t], \r\n\t\t\t"2":["struct", \r\n\t\t\t\t["type", 2], \r\n\t\t\t\t["projection", ["accum", "texmap_projectioncount", 1, "postadd"]], \r\n\t\t\t\t["speed", ["accum", "texmap_transsize", 3, "postadd"]]\r\n\t\t\t], \r\n\t\t\t"3":["struct", \r\n\t\t\t\t["type", 3], \r\n\t\t\t\t["projection", ["accum", "texmap_projectioncount", 1, "postadd"]], \r\n\t\t\t\t["speed", ["accum", "texmap_transsize", 1, "postadd"]]\r\n\t\t\t]\r\n\t\t
}
]]\r\n\t], \r\n\t["vertflags", ["buffer", ["ref", "vertcount"], "ubyte"]], //0-7 flags,  whether xyz are different from previous vertex\r\n\t["mode_1", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":["opt", ["extraflags", 0, "bitflag"], ["buffer", ["ref", "facecount"], "ubyte"]], \r\n\t\t"other":null\r\n\t
}
]], \r\n\t["tritype", ["buffer", ["ref", "facecount"], "ubyte"]], //1-4 are types,  flag 8 grabs a uv pair from the texuvs struct\r\n\t["facepriority", ["opt", ["priority", 255], ["buffer", ["ref", "facecount"], "ubyte"]]], \r\n\t["unk1", ["opt", ["flag3", 1], ["buffer", ["match", "buildnr",  {
  ">=764":["ref", "colanimcount"], ">=0":["ref", "facecount"]
}
]]]], //"transgroups"\r\n\t["mode_2", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":null, \r\n\t\t"other":["opt", ["extraflags", 0, "bitflag"], ["buffer", ["ref", "facecount"], "ubyte"]]\r\n\t
}
]], \r\n\t["boneids", ["opt", ["hasbones", 1], ["buffer", ["ref", "vertdatasize"]]]], \r\n\t["alpha", ["opt", ["hasalpha", 1], ["buffer", ["ref", "facecount"]]]], \r\n\t["indexbuffer", ["buffer", ["ref", "indexbufsize"]]], \r\n\t["material", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":["opt", ["hasmaterials", 1], ["buffer", ["ref", "facecount"], "ushort"]], \r\n\t\t"other":null\r\n\t
}
]], \r\n\t["uvs", ["buffer", ["ref", "uvcount"]]], \r\n\t["colors", ["buffer", ["ref", "facecount"], "ushort"]], \r\n\t["texmap_verts_1", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":null, \r\n\t\t"other":["array", ["ref", "texmap_vertcount"], ["tuple", "ushort", "ushort", "ushort"]]\r\n\t
}
]], \r\n\t["posx", ["buffer", ["ref", "xsize"]]], \r\n\t["posy", ["buffer", ["ref", "ysize"]]], \r\n\t["posz", ["buffer", ["ref", "zsize"]]], \r\n\t["texmap_verts_2", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":["array", ["ref", "texmap_vertcount"], ["tuple", "ushort", "ushort", "ushort"]], \r\n\t\t"other":null\r\n\t
}
]], \r\n\t["texmap_projections", ["chunkedarray", ["ref", "texmap_projectioncount"], [\r\n\t\t["normal", ["tuple", "short", "short", "short"]]\r\n\t], [\r\n\t\t["scale", ["tuple", \r\n\t\t\t["match", ["ref", "modelversion"],  {
  ">=15":"unsigned tribyte", ">=0":"ushort"
}
], \r\n\t\t\t["match", ["ref", "modelversion"],  {
  ">=14":"unsigned tribyte", ">=0":"ushort"
}
], //14 is not a typo\r\n\t\t\t["match", ["ref", "modelversion"],  {
  ">=15":"unsigned tribyte", ">=0":"ushort"
}
]\r\n\t\t]]\r\n\t], [\r\n\t\t["rotation", "ubyte"]\r\n\t], [\r\n\t\t["direction", "ubyte"]\r\n\t]]], \r\n\t["texmap_translates", ["array", ["ref", "texmap_transsize"], "ubyte"]], \r\n\t["particles", ["opt", ["extraflags", 1, "bitflag"], ["array", "ubyte", ["struct", \r\n\t\t["texture", "ushort"], \r\n\t\t["faceid", "ushort"]\r\n\t]]]], \r\n\t["effectors", ["opt", ["extraflags", 1, "bitflag"], ["array", "ubyte", ["struct", \r\n\t\t["effector", "ushort"], \r\n\t\t["vertex", "ushort"]\r\n\t]]]], \r\n\t["billboards", ["opt", ["extraflags", 2, "bitflag"], ["array", "ubyte", ["struct", \r\n\t\t["unk1", "ushort"], \r\n\t\t["unk2", "ushort"], \r\n\t\t["unk3", "ubyte"], \r\n\t\t["unk4", "ubyte"]\r\n\t]]]], \r\n\t["texuvs", ["opt", ["extraflags", 7, "bitflag"], ["struct", \r\n\t\t["headoffset", ["footer", 1, "ubyte"]], //always 7?\r\n\t\t["indexsize", ["footer", 2, "ushort"]], \r\n\t\t["datasize", ["footer", 2, "ushort"]], \r\n\t\t["coordcount", ["footer", 2, "ushort"]], \r\n\t\t["index", ["buffer", ["ref", "indexsize"], "ubyte"]], \r\n\t\t["vertex", ["buffer", ["ref", "vertcount"], "ubyte"]], \r\n\t\t["udata", ["array", ["ref", "coordcount"], "short"]], \r\n\t\t["vdata", ["array", ["ref", "coordcount"], "short"]]\r\n\t]]], \r\n\t["unusedendbytes", ["match", ["ref", "footbytes"],  {
  \r\n\t\t"0xffff":["match", "buildnr",  {
  \r\n\t\t\t">=526":null, \r\n\t\t\t"other":["array", "ubyte", ["tuple", "ushort", "ushort", "ushort", "int"]]\r\n\t\t
}
], \r\n\t\t"other":null\r\n\t
}
]]\r\n]'
