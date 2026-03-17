// Module ID: 25
// Category: syntax-error
// Size: 2204 bytes
// Parameters: e,t,n

const r=n(1206),  {
  CommentArray:i
}
=n(3527),  {
  PREFIX_BEFORE:a, PREFIX_AFTER_PROP:s, PREFIX_AFTER_COLON:o, PREFIX_AFTER_VALUE:l, PREFIX_AFTER:c, PREFIX_BEFORE_ALL:u, PREFIX_AFTER_ALL:h, BRACKET_OPEN:d, BRACKET_CLOSE:p, CURLY_BRACKET_OPEN:f, CURLY_BRACKET_CLOSE:m, COLON:g, COMMA:_, MINUS:v, EMPTY:y, UNDEFINED:b, define:x, assign_non_prop_comments:E
}
=n(4373), w=e=>r.tokenize(e,  {
comment:!0, loc:!0
}
), S=[];
let T=null, A=null;
const C=[];
let M, I, R=!1, k=!1, N=null, D=null, L=null, O=null;
const P=()=> {
  C.length=S.length=0, D=null, M=b
}
, F=e=>Symbol.for(M!==b?e+g+M:e), U=(e, t)=>O?O(e, t):t, B=()=> {
const e=new SyntaxError(`Unexpected token $ {
  L.value.slice(0, 1)
}
`);
throw Object.assign(e, L.loc.start), e
}
, z=()=> {
  const e=new SyntaxError("Unexpected end of JSON input");
throw Object.assign(e, D?D.loc.end: {
  line:1, column:0
}
), e
}
, G=()=> {
  const e=N[++I]
;
k=L&&e&&L.loc.end.line===e.loc.start.line||!1, D=L, L=e
}
, V=()=>(L||z(), "Punctuator"===L.type?L.value:L.type), H=e=>V()===e, j=e=> {
  H(e)||B()
}
, W=e=> {
  S.push(T), T=e
}
, $=()=> {
  T=S.pop()
}
, q=()=> {
  if(!A)return;
const e=[];
for(const t of A) {
  if(!t.inline)break
;
e.push(t)
}
const {
  length:t
}
=e;
t&&(t===A.length?A=null:A.splice(0, t), x(T, F(c), e))
}
, X=e=> {
  A&&(x(T, F(e), A), A=null)
}
, Y=e=> {
  const t=[];
for(;
L&&(H("LineComment")||H("BlockComment"));
) {
  const e= {
  ...L, inline:k
}
;
t.push(e), G()
}
R||t.length&&(e?x(T, F(e), t):A=t)
}
, K=(e, t)=> {
  t&&C.push(M), M=e
}
, J=()=> {
  M=C.pop()
}
;
function Z() {
  let e=V();
if(e===f)return G(), (()=> {
  const e= {
}
;
W(e), K(b, !0);
let t, n=!1;
for(Y();
!(H(m)||n&&(X(l), j(_), G(), Y(), q(), H(m)));
)n=!0, j("String"), t=JSON.parse(L.value), K(t), X(a), G(), Y(s), j(g), G(), 
Y(o), e[t]=U(t, Z()), Y();
return n&&X(c), G(), M=void 0, n||X(a), $(), J(), e
}
)();
if(e===d)return G(), (()=> {
  const e=new i;
W(e), K(b, !0);
let t=!1, n=0;
for(Y();
!(H(p)||t&&(X(l), j(_), G(), Y(), q(), H(p)));
)t=!0, K(n), X(a), e[n]=U(n, Z()), n++, Y();
return t&&X(c), G(), 
M=void 0, t||X(a), $(), J(), e
}
)();
let t, n=y;
switch(e===v&&(G(), e=V(), n=v), e) {
  case"String":case"Boolean":case"Null":case"Numeric":return t=L.value, G(), JSON.parse(n+t)
}
}
e.exports= {
  parse:(e, t, n)=> {
  P(), N=w(e), O=t, R=n, N.length||z(), I=-1, G(), W( {
}
), Y(u)
;
let r=Z();
var i;
return Y(h), L&&B(), n||null===r||(i=r, Object(i)!==i&&(r=new Object(r)), E(r, T)), $(), r=U("", r), P(), N.length=0, A=T=N=D=L=O=null, r
}
, tokenize:w
}

