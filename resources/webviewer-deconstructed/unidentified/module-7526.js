// Module ID: 7526
// Category: unidentified
// Size: 1407 bytes
// Parameters: e,t

"use strict";
t.byteLength=function(e) {
  var t=o(e), n=t[0], r=t[1];
return 3*(n+r)/4-r
}
, t.toByteArray=function(e) {
var t, n, a=o(e), s=a[0], l=a[1], c=new i(function(e, t, n) {
  return 3*(t+n)/4-n
}
(0, s, l)), u=0, h=l>0?s-4:s;
for(n=0;
n<h;
n+=4)t=r[e.charCodeAt(n)]<<18|r[e.charCodeAt(n+1)]<<12|r[e.charCodeAt(n+2)]<<6|r[e.charCodeAt(n+3)], c[u++]=t>>16&255, c[u++]=t>>8&255, 
c[u++]=255&t;
return 2===l&&(t=r[e.charCodeAt(n)]<<2|r[e.charCodeAt(n+1)]>>4, c[u++]=255&t), 1===l&&(t=r[e.charCodeAt(n)]<<10|r[e.charCodeAt(n+1)]<<4|r[e.charCodeAt(n+2)]>>2, c[u++]=t>>8&255, c[u++]=255&t), c
}
, t.fromByteArray=function(e) {
for(var t, r=e.length, i=r%3, a=[], s=16383, o=0, l=r-i;
o<l;
o+=s)a.push(c(e, o, o+s>l?l:o+s));
return 1===i?(t=e[r-1], a.push(n[t>>2]+n[t<<4&63]+"==")):2===i&&(t=(e[r-2]<<8)+e[r-1], a.push(n[t>>10]+n[t>>4&63]+n[t<<2&63]+"=")), a.join("")
}
;
for(var n=[], r=[], i="undefined"!=typeof Uint8Array?Uint8Array:Array, a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s=0;
s<64;
++s)n[s]=a[s], r[a.charCodeAt(s)]=s;
function o(e) {
  var t=e.length
;
if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");
var n=e.indexOf("=");
return-1===n&&(n=t), [n, n===t?0:4-n%4]
}
function l(e) {
  return n[e>>18&63]+n[e>>12&63]+n[e>>6&63]+n[63&e]
}
function c(e, t, n) {
for(var r, i=[], a=t;
a<n;
a+=3)r=(e[a]<<16&16711680)+(e[a+1]<<8&65280)+(255&e[a+2]), i.push(l(r));
return i.join("")
}
r["-".charCodeAt(0)]=62, r["_".charCodeAt(0)]=63
