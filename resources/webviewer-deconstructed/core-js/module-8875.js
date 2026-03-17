// Module ID: 8875
// Category: core-js
// Size: 21527 bytes
// Parameters: e,t,n

"use strict";
var r;
if(!Object.keys) {
  var i=Object.prototype.hasOwnProperty, a=Object.prototype.toString, s=n(1093), o=Object.prototype.propertyIsEnumerable, l=!o.call( {
  toString:null
}
, "toString"), c=o.call((function() {
}
), "prototype"), u=["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"], h=function(e) {
  var t=e.constructor;
return t&&t.prototype===e
}
, d= {
  $applicationCache:!0, 
$console:!0, $external:!0, $frame:!0, $frameElement:!0, $frames:!0, $innerHeight:!0, $innerWidth:!0, $onmozfullscreenchange:!0, $onmozfullscreenerror:!0, $outerHeight:!0, $outerWidth:!0, $pageXOffset:!0, $pageYOffset:!0, $parent:!0, $scrollLeft:!0, $scrollTop:!0, 
$scrollX:!0, $scrollY:!0, $self:!0, $webkitIndexedDB:!0, $webkitStorageInfo:!0, $window:!0
}
, p=function() {
  if("undefined"==typeof window)return!1;
for(var e in window)try {
  if(!d["$"+e]&&i.call(window, e)&&null!==window[e]&&"object"==typeof window[e])try {
h(window[e])
}
catch(e) {
  return!0
}
}
catch(e) {
  return!0
}
return!1
}
();
r=function(e) {
  var t=null!==e&&"object"==typeof e, n="[object Function]"===a.call(e), r=s(e), o=t&&"[object String]"===a.call(e), d=[]
;
if(!t&&!n&&!r)throw new TypeError("Object.keys called on a non-object");
var f=c&&n;
if(o&&e.length>0&&!i.call(e, 0))for(var m=0;
m<e.length;
++m)d.push(String(m))
;
if(r&&e.length>0)for(var g=0;
g<e.length;
++g)d.push(String(g));
else for(var _ in e)f&&"prototype"===_||!i.call(e, _)||d.push(String(_));
if(l)for(var v=function(e) {
  if("undefined"==typeof window||!p)return h(e);
try {
  return h(e)
}
catch(e) {
  return!1
}
}
(e), y=0;
y<u.length;
++y)v&&"constructor"===u[y]||!i.call(e, u[y])||d.push(u[y]);
return d
}
}
e.exports=r
}
, 8968:e=> {
  "use strict";
e.exports=Math.floor
}
, 8977:e=> {
  "use strict"
;
e.exports="\r\n#version 460\r\n\r\n/***************************************************/\r\n/***************** GLSL Header *********************/\r\n/***************************************************/\r\n#ifdef GL_EXT_gpu_shader4\r\n#extension GL_EXT_gpu_shader4 : enable\r\n#endif\r\n#ifdef GL_ARB_gpu_shader5\r\n#extension GL_ARB_gpu_shader5 : enable\r\n#endif\r\n#ifdef GL_ARB_derivative_control\r\n#extension GL_ARB_derivative_control : enable\r\n#endif\r\n\r\n#ifdef GL_ARB_texture_gather\r\n#extension GL_ARB_texture_gather : enable\r\n#endif\r\n\r\n#define OGL_BACKEND\r\n\r\n#undef attribute\r\n#define attribute in\r\n\r\n#undef gl_FragColor\r\n#define gl_FragColor FragColor\r\n\r\n#define shadow2DCompat texture\r\n\r\n#undef textureCube\r\n#define textureCube texture\r\n\r\n#undef texture2D\r\n#define texture2D texture\r\n\r\n#undef texture3D\r\n#define texture3D texture\r\n\r\n#undef texture2DLod\r\n#define texture2DLod textureLod\r\n\r\n#undef textureCubeLod\r\n#define textureCubeLod textureLod\r\n\r\n#undef texture2DGrad\r\n#define texture2DGrad textureGrad\r\n\r\n#define MSAA_AVAILABLE\r\n\r\n#define TEXTURE_OFFSET_AVAILABLE\r\n#if !defined(lowp)\r\n#define lowp\r\n#endif\r\n#if !defined(mediump)\r\n#define mediump\r\n#endif\r\n#if !defined(highp)\r\n#define highp\r\n#endif\r\n\r\n#define GRAPHICS_QUALITY_LOW 0\r\n#define GRAPHICS_QUALITY_MEDIUM 1\r\n#define GRAPHICS_QUALITY_HIGH 2\r\n#define GRAPHICS_QUALITY_ULTRA 3\r\n\r\n#define shadow2DLodCompat texture2DLod\r\n\r\n#define texture2DLodCompat texture2DLod\r\n\r\n#define textureCubeLodCompat textureCubeLod\r\n\r\n#define textureGatherCompat(sampler,  texCoord,  viewportScale) textureGather(sampler,  texCoord).wzxy\r\n\r\n#define UNIFORM_BUFFER_BEGIN(name) \\\r\n    layout(std140) uniform name    \\\r\n     {
  \r\n#define UNIFORM_BUFFER_END \\\r\n    
}
                      \\\r\n    ;
\r\n\r\nmat3 Mat4ToMat3(const mat4 inputMatrix)\r\n {
  \r\n    return mat3(inputMatrix);
\r\n
}
\r\n\r\n#define isNaN isnan\r\n\r\n#ifndef GL_ARB_derivative_control\r\n#define dFdxFine dFdx\r\n#define dFdyFine dFdy\r\n#define fwidthFine fwidth\r\n#endif\r\n\r\n/***************************************************/\r\n\r\n/***************************************************/\r\n/***************** Effect Defines ******************/\r\n/***************************************************/\r\n#define TEXTURE_ALBEDO_GLOBAL\r\n#define SUNLIGHT_DIRECT_LIGHTING\r\n#define TEXTURE_ATLAS\r\n#define VIEW_TRANSFORMS\r\n#define TINT\r\n\r\n/*************************************************/\r\n\r\n/***************************************************/\r\n/********** Mandatory Shader Fragments *************/\r\n/***************************************************/\r\n\r\n#define GRAPHICS_QUALITY_LOW 0\r\n#define GRAPHICS_QUALITY_MEDIUM 1\r\n#define GRAPHICS_QUALITY_HIGH 2\r\n#define GRAPHICS_QUALITY_ULTRA 3\r\n\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_X 3.0\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_Y 4.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X 42.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_Y 32.0\r\n#define MATERIAL_SETTINGS_TEXTURE_RESOLUTION 128.0\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
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
\r\nUNIFORM_BUFFER_END\r\n\r\n/***************************************************/\r\n\r\nattribute vec4 aVertexPosition_BoneLabel;
\r\nattribute vec2 aTextureUV;
\r\nattribute vec4 aVertexNormal_BatchFlags,  aVertexTangent,  aVertexColour,  aVertexColourUnwhitenedRGB_TilePositionLevel,  aMaterialSettingsSlotXY_TilePositionXZ,  aVertexSkinBones,  aVertexSkinWeights;
\r\nuniform float uSmoothSkinning;
\r\nuniform mat4 uModelMatrix;
\r\nuniform float uVertexScale;
\r\n\r\nUNIFORM_BUFFER_BEGIN(ViewTransforms)\r\nuniform highp vec3 uCameraPosition;
\r\nuniform highp mat4 uViewMatrix;
\r\nuniform highp mat4 uProjectionMatrix;
\r\nuniform highp mat4 uViewProjMatrix;
\r\nuniform highp vec4 uZBufferParams;
\r\nUNIFORM_BUFFER_END\r\nuniform mediump vec4 uTint;
\r\nuniform float uFade;
\r\nout highp vec3 vWorldPosition;
\r\nout highp vec3 vNormal;
\r\nout mediump vec4 vVertexAlbedo;
\r\nout vec2 vTextureUV;
\r\nflat out vec3 vMaterialSettingsSlotXY_BatchFlags;
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
\r\n#endif\r\n\r\n#if defined(TEXTURE_ATLAS) && defined(NORMAL_MAP)\r\n#define USE_NORMAL_MAP\r\n#endif\r\n\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\n#if defined(ANIMATION_VERTEX)\r\n#if defined(USE_BONE_HALF_FLOATS)\r\nmat4 GetBoneFromIndex(float u)\r\n {
  \r\n    uint f = uint(u),  v = f % 2u,  n = (f * 3u - v) / 2u;
\r\n    uvec4 d = (1u - v) * uBoneTransforms[n] + v * uvec4(uBoneTransforms[n].pq,  uBoneTransforms[n + 1u].st);
\r\n    uvec2 G = (1u - v) * uvec2(uBoneTransforms[n + 1u].st) + v * uvec2(uBoneTransforms[n + 1u].pq);
\r\n    vec2 m = unpackHalf2x16(d.s),  A = unpackHalf2x16(d.t),  e = unpackHalf2x16(d.p),  U = unpackHalf2x16(d.q),  s = unpackHalf2x16(G.s),  a = unpackHalf2x16(G.t);
\r\n    mat4 t = mat4(vec4(m.st,  A.s,  0.),  vec4(A.t,  e.st,  0.),  vec4(U.st,  s.s,  0.),  vec4(s.t,  a.st,  1.));
\r\n    return t;
\r\n
}
\r\n#else\r\nmat4 GetBoneFromIndex(float u)\r\n {
  \r\n    int n = int(u * 3.);
\r\n    return mat4(vec4(uBoneTransforms[n].stp,  0.),  vec4(uBoneTransforms[n].q,  uBoneTransforms[n + 1].st,  0.),  vec4(uBoneTransforms[n + 1].pq,  uBoneTransforms[n + 2].s,  0.),  vec4(uBoneTransforms[n + 2].tpq,  1.));
\r\n
}
\r\n#endif\r\n#endif\r\n\r\nvoid AssignTextureAtlasVaryings(out vec2 d,  out vec2 v,  vec2 s,  vec2 p)\r\n {
  \r\n    d = s.st,  v = p;
\r\n
}
\r\nmat3 ResolveNormalTransformMatrix(mat4 v)\r\n {
  \r\n    mat3 p = Mat4ToMat3(v);
\r\n#if defined(ANIMATION_VERTEX)\r\n    const highp float d = 2e-16;
\r\n    float s = step(d,  abs(p[0].s) + abs(p[1].t));
\r\n    p[0].s = mix(1.,  p[0].s,  s);
\r\n    p[1].t = mix(1.,  p[1].t,  s);
\r\n#endif\r\n    return p;
\r\n
}
\r\nvec2 ClipSpacePosToUVSpacePos(vec2 s)  {
   return s.st * .5 + vec2(.5,  .5);
}
\r\nvec4 OffsetPositionAlongNormal(vec4 p,  vec3 s,  vec4 t,  vec2 d,  float v)\r\n {
  \r\n    if (v <= 0.)\r\n        return t;
\r\n    else\r\n     {
  \r\n        vec2 a = t.st / t.q,  l = ClipSpacePosToUVSpacePos(a) * d;
\r\n        vec4 f = p;
\r\n        f.stp -= s;
\r\n        vec4 u = uViewProjMatrix * f;
\r\n        vec2 G = ClipSpacePosToUVSpacePos(u.st / u.q) * d;
\r\n        u.st = a;
\r\n        vec2 q = G - l;
\r\n        q = -q;
\r\n        float A = dot(q,  q);
\r\n        if (A > 0.)\r\n            q /= sqrt(A),  u.st += q * v / d;
\r\n        u.st *= u.q;
\r\n        return u;
\r\n    
}
\r\n
}
\r\n#if defined(ANIMATION_VERTEX)\r\nmat4 GetBoneMatrix(out float s)\r\n {
  \r\n    s = floor(aVertexPosition_BoneLabel.q / 256.);
\r\n    float v = aVertexPosition_BoneLabel.q - s * 256.;
\r\n    mat4 p = GetBoneFromIndex(v),  f = uSmoothSkinning < 0. ? mat4(1.) : GetBoneFromIndex(aVertexSkinBones.s);
\r\n    if (uSmoothSkinning > 0.)\r\n     {
  \r\n        f *= aVertexSkinWeights.s;
\r\n        mat4 u = GetBoneFromIndex(aVertexSkinBones.t);
\r\n        f += u * aVertexSkinWeights.t;
\r\n        u = GetBoneFromIndex(aVertexSkinBones.p);
\r\n        f += u * aVertexSkinWeights.p;
\r\n        u = GetBoneFromIndex(aVertexSkinBones.q);
\r\n        f += u * aVertexSkinWeights.q;
\r\n    
}
\r\n    return f * p;
\r\n
}
\r\nmat4 GetBoneMatrixRigid(out float s)\r\n {
  \r\n    s = floor(aVertexPosition_BoneLabel.q / 256.);
\r\n    float v = aVertexPosition_BoneLabel.q - s * 256.;
\r\n    mat4 p = GetBoneFromIndex(v),  u = uSmoothSkinning < 0. ? mat4(1.) : GetBoneFromIndex(aVertexSkinBones.s);
\r\n    return u * p;
\r\n
}
\r\n#endif\r\nvoid AssignPositionNormalVaryings(out float v)\r\n {
  \r\n    vec3 u = aVertexPosition_BoneLabel.stp;
\r\n    mat4 p;
\r\n#if defined(ANIMATION_VERTEX)\r\n    mat4 d = GetBoneMatrix(v),  s = uModelMatrix;
\r\n    p = s * d;
\r\n#else\r\n    v = 0.;
\r\n    p = uModelMatrix;
\r\n#endif\r\n    vec3 a = u * uVertexScale;
\r\n    vec4 t = p * vec4(a,  1.), \r\n         q = uViewProjMatrix * t;
\r\n#if !defined(MODEL_GEOMETRY_SHADOW_VS)\r\n    mat3 f = ResolveNormalTransformMatrix(p);
\r\n    vNormal = f * aVertexNormal_BatchFlags.stp;
\r\n    vNormal = normalize(vNormal);
\r\n    vNormal = isNaN(vNormal.s) ? vec3(0.,  1.,  0.) : vNormal;
\r\n#if defined(USE_NORMAL_MAP) && !defined(PER_FRAGMENT_TANGENTS)\r\n    vTangent.stp = f * aVertexTangent.stp;
\r\n    vTangent.stp = normalize(vTangent.stp);
\r\n    vTangent.stp = isNaN(vTangent.s) ? vec3(1.,  0.,  0.) : vTangent.stp;
\r\n    vTangent.q = aVertexTangent.q;
\r\n#endif\r\n\r\n#if defined(MODEL_GEOMETRY_HIGHLIGHT_VS)\r\n    q = OffsetPositionAlongNormal(t,  vNormal,  q,  uViewportLookupScale.pq,  uHighlightScale);
\r\n#endif\r\n    vWorldPosition = t.stp;
\r\n#endif\r\n    gl_Position = q;
\r\n#if !defined(ANIMATION_VERTEX) && defined(PUSH_TO_FARPLANE)\r\n    gl_Position.p = gl_Position.q * .9999;
\r\n#endif\r\n
}
\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\nvoid main()\r\n {
  \r\n    float d = 1.;
\r\n    AssignPositionNormalVaryings(d);
\r\n#if defined(TEXTURE_ATLAS)\r\n\r\n#if defined(TEXTURE_ALBEDO_GLOBAL)\r\n    vVertexAlbedo = aVertexColour;
\r\n#else\r\n    vVertexAlbedo = vec4(mix(aVertexColourUnwhitenedRGB_TilePositionLevel.stp,  aVertexColour.stp,  step(.5,  fract(aVertexNormal_BatchFlags.q * 8.))),  aVertexColour.q);
\r\n#endif\r\n\r\n#else\r\n    vVertexAlbedo = vec4(aVertexColourUnwhitenedRGB_TilePositionLevel.stp,  aVertexColour.q);
\r\n#endif\r\n    // vVertexAlbedo.q += uFade;
\r\n#if defined(TINT)\r\n\r\n#if !defined(PUSH_TO_FARPLANE)\r\n    // vVertexAlbedo.stp = vVertexAlbedo.stp + uTint.q * (uTint.stp - vVertexAlbedo.stp);
\r\n#endif\r\n\r\n#endif\r\n\r\n#if defined(ANIMATION_VERTEX)\r\n    vVertexAlbedo.q += uLabelDeltas[int(d)].q;
\r\n    vVertexAlbedo.q = clamp(vVertexAlbedo.q,  0.,  1.);
\r\n#if defined(ANIMATION_COLOUR_RGB) || defined(ANIMATION_COLOUR_HSL)\r\n\r\n#if defined(ANIMATION_COLOUR_RGB)\r\n    vVertexAlbedo.stp += uLabelDeltas[int(d)].stp;
\r\n#endif\r\n\r\n#if defined(ANIMATION_COLOUR_HSL)\r\n    vVertexAlbedo = convertRGBtoHSL(vVertexAlbedo);
\r\n    vVertexAlbedo.s = fract(vVertexAlbedo.s + uLabelDeltas[int(d)].s);
\r\n    vVertexAlbedo.tp = clamp(vVertexAlbedo.tp + uLabelDeltas[int(d)].tp,  0.,  1.);
\r\n    vVertexAlbedo = convertHSLtoRGB(vVertexAlbedo);
\r\n#endif\r\n\r\n#if defined(BAKED_SRGB_TO_LINEAR) && !defined(GAMMA_CORRECT_INPUTS)\r\n    vVertexAlbedo.stp = SRGBToLinear(vVertexAlbedo.stp);
\r\n#endif\r\n\r\n#endif\r\n\r\n#endif\r\n\r\n#if !defined(BAKED_SRGB_TO_LINEAR) && defined(GAMMA_CORRECT_INPUTS)\r\n    vVertexAlbedo.stp = SRGBToLinear(vVertexAlbedo.stp);
\r\n#endif\r\n\r\n#if defined(GOURAUD_SHADING)\r\n    float p = dot(vNormal,  uInvSunDirection);
\r\n    vVertexAlbedo.stp = vVertexAlbedo.stp * (uAmbientColour + uSunColour * p);
\r\n#endif\r\n\r\n#if defined(POINT_LIGHTING)\r\n    vTilePosition = vec3(floor(aVertexColourUnwhitenedRGB_TilePositionLevel.q * 255. + .1),  aMaterialSettingsSlotXY_TilePositionXZ.pq);
\r\n#endif\r\n    vMaterialSettingsSlotXY_BatchFlags.p = aVertexNormal_BatchFlags.q + .25 / 128.;
\r\n#if defined(TEXTURE_ATLAS)\r\n    AssignTextureAtlasVaryings(vTextureUV,  vMaterialSettingsSlotXY_BatchFlags.st,  aTextureUV,  aMaterialSettingsSlotXY_TilePositionXZ.st);
\r\n#endif\r\n\r\n#if defined(DEBUG_VERTEX_BONE_COLOUR)\r\n\r\n#if defined(ANIMATION_VERTEX)\r\n    vVertexAlbedo.stpq = vec4(mod(aVertexPosition_BoneLabel.q / 5.,  1.),  mod(aVertexPosition_BoneLabel.q / 14.,  1.),  mod(aVertexPosition_BoneLabel.q / 63.,  1.),  1.);
\r\n#else\r\n    vVertexAlbedo.stpq = vec4(0.);
\r\n#endif\r\n\r\n#endif\r\n\r\n#if defined(LIGHT_SCATTERING) || defined(FOG_DISTANCE)\r\n    vec4 o = uModelMatrix * vec4(aVertexPosition_BoneLabel.stp,  1.);
\r\n    vec3 v = o.stp - uCameraPosition;
\r\n    float a = length(v);
\r\n#if defined(LIGHT_SCATTERING) && defined(SUNLIGHT_DIRECT_LIGHTING)\r\n    ComputeInOutScattering(normalize(v),  a,  uInvSunDirection.stp,  vOutScattering,  vInScattering);
\r\n#else\r\n    vOutScattering = vec3(1.);
\r\n    vInScattering = vec3(0.);
\r\n#endif\r\n\r\n#if defined(FOG_DISTANCE)\r\n    float q = FogBasedOnDistance(a);
\r\n    vInScattering = mix(vInScattering,  uFogColour.stp,  q);
\r\n    vOutScattering *= 1. - q;
\r\n#endif\r\n\r\n#endif\r\n
}
\r\n"
