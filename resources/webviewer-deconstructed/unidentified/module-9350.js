// Module ID: 9350
// Category: unidentified
// Size: 956 bytes
// Parameters: 


}
, 9353:e=> {
  "use strict";
var t=Object.prototype.toString, n=Math.max, r=function(e, t) {
for(var n=[], r=0;
r<e.length;
r+=1)n[r]=e[r];
for(var i=0;
i<t.length;
i+=1)n[i+e.length]=t[i];
return n
}
;
e.exports=function(e) {
  var i=this
;
if("function"!=typeof i||"[object Function]"!==t.apply(i))throw new TypeError("Function.prototype.bind called on incompatible "+i);
for(var a, s=function(e) {
  for(var t=[], n=1, r=0;
n<e.length;
n+=1, r+=1)t[r]=e[n];
return t
}
(arguments), o=n(0, i.length-s.length), l=[], c=0;
c<o;
c++)l[c]="$"+c;
if(a=Function("binder", "return function ("+function(e) {
  for(var t="", n=0;
n<e.length;
n+=1)t+=e[n], n+1<e.length&&(t+=", ");
return t
}
(l)+") {
   return binder.apply(this, arguments);
}
")((function() {
  if(this instanceof a) {
  var t=i.apply(this, r(s, arguments));
return Object(t)===t?t:this
}
return i.apply(e, r(s, arguments))
}
)), i.prototype) {
  var u=function() {
}
;
u.prototype=i.prototype, 
a.prototype=new u, u.prototype=null
}
return a
}
}
, 9383:e=> {
  "use strict";
e.exports=Error
