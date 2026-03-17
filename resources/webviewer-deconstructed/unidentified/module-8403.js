// Module ID: 8403
// Category: unidentified
// Size: 542 bytes
// Parameters: e,t,n

"use strict"
;
var r=n(1189), i=n(1333)(), a=n(6556), s=n(9612), o=a("Array.prototype.push"), l=a("Object.prototype.propertyIsEnumerable"), c=i?s.getOwnPropertySymbols:null;
e.exports=function(e, t) {
  if(null==e)throw new TypeError("target must be an object");
var n=s(e)
;
if(1===arguments.length)return n;
for(var a=1;
a<arguments.length;
++a) {
  var u=s(arguments[a]), h=r(u), d=i&&(s.getOwnPropertySymbols||c);
if(d)for(var p=d(u), f=0;
f<p.length;
++f) {
  var m=p[f];
l(u, m)&&o(h, m)
}
for(var g=0;
g<h.length;
++g) {
  var _=h[g];
if(l(u, _)) {
var v=u[_];
n[_]=v
}
}
}
return n
}

