// Module ID: 8310
// Category: unidentified
// Size: 1004 bytes
// Parameters: e,t,n

e.exports=i;
var r=n(7007).EventEmitter;
function i() {
  r.call(this)
}
n(4317)(i, r), 
i.Readable=n(5412), i.Writable=n(6708), i.Duplex=n(5382), i.Transform=n(4610), i.PassThrough=n(3600), i.finished=n(6238), i.pipeline=n(7758), i.Stream=i, i.prototype.pipe=function(e, t) {
  var n=this;
function i(t) {
  e.writable&&!1===e.write(t)&&n.pause&&n.pause()
}
function a() {
  n.readable&&n.resume&&n.resume()
}
n.on("data", i), e.on("drain", a), e._isStdio||t&&!1===t.end||(n.on("end", o), n.on("close", l));
var s=!1;
function o() {
  s||(s=!0, e.end())
}
function l() {
  s||(s=!0, "function"==typeof e.destroy&&e.destroy())
}
function c(e) {
  if(u(), 0===r.listenerCount(this, "error"))throw e
}
function u() {
  n.removeListener("data", i), e.removeListener("drain", a), n.removeListener("end", o), n.removeListener("close", l), n.removeListener("error", c), e.removeListener("error", c), 
n.removeListener("end", u), n.removeListener("close", u), e.removeListener("close", u)
}
return n.on("error", c), e.on("error", c), n.on("end", u), n.on("close", u), e.on("close", u), e.emit("pipe", n), e
}

