// Module ID: 4373
// Category: property-descriptor
// Size: 1681 bytes
// Parameters: e,t,n

const r=n(6288),  {
  isObject:i, isArray:a, isString:s, isNumber:o
}
=n(5622), l="before", c="after-prop", u="after-colon", h="after-value", d="after", p="before-all", f="after-all", m=[l, c, u, h, d], g=[l, p, f].map(Symbol.for), _=void 0, v=(e, t)=>Symbol.for(e+":"+t), y=(e, t, n)=>Object.defineProperty(e, t,  {
value:n, writable:!0, configurable:!0
}
), b=(e, t, n, i, a, s)=> {
  const o=v(a, i);
if(!r(t, o))return;
const l=n===i?o:v(a, n);
y(e, l, t[o]), s&&delete t[o]
}
, x=(e, t, n, r, i)=> {
  m.forEach((a=> {
  b(e, t, n, r, a, i)
}
))
}
, E=(e, t)=> {
  g.forEach((n=> {
  const r=t[n];
r&&y(e, n, r)
}
))
}
;
e.exports= {
  SYMBOL_PREFIXES:m, PREFIX_BEFORE:l, PREFIX_AFTER_PROP:c, PREFIX_AFTER_COLON:u, PREFIX_AFTER_VALUE:h, PREFIX_AFTER:d, PREFIX_BEFORE_ALL:p, PREFIX_AFTER_ALL:f, BRACKET_OPEN:"[", BRACKET_CLOSE:"]", CURLY_BRACKET_OPEN:" {
  ", CURLY_BRACKET_CLOSE:"
}
", 
COLON:":", COMMA:", ", MINUS:"-", EMPTY:"", UNDEFINED:_, symbol:v, define:y, copy_comments:x, swap_comments:(e, t, n)=> {
  t!==n&&m.forEach((i=> {
  const a=v(i, n);
if(!r(e, a))return void b(e, e, n, t, i, !0);
const s=e[a];
delete e[a], b(e, e, n, t, i, !0), y(e, v(i, t), s)
}
))
}
, 
assign_non_prop_comments:E, assign(e, t, n) {
  if(!i(e))throw new TypeError("Cannot convert undefined or null to object");
if(!i(t))return e;
if(n===_)n=Object.keys(t), E(e, t);
else {
  if(!a(n))throw new TypeError("keys must be array or undefined")
;
0===n.length&&E(e, t)
}
return((e, t, n)=>(n.forEach((n=> {
  (s(n)||o(n))&&r(t, n)&&(e[n]=t[n], x(e, t, n, n))
}
)), e))(e, t, n)
}
}
}
, 4442:e=> {
  "use strict";
e.exports=function() {
  this.input=null, this.next_in=0, this.avail_in=0, this.total_in=0, this.output=null, 
this.next_out=0, this.avail_out=0, this.total_out=0, this.msg="", this.state=null, this.data_type=2, this.adler=0
}
}
, 4459:e=> {
  "use strict";
e.exports=Number.isNaN||function(e) {
  return e!=e
}

