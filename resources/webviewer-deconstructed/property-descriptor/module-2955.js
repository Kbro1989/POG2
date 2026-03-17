// Module ID: 2955
// Category: property-descriptor
// Size: 4169 bytes
// Parameters: e,t,n

"use strict";
var r, i=n(5606);
function a(e, t, n) {
  return(t=function(e) {
  var t=function(e) {
  if("object"!=typeof e||null===e)return e;
var t=e[Symbol.toPrimitive];
if(void 0!==t) {
  var n=t.call(e, "string");
if("object"!=typeof n)return n
;
throw new TypeError("@@toPrimitive must return a primitive value.")
}
return String(e)
}
(e);
return"symbol"==typeof t?t:String(t)
}
(t))in e?Object.defineProperty(e, t,  {
  value:n, enumerable:!0, configurable:!0, writable:!0
}
):e[t]=n, e
}
var s=n(6238), o=Symbol("lastResolve"), l=Symbol("lastReject"), c=Symbol("error"), u=Symbol("ended"), h=Symbol("lastPromise"), d=Symbol("handlePromise"), p=Symbol("stream");
function f(e, t) {
  return {
  value:e, done:t
}
}
function m(e) {
  var t=e[o];
if(null!==t) {
var n=e[p].read();
null!==n&&(e[h]=null, e[o]=null, e[l]=null, t(f(n, !1)))
}
}
function g(e) {
  i.nextTick(m, e)
}
var _=Object.getPrototypeOf((function() {
}
)), v=Object.setPrototypeOf((a(r= {
  get stream() {
  return this[p]
}
, next:function() {
  var e=this, t=this[c]
;
if(null!==t)return Promise.reject(t);
if(this[u])return Promise.resolve(f(void 0, !0));
if(this[p].destroyed)return new Promise((function(t, n) {
  i.nextTick((function() {
  e[c]?n(e[c]):t(f(void 0, !0))
}
))
}
));
var n, r=this[h];
if(r)n=new Promise(function(e, t) {
return function(n, r) {
  e.then((function() {
  t[u]?n(f(void 0, !0)):t[d](n, r)
}
), r)
}
}
(r, this));
else {
  var a=this[p].read();
if(null!==a)return Promise.resolve(f(a, !1));
n=new Promise(this[d])
}
return this[h]=n, n
}
}
, Symbol.asyncIterator, (function() {
  return this
}
)), 
a(r, "return", (function() {
  var e=this;
return new Promise((function(t, n) {
  e[p].destroy(null, (function(e) {
  e?n(e):t(f(void 0, !0))
}
))
}
))
}
)), r), _);
e.exports=function(e) {
  var t, n=Object.create(v, (a(t= {
}
, p,  {
  value:e, writable:!0
}
), a(t, o,  {
  value:null, writable:!0
}
), 
a(t, l,  {
  value:null, writable:!0
}
), a(t, c,  {
  value:null, writable:!0
}
), a(t, u,  {
  value:e._readableState.endEmitted, writable:!0
}
), a(t, d,  {
  value:function(e, t) {
  var r=n[p].read();
r?(n[h]=null, n[o]=null, n[l]=null, e(f(r, !1))):(n[o]=e, n[l]=t)
}
, writable:!0
}
), t))
;
return n[h]=null, s(e, (function(e) {
  if(e&&"ERR_STREAM_PREMATURE_CLOSE"!==e.code) {
  var t=n[l];
return null!==t&&(n[h]=null, n[o]=null, n[l]=null, t(e)), void(n[c]=e)
}
var r=n[o];
null!==r&&(n[h]=null, n[o]=null, n[l]=null, r(f(void 0, !0))), n[u]=!0
}
)), 
e.on("readable", g.bind(null, n)), n
}
}
, 2991:e=> {
  "use strict"
;
const t=/(?:\\(u(?:[a-f\d] {
  4
}
|\ {
  [a-f\d] {
  1, 6
}
\
}
)|x[a-f\d] {
  2
}
|.))|(?:\ {
  (~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\
}
)|((?:.|[\r\n\f])+?)/gi, n=/(?:^|\.)(\w+)(?:\(([^)]*)\))?/g, r=/^(['"])((?:\\.|(?!\1)[^\\])*)\1$/, i=/\\(u(?:[a-f\d] {
  4
}
| {
  [a-f\d] {
  1, 6
}
}
)|x[a-f\d] {
  2
}
|.)|([^\\])/gi, a=new Map([["n", "\n"], ["r", "\r"], ["t", "\t"], ["b", "\b"], ["f", "\f"], ["v", "\v"], ["0", "\0"], ["\\", "\\"], ["e", "\x1b"], ["a", "\x07"]])
;
function s(e) {
  const t="u"===e[0], n=" {
  "===e[1];
return t&&!n&&5===e.length||"x"===e[0]&&3===e.length?String.fromCharCode(parseInt(e.slice(1), 16)):t&&n?String.fromCodePoint(parseInt(e.slice(2, -1), 16)):a.get(e)||e
}
function o(e, t) {
const n=[], a=t.trim().split(/\s*, \s*/g);
let o;
for(const t of a) {
  const a=Number(t);
if(Number.isNaN(a)) {
  if(!(o=t.match(r)))throw new Error(`Invalid Chalk template style argument: $ {
  t
}
 (in style '$ {
  e
}
')`);
n.push(o[2].replace(i, ((e, t, n)=>t?s(t):n)))
}
else n.push(a)
}
return n
}
function l(e) {
  n.lastIndex=0;
const t=[];
let r;
for(;
null!==(r=n.exec(e));
) {
  const e=r[1];
if(r[2]) {
  const n=o(e, r[2]);
t.push([e].concat(n))
}
else t.push([e])
}
return t
}
function c(e, t) {
  const n= {
}
;
for(const e of t)for(const t of e.styles)n[t[0]]=e.inverse?null:t.slice(1);
let r=e;
for(const[e, t]of Object.entries(n))if(Array.isArray(t)) {
  if(!(e in r))throw new Error(`Unknown Chalk style: $ {
  e
}
`);
r=t.length>0?r[e](...t):r[e]
}
return r
}
e.exports=(e, n)=> {
  const r=[], i=[];
let a=[];
if(n.replace(t, ((t, n, o, u, h, d)=> {
  if(n)a.push(s(n));
else if(u) {
  const t=a.join("");
a=[], i.push(0===r.length?t:c(e, r)(t)), r.push( {
  inverse:o, styles:l(u)
}
)
}
else if(h) {
if(0===r.length)throw new Error("Found extraneous 
}
 in Chalk template literal");
i.push(c(e, r)(a.join(""))), a=[], r.pop()
}
else a.push(d)
}
)), i.push(a.join("")), r.length>0) {
const e=`Chalk template literal is missing $ {
  r.length
}
 closing bracket$ {
  1===r.length?"":"s"
}
 (\`
}
\`)`;
throw new Error(e)
}
return i.join("")
}
}
, 3003:e=> {
  "use strict";
e.exports=function(e) {
  return e!=e
}

