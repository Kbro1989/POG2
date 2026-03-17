// Module ID: 5896
// Category: unidentified
// Size: 2998 bytes
// Parameters: e,t,n

"use strict";
var r=n(5606);
function i(e, t) {
  s(e, t), a(e)
}
function a(e) {
  e._writableState&&!e._writableState.emitClose||e._readableState&&!e._readableState.emitClose||e.emit("close")
}
function s(e, t) {
  e.emit("error", t)
}
e.exports= {
destroy:function(e, t) {
  var n=this, o=this._readableState&&this._readableState.destroyed, l=this._writableState&&this._writableState.destroyed
;
return o||l?(t?t(e):e&&(this._writableState?this._writableState.errorEmitted||(this._writableState.errorEmitted=!0, r.nextTick(s, this, e)):r.nextTick(s, this, e)), this):(this._readableState&&(this._readableState.destroyed=!0), 
this._writableState&&(this._writableState.destroyed=!0), this._destroy(e||null, (function(e) {
  !t&&e?n._writableState?n._writableState.errorEmitted?r.nextTick(a, n):(n._writableState.errorEmitted=!0, r.nextTick(i, n, e)):r.nextTick(i, n, e):t?(r.nextTick(a, n), 
t(e)):r.nextTick(a, n)
}
)), this)
}
, undestroy:function() {
  this._readableState&&(this._readableState.destroyed=!1, this._readableState.reading=!1, this._readableState.ended=!1, this._readableState.endEmitted=!1), 
this._writableState&&(this._writableState.destroyed=!1, this._writableState.ended=!1, this._writableState.ending=!1, this._writableState.finalCalled=!1, this._writableState.prefinished=!1, this._writableState.finished=!1, 
this._writableState.errorEmitted=!1)
}
, errorOrDestroy:function(e, t) {
  var n=e._readableState, r=e._writableState;
n&&n.autoDestroy||r&&r.autoDestroy?e.destroy(t):e.emit("error", t)
}
}
}
, 5903:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                               "color",  "read": ["array", 3, "unsigned byte"] 
}
, \r\n\t"0x02":  {
   "name":                        "materialbyte",  "read": "unsigned byte" 
}
, //last used in ~2008\r\n\t"0x03":  {
   "name":                            "material",  "read": ["match", "buildnr",  {
  ">377":"unsigned short", "other":0
}
] 
}
, \r\n\t"0x05":  {
   "name":                        "unknown_0x05",  "read": "true" 
}
, \r\n\t"0x06":  {
   "name":                                "name",  "read": "string" 
}
, //not used after 2006\r\n\t"0x07":  {
   "name":                    "secondary_colour",  "read": ["array", 3, "unsigned byte"] 
}
, \r\n\t"0x08":  {
   "name":                        "unknown_0x08",  "read": "true" 
}
, \r\n\t"0x09":  {
   "name":                     "material_tiling",  "read": "unsigned short" 
}
, \r\n\t"0x0A":  {
   "name":                        "unknown_0x0A",  "read": "true" 
}
, \r\n\t"0x0B":  {
   "name":                       "bleedpriority",  "read": "unsigned byte" 
}
, //higher number means that it flows into neighbouring overlays with lower number\r\n\t"0x0C":  {
   "name":                     "bleedToUnderlay",  "read": "true" 
}
, \r\n\t"0x0D":  {
   "name":                     "tertiary_colour",  "read": ["array", 3, "unsigned byte"] 
}
, \r\n\t"0x0E":  {
   "name":                        "unknown_0x0E",  "read": "unsigned byte" 
}
, \r\n\t"0x0F":  {
   "name":                        "unknown_0x0F",  "read": "unsigned short" 
}
, //last used in ~2010\r\n\t"0x10":  {
   "name":                        "unknown_0x10",  "read": "unsigned byte" 
}
\r\n
}
'
