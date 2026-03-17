// Module ID: 7463
// Category: unidentified
// Size: 3834 bytes
// Parameters: e,t

"use strict";
function n(e, t) {
  var n=e.length;
e.push(t);
e:for(;
0<n;
) {
  var r=n-1>>>1, i=e[r];
if(!(0<a(i, t)))break e;
e[r]=t, e[n]=i, n=r
}
}
function r(e) {
  return 0===e.length?null:e[0]
}
function i(e) {
  if(0===e.length)return null
;
var t=e[0], n=e.pop();
if(n!==t) {
  e[0]=n;
e:for(var r=0, i=e.length, s=i>>>1;
r<s;
) {
  var o=2*(r+1)-1, l=e[o], c=o+1, u=e[c];
if(0>a(l, n))c<i&&0>a(u, l)?(e[r]=u, e[c]=n, r=c):(e[r]=l, e[o]=n, r=o);
else {
  if(!(c<i&&0>a(u, n)))break e;
e[r]=u, e[c]=n, r=c
}
}
}
return t
}
function a(e, t) {
  var n=e.sortIndex-t.sortIndex;
return 0!==n?n:e.id-t.id
}
if("object"==typeof performance&&"function"==typeof performance.now) {
  var s=performance;
t.unstable_now=function() {
  return s.now()
}
}
else {
  var o=Date, l=o.now()
;
t.unstable_now=function() {
  return o.now()-l
}
}
var c=[], u=[], h=1, d=null, p=3, f=!1, m=!1, g=!1, _="function"==typeof setTimeout?setTimeout:null, v="function"==typeof clearTimeout?clearTimeout:null, y="undefined"!=typeof setImmediate?setImmediate:null
;
function b(e) {
  for(var t=r(u);
null!==t;
) {
  if(null===t.callback)i(u);
else {
  if(!(t.startTime<=e))break;
i(u), t.sortIndex=t.expirationTime, n(c, t)
}
t=r(u)
}
}
function x(e) {
  if(g=!1, b(e), !m)if(null!==r(c))m=!0, D(E);
else {
  var t=r(u);
null!==t&&L(x, t.startTime-e)
}
}
function E(e, n) {
  m=!1, g&&(g=!1, v(A), A=-1), f=!0;
var a=p;
try {
  for(b(n), d=r(c);
null!==d&&(!(d.expirationTime>n)||e&&!I());
) {
  var s=d.callback;
if("function"==typeof s) {
  d.callback=null, p=d.priorityLevel;
var o=s(d.expirationTime<=n);
n=t.unstable_now(), 
"function"==typeof o?d.callback=o:d===r(c)&&i(c), b(n)
}
else i(c);
d=r(c)
}
if(null!==d)var l=!0;
else {
  var h=r(u);
null!==h&&L(x, h.startTime-n), l=!1
}
return l
}
finally {
  d=null, p=a, f=!1
}
}
"undefined"!=typeof navigator&&void 0!==navigator.scheduling&&void 0!==navigator.scheduling.isInputPending&&navigator.scheduling.isInputPending.bind(navigator.scheduling);
var w, S=!1, T=null, A=-1, C=5, M=-1;
function I() {
  return!(t.unstable_now()-M<C)
}
function R() {
  if(null!==T) {
  var e=t.unstable_now();
M=e;
var n=!0;
try {
  n=T(!0, e)
}
finally {
  n?w():(S=!1, T=null)
}
}
else S=!1
}
if("function"==typeof y)w=function() {
  y(R)
}
;
else if("undefined"!=typeof MessageChannel) {
  var k=new MessageChannel, N=k.port2
;
k.port1.onmessage=R, w=function() {
  N.postMessage(null)
}
}
else w=function() {
  _(R, 0)
}
;
function D(e) {
  T=e, S||(S=!0, w())
}
function L(e, n) {
  A=_((function() {
  e(t.unstable_now())
}
), n)
}
t.unstable_IdlePriority=5, t.unstable_ImmediatePriority=1, 
t.unstable_LowPriority=4, t.unstable_NormalPriority=3, t.unstable_Profiling=null, t.unstable_UserBlockingPriority=2, t.unstable_cancelCallback=function(e) {
  e.callback=null
}
, t.unstable_continueExecution=function() {
  m||f||(m=!0, D(E))
}
, 
t.unstable_forceFrameRate=function(e) {
  0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125,  forcing frame rates higher than 125 fps is not supported"):C=0<e?Math.floor(1e3/e):5
}
, 
t.unstable_getCurrentPriorityLevel=function() {
  return p
}
, t.unstable_getFirstCallbackNode=function() {
  return r(c)
}
, t.unstable_next=function(e) {
  switch(p) {
  case 1:case 2:case 3:var t=3;
break;
default:t=p
}
var n=p;
p=t;
try {
  return e()
}
finally {
  p=n
}
}
, 
t.unstable_pauseExecution=function() {
}
, t.unstable_requestPaint=function() {
}
, t.unstable_runWithPriority=function(e, t) {
  switch(e) {
  case 1:case 2:case 3:case 4:case 5:break;
default:e=3
}
var n=p;
p=e;
try {
  return t()
}
finally {
  p=n
}
}
, 
t.unstable_scheduleCallback=function(e, i, a) {
  var s=t.unstable_now();
switch(a="object"==typeof a&&null!==a&&"number"==typeof(a=a.delay)&&0<a?s+a:s, e) {
  case 1:var o=-1;
break;
case 2:o=250;
break;
case 5:o=1073741823;
break;
case 4:o=1e4;
break;
default:o=5e3
}
return e= {
  id:h++, callback:i, priorityLevel:e, startTime:a, expirationTime:o=a+o, sortIndex:-1
}
, a>s?(e.sortIndex=a, n(u, e), null===r(c)&&e===r(u)&&(g?(v(A), A=-1):g=!0, L(x, a-s))):(e.sortIndex=o, n(c, e), m||f||(m=!0, D(E))), e
}
, t.unstable_shouldYield=I, 
t.unstable_wrapCallback=function(e) {
  var t=p;
return function() {
  var n=p;
p=t;
try {
  return e.apply(this, arguments)
}
finally {
  p=n
}
}
}

