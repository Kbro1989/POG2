// Module ID: 6238
// Category: unidentified
// Size: 1411 bytes
// Parameters: e,t,n

"use strict";
var r=n(6048).F.ERR_STREAM_PREMATURE_CLOSE;
function i() {
}
e.exports=function e(t, n, a) {
if("function"==typeof n)return e(t, null, n);
n||(n= {
}
), a=function(e) {
  var t=!1;
return function() {
  if(!t) {
  t=!0;
for(var n=arguments.length, r=new Array(n), i=0;
i<n;
i++)r[i]=arguments[i];
e.apply(this, r)
}
}
}
(a||i)
;
var s=n.readable||!1!==n.readable&&t.readable, o=n.writable||!1!==n.writable&&t.writable, l=function() {
  t.writable||u()
}
, c=t._writableState&&t._writableState.finished, u=function() {
  o=!1, c=!0, s||a.call(t)
}
, h=t._readableState&&t._readableState.endEmitted, d=function() {
  s=!1, h=!0, o||a.call(t)
}
, p=function(e) {
  a.call(t, e)
}
, f=function() {
  var e;
return s&&!h?(t._readableState&&t._readableState.ended||(e=new r), 
a.call(t, e)):o&&!c?(t._writableState&&t._writableState.ended||(e=new r), a.call(t, e)):void 0
}
, m=function() {
  t.req.on("finish", u)
}
;
return function(e) {
  return e.setHeader&&"function"==typeof e.abort
}
(t)?(t.on("complete", u), t.on("abort", f), 
t.req?m():t.on("request", m)):o&&!t._writableState&&(t.on("end", l), t.on("close", l)), t.on("end", d), t.on("finish", u), !1!==n.error&&t.on("error", p), t.on("close", f), function() {
  t.removeListener("complete", u), t.removeListener("abort", f), 
t.removeListener("request", m), t.req&&t.req.removeListener("finish", u), t.removeListener("end", l), t.removeListener("close", l), t.removeListener("finish", u), t.removeListener("end", d), t.removeListener("error", p), t.removeListener("close", f)
}
}

