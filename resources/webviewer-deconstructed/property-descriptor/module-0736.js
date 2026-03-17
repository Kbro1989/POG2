// Module ID: 736
// Category: property-descriptor
// Size: 48420 bytes
// Parameters: e,t,n

e.exports=function(e) {
  function t(e) {
let n, i, a, s=null;
function o(...e) {
  if(!o.enabled)return;
const r=o, i=Number(new Date), a=i-(n||i);
r.diff=a, r.prev=n, r.curr=i, n=i, e[0]=t.coerce(e[0]), "string"!=typeof e[0]&&e.unshift("%O");
let s=0;
e[0]=e[0].replace(/%([a-zA-Z%])/g, ((n, i)=> {
if("%%"===n)return"%";
s++;
const a=t.formatters[i];
if("function"==typeof a) {
  const t=e[s];
n=a.call(r, t), e.splice(s, 1), s--
}
return n
}
)), t.formatArgs.call(r, e), (r.log||t.log).apply(r, e)
}
return o.namespace=e, o.useColors=t.useColors(), 
o.color=t.selectColor(e), o.extend=r, o.destroy=t.destroy, Object.defineProperty(o, "enabled",  {
  enumerable:!0, configurable:!1, get:()=>null!==s?s:(i!==t.namespaces&&(i=t.namespaces, a=t.enabled(e)), a), set:e=> {
  s=e
}
}
), "function"==typeof t.init&&t.init(o), o
}
function r(e, n) {
  const r=t(this.namespace+(void 0===n?":":n)+e);
return r.log=this.log, r
}
function i(e, t) {
  let n=0, r=0, i=-1, a=0;
for(;
n<e.length;
)if(r<t.length&&(t[r]===e[n]||"*"===t[r]))"*"===t[r]?(i=r, a=n, r++):(n++, r++);
else {
  if(-1===i)return!1;
r=i+1, 
a++, n=a
}
for(;
r<t.length&&"*"===t[r];
)r++;
return r===t.length
}
return t.debug=t, t.default=t, t.coerce=function(e) {
  return e instanceof Error?e.stack||e.message:e
}
, t.disable=function() {
  const e=[...t.names, ...t.skips.map((e=>"-"+e))].join(", ")
;
return t.enable(""), e
}
, t.enable=function(e) {
  t.save(e), t.namespaces=e, t.names=[], t.skips=[];
const n=("string"==typeof e?e:"").trim().replace(/\s+/g, ", ").split(", ").filter(Boolean);
for(const e of n)"-"===e[0]?t.skips.push(e.slice(1)):t.names.push(e)
}
, 
t.enabled=function(e) {
  for(const n of t.skips)if(i(e, n))return!1;
for(const n of t.names)if(i(e, n))return!0;
return!1
}
, t.humanize=n(6585), t.destroy=function() {
console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")
}
, Object.keys(e).forEach((n=> {
  t[n]=e[n]
}
)), t.names=[], t.skips=[], t.formatters= {
}
, 
t.selectColor=function(e) {
  let n=0;
for(let t=0;
t<e.length;
t++)n=(n<<5)-n+e.charCodeAt(t), n|=0;
return t.colors[Math.abs(n)%t.colors.length]
}
, t.enable(t.load()), t
}
}
, 929:e=> {
  "use strict"
;
e.exports="\r\n#version 460\r\n\r\n/***************************************************/\r\n/***************** GLSL Header *********************/\r\n/***************************************************/\r\n#ifdef GL_EXT_gpu_shader4\r\n#extension GL_EXT_gpu_shader4 : enable\r\n#endif\r\n#ifdef GL_ARB_gpu_shader5\r\n#extension GL_ARB_gpu_shader5 : enable\r\n#endif\r\n#ifdef GL_ARB_derivative_control\r\n#extension GL_ARB_derivative_control : enable\r\n#endif\r\n\r\n#ifdef GL_ARB_texture_gather\r\n#extension GL_ARB_texture_gather : enable\r\n#endif\r\n\r\n#define OGL_BACKEND\r\n\r\n#undef attribute\r\n#define attribute in\r\n\r\n#undef gl_FragColor\r\n#define gl_FragColor FragColor\r\n\r\n#define shadow2DCompat texture\r\n\r\n#undef textureCube\r\n#define textureCube texture\r\n\r\n#undef texture2D\r\n#define texture2D texture\r\n\r\n#undef texture3D\r\n#define texture3D texture\r\n\r\n#undef texture2DLod\r\n#define texture2DLod textureLod\r\n\r\n#undef textureCubeLod\r\n#define textureCubeLod textureLod\r\n\r\n#undef texture2DGrad\r\n#define texture2DGrad textureGrad\r\n\r\n#define MSAA_AVAILABLE\r\n\r\n#define TEXTURE_OFFSET_AVAILABLE\r\n#if !defined(lowp)\r\n#define lowp\r\n#endif\r\n#if !defined(mediump)\r\n#define mediump\r\n#endif\r\n#if !defined(highp)\r\n#define highp\r\n#endif\r\n\r\n#define GRAPHICS_QUALITY_LOW 0\r\n#define GRAPHICS_QUALITY_MEDIUM 1\r\n#define GRAPHICS_QUALITY_HIGH 2\r\n#define GRAPHICS_QUALITY_ULTRA 3\r\n\r\n#define shadow2DLodCompat texture2DLod\r\n\r\n#define texture2DLodCompat texture2DLod\r\n\r\n#define textureCubeLodCompat textureCubeLod\r\n\r\n#define textureGatherCompat(sampler,  texCoord,  viewportScale) textureGather(sampler,  texCoord).wzxy\r\n\r\n#define SHADER_TYPE_PIXEL\r\n\r\nout vec4 gl_FragColor;
\r\n\r\n#define UNIFORM_BUFFER_BEGIN(name) \\\r\n    layout(std140) uniform name    \\\r\n     {
  \r\n#define UNIFORM_BUFFER_END \\\r\n    
}
                      \\\r\n    ;
\r\n\r\nmat3 Mat4ToMat3(const mat4 inputMatrix)\r\n {
  \r\n    return mat3(inputMatrix);
\r\n
}
\r\n\r\n#define isNaN isnan\r\n\r\n#ifndef GL_ARB_derivative_control\r\n#define dFdxFine dFdx\r\n#define dFdyFine dFdy\r\n#define fwidthFine fwidth\r\n#endif\r\n\r\n/***************************************************/\r\n\r\n/***************************************************/\r\n/***************** Effect Defines ******************/\r\n/***************************************************/\r\n#define VIEW_TRANSFORMS\r\n\r\n/*************************************************/\r\n\r\n/***************************************************/\r\n/********** Mandatory Shader Fragments *************/\r\n/***************************************************/\r\n\r\n#define GRAPHICS_QUALITY_LOW 0\r\n#define GRAPHICS_QUALITY_MEDIUM 1\r\n#define GRAPHICS_QUALITY_HIGH 2\r\n#define GRAPHICS_QUALITY_ULTRA 3\r\n\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_X 3.0\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_Y 4.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X 42.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_Y 32.0\r\n#define MATERIAL_SETTINGS_TEXTURE_RESOLUTION 128.0\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
\r\nfloat SpecPowToBeckmannRoughness(float f)  {
   return sqrt(2. / (f + 2.));
}
\r\nfloat PerceptualRoughnessToRoughness(float f)  {
   return f * f;
}
\r\nfloat RoughnessToPerceptualRoughness(float f)  {
   return sqrt(f);
}
\r\n#endif\r\n#ifndef CONVERSION_UTILS_INC\r\n#define CONVERSION_UTILS_INC\r\nvec3 SRGBToLinear(vec3 srgbColour)\r\n {
  \r\n#if defined(GAMMA_CORRECT_INPUTS)\r\n    return srgbColour * srgbColour;
\r\n#else\r\n    return pow(srgbColour,  vec3(2.2,  2.2,  2.2));
\r\n#endif\r\n
}
\r\nvec3 LinearToSRGB(vec3 s)  {
   return max(vec3(1.055) * pow(s,  vec3(.416667)) - vec3(.055),  vec3(0.));
}
\r\nfloat LinearToSRGB(float s)\r\n {
  \r\n    const float p = 1. / 2.2;
\r\n    return pow(s,  p);
\r\n
}
\r\nvec3 LinearToSRGBRunescape(vec3 s)  {
   return sqrt(s);
}
\r\nfloat LinearToSRGBRunescape(float s)  {
   return sqrt(s);
}
\r\nvec4 convertRGBtoHSL(vec4 s)\r\n {
  \r\n    const float p = 1. / 6.;
\r\n    float v = s.s,  m = s.t,  t = s.p,  f = min(min(s.s,  s.t),  s.p),  q = max(max(s.s,  s.t),  s.p),  r = q - f,  G = (f + q) * .5,  i = 0.,  e = 0.;
\r\n    if (G > 0. && G < 1.)\r\n     {
  \r\n        float L = G < .5 ? G : 1. - G;
\r\n        i = r / (L * 2.);
\r\n    
}
\r\n    if (r > 0.)\r\n     {
  \r\n        vec3 L = vec3(q == v && q != m ? 1. : 0.,  q == m && q != t ? 1. : 0.,  q == t && q != v ? 1. : 0.),  o = vec3((m - t) / r,  2. + (t - v) / r,  4. + (v - m) / r);
\r\n        e += dot(o,  L);
\r\n        e *= p;
\r\n        if (e < 0.)\r\n            e += 1.;
\r\n    
}
\r\n    return vec4(e,  i,  G,  s.q);
\r\n
}
\r\nvec4 convertHSLtoRGB(vec4 s)\r\n {
  \r\n    const float v = 1. / 3.,  q = 2. / 3.,  m = 6.;
\r\n    float p = s.s,  t = s.t,  r = s.p;
\r\n    vec3 f = vec3(m * (p - q),  0.,  m * (1. - p));
\r\n    if (p < q)\r\n        f.s = 0.,  f.t = m * (q - p),  f.p = m * (p - v);
\r\n    if (p < v)\r\n        f.s = m * (v - p),  f.t = m * p,  f.p = 0.;
\r\n    f = min(f,  1.);
\r\n    float L = 2. * t,  i = 1. - t,  G = 1. - r,  e = 2. * r - 1.;
\r\n    vec3 c = L * f + i,  o;
\r\n    if (r >= .5)\r\n        o = G * c + e;
\r\n    else\r\n        o = r * c;
\r\n    return vec4(o,  s.q);
\r\n
}
\r\n#endif\r\n#ifndef PACK_UTILS_INC\r\n#define PACK_UTILS_INC\r\n#ifndef SHADER_LIB_COMMON_INC\r\n#define SHADER_LIB_COMMON_INC\r\n#define USE_MOD_PACK\r\n#endif\r\n\r\nvec4 PackFloatToRGBA(highp float valueToPack)\r\n {
  \r\n#if defined(USE_MOD_PACK) || defined(USE_FRACT_PACK)\r\n    const highp vec4 bitShift = vec4(256 * 256 * 256,  256 * 256,  256,  1.0);
\r\n    const highp vec4 bitMask = vec4(0,  1.0 / 256.0,  1.0 / 256.0,  1.0 / 256.0);
\r\n    highp vec4 fragColour = mod(valueToPack * bitShift * vec4(255),  vec4(256)) / vec4(255);
\r\n    return fragColour - fragColour.xxyz * bitMask;
\r\n#endif\r\n#ifdef USE_ARAS_PACK\r\n    const highp vec4 bitShift = vec4(1.0,  255.0,  65025.0,  16581375.0);
\r\n    const highp vec4 bitMask = vec4(1.0 / 255.0,  1.0 / 255.0,  1.0 / 255.0,  0.0);
\r\n    highp vec4 fragColour = fract(valueToPack * bitShift);
\r\n    return fragColour - (fragColour.xxyz * bitMask);
\r\n#endif\r\n
}
\r\nvec2 NormalPackSphereMap(vec3 v)\r\n {
  \r\n    vec2 f = normalize(v.st) * sqrt(-v.p * .5 + .5);
\r\n    f = f * .5 + .5;
\r\n    return f * 65535.;
\r\n
}
\r\nvec2 PackFloatToVec2(float v)\r\n {
  \r\n    vec2 f;
\r\n    const float b = 1. / 255.;
\r\n    vec2 h = vec2(1.,  255.),  r = fract(h * v);
\r\n    r.s -= r.t * b;
\r\n    return r.st;
\r\n
}
\r\n#endif\r\n#ifndef UNPACK_UTILS_INC\r\n#define UNPACK_UTILS_INC\r\n#ifndef SHADER_LIB_COMMON_INC\r\n#define SHADER_LIB_COMMON_INC\r\n#define USE_MOD_PACK\r\n#endif\r\n\r\nhighp float UnpackRGBAToFloat(highp vec4 valueToUnpack)\r\n {
  \r\n#if defined(USE_MOD_PACK) || defined(USE_FRACT_PACK)\r\n    const highp vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0),  1.0 / (256.0 * 256.0),  1.0 / 256.0,  1.0);
\r\n    return dot(valueToUnpack,  bitShifts);
\r\n#endif\r\n#ifdef USE_ARAS_PACK\r\n    const highp vec4 bitShifts = vec4(1.0,  1.0 / 255.0,  1.0 / 65025.0,  1.0 / 16581375.0);
\r\n    return dot(valueToUnpack,  bitShifts);
\r\n#endif\r\n
}
\r\nvec3 ColourUnpack(highp float v)\r\n {
  \r\n    vec3 f;
\r\n    f.s = floor(v / 256. / 256.);
\r\n    f.t = floor((v - f.s * 256. * 256.) / 256.);
\r\n    f.p = floor(v - f.s * 256. * 256. - f.t * 256.);
\r\n    return f / 256.;
\r\n
}
\r\nvec3 NormalUnpackSphereMap(vec2 v)\r\n {
  \r\n    vec4 f = vec4(v.s / 32767. - 1.,  v.t / 32767. - 1.,  1.,  -1.);
\r\n    float U = dot(f.stp,  -f.stq);
\r\n    f.st *= sqrt(U);
\r\n    f.p = U;
\r\n    return f.stp * 2. + vec3(0.,  0.,  -1.);
\r\n
}
\r\nhighp float UnpackRGBAToIntegerFloat(highp vec4 f)  {
   return floor(f.s * 255. + .5) * 256. * 256. * 256. + floor(f.t * 255. + .5) * 256. * 256. + floor(f.p * 255. + .5) * 256. + floor(f.q * 255. + .5);
}
\r\nhighp float UnpackRGBAToIntegerFloat16(highp vec2 f)  {
   return floor(f.s * 255. + .5) * 256. + floor(f.t * 255. + .5);
}
\r\nhighp int UnpackRGBAToInt(vec4 f)  {
   return int(UnpackRGBAToIntegerFloat(f));
}
\r\nhighp vec4 UnpackFloatToRGBA(highp float f)\r\n {
  \r\n    const highp vec4 v = vec4(1.,  255.,  65025.,  1.65814e+07),  s = vec4(vec3(1. / 255.),  0.);
\r\n    highp vec4 U = fract(f * v);
\r\n    U -= U.sstp * s;
\r\n    return U;
\r\n
}
\r\nhighp float UnpackVec2ToFloat(highp vec2 f)  {
   return floor(f.s * 255. + .5) * 256. + floor(f.t * 255. + .5);
}
\r\n#endif\r\n#if defined(MSAA) && defined(MSAA_AVAILABLE)\r\n#define SAMPLER_2D_AUTO_MULTISAMPLE sampler2DMS\r\n#define MSAA_SAMPLERS_ENABLED 1\r\n#define texture2DMultisample(sampler,  texCoord,  texSize) texelFetch(sampler,  ivec2((texCoord)*texSize),  0)\r\n#else\r\n#define SAMPLER_2D_AUTO_MULTISAMPLE sampler2D\r\n#define MSAA_SAMPLERS_ENABLED 0\r\n#define texture2DMultisample(sampler,  texCoord,  texSize) texture2DLodCompat(sampler,  texCoord,  0.0)\r\n#endif\r\nUNIFORM_BUFFER_BEGIN(ViewportLookupScale)\r\nuniform highp vec4 uViewportLookupScale;
\r\nuniform highp vec4 uViewportOffsetScale;
\r\nuniform highp vec4 uFullScreenLookupScale;
\r\nUNIFORM_BUFFER_END\r\n\r\n/***************************************************/\r\n\r\nUNIFORM_BUFFER_BEGIN(ViewTransforms)\r\nuniform highp vec3 uCameraPosition;
\r\nuniform highp mat4 uViewMatrix;
\r\nuniform highp mat4 uProjectionMatrix;
\r\nuniform highp mat4 uViewProjMatrix;
\r\nuniform highp vec4 uZBufferParams;
\r\nUNIFORM_BUFFER_END\r\n\r\nUNIFORM_BUFFER_BEGIN(Sunlight)\r\nuniform highp vec3 uInvSunDirection;
\r\nuniform mediump vec3 uAmbientColour;
\r\nuniform mediump vec3 uSunColour;
\r\nuniform mediump float uDummy;
\r\nUNIFORM_BUFFER_END\r\nuniform lowp vec4 uWaterFeatureFlags;
\r\nuniform highp vec4 uWaterNormalMapTextureScales_FlowNoiseScale;
\r\nuniform highp vec2 uWaterTickFade;
\r\nuniform vec4 uWaterNormalBRDFParams;
\r\nuniform vec3 uWaterSpecularColour;
\r\nin highp vec4 vPosition_WaterDepth;
\r\nin vec4 vColour;
\r\nin highp vec4 vFlowControlMask_ViewSpaceDepth;
\r\nin highp vec4 vNoisyPatchFlow0_NoisyPatchFlow1;
\r\nin highp vec4 vNoisyPatchFlow2_UVPack_NormalsFlow0Map0;
\r\nin highp vec4 vUVPack_NormalsFlow0Map1_NormalsFlow0Map2;
\r\nin highp vec4 vUVPack_NormalsFlow1Map0_NormalsFlow1Map1;
\r\nin highp vec4 vUVPack_NormalsFlow1Map2_NormalsFlow2Map0;
\r\nin highp vec4 vUVPack_NormalsFlow2Map1_NormalsFlow2Map2;
\r\nin highp vec4 vUVPack_NormalMapMacroUV_EmissiveUV[3];
\r\nin highp vec2 vUVPack_FoamUV;
\r\n#ifndef CONVERSION_UTILS_INC\r\n#define CONVERSION_UTILS_INC\r\nvec3 SRGBToLinear(vec3 srgbColour)\r\n {
  \r\n#if defined(GAMMA_CORRECT_INPUTS)\r\n    return srgbColour * srgbColour;
\r\n#else\r\n    return pow(srgbColour,  vec3(2.2,  2.2,  2.2));
\r\n#endif\r\n
}
\r\nvec3 LinearToSRGB(vec3 s)  {
   return max(vec3(1.055) * pow(s,  vec3(.416667)) - vec3(.055),  vec3(0.));
}
\r\nfloat LinearToSRGB(float s)\r\n {
  \r\n    const float p = 1. / 2.2;
\r\n    return pow(s,  p);
\r\n
}
\r\nvec3 LinearToSRGBRunescape(vec3 s)  {
   return sqrt(s);
}
\r\nfloat LinearToSRGBRunescape(float s)  {
   return sqrt(s);
}
\r\nvec4 convertRGBtoHSL(vec4 s)\r\n {
  \r\n    const float p = 1. / 6.;
\r\n    float v = s.s,  m = s.t,  t = s.p,  f = min(min(s.s,  s.t),  s.p),  q = max(max(s.s,  s.t),  s.p),  r = q - f,  G = (f + q) * .5,  i = 0.,  e = 0.;
\r\n    if (G > 0. && G < 1.)\r\n     {
  \r\n        float L = G < .5 ? G : 1. - G;
\r\n        i = r / (L * 2.);
\r\n    
}
\r\n    if (r > 0.)\r\n     {
  \r\n        vec3 L = vec3(q == v && q != m ? 1. : 0.,  q == m && q != t ? 1. : 0.,  q == t && q != v ? 1. : 0.),  o = vec3((m - t) / r,  2. + (t - v) / r,  4. + (v - m) / r);
\r\n        e += dot(o,  L);
\r\n        e *= p;
\r\n        if (e < 0.)\r\n            e += 1.;
\r\n    
}
\r\n    return vec4(e,  i,  G,  s.q);
\r\n
}
\r\nvec4 convertHSLtoRGB(vec4 s)\r\n {
  \r\n    const float v = 1. / 3.,  q = 2. / 3.,  m = 6.;
\r\n    float p = s.s,  t = s.t,  r = s.p;
\r\n    vec3 f = vec3(m * (p - q),  0.,  m * (1. - p));
\r\n    if (p < q)\r\n        f.s = 0.,  f.t = m * (q - p),  f.p = m * (p - v);
\r\n    if (p < v)\r\n        f.s = m * (v - p),  f.t = m * p,  f.p = 0.;
\r\n    f = min(f,  1.);
\r\n    float L = 2. * t,  i = 1. - t,  G = 1. - r,  e = 2. * r - 1.;
\r\n    vec3 c = L * f + i,  o;
\r\n    if (r >= .5)\r\n        o = G * c + e;
\r\n    else\r\n        o = r * c;
\r\n    return vec4(o,  s.q);
\r\n
}
\r\n#endif\r\n\r\nvec4 textureCubeSRGB(samplerCube sampler,  vec3 reflDir)\r\n {
  \r\n    vec4 texel = textureCube(sampler,  reflDir);
\r\n    return texel;
\r\n
}
\r\n\r\nvec4 textureCubeSRGB(samplerCube sampler,  vec3 reflDir,  float lod)\r\n {
  \r\n    vec4 texel = textureCube(sampler,  reflDir,  lod);
\r\n    return texel;
\r\n
}
\r\n\r\nvec4 textureCubeLodSRGB(samplerCube sampler,  vec3 reflDir,  float lod)\r\n {
  \r\n    vec4 texel = textureCubeLodCompat(sampler,  reflDir,  lod);
\r\n    return texel;
\r\n
}
\r\n#ifndef FRESNEL_INC\r\n#define FRESNEL_INC\r\nvec3 FresnelSchlick(vec3 F,  float f,  highp float h)\r\n {
  \r\n    vec3 c = F + (1. - F) * pow(1. - f,  h);
\r\n    return c;
\r\n
}
\r\nvec3 FresnelSchlickRoughness(vec3 f,  float F,  highp float h,  float v)\r\n {
  \r\n    vec3 c = f + (max(vec3(v),  f) - f) * pow(1. - F,  h);
\r\n    return c;
\r\n
}
\r\nfloat FresnelSchlick(float F,  float f,  highp float h)\r\n {
  \r\n    float c = F + (1. - F) * pow(1. - f,  h);
\r\n    return c;
\r\n
}
\r\nfloat FresnelSchlickRoughness(float f,  float F,  highp float h,  float v)\r\n {
  \r\n    float c = f + (max(v,  f) - f) * pow(1. - F,  h);
\r\n    return c;
\r\n
}
\r\nfloat FresnelSchlick(vec3 F,  vec3 f,  float c)\r\n {
  \r\n    float h = max(0.,  dot(F,  f));
\r\n    return c + (1. - c) * pow(1. - h,  5.);
\r\n
}
\r\nfloat Fresnel(vec3 F,  vec3 f,  float c,  float h)\r\n {
  \r\n    float p = 1. - max(0.,  dot(F,  f)),  v = p * p;
\r\n    v = v * v;
\r\n    v = v * p;
\r\n    return clamp(v * (1. - clamp(h,  0.,  1.)) + h - c,  0.,  1.);
\r\n
}
\r\n#endif\r\n\r\nvec3 UnpackCompressedNormal(vec3 U)\r\n {
  \r\n    vec3 v = vec3(U.ps * 255. / 127. - 1.00787,  0.);
\r\n    v.p = sqrt(1. - min(1.,  dot(v.st,  v.st)));
\r\n    v.t = -v.t;
\r\n    return v;
\r\n
}
\r\nvec3 UnpackNormal(vec3 v,  float U)\r\n {
  \r\n    vec3 t;
\r\n#if defined(COMPRESSED_NORMALS)\r\n    t = UnpackCompressedNormal(v);
\r\n#else\r\n    t = v.pst * 255. / 127. - 1.00787;
\r\n    t.t = -t.t;
\r\n#endif\r\n    t.st *= U;
\r\n    return t;
\r\n
}
\r\nvec3 UnpackNormal(vec3 U)  {
   return UnpackNormal(U,  1.);
}
\r\nvec3 UnpackNormal(vec4 v)  {
   return UnpackNormal(v.tpq,  1.);
}
\r\nvec3 UnpackNormal(vec4 v,  float U)  {
   return UnpackNormal(v.tpq,  U);
}
\r\n\r\nconst highp float CAUSTICS_FIXED_POINT_SCALE = 10000.;
\r\n#if defined(CAUSTICS) && !defined(CAUSTICS_COMPUTE) && !defined(CAUSTICS_STENCIL)\r\nfloat CalculateCausticsTerm(highp vec3 u,  float t,  vec3 e)\r\n {
  \r\n    float i = 0.,  s = 0.;
\r\n    if (u.t <= uCausticsPlaneHeight)\r\n        s = step(1.,  t);
\r\n    else\r\n     {
  \r\n#if defined(CAUSTICS_OVERWATER)\r\n        s = clamp(e.t * -1.,  0.,  1.);
\r\n        float d = smoothstep(uCausticsOverWaterFade.s,  uCausticsOverWaterFade.t,  u.t - uCausticsPlaneHeight);
\r\n        s *= 1. - d;
\r\n#else\r\n        return 0.0;
\r\n#endif\r\n    
}
\r\n    if (s > 0.)\r\n     {
  \r\n        highp vec4 C = uCausticsViewProjMatrix * vec4(u,  1.);
\r\n        C.st /= 2. * C.q;
\r\n        vec2 f = abs(C.st);
\r\n        C.st += .5;
\r\n        f = smoothstep(.4,  .5,  f);
\r\n        s *= max(0.,  1. - (f.s + f.t));
\r\n        if (s > 0.)\r\n            i += textureOffset(uCausticsMap,  C.st,  ivec2(-1,  -1)).s,  i += textureOffset(uCausticsMap,  C.st,  ivec2(-1,  0)).s,  i += textureOffset(uCausticsMap,  C.st,  ivec2(-1,  1)).s,  i += textureOffset(uCausticsMap,  C.st,  ivec2(0,  -1)).s,  i += texture2D(uCausticsMap,  C.st).s * 5.,  i += textureOffset(uCausticsMap,  C.st,  ivec2(0,  1)).s,  i += textureOffset(uCausticsMap,  C.st,  ivec2(1,  -1)).s,  i += textureOffset(uCausticsMap,  C.st,  ivec2(1,  0)).s,  i += textureOffset(uCausticsMap,  C.st,  ivec2(1,  1)).s,  i *= s / 12.;
\r\n    
}
\r\n    return i;
\r\n
}
\r\n#endif\r\n#if defined(CAUSTICS_COMPUTE)\r\nvoid WriteCausticsRay(vec3 t,  float i)\r\n {
  \r\n    vec2 s = t.sp * i * uCausticsRefractionScale,  C = (gl_FragCoord.st + s * 2.) / uCausticsComputeResolution * uCausticsMapSize;
\r\n    highp float u = min(uCausticsFade.s / i * uCausticsFade.t,  7. * uCausticsFade.t),  f = smoothstep(uCausticsFade.p,  uCausticsFade.q,  i),  E = f * u * CAUSTICS_FIXED_POINT_SCALE;
\r\n    if (E >= 1.f)\r\n        imageAtomicAdd(uCausticsIntegerMap,  ivec2(C.st),  uint(E));
\r\n
}
\r\n#endif\r\n\r\n#ifndef DEPTH_UTILS_INC\r\n#define DEPTH_UTILS_INC\r\nhighp float GetViewSpaceDepth(highp float v,  highp vec3 G)\r\n {
  \r\n    return G.s / (G.t * v + G.p);
\r\n
}
\r\nhighp vec4 GetViewSpaceDepth(highp vec4 v,  highp vec3 G)  {
   return G.s / (G.t * v + G.p);
}
\r\nhighp vec3 GetViewSpacePos(vec2 v,  highp float G,  highp mat4 f)\r\n {
  \r\n    highp vec4 m = vec4(2. * v - 1.,  2. * G - 1.,  1.),  h = f * m;
\r\n    h.stp /= h.q;
\r\n    return h.stp;
\r\n
}
\r\nhighp vec4 GetWorldSpacePos(vec2 v,  highp float G,  highp mat4 f)\r\n {
  \r\n    highp vec4 m = vec4(2. * v - 1.,  2. * G - 1.,  1.),  h = f * m;
\r\n    h = h / h.q;
\r\n    return h;
\r\n
}
\r\nhighp float GetViewSpaceDepthFromPos(vec3 v,  mat4 G)\r\n {
  \r\n    vec3 h = vec3(G[0][2],  G[1][2],  G[2][2]);
\r\n    return dot(v,  h);
\r\n
}
\r\n#if defined(SAMPLER_2D_AUTO_MULTISAMPLE)\r\nhighp vec3 GetViewSpacePos(vec2 v,  SAMPLER_2D_AUTO_MULTISAMPLE G,  highp mat4 h)\r\n {
  \r\n    highp float m;
\r\n#if defined(VIEWPORTLOOKUPSCALE)\r\n    m = texture2DMultisample(G,  v,  uViewportLookupScale.pq).s;
\r\n#else\r\n    m = texture2DMultisample(G,  v,  textureSize(G)).s;
\r\n#endif\r\n    return GetViewSpacePos(v,  m,  h);
\r\n
}
\r\nhighp vec3 GetViewSpacePos(vec2 v,  vec4 G,  vec2 h,  SAMPLER_2D_AUTO_MULTISAMPLE f,  highp mat4 m)\r\n {
  \r\n    highp float d = texture2DMultisample(f,  v * G.pq + G.st,  h).s;
\r\n    return GetViewSpacePos(v,  d,  m);
\r\n
}
\r\n#endif\r\n#endif\r\n\r\n#ifndef NOISE_UTILS_INC\r\n#define NOISE_UTILS_INC\r\nvec4 permute(vec4 t)\r\n {
  \r\n    return mod((t * 34. + 1.) * t,  289.);
\r\n
}
\r\nvec2 fade(vec2 t)  {
   return t * t * t * (t * (t * 6. - 15.) + 10.);
}
\r\nfloat cnoise(highp vec2 t)\r\n {
  \r\n    highp vec4 v = floor(t.stst) + vec4(0.,  0.,  1.,  1.),  d = fract(t.stst) - vec4(0.,  0.,  1.,  1.);
\r\n    v = mod(v,  289.);
\r\n    vec4 p = v.spsp,  s = v.ttqq,  h = d.spsp,  e = d.ttqq,  f = permute(permute(p) + s),  m = 2. * fract(f * .0243902) - 1.,  c = abs(m) - .5,  q = floor(m + .5);
\r\n    m = m - q;
\r\n    vec2 N = vec2(m.s,  c.s),  r = vec2(m.t,  c.t),  o = vec2(m.p,  c.p),  a = vec2(m.q,  c.q);
\r\n    vec4 G = 1.79284 - .853735 * vec4(dot(N,  N),  dot(o,  o),  dot(r,  r),  dot(a,  a));
\r\n    N *= G.s;
\r\n    o *= G.t;
\r\n    r *= G.p;
\r\n    a *= G.q;
\r\n    float i = dot(N,  vec2(h.s,  e.s)),  n = dot(r,  vec2(h.t,  e.t)),  l = dot(o,  vec2(h.p,  e.p)),  I = dot(a,  vec2(h.q,  e.q));
\r\n    vec2 u = fade(d.st),  S = mix(vec2(i,  l),  vec2(n,  I),  u.s);
\r\n    float g = mix(S.s,  S.t,  u.t);
\r\n    return 2.3 * g;
\r\n
}
\r\nhighp float GetInterleavedGradientNoise(highp vec2 t)  {
   return clamp(fract(52.9829 * fract(.0671106 * t.s + .00583715 * t.t)),  0.,  .999);
}
\r\n#endif\r\n\r\n#ifndef LIGHTING_UTILS_H\r\n#define LIGHTING_UTILS_H\r\n#ifndef LIGHTING_INC\r\n#define LIGHTING_INC\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\n#ifndef FRESNEL_INC\r\n#define FRESNEL_INC\r\nvec3 FresnelSchlick(vec3 F,  float f,  highp float h)\r\n {
  \r\n    vec3 c = F + (1. - F) * pow(1. - f,  h);
\r\n    return c;
\r\n
}
\r\nvec3 FresnelSchlickRoughness(vec3 f,  float F,  highp float h,  float v)\r\n {
  \r\n    vec3 c = f + (max(vec3(v),  f) - f) * pow(1. - F,  h);
\r\n    return c;
\r\n
}
\r\nfloat FresnelSchlick(float F,  float f,  highp float h)\r\n {
  \r\n    float c = F + (1. - F) * pow(1. - f,  h);
\r\n    return c;
\r\n
}
\r\nfloat FresnelSchlickRoughness(float f,  float F,  highp float h,  float v)\r\n {
  \r\n    float c = f + (max(v,  f) - f) * pow(1. - F,  h);
\r\n    return c;
\r\n
}
\r\nfloat FresnelSchlick(vec3 F,  vec3 f,  float c)\r\n {
  \r\n    float h = max(0.,  dot(F,  f));
\r\n    return c + (1. - c) * pow(1. - h,  5.);
\r\n
}
\r\nfloat Fresnel(vec3 F,  vec3 f,  float c,  float h)\r\n {
  \r\n    float p = 1. - max(0.,  dot(F,  f)),  v = p * p;
\r\n    v = v * v;
\r\n    v = v * p;
\r\n    return clamp(v * (1. - clamp(h,  0.,  1.)) + h - c,  0.,  1.);
\r\n
}
\r\n#endif\r\n\r\n#ifndef BRDF_INC\r\n#define BRDF_INC\r\n#ifndef NDF_INC\r\n#define NDF_INC\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
\r\nfloat SpecPowToBeckmannRoughness(float f)  {
   return sqrt(2. / (f + 2.));
}
\r\nfloat PerceptualRoughnessToRoughness(float f)  {
   return f * f;
}
\r\nfloat RoughnessToPerceptualRoughness(float f)  {
   return sqrt(f);
}
\r\n#endif\r\n\r\nfloat BlinnPhongNDF(float f,  float N)\r\n {
  \r\n    return (f + 2.) * INV_EIGHT * pow(N,  f);
\r\n
}
\r\nfloat GGXTrowbridgeReitzNDF(float N,  float f)\r\n {
  \r\n    float P = N * N,  I = f * f,  T = I * (P - 1.) + 1.;
\r\n    return P / (PI * (T * T + .0001));
\r\n
}
\r\nfloat BeckmannNDF(float N,  float f)\r\n {
  \r\n    float P = N * N,  I = f * f;
\r\n    return exp((I - 1.) / (P * I)) / (PI * P * (I * I));
\r\n
}
\r\n#endif\r\n\r\n#ifndef VISIBILITY_FUNC_INC\r\n#define VISIBILITY_FUNC_INC\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
\r\nfloat SpecPowToBeckmannRoughness(float f)  {
   return sqrt(2. / (f + 2.));
}
\r\nfloat PerceptualRoughnessToRoughness(float f)  {
   return f * f;
}
\r\nfloat RoughnessToPerceptualRoughness(float f)  {
   return sqrt(f);
}
\r\n#endif\r\n\r\nfloat SchlickSmithVis(float V,  float f,  float S)\r\n {
  \r\n    float P = 1. / sqrt(PI_OVER_4 * V + PI_OVER_2),  d = 1. - P,  v = (f * d + P) * (S * d + P);
\r\n    return 1. / (v + .0001);
\r\n
}
\r\nfloat KelemenSzirmayKalosVis(vec3 V,  vec3 P)\r\n {
  \r\n    vec3 f = V + P;
\r\n    return 4. / max(0.,  dot(f,  f));
\r\n
}
\r\n#endif\r\n\r\n#define GGX_NDF\r\n#define SCHLICK_SMITH_VIS\r\nvec3 CookTorranceBRDF(float d,  float S,  vec3 n,  vec3 v,  vec3 f,  vec3 B,  vec3 R,  float F)\r\n {
  \r\n    float m = max(0.,  dot(v,  f)),  r = 1.;
\r\n#if defined(BLINN_PHONG_NDF)\r\n    r = BlinnPhongNDF(d,  m);
\r\n#elif defined(GGX_NDF)\r\n    r = GGXTrowbridgeReitzNDF(PerceptualRoughnessToRoughness(S),  m);
\r\n#elif defined(BECKMANN_NDF)\r\n    r = max(0.f,  BeckmannNDF(SpecPowToBeckmannRoughness(d),  m));
\r\n#else\r\n\r\n#error CookTorranceBRDF normal distribution function not specified\r\n\r\n#endif\r\n    float C = 1.;
\r\n#if defined(SCHLICK_SMITH_VIS)\r\n    C = SchlickSmithVis(d,  F,  max(0.,  dot(v,  B)));
\r\n#elif defined(KELEMEN_SZIRMAY_KALOS_VIS)\r\n    C = KelemenSzirmayKalosVis(R,  B);
\r\n#endif\r\n    return n * (r * C);
\r\n
}
\r\nfloat RunescapeLegacyBRDF(vec3 d,  vec3 v,  vec3 f,  float B,  float S)\r\n {
  \r\n    vec3 n = reflect(-d,  f);
\r\n    float C = pow(max(0.,  dot(n,  v)),  B);
\r\n    return C * S;
\r\n
}
\r\nfloat RunescapeRT5BRDF(vec3 d,  vec3 v,  float S)  {
   return BlinnPhongNDF(S,  max(0.,  dot(d,  v)));
}
\r\nvec3 ShiftTangent(vec3 d,  vec3 S,  float B)  {
   return normalize(d + B * S);
}
\r\nvec3 AnisotropicBRDF(vec3 v,  vec3 d,  vec3 S,  vec3 f,  vec3 B,  float n,  float m,  float R,  float C)\r\n {
  \r\n    const float F = 7.5,  r = 1.,  e = .5,  o = 1.;
\r\n    float s = R - .5;
\r\n    S = ShiftTangent(S,  d,  e + (C * 2. - 1.) * o + s);
\r\n    float p = abs(dot(S,  f)),  a = 1. - p,  t = 1. - abs(dot(S,  B)),  K = p * dot(d,  B);
\r\n    K += a * t;
\r\n    K = pow(K,  F) * n;
\r\n    K = mix(K,  K * C,  o);
\r\n    float G = pow(dot(d,  v),  m),  P = mix(G,  K,  r);
\r\n    return vec3(P,  P,  P);
\r\n
}
\r\n#endif\r\n\r\nstruct LightingTerms\r\n {
  \r\n    vec3 Diffuse;
\r\n    vec3 Specular;
\r\n
}
;
\r\nvoid ClearLightingTerms(inout LightingTerms v)  {
   v.Diffuse = vec3(0.,  0.,  0.),  v.Specular = vec3(0.,  0.,  0.);
}
\r\nvoid AddLightingTerms(inout LightingTerms v,  LightingTerms L)  {
   v.Diffuse += L.Diffuse,  v.Specular += L.Specular;
}
\r\nvoid EvaluateDirLightRT5(inout LightingTerms v,  vec3 f,  vec3 L,  vec3 d,  vec3 i,  float S,  float c,  float F,  float e,  float E,  vec3 A)\r\n {
  \r\n    v.Diffuse += A * e;
\r\n#if defined(SPECULAR_LIGHTING)\r\n    vec3 G = normalize(d + i);
\r\n    float r = FresnelSchlick(S,  clamp(dot(i,  G),  0.,  1.),  F);
\r\n#if defined(ANISOTROPY_BRDF)\r\n    vec3 D = AnisotropicBRDF(G,  f,  L,  i,  d,  E,  c,  .5,  .5);
\r\n#else\r\n    vec3 n = vec3(r) * vec3(RunescapeRT5BRDF(G,  f,  c));
\r\n#endif\r\n    n *= A * e;
\r\n    v.Specular += n;
\r\n#endif\r\n
}
\r\nvoid EvaluateDirLightRT7(inout LightingTerms v,  vec3 f,  vec3 L,  vec3 d,  vec3 i,  vec3 S,  float c,  float E,  float G,  float e,  float F,  vec3 A)\r\n {
  \r\n    v.Diffuse += A * e;
\r\n#if defined(SPECULAR_LIGHTING)\r\n    vec3 r = normalize(d + i),  n = FresnelSchlick(S,  clamp(dot(i,  r),  0.,  1.),  G);
\r\n#if defined(ANISOTROPY_BRDF)\r\n    vec3 D = AnisotropicBRDF(r,  f,  L,  i,  d,  F,  c,  .5,  .5);
\r\n#else\r\n    vec3 C = CookTorranceBRDF(c,  E,  n,  f,  r,  d,  i,  F);
\r\n#endif\r\n    C *= A * e;
\r\n    v.Specular += C;
\r\n#endif\r\n
}
\r\nfloat SpecularHorizonOcclusion(float L,  vec3 i,  vec3 v)\r\n {
  \r\n    vec3 d = reflect(i,  v);
\r\n    float A = clamp(1. + L * dot(d,  v),  0.,  1.);
\r\n    A *= A;
\r\n    return A;
\r\n
}
\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\n#endif\r\n\r\n#if !defined(DEFERRED_SHADOWS)\r\nLightingTerms EvaluateSunlightRT5(inout int i,  inout float E,  highp vec4 v,  vec3 u,  vec3 f,  float d,  vec3 n,  float p,  float S,  float r)\r\n {
  \r\n    float t = max(0.,  dot(u,  uInvSunDirection)),  L = t;
\r\n    E = 1.;
\r\n#if defined(SUNLIGHT_SHADOWS)\r\n    if (S == 0. && uMappingParams.p != 0.)\r\n     {
  \r\n        if (L > 0.)\r\n         {
  \r\n            highp vec4 h = uSunlightViewMatrix * v,  e = vec4(u.st,  0.,  0.) * 32.;
\r\n            E = DirLightShadowAtten(i,  v + e,  h + e,  d,  uSunlightShadowMap,  uSunlightShadowTranslucencyMap,  r);
\r\n        
}
\r\n    
}
\r\n#endif\r\n    L *= E;
\r\n    float h = .65;
\r\n    LightingTerms D;
\r\n    ClearLightingTerms(D);
\r\n    EvaluateDirLightRT5(D,  u,  f,  n,  uInvSunDirection,  h,  p,  5.,  L,  t,  uSunColour);
\r\n    return D;
\r\n
}
\r\n#else\r\nLightingTerms EvaluateSunlightRT5(inout float E,  vec3 u,  vec3 v,  vec3 f,  vec2 d,  float n,  float S)\r\n {
  \r\n    float t = max(0.,  dot(u,  uInvSunDirection)),  L = t;
\r\n    E = 1.;
\r\n#if defined(SUNLIGHT_SHADOWS) && defined(DEFERRED_SHADOWS)\r\n    if (S == 0. && uMappingParams.p != 0.)\r\n        E = texture2DLod(uShadowBuffer,  d,  0.).s;
\r\n#endif\r\n    L *= E;
\r\n    float h = .65;
\r\n    LightingTerms D;
\r\n    ClearLightingTerms(D);
\r\n    EvaluateDirLightRT5(D,  u,  v,  f,  uInvSunDirection,  h,  n,  5.,  L,  uSunColour);
\r\n    return D;
\r\n
}
\r\n#endif\r\n#if !defined(DEFERRED_SHADOWS)\r\nLightingTerms EvaluateSunlightRT7(inout int u,  inout float E,  highp vec4 v,  vec3 f,  vec3 d,  float n,  vec3 h,  vec3 L,  float p,  float i,  float t,  float S)\r\n {
  \r\n    float D = max(0.,  dot(f,  uInvSunDirection)),  e = D;
\r\n    E = 1.;
\r\n#if defined(SUNLIGHT_SHADOWS)\r\n    if (uMappingParams.p != 0.)\r\n     {
  \r\n        if (D > 0.)\r\n         {
  \r\n            highp vec4 r = uSunlightViewMatrix * v,  a = vec4(f.st,  0.,  0.) * 32.;
\r\n            E = DirLightShadowAtten(u,  v + a,  r + a,  n,  uSunlightShadowMap,  uSunlightShadowTranslucencyMap,  S);
\r\n        
}
\r\n    
}
\r\n#endif\r\n    e *= E;
\r\n    LightingTerms r;
\r\n    ClearLightingTerms(r);
\r\n    EvaluateDirLightRT7(r,  f,  d,  h,  uInvSunDirection,  L,  p,  i,  t,  e,  D,  uSunColour);
\r\n    return r;
\r\n
}
\r\n#else\r\nLightingTerms EvaluateSunlightRT7(inout float E,  vec3 u,  vec3 v,  vec3 f,  vec2 d,  vec3 n,  float h,  float L,  float r)\r\n {
  \r\n    float t = max(0.,  dot(u,  uInvSunDirection)),  p = t;
\r\n    E = 1.;
\r\n#if defined(SUNLIGHT_SHADOWS) && defined(DEFERRED_SHADOWS)\r\n    if (uMappingParams.p != 0.)\r\n        E = texture2DLod(uShadowBuffer,  d,  0.).s;
\r\n#endif\r\n    LightingTerms D;
\r\n    ClearLightingTerms(D);
\r\n    EvaluateDirLightRT7(D,  u,  v,  f,  uInvSunDirection,  n,  h,  L,  r,  t,  p,  uSunColour);
\r\n    return D;
\r\n
}
\r\n#endif\r\n#endif\r\n\r\n#ifndef DISTANCE_FOG_UNIFORMS\r\n#define DISTANCE_FOG_UNIFORMS\r\n#if defined(FOG_DISTANCE)\r\nUNIFORM_BUFFER_BEGIN(DistanceFog)\r\nuniform mediump vec4 uFogColour;
\r\nuniform highp vec4 uFogParams;
\r\nUNIFORM_BUFFER_END\r\n#endif\r\n#endif\r\n\r\n#ifndef DISTANCE_FOG_FUNCTIONS\r\n#define DISTANCE_FOG_FUNCTIONS\r\n#if defined(FOG_DISTANCE)\r\nfloat FogBasedOnDistance(highp float f)\r\n {
  \r\n    highp float F = (uFogParams.t - f) * uFogParams.s;
\r\n    return 1. - clamp(F,  0.,  1.);
\r\n
}
\r\nfloat FogBasedOnAngle(highp vec3 f)\r\n {
  \r\n    highp float F = 1. - clamp(f.t + uFogParams.q,  0.,  1.);
\r\n    F = pow(F,  uFogParams.p);
\r\n    return clamp(F,  0.,  1.);
\r\n
}
\r\n#endif\r\n#endif\r\n\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\nfloat GenerateNoise()\r\n {
  \r\n    const float d = 512.,  v = .125;
\r\n    return clamp(cnoise(vPosition_WaterDepth.sp / d) * v,  0.,  1.);
\r\n
}
\r\nvec2 GetCombinedFlow()  {
   return vNoisyPatchFlow0_NoisyPatchFlow1.st * vFlowControlMask_ViewSpaceDepth.s + vNoisyPatchFlow0_NoisyPatchFlow1.pq * vFlowControlMask_ViewSpaceDepth.t + vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.st * vFlowControlMask_ViewSpaceDepth.p;
}
\r\n#if defined(WATER_NORMAL_MAPS)\r\nvec4 WeightedNormalMap_XY_DXDY(highp float v,  sampler2D d,  vec2 f,  vec2 p,  float E)\r\n {
  \r\n    if (v <= 0.)\r\n        return vec4(0.);
\r\n    vec3 u = UnpackNormal(texture2D(d,  f));
\r\n    vec2 t = u.st / u.p;
\r\n    const float W = 6.;
\r\n    float q = clamp(length(p) * W + uWaterStillWaterNormalStrength_spareyzw.s,  0.,  1.);
\r\n    return vec4(u.st,  t * q) * v * E;
\r\n
}
\r\nvec2 GetNormalDXDYWeightedSum(highp vec4 d,  highp vec4 v,  highp vec4 u,  vec2 f,  vec2 p,  vec2 t,  vec2 W,  float E)\r\n {
  \r\n    vec4 h = vec4(0.);
\r\n    h += WeightedNormalMap_XY_DXDY(d.s,  uWaterNormalMapTexture0,  f,  W,  1.);
\r\n    p += h.st * v.t * E;
\r\n    h += WeightedNormalMap_XY_DXDY(v.s,  uWaterNormalMapTexture1,  p,  W,  1.);
\r\n    t += h.st * u.t * E;
\r\n    h += WeightedNormalMap_XY_DXDY(u.s,  uWaterNormalMapTexture2,  t,  W,  1.);
\r\n    return h.pq;
\r\n
}
\r\nvec3 WaterDetailNormalWeightedSum(vec2 v,  vec2 p,  vec2 d,  vec2 f,  vec3 h)\r\n {
  \r\n    const float u = .5;
\r\n    vec2 t = v + h.st * u * uSampleWeight_uvDistortion_sparezw[0].t,  q = p + h.st * u * uSampleWeight_uvDistortion_sparezw[1].t,  s = d + h.st * u * uSampleWeight_uvDistortion_sparezw[2].t;
\r\n    const float E = .8;
\r\n    vec2 W = GetNormalDXDYWeightedSum(uSampleWeight_uvDistortion_sparezw[0],  uSampleWeight_uvDistortion_sparezw[1],  uSampleWeight_uvDistortion_sparezw[2],  t,  q,  s,  f,  E);
\r\n    return normalize(vec3(W,  1.));
\r\n
}
\r\n#if !defined(GLES2_COMPAT_MODE)\r\nvec3 WaterMacroNormalWeightedSum()\r\n {
  \r\n    const float d = .25;
\r\n    const vec2 v = vec2(.1,  -.13) * d;
\r\n    const float f = .1;
\r\n    vec2 p = GetNormalDXDYWeightedSum(uMacroSampleWeight_uvDistortion_sparezw[0],  uMacroSampleWeight_uvDistortion_sparezw[1],  uMacroSampleWeight_uvDistortion_sparezw[2],  vUVPack_NormalMapMacroUV_EmissiveUV[0].st,  vUVPack_NormalMapMacroUV_EmissiveUV[1].st,  vUVPack_NormalMapMacroUV_EmissiveUV[2].st,  v,  f);
\r\n    return normalize(vec3(p,  1.));
\r\n
}
\r\n#else\r\nvec3 WaterMacroNormalWeightedSum()\r\n {
  \r\n    const float d = .25;
\r\n    const vec2 v = vec2(.1,  -.13) * d;
\r\n    const float f = .1,  p = .1;
\r\n    vec2 W = vPosition_WaterDepth.sp * uWaterNormalMapTextureScales_FlowNoiseScale.s * p,  u = vPosition_WaterDepth.sp * uWaterNormalMapTextureScales_FlowNoiseScale.t * p,  t = vPosition_WaterDepth.sp * uWaterNormalMapTextureScales_FlowNoiseScale.p * p;
\r\n    const float E = .01;
\r\n    vec2 q = vec2(.1,  -.13),  s = vec2(-.08,  .1),  r = vec2(.11,  -.9);
\r\n    const float n = .5;
\r\n    highp float m = uWaterTickFade.s * n;
\r\n    vec2 h = W + q * d * m,  e = u + s * d * m,  c = t + r * d * m,  G = GetNormalDXDYWeightedSum(uMacroSampleWeight_uvDistortion_sparezw[0],  uMacroSampleWeight_uvDistortion_sparezw[1],  uMacroSampleWeight_uvDistortion_sparezw[2],  h,  e,  c,  v,  f);
\r\n    return normalize(vec3(G,  1.));
\r\n
}
\r\n#endif\r\nvec3 WaterNormal()\r\n {
  \r\n    vec3 v = WaterMacroNormalWeightedSum(),  u = vec3(0.);
\r\n    vec2 f = vNoisyPatchFlow0_NoisyPatchFlow1.pq - vNoisyPatchFlow0_NoisyPatchFlow1.st,  p = vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.st - vNoisyPatchFlow0_NoisyPatchFlow1.st,  t = vec2(0.,  0.),  q = vec2(0.,  0.),  s = vec2(0.,  0.),  W = vec2(0.,  0.),  r = vec2(0.,  0.),  c = vec2(0.,  0.),  i = vec2(0.,  0.),  h = vec2(0.,  0.),  e = vec2(0.,  0.);
\r\n#if !defined(GLES2_COMPAT_MODE)\r\n    t = vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.pq;
\r\n    q = vUVPack_NormalsFlow0Map1_NormalsFlow0Map2.st;
\r\n    s = vUVPack_NormalsFlow0Map1_NormalsFlow0Map2.pq;
\r\n    W = vUVPack_NormalsFlow1Map0_NormalsFlow1Map1.st;
\r\n    r = vUVPack_NormalsFlow1Map0_NormalsFlow1Map1.pq;
\r\n    c = vUVPack_NormalsFlow1Map2_NormalsFlow2Map0.st;
\r\n    i = vUVPack_NormalsFlow1Map2_NormalsFlow2Map0.pq;
\r\n    h = vUVPack_NormalsFlow2Map1_NormalsFlow2Map2.st;
\r\n    e = vUVPack_NormalsFlow2Map1_NormalsFlow2Map2.pq;
\r\n#else\r\n    vec2 d = vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.pq,  m = vUVPack_NormalsFlow1Map0_NormalsFlow2Map0.st,  E = vUVPack_NormalsFlow1Map0_NormalsFlow2Map0.pq;
\r\n    t = d;
\r\n    q = d * vec2(-.96,  .95);
\r\n    s = d * vec2(.97,  -.94);
\r\n    W = m;
\r\n    r = m * vec2(-.96,  .95);
\r\n    c = m * vec2(.97,  -.94);
\r\n    i = E;
\r\n    h = E * vec2(-.96,  .95);
\r\n    e = E * vec2(.97,  -.94);
\r\n#endif\r\n    const float G = 1e-07;
\r\n    if (dot(f,  f) <= G && dot(p,  p) <= G)\r\n        u = WaterDetailNormalWeightedSum(t,  q,  s,  vNoisyPatchFlow0_NoisyPatchFlow1.st,  v) + v;
\r\n    else\r\n        u += (WaterDetailNormalWeightedSum(t,  q,  s,  vNoisyPatchFlow0_NoisyPatchFlow1.st,  v) + v) * vFlowControlMask_ViewSpaceDepth.s,  u += (WaterDetailNormalWeightedSum(W,  r,  c,  vNoisyPatchFlow0_NoisyPatchFlow1.pq,  v) + v) * vFlowControlMask_ViewSpaceDepth.t,  u += (WaterDetailNormalWeightedSum(i,  h,  e,  vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.st,  v) + v) * vFlowControlMask_ViewSpaceDepth.p;
\r\n    return normalize(u).spt;
\r\n
}
\r\n#else\r\nvec3 WaterNormal()\r\n {
  \r\n    return vec3(0.,  1.,  0.);
\r\n
}
\r\n#endif\r\nvec3 WaterAlbedo(float v,  float d,  float E)\r\n {
  \r\n    vec3 f = vColour.stp;
\r\n#if defined(WATER_FOAM_MAP)\r\n    float p = uWaterFoamScaleFoamDepth.t,  u = clamp((1. - step(p,  0.)) * min(1.,  1. - min(v / p,  1.)),  0.,  1.),  q = uWaterTickFade.s + vPosition_WaterDepth.s * .0001 + vPosition_WaterDepth.p * .0001,  t = pow(max(0.,  cos(abs(v) * .005 + q + E * 4.)),  8.),  s = pow(max(0.,  cos(abs(v) * .005 - q + E * 8.)),  4.),  r = min(1.,  t + s * u) * max(.2 - d,  0.);
\r\n#if !defined(GLES2_COMPAT_MODE)\r\n    vec4 h = texture2D(uWaterTextureFoam,  vUVPack_FoamUV.st) * uWaterFoamScaleFoamDepth.s;
\r\n    vec3 W = h.stp * h.q;
\r\n    f = mix(vColour.stp,  W,  r * u);
\r\n#else\r\n    f = vColour.stp;
\r\n#endif\r\n\r\n#endif\r\n    return f;
\r\n
}
\r\nfloat WaterSoftEdgeAlpha(float v)\r\n {
  \r\n    const float p = .004,  u = 1.;
\r\n    float f;
\r\n#if defined(WATER_EXTINCTION)\r\n    const float d = .002;
\r\n    float W = uWaterExtinctionVisibilityMetres / d,  t = p + 1. / (W + .001),  s = pow(v * t,  u);
\r\n    f = clamp(s,  0.,  1.);
\r\n#else\r\n    float q = pow(v * p,  u);
\r\n    f = clamp(q,  0.,  1.);
\r\n#endif\r\n    return f;
\r\n
}
\r\nfloat SunLightShadowAttenuation(vec3 d,  vec3 p,  vec2 v,  vec3 f,  float E)\r\n {
  \r\n    float W = 1.;
\r\n#if defined(SUNLIGHT_SHADOWS)\r\n    int u = -1;
\r\n    vec4 t = uSunlightViewMatrix * vec4(vPosition_WaterDepth.stp,  1.);
\r\n    W = DirLightShadowAtten(u,  vec4(vPosition_WaterDepth.stp,  1.) + vec4(v,  0.,  0.),  t + vec4(v,  0.,  0.),  vFlowControlMask_ViewSpaceDepth.q,  uSunlightShadowMap,  uSunlightShadowTranslucencyMap,  1.);
\r\n#endif\r\n    return W;
\r\n
}
\r\nvec3 SunLightDiffuseContribution(vec3 v,  vec3 d,  vec2 p,  vec3 f,  float E,  float u)\r\n {
  \r\n    vec3 r = vec3(0.);
\r\n#if defined(SUNLIGHT_DIRECT_LIGHTING)\r\n    r = v * (dot(d,  uInvSunDirection) * .5 + .5) * (1. - E) * uSunColour;
\r\n#else\r\n    const float W = 2.;
\r\n    r = v * W;
\r\n#endif\r\n    return r * u;
\r\n
}
\r\nvec3 SunLightSpecularContribution(vec3 d,  vec3 v,  vec2 p,  vec3 f,  float t,  float E)\r\n {
  \r\n    vec3 W = vec3(0.);
\r\n#if defined(SPECULAR_LIGHTING)\r\n    vec3 u = normalize(uInvSunDirection - f);
\r\n    float q = clamp(dot(u,  v),  0.,  1.);
\r\n    W = uSunColour * uSunColour * t * clamp(uInvSunDirection.t,  0.,  1.) * pow(q,  uWaterNormalBRDFParams.p * .25) * (uWaterNormalBRDFParams.q * 1.8 + .2) * clamp(uWaterNormalBRDFParams.q - .05,  0.,  1.) * 25.;
\r\n#endif\r\n    return W * E;
\r\n
}
\r\n#if defined(GLOBAL_ENVIRONMENTMAPPING)\r\nvec3 GetEnvironmentMapReflection(vec3 v,  vec3 f)\r\n {
  \r\n    vec3 u = reflect(v,  f);
\r\n    u.p = -u.p;
\r\n    u.t = abs(u.t);
\r\n    vec3 d = textureCubeSRGB(uGlobalEnvironmentMap,  u).stp;
\r\n#if defined(FOG_DISTANCE)\r\n    float E = FogBasedOnAngle(normalize(reflect(v,  f)));
\r\n    d = mix(d.stp,  uFogColour.stp,  E);
\r\n#endif\r\n    return d;
\r\n
}
\r\n#endif\r\nvec3 EnvMapContribution(vec3 v,  vec3 f,  vec3 d,  float E)\r\n {
  \r\n    vec3 W = vec3(0.);
\r\n    float u = 1.;
\r\n#if defined(GLOBAL_ENVIRONMENTMAPPING)\r\n\r\n#if defined(REFLECTION)\r\n    u = uWaterReflectionStrength;
\r\n    if (uWaterReflectionMapContribution < 1.)\r\n#endif\r\n     {
  \r\n        vec3 t = GetEnvironmentMapReflection(d,  f);
\r\n#if defined(REFLECTION)\r\n        t *= 1. - uWaterReflectionMapContribution;
\r\n#endif\r\n        W = t * mix(v,  vec3(1.,  1.,  1.),  E);
\r\n    
}
\r\n#endif\r\n    return W * u;
\r\n
}
\r\nvec3 WaterReflection(vec3 v,  vec3 f,  vec2 d,  vec3 p,  float E)\r\n {
  \r\n    vec3 W = vec3(0.);
\r\n#if defined(REFLECTION)\r\n    vec2 u = uViewportOffsetScale.st * uFullScreenLookupScale.pq,  h = gl_FragCoord.st + d;
\r\n    h = (h - u) * uViewportLookupScale.st;
\r\n    vec4 r = texture2DLodCompat(uReflectionMap,  vec2(1. - h.s,  h.t),  0.);
\r\n    if (r.q < 1.)\r\n     {
  \r\n        h = gl_FragCoord.st;
\r\n        h = (h - u) * uViewportLookupScale.st;
\r\n        r = texture2DLodCompat(uReflectionMap,  vec2(1. - h.s,  h.t),  0.);
\r\n#if defined(GLOBAL_ENVIRONMENTMAPPING)\r\n        if (r.q == 0.)\r\n            r.stp = GetEnvironmentMapReflection(p,  f),  r.q = 1.;
\r\n#endif\r\n    
}
\r\n    W = r.stp * mix(v,  vec3(1.),  E) * uWaterReflectionMapContribution * uWaterReflectionStrength;
\r\n#endif\r\n    return W;
\r\n
}
\r\nvec3 WaterExtinction(vec3 v,  vec3 d,  float f,  vec2 p,  vec3 W,  float E)\r\n {
  \r\n    vec3 t = d;
\r\n#if defined(WATER_EXTINCTION) && defined(REFRACTION)\r\n    const float u = .002;
\r\n    if (uWaterFeatureFlags.t >= 1.)\r\n     {
  \r\n        vec3 h = GetWorldSpacePos(p,  f,  uSceneInvViewProjMatrix).stp;
\r\n        float r = length(h - vPosition_WaterDepth.stp) * u;
\r\n        highp float q = abs(h.t - vPosition_WaterDepth.t) * u,  s = mix(.04,  1.,  clamp(uWaterExtinctionVisibilityMetres,  0.,  1.));
\r\n        vec3 m = W / v,  c = v / max(max(v.s,  v.t),  v.p),  n = m * c,  e = uWaterExtinctionOpaqueWaterColour * n;
\r\n        float G = clamp(r / uWaterExtinctionVisibilityMetres,  0.,  1.),  S = pow(G,  s);
\r\n        vec3 i = mix(d,  e,  S);
\r\n        const float N = .25;
\r\n        vec3 C = clamp(q / (uWaterExtinctionRGBDepthMetres * c),  0.,  1.),  P = pow(C,  vec3(N));
\r\n        t = i * (1. - P);
\r\n        t = mix(d,  t,  E);
\r\n    
}
\r\n#endif\r\n    return t;
\r\n
}
\r\nvec3 WaterRefractionWithExtinction(vec3 v,  vec3 d,  float p,  float t,  vec3 f,  float u)\r\n {
  \r\n    vec3 W = vec3(0.);
\r\n#if defined(REFRACTION)\r\n    vec2 E = uViewportOffsetScale.st * uFullScreenLookupScale.pq;
\r\n    vec3 q = vec3(0.);
\r\n    float r = 0.;
\r\n    highp vec2 h = d.sp * min(sqrt(p) * u * 2.,  128.);
\r\n    vec2 s = gl_FragCoord.st + h * t * 2.;
\r\n    s = (s - E) * uViewportLookupScale.st;
\r\n    if (uWaterFeatureFlags.s >= 1.)\r\n     {
  \r\n#if !defined(NXT_MOBILE)\r\n        r = texture2DLodCompat(uRefractionDepth,  s,  0.).s;
\r\n        if (r < gl_FragCoord.p || r >= 1.)\r\n            s = gl_FragCoord.st,  s = (s - E) * uViewportLookupScale.st;
\r\n#endif\r\n        q = texture2DLodCompat(uRefractionMap,  vec3(s,  0.),  0.).stp;
\r\n    
}
\r\n    W = WaterExtinction(v,  q,  r,  s,  f,  u);
\r\n#endif\r\n    return W;
\r\n
}
\r\n#if defined(WATER_EMISSIVE) && !defined(GLES2_COMPAT_MODE)\r\n#define EMISSIVE_MAP_MASK (0)\r\n#define EMISSIVE_MAP_RGBMAP_MASK (1)\r\nvec4 SampleEmissiveMap(sampler2D v,  vec2 E)\r\n {
  \r\n    vec2 u = vUVPack_NormalMapMacroUV_EmissiveUV[1].pq - vUVPack_NormalMapMacroUV_EmissiveUV[0].pq,  p = vUVPack_NormalMapMacroUV_EmissiveUV[2].pq - vUVPack_NormalMapMacroUV_EmissiveUV[0].pq;
\r\n    const float W = 1e-07;
\r\n    if (dot(u,  u) <= W && dot(p,  p) <= W)\r\n        return texture2D(v,  vUVPack_NormalMapMacroUV_EmissiveUV[0].pq + E);
\r\n    else\r\n     {
  \r\n        vec4 f = texture2D(v,  vUVPack_NormalMapMacroUV_EmissiveUV[0].pq + E) * vFlowControlMask_ViewSpaceDepth.s;
\r\n        f += texture2D(v,  vUVPack_NormalMapMacroUV_EmissiveUV[1].pq + E) * vFlowControlMask_ViewSpaceDepth.t;
\r\n        f += texture2D(v,  vUVPack_NormalMapMacroUV_EmissiveUV[2].pq + E) * vFlowControlMask_ViewSpaceDepth.p;
\r\n        return f;
\r\n    
}
\r\n
}
\r\nvec4 EmissiveContribution_Mask(vec3 v,  vec2 f)\r\n {
  \r\n    float E = SampleEmissiveMap(uWaterEmissiveMapTexture,  f).s;
\r\n    vec3 d = mix(v,  uWaterEmissiveColourEmissiveSource.stp,  uWaterEmissiveColourEmissiveSource.q);
\r\n    float W = uEmissiveScale_MapRefractionDepth_EmissiveMapMode_EmissiveMapExists.s;
\r\n    return vec4(d * (1. + W),  E);
\r\n
}
\r\nvec4 EmissiveContribution_RGBMapMask(vec3 v,  vec2 f)\r\n {
  \r\n    vec4 h = SampleEmissiveMap(uWaterEmissiveMapTexture,  f);
\r\n    vec3 d = mix(v,  h.stp * uWaterEmissiveColourEmissiveSource.stp,  uWaterEmissiveColourEmissiveSource.q);
\r\n    float E = uEmissiveScale_MapRefractionDepth_EmissiveMapMode_EmissiveMapExists.s;
\r\n    return vec4(d * (1. + E),  h.q);
\r\n
}
\r\nvec4 EmissiveContribution_NoMap(vec3 v)\r\n {
  \r\n    vec3 d = mix(v,  uWaterEmissiveColourEmissiveSource.stp,  uWaterEmissiveColourEmissiveSource.q);
\r\n    float E = uEmissiveScale_MapRefractionDepth_EmissiveMapMode_EmissiveMapExists.s;
\r\n    return vec4(d * (1. + E),  1.);
\r\n
}
\r\nvec4 EmissiveContribution(vec3 v,  vec3 d,  float E)\r\n {
  \r\n    int W = int(uEmissiveScale_MapRefractionDepth_EmissiveMapMode_EmissiveMapExists.q);
\r\n    if (W == 0)\r\n        return EmissiveContribution_NoMap(v);
\r\n    vec2 f = d.sp * uEmissiveScale_MapRefractionDepth_EmissiveMapMode_EmissiveMapExists.t * E * 2.;
\r\n    int u = int(uEmissiveScale_MapRefractionDepth_EmissiveMapMode_EmissiveMapExists.p);
\r\n    if (u == EMISSIVE_MAP_MASK)\r\n        return EmissiveContribution_Mask(v,  f);
\r\n    else\r\n        return EmissiveContribution_RGBMapMask(v,  f);
\r\n
}
\r\n#endif\r\n#if (defined(SUNLIGHT_SHADOWS) && defined(DEBUG_SUNLIGHT_SHADOW_CASCADE) && !defined(DEFERRED_SHADOWS)) || defined(DEBUG_ALBEDO) || defined(DEBUG_NORMALS)\r\n#define WATER_DEBUG_OUTPUT\r\n#endif\r\n#if defined(WATER_DEBUG_OUTPUT)\r\nvoid WaterWriteDebugColour(vec3 v,  vec3 d)\r\n {
  \r\n#if defined(DEBUG_ALBEDO)\r\n    gl_FragColor = vec4(v,  1.);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(DEBUG_NORMALS)\r\n    gl_FragColor = vec4(d * .5 + .5,  1.);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(SUNLIGHT_SHADOWS) && defined(DEBUG_SUNLIGHT_SHADOW_CASCADE) && !defined(DEFERRED_SHADOWS)\r\n    gl_FragColor = vec4(ShadowMapCascadeColour(iCascade,  int(uMappingParams.q)).stp,  1.);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n
}
\r\n#endif\r\nvoid WaterFragment()\r\n {
  \r\n    vec3 v = vPosition_WaterDepth.stp - uCameraPosition;
\r\n    float d = length(v);
\r\n    vec3 f = v / d;
\r\n    vec2 u = GetCombinedFlow();
\r\n    float p = length(u),  E = GenerateNoise();
\r\n    vec3 W = WaterAlbedo(vPosition_WaterDepth.q,  p,  E),  h = WaterNormal();
\r\n    vec2 t = h.sp * min(vPosition_WaterDepth.q,  32.);
\r\n    float q = WaterSoftEdgeAlpha(vPosition_WaterDepth.q);
\r\n    vec4 r = vec4(0.);
\r\n    r.q = q;
\r\n    const float s = .28,  e = 0.,  c = .6;
\r\n    float G = clamp(FresnelSchlick(h,  -f,  s),  e,  c),  S = clamp(G + uWaterNormalBRDFParams.s,  e,  c);
\r\n    r.q *= G;
\r\n    r.stp += WaterReflection(W,  h,  t,  f,  S);
\r\n    r.stp += EnvMapContribution(W,  h,  f,  S);
\r\n    float N = SunLightShadowAttenuation(W,  h,  t,  f,  G);
\r\n    vec3 m = SunLightDiffuseContribution(W,  h,  t,  f,  G,  N),  n = SunLightSpecularContribution(W,  h,  t,  f,  S,  N);
\r\n    r.stp += n;
\r\n#if defined(SUNLIGHT_DIRECT_LIGHTING) && (defined(LIGHT_SCATTERING) || defined(FOG_DISTANCE))\r\n    vec3 i = vOutScattering,  P = vInScattering;
\r\n    r.stp = ApplyInOutScattering(r.stp,  i,  P);
\r\n    r.q = mix(r.q,  1.,  vColour.q);
\r\n#endif\r\n\r\n#if !defined(REFRACTION)\r\n    r.stp += m;
\r\n#if defined(WATER_EMISSIVE) && !defined(GLES2_COMPAT_MODE)\r\n    vec4 C = EmissiveContribution(W,  h,  G);
\r\n    r.stp = mix(r.stp,  C.stp,  C.q * q * uEmissiveBlend);
\r\n#endif\r\n\r\n#else\r\n    vec3 D = WaterRefractionWithExtinction(W,  h,  vPosition_WaterDepth.q,  G,  m,  q);
\r\n#if defined(WATER_EMISSIVE) && !defined(GLES2_COMPAT_MODE)\r\n    r.stp = mix(D,  r.stp,  G);
\r\n    vec4 g = EmissiveContribution(W,  h,  G);
\r\n    r.stp = mix(r.stp,  g.stp,  g.q * uEmissiveBlend);
\r\n    r.stp = mix(D,  r.stp,  q);
\r\n#else\r\n    r.stp = mix(D,  r.stp,  r.q);
\r\n#endif\r\n\r\n#endif\r\n\r\n#if !defined(SUNLIGHT_DIRECT_LIGHTING)\r\n    r.q = 1.;
\r\n#endif\r\n    gl_FragColor = r;
\r\n#if defined(WATER_DEBUG_OUTPUT)\r\n    WaterWriteDebugColour(W,  h);
\r\n#endif\r\n
}
\r\n#if defined(CAUSTICS_STENCIL)\r\nvoid CausticsStencil()\r\n {
  \r\n    gl_FragColor.s = float(texture2D(uCausticsMap,  gl_FragCoord.st / uCausticsMapSize).s) * uCausticsScale / CAUSTICS_FIXED_POINT_SCALE;
\r\n
}
\r\n#endif\r\n#if defined(CAUSTICS_COMPUTE)\r\nvoid CausticsCompute()\r\n {
  \r\n    vec3 v = WaterNormal();
\r\n    WriteCausticsRay(v,  vPosition_WaterDepth.q);
\r\n    discard;
\r\n    return;
\r\n
}
\r\n#endif\r\n#if defined(CLIP_PLANE_CLAMP)\r\nvoid ClipPlaneClamp()\r\n {
  \r\n    const float E = 200.;
\r\n    if (abs(vPosition_WaterDepth.t + uClipPlane.q) < E)\r\n        gl_FragDepth = 1.,  gl_FragColor = vec4(uFogColour.stp,  1.);
\r\n    else\r\n     {
  \r\n        discard;
\r\n    
}
\r\n
}
\r\n#endif\r\nvoid main()\r\n {
  \r\n#if defined(CLIP_PLANE_CLAMP)\r\n    ClipPlaneClamp();
\r\n#elif defined(CAUSTICS_STENCIL)\r\n    CausticsStencil();
\r\n#elif defined(CAUSTICS_COMPUTE)\r\n    CausticsCompute();
\r\n#else\r\n    WaterFragment();
\r\n#endif\r\n
}
\r\n"
