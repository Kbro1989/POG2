// Module ID: 4039
// Category: unidentified
// Size: 620 bytes
// Parameters: e,t,n

"use strict";
var r="undefined"!=typeof Symbol&&Symbol, i=n(1333);
e.exports=function() {
return"function"==typeof r&&"function"==typeof Symbol&&"symbol"==typeof r("foo")&&"symbol"==typeof Symbol("bar")&&i()
}
}
, 4058:e=> {
  "use strict";
e.exports= {
  stringReplaceAll:(e, t, n)=> {
  let r=e.indexOf(t);
if(-1===r)return e;
const i=t.length;
let a=0, s=""
;
do {
  s+=e.substr(a, r-a)+t+n, a=r+i, r=e.indexOf(t, a)
}
while(-1!==r);
return s+=e.substr(a), s
}
, stringEncaseCRLFWithFirstIndex:(e, t, n, r)=> {
  let i=0, a="";
do {
  const s="\r"===e[r-1];
a+=e.substr(i, (s?r-1:r)-i)+t+(s?"\r\n":"\n")+n, i=r+1, r=e.indexOf("\n", i)
}
while(-1!==r);
return a+=e.substr(i), a
}
}

