// Module ID: 251
// Category: unidentified
// Size: 874 bytes
// Parameters: e,t

t.read=function(e, t, n, r, i) {
  var a, s, o=8*i-r-1, l=(1<<o)-1, c=l>>1, u=-7, h=n?i-1:0, d=n?-1:1, p=e[t+h];
for(h+=d, a=p&(1<<-u)-1, p>>=-u, u+=o;
u>0;
a=256*a+e[t+h], h+=d, u-=8);
for(s=a&(1<<-u)-1, a>>=-u, 
u+=r;
u>0;
s=256*s+e[t+h], h+=d, u-=8);
if(0===a)a=1-c;
else {
  if(a===l)return s?NaN:1/0*(p?-1:1);
s+=Math.pow(2, r), a-=c
}
return(p?-1:1)*s*Math.pow(2, a-r)
}
, t.write=function(e, t, n, r, i, a) {
var s, o, l, c=8*a-i-1, u=(1<<c)-1, h=u>>1, d=23===i?Math.pow(2, -24)-Math.pow(2, -77):0, p=r?0:a-1, f=r?1:-1, m=t<0||0===t&&1/t<0?1:0;
for(t=Math.abs(t), isNaN(t)||t===1/0?(o=isNaN(t)?1:0, s=u):(s=Math.floor(Math.log(t)/Math.LN2), t*(l=Math.pow(2, -s))<1&&(s--, 
l*=2), (t+=s+h>=1?d/l:d*Math.pow(2, 1-h))*l>=2&&(s++, l/=2), s+h>=u?(o=0, s=u):s+h>=1?(o=(t*l-1)*Math.pow(2, i), s+=h):(o=t*Math.pow(2, h-1)*Math.pow(2, i), s=0));
i>=8;
e[n+p]=255&o, p+=f, o/=256, i-=8);
for(s=s<<i|o, c+=i;
c>0;
e[n+p]=255&s, p+=f, s/=256, c-=8);
e[n+p-f]|=128*m
}

