// Module ID: 41
// Category: unidentified
// Size: 1362 bytes
// Parameters: e,t,n

"use strict";
var r=n(655), i=n(8068), a=n(9675), s=n(5795)
;
e.exports=function(e, t, n) {
  if(!e||"object"!=typeof e&&"function"!=typeof e)throw new a("`obj` must be an object or a function`");
if("string"!=typeof t&&"symbol"!=typeof t)throw new a("`property` must be a string or a symbol`")
;
if(arguments.length>3&&"boolean"!=typeof arguments[3]&&null!==arguments[3])throw new a("`nonEnumerable`,  if provided,  must be a boolean or null")
;
if(arguments.length>4&&"boolean"!=typeof arguments[4]&&null!==arguments[4])throw new a("`nonWritable`,  if provided,  must be a boolean or null")
;
if(arguments.length>5&&"boolean"!=typeof arguments[5]&&null!==arguments[5])throw new a("`nonConfigurable`,  if provided,  must be a boolean or null")
;
if(arguments.length>6&&"boolean"!=typeof arguments[6])throw new a("`loose`,  if provided,  must be a boolean")
;
var o=arguments.length>3?arguments[3]:null, l=arguments.length>4?arguments[4]:null, c=arguments.length>5?arguments[5]:null, u=arguments.length>6&&arguments[6], h=!!s&&s(e, t);
if(r)r(e, t,  {
  configurable:null===c&&h?h.configurable:!c, 
enumerable:null===o&&h?h.enumerable:!o, value:n, writable:null===l&&h?h.writable:!l
}
);
else {
  if(!u&&(o||l||c))throw new i("This environment does not support defining a property as non-configurable,  non-writable,  or non-enumerable.");
e[t]=n
}
}
}
, 76:e=> {
"use strict";
e.exports=Function.prototype.call
