// Module ID: 734
// Category: property-descriptor
// Size: 673 bytes
// Parameters: e,t,n

const r=n(5659), i=n(8507), a= {
}
;
Object.keys(r).forEach((e=> {
  a[e]= {
}
, Object.defineProperty(a[e], "channels",  {
  value:r[e].channels
}
), Object.defineProperty(a[e], "labels",  {
  value:r[e].labels
}
);
const t=i(e);
Object.keys(t).forEach((n=> {
  const r=t[n]
;
a[e][n]=function(e) {
  const t=function(...t) {
  const n=t[0];
if(null==n)return n;
n.length>1&&(t=n);
const r=e(t);
if("object"==typeof r)for(let e=r.length, t=0;
t<e;
t++)r[t]=Math.round(r[t]);
return r
}
;
return"conversion"in e&&(t.conversion=e.conversion), t
}
(r), a[e][n].raw=function(e) {
  const t=function(...t) {
  const n=t[0];
return null==n?n:(n.length>1&&(t=n), e(t))
}
;
return"conversion"in e&&(t.conversion=e.conversion), t
}
(r)
}
))
}
)), e.exports=a
