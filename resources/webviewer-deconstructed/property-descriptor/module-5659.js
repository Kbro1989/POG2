// Module ID: 5659
// Category: property-descriptor
// Size: 8531 bytes
// Parameters: e,t,n

const r=n(8156), i= {
}
;
for(const e of Object.keys(r))i[r[e]]=e;
const a= {
  rgb: {
  channels:3, labels:"rgb"
}
, hsl: {
  channels:3, labels:"hsl"
}
, hsv: {
  channels:3, labels:"hsv"
}
, hwb: {
  channels:3, labels:"hwb"
}
, cmyk: {
channels:4, labels:"cmyk"
}
, xyz: {
  channels:3, labels:"xyz"
}
, lab: {
  channels:3, labels:"lab"
}
, lch: {
  channels:3, labels:"lch"
}
, hex: {
  channels:1, labels:["hex"]
}
, keyword: {
  channels:1, labels:["keyword"]
}
, ansi16: {
  channels:1, labels:["ansi16"]
}
, ansi256: {
  channels:1, 
labels:["ansi256"]
}
, hcg: {
  channels:3, labels:["h", "c", "g"]
}
, apple: {
  channels:3, labels:["r16", "g16", "b16"]
}
, gray: {
  channels:1, labels:["gray"]
}
}
;
e.exports=a;
for(const e of Object.keys(a)) {
if(!("channels"in a[e]))throw new Error("missing channels property: "+e);
if(!("labels"in a[e]))throw new Error("missing channel labels property: "+e);
if(a[e].labels.length!==a[e].channels)throw new Error("channel and label counts mismatch: "+e)
;
const {
  channels:t, labels:n
}
=a[e];
delete a[e].channels, delete a[e].labels, Object.defineProperty(a[e], "channels",  {
  value:t
}
), Object.defineProperty(a[e], "labels",  {
  value:n
}
)
}
function s(e, t) {
  return(e[0]-t[0])**2+(e[1]-t[1])**2+(e[2]-t[2])**2
}
a.rgb.hsl=function(e) {
  const t=e[0]/255, n=e[1]/255, r=e[2]/255, i=Math.min(t, n, r), a=Math.max(t, n, r), s=a-i;
let o, l;
a===i?o=0:t===a?o=(n-r)/s:n===a?o=2+(r-t)/s:r===a&&(o=4+(t-n)/s), o=Math.min(60*o, 360), o<0&&(o+=360);
const c=(i+a)/2
;
return l=a===i?0:c<=.5?s/(a+i):s/(2-a-i), [o, 100*l, 100*c]
}
, a.rgb.hsv=function(e) {
  let t, n, r, i, a;
const s=e[0]/255, o=e[1]/255, l=e[2]/255, c=Math.max(s, o, l), u=c-Math.min(s, o, l), h=function(e) {
  return(c-e)/6/u+.5
}
;
return 0===u?(i=0, a=0):(a=u/c, t=h(s), n=h(o), 
r=h(l), s===c?i=r-n:o===c?i=1/3+t-r:l===c&&(i=2/3+n-t), i<0?i+=1:i>1&&(i-=1)), [360*i, 100*a, 100*c]
}
, a.rgb.hwb=function(e) {
  const t=e[0], n=e[1];
let r=e[2];
const i=a.rgb.hsl(e)[0], s=1/255*Math.min(t, Math.min(n, r))
;
return r=1-1/255*Math.max(t, Math.max(n, r)), [i, 100*s, 100*r]
}
, a.rgb.cmyk=function(e) {
  const t=e[0]/255, n=e[1]/255, r=e[2]/255, i=Math.min(1-t, 1-n, 1-r);
return[100*((1-t-i)/(1-i)||0), 100*((1-n-i)/(1-i)||0), 100*((1-r-i)/(1-i)||0), 100*i]
}
, 
a.rgb.keyword=function(e) {
  const t=i[e];
if(t)return t;
let n, a=1/0;
for(const t of Object.keys(r)) {
  const i=s(e, r[t]);
i<a&&(a=i, n=t)
}
return n
}
, a.keyword.rgb=function(e) {
  return r[e]
}
, a.rgb.xyz=function(e) {
  let t=e[0]/255, n=e[1]/255, r=e[2]/255
;
return t=t>.04045?((t+.055)/1.055)**2.4:t/12.92, n=n>.04045?((n+.055)/1.055)**2.4:n/12.92, r=r>.04045?((r+.055)/1.055)**2.4:r/12.92, [100*(.4124*t+.3576*n+.1805*r), 100*(.2126*t+.7152*n+.0722*r), 100*(.0193*t+.1192*n+.9505*r)]
}
, a.rgb.lab=function(e) {
const t=a.rgb.xyz(e);
let n=t[0], r=t[1], i=t[2];
return n/=95.047, r/=100, i/=108.883, n=n>.008856?n**(1/3):7.787*n+16/116, r=r>.008856?r**(1/3):7.787*r+16/116, i=i>.008856?i**(1/3):7.787*i+16/116, [116*r-16, 500*(n-r), 200*(r-i)]
}
, a.hsl.rgb=function(e) {
const t=e[0]/360, n=e[1]/100, r=e[2]/100;
let i, a, s;
if(0===n)return s=255*r, [s, s, s];
i=r<.5?r*(1+n):r+n-r*n;
const o=2*r-i, l=[0, 0, 0];
for(let e=0;
e<3;
e++)a=t+1/3*-(e-1), a<0&&a++, a>1&&a--, s=6*a<1?o+6*(i-o)*a:2*a<1?i:3*a<2?o+(i-o)*(2/3-a)*6:o, l[e]=255*s
;
return l
}
, a.hsl.hsv=function(e) {
  const t=e[0];
let n=e[1]/100, r=e[2]/100, i=n;
const a=Math.max(r, .01);
return r*=2, n*=r<=1?r:2-r, i*=a<=1?a:2-a, [t, 100*(0===r?2*i/(a+i):2*n/(r+n)), (r+n)/2*100]
}
, a.hsv.rgb=function(e) {
  const t=e[0]/60, n=e[1]/100
;
let r=e[2]/100;
const i=Math.floor(t)%6, a=t-Math.floor(t), s=255*r*(1-n), o=255*r*(1-n*a), l=255*r*(1-n*(1-a));
switch(r*=255, i) {
  case 0:return[r, l, s];
case 1:return[o, r, s];
case 2:return[s, r, l];
case 3:return[s, o, r];
case 4:return[l, s, r];
case 5:return[r, s, o]
}
}
, a.hsv.hsl=function(e) {
  const t=e[0], n=e[1]/100, r=e[2]/100, i=Math.max(r, .01);
let a, s;
s=(2-n)*r;
const o=(2-n)*i;
return a=n*i, a/=o<=1?o:2-o, a=a||0, s/=2, [t, 100*a, 100*s]
}
, a.hwb.rgb=function(e) {
  const t=e[0]/360;
let n=e[1]/100, r=e[2]/100;
const i=n+r;
let a
;
i>1&&(n/=i, r/=i);
const s=Math.floor(6*t), o=1-r;
a=6*t-s, 1&s&&(a=1-a);
const l=n+a*(o-n);
let c, u, h;
switch(s) {
  default:case 6:case 0:c=o, u=l, h=n;
break;
case 1:c=l, u=o, h=n;
break;
case 2:c=n, u=o, h=l;
break;
case 3:c=n, u=l, h=o;
break;
case 4:c=l, u=n, h=o;
break
;
case 5:c=o, u=n, h=l
}
return[255*c, 255*u, 255*h]
}
, a.cmyk.rgb=function(e) {
  const t=e[0]/100, n=e[1]/100, r=e[2]/100, i=e[3]/100;
return[255*(1-Math.min(1, t*(1-i)+i)), 255*(1-Math.min(1, n*(1-i)+i)), 255*(1-Math.min(1, r*(1-i)+i))]
}
, a.xyz.rgb=function(e) {
const t=e[0]/100, n=e[1]/100, r=e[2]/100;
let i, a, s;
return i=3.2406*t+-1.5372*n+-.4986*r, a=-.9689*t+1.8758*n+.0415*r, s=.0557*t+-.204*n+1.057*r, i=i>.0031308?1.055*i**(1/2.4)-.055:12.92*i, a=a>.0031308?1.055*a**(1/2.4)-.055:12.92*a, 
s=s>.0031308?1.055*s**(1/2.4)-.055:12.92*s, i=Math.min(Math.max(0, i), 1), a=Math.min(Math.max(0, a), 1), s=Math.min(Math.max(0, s), 1), [255*i, 255*a, 255*s]
}
, a.xyz.lab=function(e) {
  let t=e[0], n=e[1], r=e[2];
return t/=95.047, n/=100, r/=108.883, 
t=t>.008856?t**(1/3):7.787*t+16/116, n=n>.008856?n**(1/3):7.787*n+16/116, r=r>.008856?r**(1/3):7.787*r+16/116, [116*n-16, 500*(t-n), 200*(n-r)]
}
, a.lab.xyz=function(e) {
  let t, n, r;
n=(e[0]+16)/116, t=e[1]/500+n, r=n-e[2]/200;
const i=n**3, a=t**3, s=r**3
;
return n=i>.008856?i:(n-16/116)/7.787, t=a>.008856?a:(t-16/116)/7.787, r=s>.008856?s:(r-16/116)/7.787, t*=95.047, n*=100, r*=108.883, [t, n, r]
}
, a.lab.lch=function(e) {
  const t=e[0], n=e[1], r=e[2];
let i;
return i=360*Math.atan2(r, n)/2/Math.PI, i<0&&(i+=360), 
[t, Math.sqrt(n*n+r*r), i]
}
, a.lch.lab=function(e) {
  const t=e[0], n=e[1], r=e[2]/360*2*Math.PI;
return[t, n*Math.cos(r), n*Math.sin(r)]
}
, a.rgb.ansi16=function(e, t=null) {
  const[n, r, i]=e;
let s=null===t?a.rgb.hsv(e)[2]:t;
if(s=Math.round(s/50), 0===s)return 30
;
let o=30+(Math.round(i/255)<<2|Math.round(r/255)<<1|Math.round(n/255));
return 2===s&&(o+=60), o
}
, a.hsv.ansi16=function(e) {
  return a.rgb.ansi16(a.hsv.rgb(e), e[2])
}
, a.rgb.ansi256=function(e) {
  const t=e[0], n=e[1], r=e[2]
;
return t===n&&n===r?t<8?16:t>248?231:Math.round((t-8)/247*24)+232:16+36*Math.round(t/255*5)+6*Math.round(n/255*5)+Math.round(r/255*5)
}
, a.ansi16.rgb=function(e) {
  let t=e%10;
if(0===t||7===t)return e>50&&(t+=3.5), t=t/10.5*255, [t, t, t]
;
const n=.5*(1+~~(e>50));
return[(1&t)*n*255, (t>>1&1)*n*255, (t>>2&1)*n*255]
}
, a.ansi256.rgb=function(e) {
  if(e>=232) {
  const t=10*(e-232)+8;
return[t, t, t]
}
let t;
return e-=16, [Math.floor(e/36)/5*255, Math.floor((t=e%36)/6)/5*255, t%6/5*255]
}
, 
a.rgb.hex=function(e) {
  const t=(((255&Math.round(e[0]))<<16)+((255&Math.round(e[1]))<<8)+(255&Math.round(e[2]))).toString(16).toUpperCase();
return"000000".substring(t.length)+t
}
, a.hex.rgb=function(e) {
const t=e.toString(16).match(/[a-f0-9] {
  6
}
|[a-f0-9] {
  3
}
/i);
if(!t)return[0, 0, 0];
let n=t[0];
3===t[0].length&&(n=n.split("").map((e=>e+e)).join(""));
const r=parseInt(n, 16);
return[r>>16&255, r>>8&255, 255&r]
}
, a.rgb.hcg=function(e) {
const t=e[0]/255, n=e[1]/255, r=e[2]/255, i=Math.max(Math.max(t, n), r), a=Math.min(Math.min(t, n), r), s=i-a;
let o, l;
return o=s<1?a/(1-s):0, l=s<=0?0:i===t?(n-r)/s%6:i===n?2+(r-t)/s:4+(t-n)/s, l/=6, l%=1, [360*l, 100*s, 100*o]
}
, a.hsl.hcg=function(e) {
const t=e[1]/100, n=e[2]/100, r=n<.5?2*t*n:2*t*(1-n);
let i=0;
return r<1&&(i=(n-.5*r)/(1-r)), [e[0], 100*r, 100*i]
}
, a.hsv.hcg=function(e) {
  const t=e[1]/100, n=e[2]/100, r=t*n;
let i=0;
return r<1&&(i=(n-r)/(1-r)), [e[0], 100*r, 100*i]
}
, a.hcg.rgb=function(e) {
const t=e[0]/360, n=e[1]/100, r=e[2]/100;
if(0===n)return[255*r, 255*r, 255*r];
const i=[0, 0, 0], a=t%1*6, s=a%1, o=1-s;
let l=0;
switch(Math.floor(a)) {
  case 0:i[0]=1, i[1]=s, i[2]=0;
break;
case 1:i[0]=o, i[1]=1, i[2]=0;
break;
case 2:i[0]=0, i[1]=1, i[2]=s;
break;
case 3:
i[0]=0, i[1]=o, i[2]=1;
break;
case 4:i[0]=s, i[1]=0, i[2]=1;
break;
default:i[0]=1, i[1]=0, i[2]=o
}
return l=(1-n)*r, [255*(n*i[0]+l), 255*(n*i[1]+l), 255*(n*i[2]+l)]
}
, a.hcg.hsv=function(e) {
  const t=e[1]/100, n=t+e[2]/100*(1-t);
let r=0;
return n>0&&(r=t/n), 
[e[0], 100*r, 100*n]
}
, a.hcg.hsl=function(e) {
  const t=e[1]/100, n=e[2]/100*(1-t)+.5*t;
let r=0;
return n>0&&n<.5?r=t/(2*n):n>=.5&&n<1&&(r=t/(2*(1-n))), [e[0], 100*r, 100*n]
}
, a.hcg.hwb=function(e) {
  const t=e[1]/100, n=t+e[2]/100*(1-t)
;
return[e[0], 100*(n-t), 100*(1-n)]
}
, a.hwb.hcg=function(e) {
  const t=e[1]/100, n=1-e[2]/100, r=n-t;
let i=0;
return r<1&&(i=(n-r)/(1-r)), [e[0], 100*r, 100*i]
}
, a.apple.rgb=function(e) {
  return[e[0]/65535*255, e[1]/65535*255, e[2]/65535*255]
}
, 
a.rgb.apple=function(e) {
  return[e[0]/255*65535, e[1]/255*65535, e[2]/255*65535]
}
, a.gray.rgb=function(e) {
  return[e[0]/100*255, e[0]/100*255, e[0]/100*255]
}
, a.gray.hsl=function(e) {
  return[0, 0, e[0]]
}
, a.gray.hsv=a.gray.hsl, a.gray.hwb=function(e) {
return[0, 100, e[0]]
}
, a.gray.cmyk=function(e) {
  return[0, 0, 0, e[0]]
}
, a.gray.lab=function(e) {
  return[e[0], 0, 0]
}
, a.gray.hex=function(e) {
  const t=255&Math.round(e[0]/100*255), n=((t<<16)+(t<<8)+t).toString(16).toUpperCase();
return"000000".substring(n.length)+n
}
, a.rgb.gray=function(e) {
  return[(e[0]+e[1]+e[2])/3/255*100]
}

