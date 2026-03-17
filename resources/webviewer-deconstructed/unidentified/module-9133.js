// Module ID: 9133
// Category: unidentified
// Size: 448 bytes
// Parameters: e,t,n

"use strict";
var r=n(8403);
e.exports=function() {
  return Object.assign?function() {
  if(!Object.assign)return!1
;
for(var e="abcdefghijklmnopqrst", t=e.split(""), n= {
}
, r=0;
r<t.length;
++r)n[t[r]]=t[r];
var i=Object.assign( {
}
, n), a="";
for(var s in i)a+=s;
return e!==a
}
()||function() {
  if(!Object.assign||!Object.preventExtensions)return!1;
var e=Object.preventExtensions( {
1:2
}
);
try {
  Object.assign(e, "xy")
}
catch(t) {
  return"y"===e[1]
}
return!1
}
()?r:Object.assign:r
}

