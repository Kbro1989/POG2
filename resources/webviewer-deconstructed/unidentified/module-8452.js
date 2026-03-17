// Module ID: 8452
// Category: unidentified
// Size: 1423 bytes
// Parameters: e,t,n

"use strict"
;
var r=n(1189), i="function"==typeof Symbol&&"symbol"==typeof Symbol("foo"), a=Object.prototype.toString, s=Array.prototype.concat, o=n(41), l=n(592)(), c=function(e, t, n, r) {
  if(t in e)if(!0===r) {
  if(e[t]===n)return
}
else if("function"!=typeof(i=r)||"[object Function]"!==a.call(i)||!r())return;
var i;
l?o(e, t, n, !0):o(e, t, n)
}
, u=function(e, t) {
  var n=arguments.length>2?arguments[2]: {
}
, a=r(t);
i&&(a=s.call(a, Object.getOwnPropertySymbols(t)))
;
for(var o=0;
o<a.length;
o+=1)c(e, a[o], t[a[o]], n[a[o]])
}
;
u.supportsDescriptors=!!l, e.exports=u
}
, 8487:e=> {
  "use strict";
var t=/("(?:[^\\"]|\\.)*")|[:, ]/g;
e.exports=function(e, n) {
  var r, i, a;
return n=n|| {
}
, 
r=JSON.stringify([1], void 0, void 0===n.indent?2:n.indent).slice(2, -3), i=""===r?1/0:void 0===n.maxLength?80:n.maxLength, a=n.replacer, function e(n, s, o) {
  var l, c, u, h, d, p, f, m, g, _, v, y;
if(n&&"function"==typeof n.toJSON&&(n=n.toJSON()), 
void 0===(v=JSON.stringify(n, a)))return v;
if(f=i-s.length-o, v.length<=f&&(g=v.replace(t, (function(e, t) {
  return t||e+" "
}
))).length<=f)return g;
if(null!=a&&(n=JSON.parse(v), a=void 0), "object"==typeof n&&null!==n) {
  if(m=s+r, u=[], c=0, 
Array.isArray(n))for(_="[", l="]", f=n.length;
c<f;
c++)u.push(e(n[c], m, c===f-1?0:1)||"null");
else for(_=" {
  ", l="
}
", f=(p=Object.keys(n)).length;
c<f;
c++)h=p[c], d=JSON.stringify(h)+": ", void 0!==(y=e(n[h], m, d.length+(c===f-1?0:1)))&&u.push(d+y)
;
if(u.length>0)return[_, r+u.join(", \n"+m), l].join("\n"+s)
}
return v
}
(e, "", 0)
}

