// Module ID: 7833
// Category: syntax-error
// Size: 5835 bytes
// Parameters: e,t,n

var r=n(5606);
t.formatArgs=function(t) {
if(t[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+t[0]+(this.useColors?"%c ":" ")+"+"+e.exports.humanize(this.diff), !this.useColors)return;
const n="color: "+this.color;
t.splice(1, 0, n, "color: inherit");
let r=0, i=0
;
t[0].replace(/%[a-zA-Z%]/g, (e=> {
  "%%"!==e&&(r++, "%c"===e&&(i=r))
}
)), t.splice(i, 0, n)
}
, t.save=function(e) {
  try {
  e?t.storage.setItem("debug", e):t.storage.removeItem("debug")
}
catch(e) {
}
}
, t.load=function() {
  let e;
try {
e=t.storage.getItem("debug")||t.storage.getItem("DEBUG")
}
catch(e) {
}
return!e&&void 0!==r&&"env"in r&&(e=r.env.DEBUG), e
}
, t.useColors=function() {
if("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))return!0;
if("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))return!1;
let e
;
return"undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&(e=navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/))&&parseInt(e[1], 10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)
}
, t.storage=function() {
  try {
  return localStorage
}
catch(e) {
}
}
(), t.destroy=(()=> {
  let e=!1;
return()=> {
  e||(e=!0, 
console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))
}
}
)(), 
t.colors=["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"], 
t.log=console.debug||console.log||(()=> {
}
), e.exports=n(736)(t);
const {
  formatters:i
}
=e.exports;
i.j=function(e) {
  try {
  return JSON.stringify(e)
}
catch(e) {
  return"[UnexpectedJSONParseError]: "+e.message
}
}
}
, 7882:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0xF9":  {
   "name":              "extra",  "read": "extrasmap" 
}
\r\n
}
'
}
, 7996:e=> {
  "use strict";
var t=new Uint8Array(1e7), n= {
  array:function(e) {
  var t=0, n=0, r=[0, 1, 3, 7, 15, 31, 63, 127, 255];
return function(i) {
  for(var a=0;
i>0;
) {
  var s=8-t
;
i>=s?(a<<=s, a|=r[s]&e[n++], t=0, i-=s):(a<<=i, a|=(e[n]&r[i]<<8-i-t)>>8-i-t, t+=i, i=0)
}
return a
}
}
, simple:function(e) {
  var t, r, i=n.header(e), a=[], s=0;
do {
  -1!=(r=n.decompress(e, i))&&(a.push(r), s+=r.byteLength)
}
while(-1!=r);
t=new Uint8Array(s), s=0
;
for(var o=0;
o<a.length;
++o)r=a[o], t.set(r, s), s+=r.byteLength;
return t
}
, header:function(e) {
  if(4348520!=e(24))throw"No magic number found";
var t=e(8)-48;
if(t<1||t>9)throw"Not a BZIP archive";
return t
}
, decompress:function(e, n, r) {
for(var i=9e5, a="", s=0;
s<6;
s++)a+=e(8).toString(16);
if("177245385090"==a)return-1;
if("314159265359"!=a)throw"eek not valid bzip data";
if(e(32), e(1))throw"unsupported obsolete version";
var o=e(24);
if(o>i)throw"Initial position larger than buffer size"
;
var l=e(16), c=new Uint8Array(256), u=0;
for(s=0;
s<16;
s++)if(l&1<<15-s) {
  var h=e(16);
for(g=0;
g<16;
g++)h&1<<15-g&&(c[u++]=16*s+g)
}
var d=e(3);
if(d<2||d>6)throw"another error";
var p=e(15);
if(0==p)throw"meh";
var f=[];
for(s=0;
s<d;
s++)f[s]=s
;
var m=new Uint8Array(32768);
for(s=0;
s<p;
s++) {
  for(var g=0;
e(1);
g++)if(g>=d)throw"whoops another error";
var _=f[g];
f.splice(g, 1), f.splice(0, 0, _), m[s]=_
}
var v=u+2, y=[];
for(g=0;
g<d;
g++) {
  var b, x, E, w=new Uint8Array(258), S=new Uint8Array(21);
for(l=e(5), 
s=0;
s<v;
s++) {
  for(;
;
) {
  if(l<1||l>20)throw"I gave up a while ago on writing error messages";
if(!e(1))break;
e(1)?l--:l++
}
w[s]=l
}
for(b=x=w[0], s=1;
s<v;
s++)w[s]>x?x=w[s]:w[s]<b&&(b=w[s]);
(E=y[g]= {
}
).permute=new Uint32Array(258), E.limit=new Uint32Array(21), 
E.base=new Uint32Array(21), E.minLen=b, E.maxLen=x;
var T=E.base.subarray(1), A=E.limit.subarray(1), C=0;
for(s=b;
s<=x;
s++)for(l=0;
l<v;
l++)w[l]==s&&(E.permute[C++]=l);
for(s=b;
s<=x;
s++)S[s]=A[s]=0;
for(s=0;
s<v;
s++)S[w[s]]++;
for(C=l=0, s=b;
s<x;
s++)C+=S[s], 
A[s]=C-1, C<<=1, T[s+1]=C-(l+=S[s]);
A[x]=C+S[x]-1, T[b]=0
}
var M, I, R, k=new Uint32Array(256);
for(s=0;
s<256;
s++)f[s]=s;
M=I=v=R=0;
for(var N=new Uint32Array(i);
;
) {
  if(!v--) {
  if(v=49, R>=p)throw"meow i'm a kitty,  that's an error"
;
T=(E=y[m[R++]]).base.subarray(1), A=E.limit.subarray(1)
}
for(g=e(s=E.minLen);
;
) {
  if(s>E.maxLen)throw"rawr i'm a dinosaur";
if(g<=A[s])break;
s++, g=g<<1|e(1)
}
if((g-=T[s])<0||g>=258)throw"moo i'm a cow";
var D=E.permute[g];
if(0!=D&&1!=D) {
  if(M) {
  if(M=0, 
I+l>=i)throw"Boom.";
for(k[_=c[f[0]]]+=l;
l--;
)N[I++]=_
}
if(D>u)break;
if(I>=i)throw"I can't think of anything. Error";
_=f[s=D-1], f.splice(s, 1), f.splice(0, 0, _), k[_=c[_]]++, N[I++]=_
}
else M||(M=1, l=0), l+=0==D?M:2*M, M<<=1
}
if(o<0||o>=I)throw"I'm a monkey and I'm throwing something at someone,  namely you";
for(g=0, s=0;
s<256;
s++)h=g+k[s], k[s]=g, g=h;
for(s=0;
s<I;
s++)N[k[_=255&N[s]]]|=s<<8, k[_]++;
var L, O, P, F=0, U=0, B=0;
I&&(U=255&(F=N[o]), F>>=8, B=-1);
var z=0
;
for(r||(r=1/0);
I;
) {
  for(I--, O=U, U=255&(F=N[F]), F>>=8, 3==B++?(L=U, P=O, U=-1):(L=1, P=U);
L--;
)if(t[z++]=P, ! --r)return t;
U!=O&&(B=0)
}
if(z>t.length)throw new Error("not enough memory reserved");
return t.slice(0, z)
}
}
;
e.exports=n
}
, 8002:e=> {
  "use strict"
;
e.exports=Math.min
}
, 8068:e=> {
  "use strict";
e.exports=SyntaxError
