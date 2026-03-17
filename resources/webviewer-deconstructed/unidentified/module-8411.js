// Module ID: 8411
// Category: unidentified
// Size: 14106 bytes
// Parameters: e,t,n

"use strict";
var r, i=n(9805), a=n(3665), s=n(3269), o=n(4823), l=n(4674), c=-2, u=258, h=262, d=103, p=113, f=666;
function m(e, t) {
  return e.msg=l[t], t
}
function g(e) {
  return(e<<1)-(e>4?9:0)
}
function _(e) {
for(var t=e.length;
--t>=0;
)e[t]=0
}
function v(e) {
  var t=e.state, n=t.pending;
n>e.avail_out&&(n=e.avail_out), 0!==n&&(i.arraySet(e.output, t.pending_buf, t.pending_out, n, e.next_out), e.next_out+=n, t.pending_out+=n, e.total_out+=n, e.avail_out-=n, t.pending-=n, 
0===t.pending&&(t.pending_out=0))
}
function y(e, t) {
  a._tr_flush_block(e, e.block_start>=0?e.block_start:-1, e.strstart-e.block_start, t), e.block_start=e.strstart, v(e.strm)
}
function b(e, t) {
  e.pending_buf[e.pending++]=t
}
function x(e, t) {
e.pending_buf[e.pending++]=t>>>8&255, e.pending_buf[e.pending++]=255&t
}
function E(e, t, n, r) {
  var a=e.avail_in;
return a>r&&(a=r), 0===a?0:(e.avail_in-=a, i.arraySet(t, e.input, e.next_in, a, n), 
1===e.state.wrap?e.adler=s(e.adler, t, a, n):2===e.state.wrap&&(e.adler=o(e.adler, t, a, n)), e.next_in+=a, e.total_in+=a, a)
}
function w(e, t) {
var n, r, i=e.max_chain_length, a=e.strstart, s=e.prev_length, o=e.nice_match, l=e.strstart>e.w_size-h?e.strstart-(e.w_size-h):0, c=e.window, d=e.w_mask, p=e.prev, f=e.strstart+u, m=c[a+s-1], g=c[a+s];
e.prev_length>=e.good_match&&(i>>=2), 
o>e.lookahead&&(o=e.lookahead);
do {
  if(c[(n=t)+s]===g&&c[n+s-1]===m&&c[n]===c[a]&&c[++n]===c[a+1]) {
  a+=2, n++
;
do {
}
while(c[++a]===c[++n]&&c[++a]===c[++n]&&c[++a]===c[++n]&&c[++a]===c[++n]&&c[++a]===c[++n]&&c[++a]===c[++n]&&c[++a]===c[++n]&&c[++a]===c[++n]&&a<f);
if(r=u-(f-a), a=f-u, r>s) {
  if(e.match_start=t, s=r, r>=o)break;
m=c[a+s-1], g=c[a+s]
}
}
}
while((t=p[t&d])>l&&0!=--i);
return s<=e.lookahead?s:e.lookahead
}
function S(e) {
  var t, n, r, a, s, o=e.w_size;
do {
  if(a=e.window_size-e.lookahead-e.strstart, e.strstart>=o+(o-h)) {
  i.arraySet(e.window, e.window, o, o, 0), e.match_start-=o, e.strstart-=o, 
e.block_start-=o, t=n=e.hash_size;
do {
  r=e.head[--t], e.head[t]=r>=o?r-o:0
}
while(--n);
t=n=o;
do {
  r=e.prev[--t], e.prev[t]=r>=o?r-o:0
}
while(--n);
a+=o
}
if(0===e.strm.avail_in)break;
if(n=E(e.strm, e.window, e.strstart+e.lookahead, a), e.lookahead+=n, 
e.lookahead+e.insert>=3)for(s=e.strstart-e.insert, e.ins_h=e.window[s], e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;
e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+3-1])&e.hash_mask, e.prev[s&e.w_mask]=e.head[e.ins_h], 
e.head[e.ins_h]=s, s++, e.insert--, !(e.lookahead+e.insert<3));
);
}
while(e.lookahead<h&&0!==e.strm.avail_in)
}
function T(e, t) {
  for(var n, r;
;
) {
  if(e.lookahead<h) {
  if(S(e), e.lookahead<h&&0===t)return 1;
if(0===e.lookahead)break
}
if(n=0, 
e.lookahead>=3&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask, n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h], e.head[e.ins_h]=e.strstart), 0!==n&&e.strstart-n<=e.w_size-h&&(e.match_length=w(e, n)), 
e.match_length>=3)if(r=a._tr_tally(e, e.strstart-e.match_start, e.match_length-3), e.lookahead-=e.match_length, e.match_length<=e.max_lazy_match&&e.lookahead>=3) {
  e.match_length--;
do {
  e.strstart++, 
e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask, n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h], e.head[e.ins_h]=e.strstart
}
while(0!=--e.match_length);
e.strstart++
}
else e.strstart+=e.match_length, e.match_length=0, 
e.ins_h=e.window[e.strstart], e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;
else r=a._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++;
if(r&&(y(e, !1), 0===e.strm.avail_out))return 1
}
return e.insert=e.strstart<2?e.strstart:2, 4===t?(y(e, !0), 0===e.strm.avail_out?3:4):e.last_lit&&(y(e, !1), 0===e.strm.avail_out)?1:2
}
function A(e, t) {
  for(var n, r, i;
;
) {
  if(e.lookahead<h) {
  if(S(e), e.lookahead<h&&0===t)return 1;
if(0===e.lookahead)break
}
if(n=0, e.lookahead>=3&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask, n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h], e.head[e.ins_h]=e.strstart), e.prev_length=e.match_length, e.prev_match=e.match_start, e.match_length=2, 
0!==n&&e.prev_length<e.max_lazy_match&&e.strstart-n<=e.w_size-h&&(e.match_length=w(e, n), e.match_length<=5&&(1===e.strategy||3===e.match_length&&e.strstart-e.match_start>4096)&&(e.match_length=2)), e.prev_length>=3&&e.match_length<=e.prev_length) {
i=e.strstart+e.lookahead-3, r=a._tr_tally(e, e.strstart-1-e.prev_match, e.prev_length-3), e.lookahead-=e.prev_length-1, e.prev_length-=2;
do {
  ++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask, 
n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h], e.head[e.ins_h]=e.strstart)
}
while(0!=--e.prev_length);
if(e.match_available=0, e.match_length=2, e.strstart++, r&&(y(e, !1), 0===e.strm.avail_out))return 1
}
else if(e.match_available) {
if((r=a._tr_tally(e, 0, e.window[e.strstart-1]))&&y(e, !1), e.strstart++, e.lookahead--, 0===e.strm.avail_out)return 1
}
else e.match_available=1, e.strstart++, e.lookahead--
}
return e.match_available&&(r=a._tr_tally(e, 0, e.window[e.strstart-1]), 
e.match_available=0), e.insert=e.strstart<2?e.strstart:2, 4===t?(y(e, !0), 0===e.strm.avail_out?3:4):e.last_lit&&(y(e, !1), 0===e.strm.avail_out)?1:2
}
function C(e, t, n, r, i) {
  this.good_length=e, this.max_lazy=t, this.nice_length=n, this.max_chain=r, this.func=i
}
function M() {
  this.strm=null, this.status=0, this.pending_buf=null, this.pending_buf_size=0, this.pending_out=0, this.pending=0, this.wrap=0, this.gzhead=null, this.gzindex=0, this.method=8, this.last_flush=-1, this.w_size=0, this.w_bits=0, this.w_mask=0, 
this.window=null, this.window_size=0, this.prev=null, this.head=null, this.ins_h=0, this.hash_size=0, this.hash_bits=0, this.hash_mask=0, this.hash_shift=0, this.block_start=0, this.match_length=0, this.prev_match=0, this.match_available=0, this.strstart=0, 
this.match_start=0, this.lookahead=0, this.prev_length=0, this.max_chain_length=0, this.max_lazy_match=0, this.level=0, this.strategy=0, this.good_match=0, this.nice_match=0, this.dyn_ltree=new i.Buf16(1146), this.dyn_dtree=new i.Buf16(122), 
this.bl_tree=new i.Buf16(78), _(this.dyn_ltree), _(this.dyn_dtree), _(this.bl_tree), this.l_desc=null, this.d_desc=null, this.bl_desc=null, this.bl_count=new i.Buf16(16), this.heap=new i.Buf16(573), _(this.heap), this.heap_len=0, this.heap_max=0, 
this.depth=new i.Buf16(573), _(this.depth), this.l_buf=0, this.lit_bufsize=0, this.last_lit=0, this.d_buf=0, this.opt_len=0, this.static_len=0, this.matches=0, this.insert=0, this.bi_buf=0, this.bi_valid=0
}
function I(e) {
  var t
;
return e&&e.state?(e.total_in=e.total_out=0, e.data_type=2, (t=e.state).pending=0, t.pending_out=0, t.wrap<0&&(t.wrap=-t.wrap), t.status=t.wrap?42:p, e.adler=2===t.wrap?0:1, t.last_flush=0, a._tr_init(t), 0):m(e, c)
}
function R(e) {
  var t, n=I(e)
;
return 0===n&&((t=e.state).window_size=2*t.w_size, _(t.head), t.max_lazy_match=r[t.level].max_lazy, t.good_match=r[t.level].good_length, t.nice_match=r[t.level].nice_length, t.max_chain_length=r[t.level].max_chain, t.strstart=0, t.block_start=0, 
t.lookahead=0, t.insert=0, t.match_length=t.prev_length=2, t.match_available=0, t.ins_h=0), n
}
function k(e, t, n, r, a, s) {
  if(!e)return c;
var o=1;
if(-1===t&&(t=6), r<0?(o=0, r=-r):r>15&&(o=2, r-=16), a<1||a>9||8!==n||r<8||r>15||t<0||t>9||s<0||s>4)return m(e, c)
;
8===r&&(r=9);
var l=new M;
return e.state=l, l.strm=e, l.wrap=o, l.gzhead=null, l.w_bits=r, l.w_size=1<<l.w_bits, l.w_mask=l.w_size-1, l.hash_bits=a+7, l.hash_size=1<<l.hash_bits, l.hash_mask=l.hash_size-1, l.hash_shift=~~((l.hash_bits+3-1)/3), 
l.window=new i.Buf8(2*l.w_size), l.head=new i.Buf16(l.hash_size), l.prev=new i.Buf16(l.w_size), l.lit_bufsize=1<<a+6, l.pending_buf_size=4*l.lit_bufsize, l.pending_buf=new i.Buf8(l.pending_buf_size), l.d_buf=1*l.lit_bufsize, l.l_buf=3*l.lit_bufsize, 
l.level=t, l.strategy=s, l.method=n, R(e)
}
r=[new C(0, 0, 0, 0, (function(e, t) {
  var n=65535;
for(n>e.pending_buf_size-5&&(n=e.pending_buf_size-5);
;
) {
  if(e.lookahead<=1) {
  if(S(e), 0===e.lookahead&&0===t)return 1;
if(0===e.lookahead)break
}
e.strstart+=e.lookahead, 
e.lookahead=0;
var r=e.block_start+n;
if((0===e.strstart||e.strstart>=r)&&(e.lookahead=e.strstart-r, e.strstart=r, y(e, !1), 0===e.strm.avail_out))return 1;
if(e.strstart-e.block_start>=e.w_size-h&&(y(e, !1), 0===e.strm.avail_out))return 1
}
return e.insert=0, 
4===t?(y(e, !0), 0===e.strm.avail_out?3:4):(e.strstart>e.block_start&&(y(e, !1), e.strm.avail_out), 1)
}
)), new C(4, 4, 8, 4, T), new C(4, 5, 16, 8, T), new C(4, 6, 32, 32, T), new C(4, 4, 16, 16, A), new C(8, 16, 32, 32, A), new C(8, 16, 128, 128, A), new C(8, 32, 128, 256, A), new C(32, 128, 258, 1024, A), new C(32, 258, 258, 4096, A)], t.deflateInit=function(e, t) {
  return k(e, t, 8, 15, 8, 0)
}
, 
t.deflateInit2=k, t.deflateReset=R, t.deflateResetKeep=I, t.deflateSetHeader=function(e, t) {
  return e&&e.state?2!==e.state.wrap?c:(e.state.gzhead=t, 0):c
}
, t.deflate=function(e, t) {
  var n, i, s, l;
if(!e||!e.state||t>5||t<0)return e?m(e, c):c;
if(i=e.state, 
!e.output||!e.input&&0!==e.avail_in||i.status===f&&4!==t)return m(e, 0===e.avail_out?-5:c);
if(i.strm=e, n=i.last_flush, i.last_flush=t, 42===i.status)if(2===i.wrap)e.adler=0, b(i, 31), b(i, 139), b(i, 8), 
i.gzhead?(b(i, (i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)), b(i, 255&i.gzhead.time), b(i, i.gzhead.time>>8&255), b(i, i.gzhead.time>>16&255), b(i, i.gzhead.time>>24&255), 
b(i, 9===i.level?2:i.strategy>=2||i.level<2?4:0), b(i, 255&i.gzhead.os), i.gzhead.extra&&i.gzhead.extra.length&&(b(i, 255&i.gzhead.extra.length), b(i, i.gzhead.extra.length>>8&255)), i.gzhead.hcrc&&(e.adler=o(e.adler, i.pending_buf, i.pending, 0)), i.gzindex=0, 
i.status=69):(b(i, 0), b(i, 0), b(i, 0), b(i, 0), b(i, 0), b(i, 9===i.level?2:i.strategy>=2||i.level<2?4:0), b(i, 3), i.status=p);
else {
  var h=8+(i.w_bits-8<<4)<<8;
h|=(i.strategy>=2||i.level<2?0:i.level<6?1:6===i.level?2:3)<<6, 0!==i.strstart&&(h|=32), h+=31-h%31, 
i.status=p, x(i, h), 0!==i.strstart&&(x(i, e.adler>>>16), x(i, 65535&e.adler)), e.adler=1
}
if(69===i.status)if(i.gzhead.extra) {
for(s=i.pending;
i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>s&&(e.adler=o(e.adler, i.pending_buf, i.pending-s, s)), v(e), s=i.pending, 
i.pending!==i.pending_buf_size));
)b(i, 255&i.gzhead.extra[i.gzindex]), i.gzindex++;
i.gzhead.hcrc&&i.pending>s&&(e.adler=o(e.adler, i.pending_buf, i.pending-s, s)), i.gzindex===i.gzhead.extra.length&&(i.gzindex=0, i.status=73)
}
else i.status=73
;
if(73===i.status)if(i.gzhead.name) {
  s=i.pending;
do {
  if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>s&&(e.adler=o(e.adler, i.pending_buf, i.pending-s, s)), v(e), s=i.pending, i.pending===i.pending_buf_size)) {
  l=1;
break
}
l=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0, b(i, l)
}
while(0!==l);
i.gzhead.hcrc&&i.pending>s&&(e.adler=o(e.adler, i.pending_buf, i.pending-s, s)), 0===l&&(i.gzindex=0, i.status=91)
}
else i.status=91
;
if(91===i.status)if(i.gzhead.comment) {
  s=i.pending;
do {
  if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>s&&(e.adler=o(e.adler, i.pending_buf, i.pending-s, s)), v(e), s=i.pending, i.pending===i.pending_buf_size)) {
  l=1;
break
}
l=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0, b(i, l)
}
while(0!==l);
i.gzhead.hcrc&&i.pending>s&&(e.adler=o(e.adler, i.pending_buf, i.pending-s, s)), 0===l&&(i.status=d)
}
else i.status=d
;
if(i.status===d&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&v(e), i.pending+2<=i.pending_buf_size&&(b(i, 255&e.adler), b(i, e.adler>>8&255), e.adler=0, i.status=p)):i.status=p), 0!==i.pending) {
  if(v(e), 0===e.avail_out)return i.last_flush=-1, 0
}
else if(0===e.avail_in&&g(t)<=g(n)&&4!==t)return m(e, -5);
if(i.status===f&&0!==e.avail_in)return m(e, -5);
if(0!==e.avail_in||0!==i.lookahead||0!==t&&i.status!==f) {
  var E=2===i.strategy?function(e, t) {
  for(var n;
;
) {
  if(0===e.lookahead&&(S(e), 
0===e.lookahead)) {
  if(0===t)return 1;
break
}
if(e.match_length=0, n=a._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++, n&&(y(e, !1), 0===e.strm.avail_out))return 1
}
return e.insert=0, 4===t?(y(e, !0), 
0===e.strm.avail_out?3:4):e.last_lit&&(y(e, !1), 0===e.strm.avail_out)?1:2
}
(i, t):3===i.strategy?function(e, t) {
  for(var n, r, i, s, o=e.window;
;
) {
  if(e.lookahead<=u) {
  if(S(e), e.lookahead<=u&&0===t)return 1;
if(0===e.lookahead)break
}
if(e.match_length=0, 
e.lookahead>=3&&e.strstart>0&&(r=o[i=e.strstart-1])===o[++i]&&r===o[++i]&&r===o[++i]) {
  s=e.strstart+u;
do {
}
while(r===o[++i]&&r===o[++i]&&r===o[++i]&&r===o[++i]&&r===o[++i]&&r===o[++i]&&r===o[++i]&&r===o[++i]&&i<s);
e.match_length=u-(s-i), 
e.match_length>e.lookahead&&(e.match_length=e.lookahead)
}
if(e.match_length>=3?(n=a._tr_tally(e, 1, e.match_length-3), e.lookahead-=e.match_length, e.strstart+=e.match_length, e.match_length=0):(n=a._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, 
e.strstart++), n&&(y(e, !1), 0===e.strm.avail_out))return 1
}
return e.insert=0, 4===t?(y(e, !0), 0===e.strm.avail_out?3:4):e.last_lit&&(y(e, !1), 0===e.strm.avail_out)?1:2
}
(i, t):r[i.level].func(i, t);
if(3!==E&&4!==E||(i.status=f), 
1===E||3===E)return 0===e.avail_out&&(i.last_flush=-1), 0;
if(2===E&&(1===t?a._tr_align(i):5!==t&&(a._tr_stored_block(i, 0, 0, !1), 3===t&&(_(i.head), 0===i.lookahead&&(i.strstart=0, i.block_start=0, i.insert=0))), v(e), 0===e.avail_out))return i.last_flush=-1, 
0
}
return 4!==t?0:i.wrap<=0?1:(2===i.wrap?(b(i, 255&e.adler), b(i, e.adler>>8&255), b(i, e.adler>>16&255), b(i, e.adler>>24&255), b(i, 255&e.total_in), b(i, e.total_in>>8&255), b(i, e.total_in>>16&255), b(i, e.total_in>>24&255)):(x(i, e.adler>>>16), 
x(i, 65535&e.adler)), v(e), i.wrap>0&&(i.wrap=-i.wrap), 0!==i.pending?0:1)
}
, t.deflateEnd=function(e) {
  var t;
return e&&e.state?42!==(t=e.state.status)&&69!==t&&73!==t&&91!==t&&t!==d&&t!==p&&t!==f?m(e, c):(e.state=null, t===p?m(e, -3):0):c
}
, 
t.deflateSetDictionary=function(e, t) {
  var n, r, a, o, l, u, h, d, p=t.length;
if(!e||!e.state)return c;
if(2===(o=(n=e.state).wrap)||1===o&&42!==n.status||n.lookahead)return c;
for(1===o&&(e.adler=s(e.adler, t, p, 0)), n.wrap=0, p>=n.w_size&&(0===o&&(_(n.head), 
n.strstart=0, n.block_start=0, n.insert=0), d=new i.Buf8(n.w_size), i.arraySet(d, t, p-n.w_size, n.w_size, 0), t=d, p=n.w_size), l=e.avail_in, u=e.next_in, h=e.input, e.avail_in=p, e.next_in=0, e.input=t, S(n);
n.lookahead>=3;
) {
  r=n.strstart, a=n.lookahead-2;
do {
n.ins_h=(n.ins_h<<n.hash_shift^n.window[r+3-1])&n.hash_mask, n.prev[r&n.w_mask]=n.head[n.ins_h], n.head[n.ins_h]=r, r++
}
while(--a);
n.strstart=r, n.lookahead=2, S(n)
}
return n.strstart+=n.lookahead, n.block_start=n.strstart, n.insert=n.lookahead, 
n.lookahead=0, n.match_length=n.prev_length=2, n.match_available=0, e.next_in=u, e.input=h, e.avail_in=l, n.wrap=o, 0
}
, t.deflateInfo="pako deflate (from Nodeca project)"
