// Module ID: 8507
// Category: unidentified
// Size: 740 bytes
// Parameters: e,t,n

const r=n(5659);
function i(e, t) {
  return function(n) {
  return t(e(n))
}
}
function a(e, t) {
  const n=[t[e].parent, e];
let a=r[t[e].parent][e], s=t[e].parent
;
for(;
t[s].parent;
)n.unshift(t[s].parent), a=i(r[t[s].parent][s], a), s=t[s].parent;
return a.conversion=n, a
}
e.exports=function(e) {
  const t=function(e) {
  const t=function() {
  const e= {
}
, t=Object.keys(r);
for(let n=t.length, r=0;
r<n;
r++)e[t[r]]= {
  distance:-1, 
parent:null
}
;
return e
}
(), n=[e];
for(t[e].distance=0;
n.length;
) {
  const e=n.pop(), i=Object.keys(r[e]);
for(let r=i.length, a=0;
a<r;
a++) {
  const r=i[a], s=t[r];
-1===s.distance&&(s.distance=t[e].distance+1, s.parent=e, n.unshift(r))
}
}
return t
}
(e), n= {
}
, i=Object.keys(t);
for(let e=i.length, r=0;
r<e;
r++) {
  const e=i[r];
null!==t[e].parent&&(n[e]=a(e, t))
}
return n
}

