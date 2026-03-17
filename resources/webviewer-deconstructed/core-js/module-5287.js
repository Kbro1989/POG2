// Module ID: 5287
// Category: core-js
// Size: 6462 bytes
// Parameters: e,t

"use strict"
;
var n=Symbol.for("react.element"), r=Symbol.for("react.portal"), i=Symbol.for("react.fragment"), a=Symbol.for("react.strict_mode"), s=Symbol.for("react.profiler"), o=Symbol.for("react.provider"), l=Symbol.for("react.context"), c=Symbol.for("react.forward_ref"), u=Symbol.for("react.suspense"), h=Symbol.for("react.memo"), d=Symbol.for("react.lazy"), p=Symbol.iterator, f= {
isMounted:function() {
  return!1
}
, enqueueForceUpdate:function() {
}
, enqueueReplaceState:function() {
}
, enqueueSetState:function() {
}
}
, m=Object.assign, g= {
}
;
function _(e, t, n) {
  this.props=e, this.context=t, this.refs=g, this.updater=n||f
}
function v() {
}
function y(e, t, n) {
  this.props=e, this.context=t, this.refs=g, this.updater=n||f
}
_.prototype.isReactComponent= {
}
, _.prototype.setState=function(e, t) {
if("object"!=typeof e&&"function"!=typeof e&&null!=e)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
this.updater.enqueueSetState(this, e, t, "setState")
}
, 
_.prototype.forceUpdate=function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate")
}
, v.prototype=_.prototype;
var b=y.prototype=new v;
b.constructor=y, m(b, _.prototype), b.isPureReactComponent=!0
;
var x=Array.isArray, E=Object.prototype.hasOwnProperty, w= {
  current:null
}
, S= {
  key:!0, ref:!0, __self:!0, __source:!0
}
;
function T(e, t, r) {
  var i, a= {
}
, s=null, o=null;
if(null!=t)for(i in void 0!==t.ref&&(o=t.ref), void 0!==t.key&&(s=""+t.key), 
t)E.call(t, i)&&!S.hasOwnProperty(i)&&(a[i]=t[i]);
var l=arguments.length-2;
if(1===l)a.children=r;
else if(1<l) {
  for(var c=Array(l), u=0;
u<l;
u++)c[u]=arguments[u+2];
a.children=c
}
if(e&&e.defaultProps)for(i in l=e.defaultProps)void 0===a[i]&&(a[i]=l[i])
;
return {
  $$typeof:n, type:e, key:s, ref:o, props:a, _owner:w.current
}
}
function A(e) {
  return"object"==typeof e&&null!==e&&e.$$typeof===n
}
var C=/\/+/g;
function M(e, t) {
  return"object"==typeof e&&null!==e&&null!=e.key?function(e) {
  var t= {
  "=":"=0", ":":"=2"
}
;
return"$"+e.replace(/[=:]/g, (function(e) {
  return t[e]
}
))
}
(""+e.key):t.toString(36)
}
function I(e, t, i, a, s) {
  var o=typeof e;
"undefined"!==o&&"boolean"!==o||(e=null);
var l=!1;
if(null===e)l=!0;
else switch(o) {
  case"string":case"number":l=!0;
break
;
case"object":switch(e.$$typeof) {
  case n:case r:l=!0
}
}
if(l)return s=s(l=e), e=""===a?"."+M(l, 0):a, x(s)?(i="", null!=e&&(i=e.replace(C, "$&/")+"/"), I(s, t, i, "", (function(e) {
  return e
}
))):null!=s&&(A(s)&&(s=function(e, t) {
  return {
  $$typeof:n, type:e.type, key:t, 
ref:e.ref, props:e.props, _owner:e._owner
}
}
(s, i+(!s.key||l&&l.key===s.key?"":(""+s.key).replace(C, "$&/")+"/")+e)), t.push(s)), 1;
if(l=0, a=""===a?".":a+":", x(e))for(var c=0;
c<e.length;
c++) {
  var u=a+M(o=e[c], c);
l+=I(o, t, i, u, s)
}
else if(u=function(e) {
return null===e||"object"!=typeof e?null:"function"==typeof(e=p&&e[p]||e["@@iterator"])?e:null
}
(e), "function"==typeof u)for(e=u.call(e), c=0;
!(o=e.next()).done;
)l+=I(o=o.value, t, i, u=a+M(o, c++), s);
else if("object"===o)throw t=String(e), 
Error("Objects are not valid as a React child (found: "+("[object Object]"===t?"object with keys  {
  "+Object.keys(e).join(",  ")+"
}
":t)+"). If you meant to render a collection of children,  use an array instead.");
return l
}
function R(e, t, n) {
if(null==e)return e;
var r=[], i=0;
return I(e, r, "", "", (function(e) {
  return t.call(n, e, i++)
}
)), r
}
function k(e) {
  if(-1===e._status) {
  var t=e._result;
(t=t()).then((function(t) {
  0!==e._status&&-1!==e._status||(e._status=1, e._result=t)
}
), (function(t) {
0!==e._status&&-1!==e._status||(e._status=2, e._result=t)
}
)), -1===e._status&&(e._status=0, e._result=t)
}
if(1===e._status)return e._result.default;
throw e._result
}
var N= {
  current:null
}
, D= {
  transition:null
}
, L= {
  ReactCurrentDispatcher:N, 
ReactCurrentBatchConfig:D, ReactCurrentOwner:w
}
;
function O() {
  throw Error("act(...) is not supported in production builds of React.")
}
t.Children= {
  map:R, forEach:function(e, t, n) {
  R(e, (function() {
  t.apply(this, arguments)
}
), n)
}
, count:function(e) {
  var t=0
;
return R(e, (function() {
  t++
}
)), t
}
, toArray:function(e) {
  return R(e, (function(e) {
  return e
}
))||[]
}
, only:function(e) {
  if(!A(e))throw Error("React.Children.only expected to receive a single React element child.");
return e
}
}
, t.Component=_, t.Fragment=i, 
t.Profiler=s, t.PureComponent=y, t.StrictMode=a, t.Suspense=u, t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=L, t.act=O, t.cloneElement=function(e, t, r) {
if(null==e)throw Error("React.cloneElement(...): The argument must be a React element,  but you passed "+e+".");
var i=m( {
}
, e.props), a=e.key, s=e.ref, o=e._owner;
if(null!=t) {
  if(void 0!==t.ref&&(s=t.ref, o=w.current), void 0!==t.key&&(a=""+t.key), 
e.type&&e.type.defaultProps)var l=e.type.defaultProps;
for(c in t)E.call(t, c)&&!S.hasOwnProperty(c)&&(i[c]=void 0===t[c]&&void 0!==l?l[c]:t[c])
}
var c=arguments.length-2;
if(1===c)i.children=r;
else if(1<c) {
  l=Array(c)
;
for(var u=0;
u<c;
u++)l[u]=arguments[u+2];
i.children=l
}
return {
  $$typeof:n, type:e.type, key:a, ref:s, props:i, _owner:o
}
}
, t.createContext=function(e) {
  return(e= {
  $$typeof:l, _currentValue:e, _currentValue2:e, _threadCount:0, Provider:null, Consumer:null, 
_defaultValue:null, _globalName:null
}
).Provider= {
  $$typeof:o, _context:e
}
, e.Consumer=e
}
, t.createElement=T, t.createFactory=function(e) {
  var t=T.bind(null, e);
return t.type=e, t
}
, t.createRef=function() {
  return {
  current:null
}
}
, t.forwardRef=function(e) {
  return {
$$typeof:c, render:e
}
}
, t.isValidElement=A, t.lazy=function(e) {
  return {
  $$typeof:d, _payload: {
  _status:-1, _result:e
}
, _init:k
}
}
, t.memo=function(e, t) {
  return {
  $$typeof:h, type:e, compare:void 0===t?null:t
}
}
, t.startTransition=function(e) {
  var t=D.transition
;
D.transition= {
}
;
try {
  e()
}
finally {
  D.transition=t
}
}
, t.unstable_act=O, t.useCallback=function(e, t) {
  return N.current.useCallback(e, t)
}
, t.useContext=function(e) {
  return N.current.useContext(e)
}
, t.useDebugValue=function() {
}
, t.useDeferredValue=function(e) {
return N.current.useDeferredValue(e)
}
, t.useEffect=function(e, t) {
  return N.current.useEffect(e, t)
}
, t.useId=function() {
  return N.current.useId()
}
, t.useImperativeHandle=function(e, t, n) {
  return N.current.useImperativeHandle(e, t, n)
}
, 
t.useInsertionEffect=function(e, t) {
  return N.current.useInsertionEffect(e, t)
}
, t.useLayoutEffect=function(e, t) {
  return N.current.useLayoutEffect(e, t)
}
, t.useMemo=function(e, t) {
  return N.current.useMemo(e, t)
}
, t.useReducer=function(e, t, n) {
return N.current.useReducer(e, t, n)
}
, t.useRef=function(e) {
  return N.current.useRef(e)
}
, t.useState=function(e) {
  return N.current.useState(e)
}
, t.useSyncExternalStore=function(e, t, n) {
  return N.current.useSyncExternalStore(e, t, n)
}
, t.useTransition=function() {
return N.current.useTransition()
}
, t.version="18.3.1"
