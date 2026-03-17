// Module ID: 2682
// Category: unidentified
// Size: 576 bytes
// Parameters: e,t,n

"use strict";
var r=n(9600), i=Object.prototype.toString, a=Object.prototype.hasOwnProperty;
e.exports=function(e, t, n) {
  if(!r(t))throw new TypeError("iterator must be a function")
;
var s, o;
arguments.length>=3&&(s=n), o=e, "[object Array]"===i.call(o)?function(e, t, n) {
  for(var r=0, i=e.length;
r<i;
r++)a.call(e, r)&&(null==n?t(e[r], r, e):t.call(n, e[r], r, e))
}
(e, t, s):"string"==typeof e?function(e, t, n) {
for(var r=0, i=e.length;
r<i;
r++)null==n?t(e.charAt(r), r, e):t.call(n, e.charAt(r), r, e)
}
(e, t, s):function(e, t, n) {
  for(var r in e)a.call(e, r)&&(null==n?t(e[r], r, e):t.call(n, e[r], r, e))
}
(e, t, s)
}

