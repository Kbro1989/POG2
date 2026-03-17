// Module ID: 5795
// Category: property-descriptor
// Size: 138767 bytes
// Parameters: e,t,n

"use strict";
var r=n(6549);
if(r)try {
  r([], "length")
}
catch(e) {
  r=null
}
e.exports=r
}
, 
5857:e=> {
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
\r\n\r\n#define isNaN isnan\r\n\r\n#ifndef GL_ARB_derivative_control\r\n#define dFdxFine dFdx\r\n#define dFdyFine dFdy\r\n#define fwidthFine fwidth\r\n#endif\r\n\r\n/***************************************************/\r\n\r\n/***************************************************/\r\n/***************** Effect Defines ******************/\r\n/***************************************************/\r\n#define SUNLIGHT_DIRECT_LIGHTING\r\n#define TEXTURE_ATLAS\r\n#define VIEW_TRANSFORMS\r\n\r\n/*************************************************/\r\n\r\n/***************************************************/\r\n/********** Mandatory Shader Fragments *************/\r\n/***************************************************/\r\n\r\n#define GRAPHICS_QUALITY_LOW 0\r\n#define GRAPHICS_QUALITY_MEDIUM 1\r\n#define GRAPHICS_QUALITY_HIGH 2\r\n#define GRAPHICS_QUALITY_ULTRA 3\r\n\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_X 3.0\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_Y 4.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X 42.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_Y 32.0\r\n#define MATERIAL_SETTINGS_TEXTURE_RESOLUTION 128.0\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
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
\r\nUNIFORM_BUFFER_END\r\n\r\n/***************************************************/\r\n\r\nattribute vec3 aVertexPosition;
\r\nattribute vec4 aVertexNormal_FogProportion;
\r\nattribute vec4 aMaterialSettingsSlotXY_MaterialSettingsSlotXY2;
\r\nattribute vec2 aMaterialSettingsSlotXY3;
\r\nattribute vec4 aTextureScale;
\r\nattribute vec4 aVertexColour;
\r\nattribute vec4 aTextureWeight;
\r\nattribute vec4 aMaterialProperties;
\r\nuniform mat4 uModelMatrix;
\r\n\r\nUNIFORM_BUFFER_BEGIN(ViewTransforms)\r\nuniform highp vec3 uCameraPosition;
\r\nuniform highp mat4 uViewMatrix;
\r\nuniform highp mat4 uProjectionMatrix;
\r\nuniform highp mat4 uViewProjMatrix;
\r\nuniform highp vec4 uZBufferParams;
\r\nUNIFORM_BUFFER_END\r\nuniform mediump vec4 uAtlasMeta;
\r\nuniform float uFade;
\r\nout highp vec4 vWorldPos_ViewSpaceDepth;
\r\nout vec4 vVertexAlbedo;
\r\nout vec3 vWorldNormal;
\r\nflat out highp vec4 vMaterialSettingsSlots1D;
\r\nflat out highp vec4 vTextureScale;
\r\nout vec4 vTextureWeight;
\r\nflat out vec4 vMaterialProperties;
\r\n#ifndef DISTANCE_FOG_UNIFORMS\r\n#define DISTANCE_FOG_UNIFORMS\r\n#if defined(FOG_DISTANCE)\r\nUNIFORM_BUFFER_BEGIN(DistanceFog)\r\nuniform mediump vec4 uFogColour;
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
\r\n#endif\r\n#endif\r\n\r\nvoid main()\r\n {
  \r\n    vec4 d = uModelMatrix * vec4(aVertexPosition,  1.);
\r\n    gl_Position = uViewProjMatrix * d;
\r\n    vWorldPos_ViewSpaceDepth.stp = d.stp;
\r\n    vVertexAlbedo = aVertexColour;
\r\n#if defined(GAMMA_CORRECT_INPUTS) && !defined(TEXTURE_ATLAS)\r\n    vVertexAlbedo.stp = SRGBToLinear(vVertexAlbedo.stp);
\r\n#endif\r\n    vVertexAlbedo.q += uFade;
\r\n#if defined(SUNLIGHT_DIRECT_LIGHTING) || defined(DEBUG_NORMALS)\r\n    vWorldNormal = normalize(Mat4ToMat3(uModelMatrix) * aVertexNormal_FogProportion.stp);
\r\n#endif\r\n\r\n#if defined(IRRADIANCE_LIGHTING) && !defined(NORMAL_MAP)\r\n    vAmbientColour = uAmbientColour * EvaluateSHLighting2ndOrder(vWorldNormal,  uIrradianceSHCoefs);
\r\n#endif\r\n\r\n#if defined(TEXTURE_ATLAS)\r\n    vMaterialSettingsSlots1D = vec4(aMaterialSettingsSlotXY_MaterialSettingsSlotXY2.s + aMaterialSettingsSlotXY_MaterialSettingsSlotXY2.t * MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X,  aMaterialSettingsSlotXY_MaterialSettingsSlotXY2.p + aMaterialSettingsSlotXY_MaterialSettingsSlotXY2.q * MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X,  aMaterialSettingsSlotXY3.s + aMaterialSettingsSlotXY3.t * MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X,  0.);
\r\n    vTextureScale = aTextureScale;
\r\n    vTextureWeight = aTextureWeight;
\r\n#endif\r\n    vMaterialProperties = aMaterialProperties + vec4(.25);
\r\n#if defined(LIGHT_SCATTERING) || defined(SUNLIGHT_SHADOWS) || defined(FOG_DISTANCE)\r\n    vec3 S = d.stp - uCameraPosition;
\r\n    float G = length(S);
\r\n    vec3 g = S / G;
\r\n#endif\r\n\r\n#if defined(SUNLIGHT_SHADOWS)\r\n    vec3 u = vec3(uViewMatrix[0][2],  uViewMatrix[1][2],  uViewMatrix[2][2]);
\r\n    vWorldPos_ViewSpaceDepth.q = abs(dot(S.stp,  u));
\r\n#endif\r\n\r\n#if (defined(FOG_DISTANCE) || (defined(SUNLIGHT_DIRECT_LIGHTING) && defined(LIGHT_SCATTERING))) && !defined(OGLES2_BACKEND)\r\n\r\n#if defined(LIGHT_SCATTERING) && defined(SUNLIGHT_DIRECT_LIGHTING)\r\n    ComputeInOutScattering(g,  G,  uInvSunDirection,  vOutScattering,  vInScattering);
\r\n#else\r\n    vOutScattering = vec3(1.);
\r\n    vInScattering = vec3(0.);
\r\n#endif\r\n\r\n#if defined(FOG_DISTANCE)\r\n    float p = FogBasedOnDistance(G);
\r\n    vInScattering = mix(vInScattering,  uFogColour.stp,  p);
\r\n    vOutScattering *= 1. - p;
\r\n#endif\r\n\r\n#endif\r\n
}
\r\n"
}
, 5872:e=> {
  !function() {
  class t {
  static copy$byte_A$int$byte_A$int$int(e, t, n, r, i) {
  if(e===n) {
  if(t===r)return;
if(r>t&&r<t+i) {
  let a=t+--i, s=r+i;
for(i=a-i, i+=7;
a>=i;
) {
  let t=s-1, r=a-1;
n[s]=e[a], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], 
n[t--]=e[r--], n[t--]=e[r--], s=t-1, a=r-1, n[t]=e[r]
}
for(i-=7;
a>=i;
)n[s--]=e[a--];
return
}
}
for(i+=t, i-=7;
t<i;
) {
  let i=r+1, a=t+1;
n[r]=e[t], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], r=i+1, t=a+1, n[i]=e[a]
}
for(i+=7;
t<i;
)n[r++]=e[t++]
}
static copy(e, n, r, i, a) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n||!(null!=r&&r instanceof Array&&(0==r.length||null==r[0]||"number"==typeof r[0])||null===r)||"number"!=typeof i&&null!==i||"number"!=typeof a&&null!==a) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n||!(null!=r&&r instanceof Array&&(0==r.length||null==r[0]||"number"==typeof r[0])||null===r)||"number"!=typeof i&&null!==i||"number"!=typeof a&&null!==a) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n||!(null!=r&&r instanceof Array&&(0==r.length||null==r[0]||"number"==typeof r[0])||null===r)||"number"!=typeof i&&null!==i||"number"!=typeof a&&null!==a) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n||!(null!=r&&r instanceof Array&&(0==r.length||null==r[0]||"number"==typeof r[0])||null===r)||"number"!=typeof i&&null!==i||"number"!=typeof a&&null!==a) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n||!(null!=r&&r instanceof Array&&(0==r.length||null==r[0]||"number"==typeof r[0])||null===r)||"number"!=typeof i&&null!==i||"number"!=typeof a&&null!==a) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||null!=e[0])||null===e)||"number"!=typeof n&&null!==n||!(null!=r&&r instanceof Array&&(0==r.length||null==r[0]||null!=r[0])||null===r)||"number"!=typeof i&&null!==i||"number"!=typeof a&&null!==a)throw new Error("invalid overload")
;
return t.copy$java_lang_Object_A$int$java_lang_Object_A$int$int(e, n, r, i, a)
}
return t.copy$float_A$int$float_A$int$int(e, n, r, i, a)
}
return t.copy$long_A$int$long_A$int$int(e, n, r, i, a)
}
return t.copy$int_A$int$int_A$int$int(e, n, r, i, a)
}
return t.copy$short_A$int$short_A$int$int(e, n, r, i, a)
}
return t.copy$byte_A$int$byte_A$int$int(e, n, r, i, a)
}
static copy$short_A$int$short_A$int$int(e, t, n, r, i) {
  if(e===n) {
  if(t===r)return;
if(r>t&&r<t+i) {
  let a=t+--i, s=r+i;
for(i=a-i, i+=7;
a>=i;
) {
let t=s-1, r=a-1;
n[s]=e[a], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], s=t-1, a=r-1, n[t]=e[r]
}
for(i-=7;
a>=i;
)n[s--]=e[a--];
return
}
}
for(i+=t, i-=7;
t<i;
) {
  let i=r+1, a=t+1;
n[r]=e[t], n[i++]=e[a++], n[i++]=e[a++], 
n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], r=i+1, t=a+1, n[i]=e[a]
}
for(i+=7;
t<i;
)n[r++]=e[t++]
}
static copy$int_A$int$int_A$int$int(e, t, n, r, i) {
  if(e===n) {
  if(t===r)return;
if(r>t&&r<t+i) {
  let a=t+--i, s=r+i;
for(i=a-i, i+=7;
a>=i;
) {
  let t=s-1, r=a-1
;
n[s]=e[a], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], s=t-1, a=r-1, n[t]=e[r]
}
for(i-=7;
a>=i;
)n[s--]=e[a--];
return
}
}
for(i+=t, i-=7;
t<i;
) {
  let i=r+1, a=t+1;
n[r]=e[t], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], 
n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], r=i+1, t=a+1, n[i]=e[a]
}
for(i+=7;
t<i;
)n[r++]=e[t++]
}
static copy$long_A$int$long_A$int$int(e, t, n, r, i) {
  if(e===n) {
  if(t===r)return;
if(r>t&&r<t+i) {
  let a=t+--i, s=r+i;
for(i=a-i, i+=3;
a>=i;
) {
  let t=s-1, r=a-1;
n[s]=e[a], 
n[t--]=e[r--], n[t--]=e[r--], s=t-1, a=r-1, n[t]=e[r]
}
for(i-=3;
a>=i;
)n[s--]=e[a--];
return
}
}
for(i+=t, i-=3;
t<i;
) {
  let i=r+1, a=t+1;
n[r]=e[t], n[i++]=e[a++], n[i++]=e[a++], r=i+1, t=a+1, n[i]=e[a]
}
for(i+=3;
t<i;
)n[r++]=e[t++]
}
static copy$float_A$int$float_A$int$int(e, t, n, r, i) {
  if(e!==n) {
  for(i-=7;
t<i;
) {
  let i=r+1, a=t+1;
n[r]=e[t], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], r=i+1, t=a+1, n[i]=e[a]
}
for(i+=7;
t<i;
)n[r++]=e[t++]
}
}
static copy$java_lang_Object_A$int$java_lang_Object_A$int$int(e, t, n, r, i) {
  if(e===n) {
  if(t===r)return;
if(r>t&&r<t+i) {
  let a=t+--i, s=r+i;
for(i=a-i, i+=7;
a>=i;
) {
  let t=s-1, r=a-1;
n[s]=e[a], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], n[t--]=e[r--], 
n[t--]=e[r--], s=t-1, a=r-1, n[t]=e[r]
}
for(i-=7;
a>=i;
)n[s--]=e[a--];
return
}
}
for(i+=t, i-=7;
t<i;
) {
  let i=r+1, a=t+1;
n[r]=e[t], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], n[i++]=e[a++], r=i+1, t=a+1, n[i]=e[a]
}
for(i+=7;
t<i;
)n[r++]=e[t++]
}
static clear(e, t, n) {
  for(n-=7;
t<n;
) {
  let n=t+1;
e[t]=0, e[n++]=0, e[n++]=0, e[n++]=0, e[n++]=0, e[n++]=0, e[n++]=0, t=n+1, e[n]=0
}
for(n+=7;
t<n;
)e[t++]=0
}
static fill$short_A$int$int$short(e, t, n, r) {
  for(n-=7;
t<n;
) {
  let n=t+1;
e[t]=r, 
e[n++]=r, e[n++]=r, e[n++]=r, e[n++]=r, e[n++]=r, e[n++]=r, t=n+1, e[n]=r
}
for(n+=7;
t<n;
)e[t++]=r
}
static fill(e, n, r, i) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i)throw new Error("invalid overload")
;
return t.fill$int_A$int$int$int(e, n, r, i)
}
return t.fill$short_A$int$int$short(e, n, r, i)
}
static fill$int_A$int$int$int(e, t, n, r) {
  for(n=t+n-7;
t<n;
) {
  let n=t+1;
e[t]=r, e[n++]=r, e[n++]=r, e[n++]=r, e[n++]=r, e[n++]=r, e[n++]=r, t=n+1, e[n]=r
}
for(n+=7;
t<n;
)e[t++]=r
}
static sort$int_A$java_lang_Object_A(e, n) {
  t.sort$int_A$java_lang_Object_A$int$int(e, n, 0, e.length-1)
}
static sort$int_A$java_lang_Object_A$int$int(e, n, r, i) {
  if(i<=r)return;
const a=(r+i)/2|0;
let s=r;
const o=e[a];
e[a]=e[i], e[i]=o;
const l=n[a];
n[a]=n[i], 
n[i]=l;
for(let t=r;
t<i;
t++)if(o+(1&t)>e[t]) {
  const r=e[t];
e[t]=e[s], e[s]=r;
const i=n[t];
n[t]=n[s], n[s++]=i
}
e[i]=e[s], e[s]=o, n[i]=n[s], n[s]=l, t.sort$int_A$java_lang_Object_A$int$int(e, n, r, s-1), t.sort$int_A$java_lang_Object_A$int$int(e, n, s+1, i)
}
static sort(e, n, r, i) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||!(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||null!=n[0])||null===n)||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"string"==typeof e[0])||null===e)||!(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||"number"==typeof n[0])||null===n)||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||!(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||null!=n[0])||null===n)||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||!(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||"number"==typeof n[0])||null===n)||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||!(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||"number"==typeof n[0])||null===n)||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i) {
if((null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)&&(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||null!=n[0])||null===n)&&void 0===r&&void 0===i)return t.sort$int_A$java_lang_Object_A(e, n)
;
if((null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"string"==typeof e[0])||null===e)&&(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||"number"==typeof n[0])||null===n)&&void 0===r&&void 0===i)return t.sort$java_lang_String_A$short_A(e, n)
;
if((null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)&&(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||null!=n[0])||null===n)&&void 0===r&&void 0===i)return t.sort$long_A$java_lang_Object_A(e, n)
;
if((null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)&&(null!=n&&n instanceof Array&&(0==n.length||null==n[0]||"number"==typeof n[0])||null===n)&&void 0===r&&void 0===i)return t.sort$long_A$int_A(e, n)
;
throw new Error("invalid overload")
}
return t.sort$int_A$int_A$int$int(e, n, r, i)
}
return t.sort$long_A$int_A$int$int(e, n, r, i)
}
return t.sort$long_A$java_lang_Object_A$int$int(e, n, r, i)
}
return t.sort$java_lang_String_A$short_A$int$int(e, n, r, i)
}
return t.sort$int_A$java_lang_Object_A$int$int(e, n, r, i)
}
static sort$java_lang_String_A$short_A(e, n) {
  t.sort$java_lang_String_A$short_A$int$int(e, n, 0, e.length-1)
}
static sort$java_lang_String_A$short_A$int$int(e, n, r, i) {
  if(i<=r)return;
const a=(r+i)/2|0
;
let s=r;
const o=e[a];
e[a]=e[i], e[i]=o;
const l=n[a];
n[a]=n[i], n[i]=l;
for(let t=r;
t<i;
t++)if(null==o||null!=e[t]&&e[t].localeCompare(o)<(1&t)) {
  const r=e[t];
e[t]=e[s], e[s]=r;
const i=n[t];
n[t]=n[s], n[s++]=i
}
e[i]=e[s], e[s]=o, n[i]=n[s], n[s]=l, 
t.sort$java_lang_String_A$short_A$int$int(e, n, r, s-1), t.sort$java_lang_String_A$short_A$int$int(e, n, s+1, i)
}
static copyOfNullable$short_A(e) {
  if(null==e)return null;
 {
  const n=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(e.length)
;
return t.copy$short_A$int$short_A$int$int(e, 0, n, 0, e.length), n
}
}
static copyOfNullable(e) {
  if(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)return t.copyOfNullable$short_A(e)
;
if(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)return t.copyOfNullable$int_A(e);
throw new Error("invalid overload")
}
static copyOf$short_A$int(e, n) {
  const r=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(n)
;
return t.copy$short_A$int$short_A$int$int(e, 0, r, 0, n), r
}
static copyOf(e, n) {
  if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof n&&null!==n)throw new Error("invalid overload");
return t.copyOf$float_A$int(e, n)
}
return t.copyOf$short_A$int(e, n)
}
static copyOfNullable$int_A(e) {
  if(null==e)return null;
 {
  const n=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(e.length);
return t.copy$int_A$int$int_A$int$int(e, 0, n, 0, e.length), n
}
}
static copyOf$float_A$int(e, n) {
  const r=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(n);
return t.copy$float_A$int$float_A$int$int(e, 0, r, 0, n), r
}
static sort$long_A$java_lang_Object_A$int$int(e, n, r, i) {
  if(r>=i)return;
const a=(i+r)/2|0;
let s=r;
const o=e[a];
e[a]=e[i], e[i]=o;
const l=n[a];
n[a]=n[i], n[i]=l
;
for(let t=r;
t<i;
t++)if(e[t]<(e=>e<0?Math.ceil(e):Math.floor(e))(1&t)+o) {
  const r=e[t];
e[t]=e[s], e[s]=r;
const i=n[t];
n[t]=n[s], n[s++]=i
}
e[i]=e[s], e[s]=o, n[i]=n[s], n[s]=l, t.sort$long_A$java_lang_Object_A$int$int(e, n, r, s-1), 
t.sort$long_A$java_lang_Object_A$int$int(e, n, s+1, i)
}
static sort$long_A$java_lang_Object_A(e, n) {
  t.sort$long_A$java_lang_Object_A$int$int(e, n, 0, e.length-1)
}
static sort$long_A$int_A$int$int(e, n, r, i) {
  if(i<=r)return;
const a=(i+r)/2|0;
let s=r;
const o=e[a]
;
e[a]=e[i], e[i]=o;
const l=n[a];
n[a]=n[i], n[i]=l;
for(let t=r;
t<i;
t++)if(e[t]<(e=>e<0?Math.ceil(e):Math.floor(e))(1&t)+o) {
  const r=e[t];
e[t]=e[s], e[s]=r;
const i=n[t];
n[t]=n[s], n[s++]=i
}
e[i]=e[s], e[s]=o, n[i]=n[s], n[s]=l, 
t.sort$long_A$int_A$int$int(e, n, r, s-1), t.sort$long_A$int_A$int$int(e, n, s+1, i)
}
static sort$long_A$int_A(e, n) {
  t.sort$long_A$int_A$int$int(e, n, 0, e.length-1)
}
static fillRange(e, t, n, r) {
  const i=--n-7;
let a=t-1;
for(;
a<i;
)e[t=a+1]=r, e[++t]=r, e[++t]=r, 
e[++t]=r, e[++t]=r, e[++t]=r, e[++t]=r, a=t+1, e[a]=r;
for(;
a<n;
)a++, e[a]=r
}
static sort$int_A$int_A$int$int(e, n, r, i) {
  if(r>=i)return;
let a=r;
const s=(i+r)/2|0, o=e[s];
e[s]=e[i], e[i]=o;
const l=n[s];
n[s]=n[i], n[i]=l;
for(let t=r;
t<i;
t++)if(e[t]>(1&t)+o) {
const r=e[t];
e[t]=e[a], e[a]=r;
const i=n[t];
n[t]=n[a], n[a++]=i
}
e[i]=e[a], e[a]=o, n[i]=n[a], n[a]=l, t.sort$int_A$int_A$int$int(e, n, r, a-1), t.sort$int_A$int_A$int$int(e, n, a+1, i)
}
}
t.__class="ArrayUtils";
class n {
  static smallBuffers_$LI$() {
return null==n.smallBuffers&&(n.smallBuffers=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(1e3)), n.smallBuffers
}
static mediumBuffers_$LI$() {
  return null==n.mediumBuffers&&(n.mediumBuffers=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(250)), 
n.mediumBuffers
}
static largeBuffers_$LI$() {
  return null==n.largeBuffers&&(n.largeBuffers=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(50)), n.largeBuffers
}
static allocate(e) {
  if(100===e&&n.smallBufferCount>0) {
const e=n.smallBuffers_$LI$()[--n.smallBufferCount];
return n.smallBuffers_$LI$()[n.smallBufferCount]=null, e
}
if(5e3===e&&n.mediumBufferCount>0) {
  const e=n.mediumBuffers_$LI$()[--n.mediumBufferCount]
;
return n.mediumBuffers_$LI$()[n.mediumBufferCount]=null, e
}
if(3e4===e&&n.largeBufferCount>0) {
  const e=n.largeBuffers_$LI$()[--n.largeBufferCount];
return n.largeBuffers_$LI$()[n.largeBufferCount]=null, e
}
return(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0)
;
return t
}
)(e)
}
}
n.smallBufferCount=0, n.mediumBufferCount=0, n.largeBufferCount=0, n.__class="BufferPool";
class r {
  constructor(e, t, n) {
  this.singleRow=-1, this.size=0, this.recentlyUsed=new s, this.invalid=!1, void 0===this.capacity&&(this.capacity=0), 
void 0===this.height&&(this.height=0), void 0===this.entries&&(this.entries=null), void 0===this.pixels&&(this.pixels=null), this.capacity=e, this.height=t, this.entries=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(this.height), 
this.pixels=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([this.capacity, 3, n])
}
clear() {
  for(let e=0;
e<this.capacity;
e++)this.pixels[e][0]=null, 
this.pixels[e][1]=null, this.pixels[e][2]=null, this.pixels[e]=null;
this.pixels=null, this.entries=null, this.recentlyUsed.clear(), this.recentlyUsed=null
}
get$() {
if(this.capacity!==this.height)throw Object.defineProperty(new Error("Can only retrieve a full image cache"), "__classes",  {
  configurable:!0, value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
)
;
for(let e=0;
e<this.capacity;
e++)this.entries[e]=g.VALID_$LI$();
return this.pixels
}
get$int(e) {
  if(this.height===this.capacity)return this.invalid=null==this.entries[e], this.entries[e]=g.VALID_$LI$(), this.pixels[e]
;
if(1===this.capacity)return this.invalid=e!==this.singleRow, this.singleRow=e, this.pixels[0];
 {
  let t=this.entries[e];
if(null==t) {
  if(this.invalid=!0, this.capacity<=this.size) {
  const n=this.recentlyUsed.tail();
t=new g(e, n.index), this.entries[n.row]=null, 
n.unlink()
}
else t=new g(e, this.size), this.size++;
this.entries[e]=t
}
else this.invalid=!1;
return this.recentlyUsed.addHead(t), this.pixels[t.index]
}
}
get(e) {
  if("number"==typeof e||null===e)return this.get$int(e);
if(void 0===e)return this.get$()
;
throw new Error("invalid overload")
}
}
r.__class="ColorImageCache";
class i {
  constructor(e) {
  void 0===this.searchCursor&&(this.searchCursor=null), void 0===this.searchKey&&(this.searchKey=0), void 0===this.iteratorCursor&&(this.iteratorCursor=null), 
this.iteratorBucket=0, void 0===this.buckets&&(this.buckets=null), void 0===this.bucketCount&&(this.bucketCount=0), this.buckets=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(e), this.bucketCount=e;
for(let t=0;
t<e;
t++) {
  const e=this.buckets[t]=new c
;
e.prev=e, e.next=e
}
}
getBucketCount() {
  return this.bucketCount
}
put(e, t) {
  null!=t.prev&&t.unlink();
const n=this.buckets[e&(r=this.bucketCount-1, r<0?Math.ceil(r):Math.floor(r))];
var r;
t.key=e, t.next=n, t.prev=n.prev, t.prev.next=t, t.next.prev=t
}
size() {
let e=0;
for(let t=0;
t<this.bucketCount;
t++) {
  const n=this.buckets[t];
for(let t=n.next;
t!==n;
t=t.next)e++
}
return e
}
head() {
  return this.iteratorBucket=0, this.next()
}
next() {
if(this.iteratorBucket>0&&this.buckets[this.iteratorBucket-1]!==this.iteratorCursor) {
  const e=this.iteratorCursor;
return this.iteratorCursor=e.next, e
}
let e;
do {
  if(this.iteratorBucket>=this.bucketCount)return null
;
e=this.buckets[this.iteratorBucket++].next
}
while(e===this.buckets[this.iteratorBucket-1]);
return this.iteratorCursor=e.next, e
}
get(e) {
  this.searchKey=e;
const t=this.buckets[e&(n=this.bucketCount-1, n<0?Math.ceil(n):Math.floor(n))];
var n
;
for(this.searchCursor=t.next;
this.searchCursor!==t;
this.searchCursor=this.searchCursor.next)if(this.searchCursor.key===e) {
  const e=this.searchCursor;
return this.searchCursor=this.searchCursor.next, e
}
return this.searchCursor=null, null
}
toArray(e) {
let t=0;
for(let n=0;
n<this.bucketCount;
n++) {
  const r=this.buckets[n];
for(let n=r.next;
n!==r;
n=n.next)e[t++]=n
}
return t
}
nextWithKey() {
  if(null==this.searchCursor)return null;
const e=this.buckets[0|(t=this.bucketCount-1, 
(t<0?Math.ceil(t):Math.floor(t))&this.searchKey)];
for(var t;
e!==this.searchCursor;
) {
  if(this.searchKey===this.searchCursor.key) {
  const e=this.searchCursor;
return this.searchCursor=this.searchCursor.next, e
}
this.searchCursor=this.searchCursor.next
}
return this.searchCursor=null, null
}
clear() {
  for(let e=0;
e<this.bucketCount;
e++) {
  const t=this.buckets[e];
for(;
;
) {
  const e=t.next;
if(e===t)break;
e.unlink()
}
}
this.iteratorCursor=null, this.searchCursor=null
}
}
i.__class="HashTable";
class a {
  static clp2(e) {
return e--, e|=e>>>1, e|=e>>>2, e|=e>>>4, 1+((e|=e>>>8)|e>>>16)
}
static flp2(e) {
  let t=e>>>1;
return t|=t>>>1, t|=t>>>2, t|=t>>>4, t|=t>>>8, t|=t>>>16, e&~t
}
static isPowerOfTwo(e) {
  return e===(e&-e)
}
static bitCount(e) {
  let t=0;
return(e<0||e>=65536)&&(e>>>=16, 
t+=16), e>=256&&(e>>>=8, t+=8), e>=16&&(e>>>=4, t+=4), e>=4&&(t+=2, e>>>=2), e>=1&&(t++, e>>>=1), t+e
}
static bitCountFast(e) {
  return e=((e=(858993459&(e=(e>>>1&1431655765)+(1431655765&e)))+(e>>>2&-1288490189))>>>4)+e&252645135, 255&(e+=e>>>8)+(e>>>16)
}
static signum(e) {
  return e>0?1:e<0?-1:0
}
static toString(e) {
  return e<0?""+e:a.toStringInternal(e)
}
static toStringInternal(e) {
  if(e<0)return""+e;
let t=2;
for(let n=e/10|0;
0!==n;
n=(e=>e<0?Math.ceil(e):Math.floor(e))(n/10))t++;
const n=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(null);
return t
}
)(t);
n[0]="+";
for(let r=t-1;
r>0;
r--) {
  const t=e-10*(e=(e=>e<0?Math.ceil(e):Math.floor(e))(e/10));
n[r]=t>=10?String.fromCharCode(t+87):String.fromCharCode(t+48)
}
return n.join("")
}
static bitReverse(e, t) {
  let n=0
;
for(;
t>0;
)n=1&e|n<<1, e>>>=1, t--;
return n
}
static pow(e, t) {
  let n=1;
for(;
t>1;
)1&t&&(n*=e), t>>=1, e*=e;
return 1===t?e*n:n
}
static clamp(e, t, n) {
  return e<t?t:e>n?n:e
}
}
a.__class="IntUtils";
class s {
  constructor() {
  void 0===this.cursor&&(this.cursor=null), 
this.sentinel=new c, this.sentinel.next=this.sentinel, this.sentinel.prev=this.sentinel
}
static insertBefore(e, t) {
  null!=e.prev&&e.unlink(), e.next=t, e.prev=t.prev, e.prev.next=e, e.next.prev=e
}
clear() {
  for(;
;
) {
  const e=this.sentinel.next
;
if(this.sentinel===e)return void(this.cursor=null);
e.unlink()
}
}
addHead(e) {
  null!=e.prev&&e.unlink(), e.prev=this.sentinel, e.next=this.sentinel.next, e.prev.next=e, e.next.prev=e
}
removeHead() {
  const e=this.sentinel.next
;
return e===this.sentinel?null:(e.unlink(), e)
}
isEmpty() {
  return this.sentinel.next===this.sentinel
}
head() {
  const e=this.sentinel.next;
return e===this.sentinel?(this.cursor=null, null):(this.cursor=e.next, e)
}
addTail(e) {
  null!=e.prev&&e.unlink(), 
e.prev=this.sentinel.prev, e.next=this.sentinel, e.prev.next=e, e.next.prev=e
}
tail() {
  const e=this.sentinel.prev;
return e===this.sentinel?(this.cursor=null, null):(this.cursor=e.prev, e)
}
prev() {
  const e=this.cursor
;
return e===this.sentinel?(this.cursor=null, null):(this.cursor=e.prev, e)
}
next() {
  const e=this.cursor;
return this.sentinel===e?(this.cursor=null, null):(this.cursor=e.next, e)
}
}
s.__class="LinkedList";
class o {
  constructor(e) {
  let t
;
for(this.aClass4_Sub3_18=new v, this.queue=new d, void 0===this.available&&(this.available=0), void 0===this.capacity&&(this.capacity=0), void 0===this.table&&(this.table=null), this.available=e, t=1;
t+t<e;
t+=t);
this.capacity=e, this.table=new i(t)
}
head() {
return this.table.head()
}
put(e, t) {
  if(0===this.available) {
  const e=this.queue.removeHead();
if(e.unlink(), e.unlinkSecondary(), this.aClass4_Sub3_18===e) {
  const e=this.queue.removeHead();
e.unlink(), e.unlinkSecondary()
}
}
else this.available--
;
this.table.put(e, t), this.queue.addTail(t)
}
get(e) {
  const t=this.table.get(e);
return null!=t&&this.queue.addTail(t), t
}
next() {
  return this.table.next()
}
clear() {
  this.queue.clear(), this.table.clear(), this.aClass4_Sub3_18=new v, this.available=this.capacity
}
}
o.__class="LruHashTable";
class l {
  static sub10_method283(e, t, n, r, i, a, s, o, c) {
  if(c===i&&n===o&&a===s&&t===e)return void l.sub9_method280(e, c, n, r, s);
let u=c, h=n
;
const d=3*c, p=3*n, f=3*i, m=3*a, g=3*o, _=3*t, v=f+s-c-m, y=g+e-_-n, b=m+d-f-f, x=_+p-g-g, E=g-p, w=f-d;
for(let e=128;
e<=4096;
e+=128) {
  const t=e*e>>12, i=e*t>>12, a=(w*e+t*b+i*v>>12)+c, s=(E*e+y*i+x*t>>12)+n;
l.sub9_method280(s, u, h, r, a), u=a, h=s
}
}
static sub22_method4693(e, t, n, r, i, a, s, o, c) {
l.sub2_anInt902<=c&&c<=l.sub3_anInt2553&&l.sub2_anInt902<=e&&l.sub3_anInt2553>=e&&l.sub2_anInt902<=r&&l.sub3_anInt2553>=r&&l.sub2_anInt902<=i&&i<=l.sub3_anInt2553&&a>=l.sub4_anInt3086&&a<=l.sub5_anInt4230&&t>=l.sub4_anInt3086&&l.sub5_anInt4230>=t&&o>=l.sub4_anInt3086&&l.sub5_anInt4230>=o&&l.sub4_anInt3086<=s&&l.sub5_anInt4230>=s?l.sub10_method283(s, o, a, n, e, r, i, t, c):l.sub31_method3662(c, o, i, e, t, a, s, n, r)
}
static sub9_method280(e, t, n, r, i) {
  let a=e-n, s=i-t;
if(0===s)0!==a&&l.sub10_method306(t, r, e, n);
else if(0===a)l.sub20_method1975(t, i, r, n);
else {
  s<0&&(s=-s), a<0&&(a=-a);
const o=a>s;
if(o) {
  const r=t;
t=n, n=r;
const a=i;
i=e, e=a
}
if(i<t) {
  const r=t;
t=i;
const a=n
;
n=e, e=a, i=r
}
let c=n;
const u=i-t;
let h=e-n;
const d=e>n?1:-1;
h<0&&(h=-h);
let p=-(u>>1);
if(o)for(let e=t;
e<=i;
e++)p+=h, l.sub5_anIntArrayArray36[e][c]=r, p>0&&(c+=d, p-=u);
else for(let e=t;
e<=i;
e++)p+=h, l.sub5_anIntArrayArray36[c][e]=r, p>0&&(c+=d, p-=u)
}
}
static sub10_method306(e, t, n, r) {
  if(n>=r)for(let i=r;
i<n;
i++)l.sub5_anIntArrayArray36[i][e]=t;
else for(let i=n;
i<r;
i++)l.sub5_anIntArrayArray36[i][e]=t
}
static sub20_method1975(e, n, r, i) {
n>=e?t.fillRange(l.sub5_anIntArrayArray36[i], e, n, r):t.fillRange(l.sub5_anIntArrayArray36[i], n, e, r)
}
static sub31_method3662(e, t, n, r, i, a, s, o, c) {
  if(r===e&&i===a&&c===n&&t===s)return void l.sub32_method4022(a, s, o, e, n);
let u=e, h=a
;
const d=3*e, p=3*i, f=3*r, m=3*c, g=n+f-e-m, _=3*a, v=d+m-f-f, y=3*t, b=y+_-p-p, x=p+s-a-y, E=f-d, w=p-_;
for(let t=128;
t<=4096;
t+=128) {
  const n=t*t>>12, r=t*n>>12, i=(E*t+n*v+r*g>>12)+e, s=(w*t+x*r+b*n>>12)+a;
l.sub32_method4022(h, s, o, u, i), h=s, u=i
}
}
static sub32_method4022(e, t, n, r, i) {
  const a=i-r, s=t-e;
if(0===a)0!==s&&l.sub20_method1930(r, e, t, n);
else if(0===s)l.sub13_method1015(r, i, n, e);
else {
  const o=(s<<12)/a|0, c=e-(r*o>>12);
let u, h, d, p;
r<l.sub2_anInt902?(h=c+(l.sub2_anInt902*o>>12), 
u=l.sub2_anInt902):l.sub3_anInt2553>=r?(u=r, h=e):(u=l.sub3_anInt2553, h=(l.sub3_anInt2553*o>>12)+c), i<l.sub2_anInt902?(d=l.sub2_anInt902, p=c+(l.sub2_anInt902*o>>12)):i<=l.sub3_anInt2553?(d=i, p=t):(d=l.sub3_anInt2553, p=(o*l.sub3_anInt2553>>12)+c), 
l.sub4_anInt3086>p?(d=(l.sub4_anInt3086-c<<12)/o|0, p=l.sub4_anInt3086):l.sub5_anInt4230<p&&(d=(l.sub5_anInt4230-c<<12)/o|0, p=l.sub5_anInt4230), l.sub4_anInt3086>h?(u=(l.sub4_anInt3086-c<<12)/o|0, 
h=l.sub4_anInt3086):h>l.sub5_anInt4230&&(h=l.sub5_anInt4230, u=(l.sub5_anInt4230-c<<12)/o|0), l.sub9_method280(p, u, h, n, d)
}
}
static sub20_method1930(e, t, n, r) {
  l.sub2_anInt902<=e&&l.sub3_anInt2553>=e&&(t=a.clamp(t, l.sub4_anInt3086, l.sub5_anInt4230), 
n=a.clamp(n, l.sub4_anInt3086, l.sub5_anInt4230), l.sub10_method306(e, r, n, t))
}
static sub13_method1015(e, t, n, r) {
  l.sub4_anInt3086<=r&&r<=l.sub5_anInt4230&&(e=a.clamp(e, l.sub2_anInt902, l.sub3_anInt2553), t=a.clamp(t, l.sub2_anInt902, l.sub3_anInt2553), 
l.sub20_method1975(e, t, n, r))
}
static sub36_method4566(e, t, n, r, i, a, s) {
  e>=l.sub2_anInt902&&a<=l.sub3_anInt2553&&l.sub4_anInt3086<=s&&i<=l.sub5_anInt4230?l.sub9_method758(t, a, s, e, i, n, r):l.sub22_method2190(i, r, n, t, e, a, s)
}
static sub9_method758(e, n, r, i, a, s, o) {
  const c=r+o, u=a-o, h=i+o, d=n-o;
for(let a=r;
a<c;
a++)t.fillRange(l.sub5_anIntArrayArray36[a], i, n, e);
for(let r=a;
r>u;
r--)t.fillRange(l.sub5_anIntArrayArray36[r], i, n, e);
for(let r=c;
r<=u;
r++) {
const a=l.sub5_anIntArrayArray36[r];
t.fillRange(a, i, h, e), t.fillRange(a, h, d, s), t.fillRange(a, d, n, e)
}
}
static sub22_method2190(e, n, r, i, s, o, c) {
const u=a.clamp(c, l.sub4_anInt3086, l.sub5_anInt4230), h=a.clamp(e, l.sub4_anInt3086, l.sub5_anInt4230), d=a.clamp(s, l.sub2_anInt902, l.sub3_anInt2553), p=a.clamp(o, l.sub2_anInt902, l.sub3_anInt2553), f=a.clamp(c+n, l.sub4_anInt3086, l.sub5_anInt4230), m=a.clamp(e-n, l.sub4_anInt3086, l.sub5_anInt4230)
;
for(let e=u;
e<f;
e++)t.fillRange(l.sub5_anIntArrayArray36[e], d, p, i);
for(let e=h;
e>m;
e--)t.fillRange(l.sub5_anIntArrayArray36[e], d, p, i);
const g=a.clamp(s+n, l.sub2_anInt902, l.sub3_anInt2553), _=a.clamp(o-n, l.sub2_anInt902, l.sub3_anInt2553)
;
for(let e=f;
e<=m;
e++) {
  const n=l.sub5_anIntArrayArray36[e];
t.fillRange(n, d, g, i), t.fillRange(n, g, _, r), t.fillRange(n, _, p, i)
}
}
static sub32_method3997(e, t, n, r, i, a) {
e>=l.sub2_anInt902&&l.sub3_anInt2553>=a&&n>=l.sub4_anInt3086&&l.sub5_anInt4230>=i?1===r?l.sub27_method4706(t, e, a, n, i):l.sub14_method1200(t, e, i, a, r, n):1===r?l.sub27_method4241(a, i, n, t, e):l.sub31_method3781(a, t, r, e, n, i)
}
static sub31_method3781(e, n, r, i, s, o) {
const c=a.clamp(s, l.sub4_anInt3086, l.sub5_anInt4230), u=a.clamp(o, l.sub4_anInt3086, l.sub5_anInt4230), h=a.clamp(i, l.sub2_anInt902, l.sub3_anInt2553), d=a.clamp(e, l.sub2_anInt902, l.sub3_anInt2553), p=a.clamp(r+s, l.sub4_anInt3086, l.sub5_anInt4230), f=a.clamp(o-r, l.sub4_anInt3086, l.sub5_anInt4230)
;
for(let e=c;
e<p;
e++)t.fillRange(l.sub5_anIntArrayArray36[e], h, d, n);
for(let e=u;
e>f;
e--)t.fillRange(l.sub5_anIntArrayArray36[e], h, d, n);
const m=a.clamp(i+r, l.sub2_anInt902, l.sub3_anInt2553), g=a.clamp(e-r, l.sub2_anInt902, l.sub3_anInt2553)
;
for(let e=p;
e<=f;
e++) {
  const r=l.sub5_anIntArrayArray36[e];
t.fillRange(r, h, m, n), t.fillRange(r, g, d, n)
}
}
static sub27_method4241(e, n, r, i, a) {
  if(l.sub5_anInt4230<r||l.sub4_anInt3086>n)return;
let s, o, c, u;
if(l.sub2_anInt902>a?(a=l.sub2_anInt902, 
s=!1):a>l.sub3_anInt2553?(a=l.sub3_anInt2553, s=!1):s=!0, e<l.sub2_anInt902?(e=l.sub2_anInt902, o=!1):l.sub3_anInt2553<e?(e=l.sub3_anInt2553, o=!1):o=!0, l.sub4_anInt3086<=r?(c=r+1, t.fillRange(l.sub5_anIntArrayArray36[r], a, e, i)):c=l.sub4_anInt3086, 
l.sub5_anInt4230<n?u=l.sub5_anInt4230:(u=n-1, t.fillRange(l.sub5_anIntArrayArray36[n], a, e, i)), s&&o)for(let t=c;
t<=u;
t++) {
  const n=l.sub5_anIntArrayArray36[t];
n[a]=n[e]=i
}
else if(s)for(let e=c;
e<=u;
e++)l.sub5_anIntArrayArray36[e][a]=i;
else if(o)for(let t=c;
t<=u;
t++)l.sub5_anIntArrayArray36[t][e]=i
}
static sub27_method4706(e, n, r, i, a) {
  t.fillRange(l.sub5_anIntArrayArray36[i++], n, r, e), 
t.fillRange(l.sub5_anIntArrayArray36[a--], n, r, e);
for(let t=i;
t<=a;
t++) {
  const i=l.sub5_anIntArrayArray36[t];
i[n]=i[r]=e
}
}
static sub14_method1200(e, n, r, i, a, s) {
  const o=a+s, c=r-a, u=a+n;
for(let r=s;
r<o;
r++)t.fillRange(l.sub5_anIntArrayArray36[r], n, i, e)
;
for(let a=r;
a>c;
a--)t.fillRange(l.sub5_anIntArrayArray36[a], n, i, e);
const h=i-a;
for(let r=o;
r<=c;
r++) {
  const a=l.sub5_anIntArrayArray36[r];
t.fillRange(a, n, u, e), t.fillRange(a, h, i, e)
}
}
static sub29_method3429(e, t, n, r, i) {
l.sub2_anInt902<=e&&n<=l.sub3_anInt2553&&l.sub4_anInt3086<=r&&t<=l.sub5_anInt4230?l.sub15_method1477(r, e, t, i, n):l.sub22_method4701(e, n, r, i, t)
}
static sub15_method1477(e, n, r, i, a) {
  for(let s=e;
s<=r;
s++)t.fillRange(l.sub5_anIntArrayArray36[s], n, a, i)
}
static sub22_method4701(e, n, r, i, s) {
  const o=a.clamp(r, l.sub4_anInt3086, l.sub5_anInt4230), c=a.clamp(s, l.sub4_anInt3086, l.sub5_anInt4230), u=a.clamp(e, l.sub2_anInt902, l.sub3_anInt2553), h=a.clamp(n, l.sub2_anInt902, l.sub3_anInt2553)
;
for(let e=o;
e<=c;
e++)t.fillRange(l.sub5_anIntArrayArray36[e], u, h, i)
}
static sub18_method1745(e, t, n, r, i, a, s) {
e===s?l.sub8_method100(e, r, a, t, n, i):n-e>=l.sub2_anInt902&&l.sub3_anInt2553>=e+n&&a-s>=l.sub4_anInt3086&&s+a<=l.sub5_anInt4230?l.sub10_method388(n, i, r, a, e, t, s):l.sub32_method4031(t, r, n, s, a, e, i)
}
static sub32_method4031(e, n, r, i, s, o, c) {
  let u=0
;
const h=i-c;
let d=i, p=0;
const f=o-c, m=o*o, g=i*i, _=f*f, v=g<<1, y=h*h, b=m<<1, x=y<<1, E=_<<1, w=i<<1, S=h<<1;
let T=v+(1-w)*m, A=g-(w-1)*b, C=_*(1-S)+x;
const M=m<<2;
let I=y-E*(S-1);
const R=g<<2, k=_<<2, N=y<<2
;
let D=3*v, L=3*x, O=b*(w-3), P=R, F=(S-3)*E, U=M*(i-1), B=N, z=(h-1)*k;
if(s>=l.sub4_anInt3086&&l.sub5_anInt4230>=s) {
const i=l.sub5_anIntArrayArray36[s], c=a.clamp(r-o, l.sub2_anInt902, l.sub3_anInt2553), u=a.clamp(r+o, l.sub2_anInt902, l.sub3_anInt2553), h=a.clamp(r-f, l.sub2_anInt902, l.sub3_anInt2553), d=a.clamp(r+f, l.sub2_anInt902, l.sub3_anInt2553);
t.fillRange(i, c, h, n), 
t.fillRange(i, h, d, e), t.fillRange(i, d, u, n)
}
for(;
d>0;
) {
  if(T<0)for(;
T<0;
)T+=D, u++, D+=R, A+=P, P+=R;
A<0&&(u++, T+=D, D+=R, A+=P, P+=R);
const i=h>=d;
if(A+=-O, d--, i) {
  if(C<0)for(;
C<0;
)C+=L, I+=B, L+=N, B+=N, p++;
I<0&&(C+=L, L+=N, I+=B, B+=N, p++), I+=-F, F-=k, C+=-z, z-=k
}
T+=-U;
const o=d+s, c=s-d;
if(U-=M, O-=M, o>=l.sub4_anInt3086&&l.sub5_anInt4230>=c) {
  const s=a.clamp(u+r, l.sub2_anInt902, l.sub3_anInt2553), h=a.clamp(r-u, l.sub2_anInt902, l.sub3_anInt2553);
if(i) {
const i=a.clamp(r+p, l.sub2_anInt902, l.sub3_anInt2553), u=a.clamp(r-p, l.sub2_anInt902, l.sub3_anInt2553);
if(l.sub4_anInt3086<=c) {
  const r=l.sub5_anIntArrayArray36[c];
t.fillRange(r, h, u, n), t.fillRange(r, u, i, e), t.fillRange(r, i, s, n)
}
if(l.sub5_anInt4230>=o) {
const r=l.sub5_anIntArrayArray36[o];
t.fillRange(r, h, u, n), t.fillRange(r, u, i, e), t.fillRange(r, i, s, n)
}
}
else c>=l.sub4_anInt3086&&t.fillRange(l.sub5_anIntArrayArray36[c], h, s, n), l.sub5_anInt4230>=o&&t.fillRange(l.sub5_anIntArrayArray36[o], h, s, n)
}
}
}
static sub10_method388(e, n, r, i, a, s, o) {
  let c=0, u=o;
const h=a-n;
let d=0;
const p=o-n, f=a*a, m=o*o, g=h*h, _=p*p, v=m<<1, y=_<<1, b=f<<1, x=g<<1, E=o<<1, w=p<<1;
let S=f*(1-E)+v, T=m-b*(E-1), A=y+(1-w)*g, C=_-x*(w-1);
const M=f<<2, I=m<<2, R=_<<2, k=g<<2
;
let N=3*v, D=b*(E-3), L=3*y, O=I, P=(w-3)*x, F=R, U=(o-1)*M, B=k*(p-1);
const z=l.sub5_anIntArrayArray36[i];
for(t.fillRange(z, e-a, e-h, r), t.fillRange(z, e-h, h+e, s), t.fillRange(z, h+e, e+a, r);
u>0;
) {
  if(S<0)for(;
S<0;
)S+=N, N+=I, c++, T+=O, O+=I;
T<0&&(S+=N, T+=O, N+=I, 
c++, O+=I), S+=-U;
const n=e-c, a=p>=u, o=e+c;
U-=M, u--, T+=-D;
const h=u+i;
if(D-=M, a) {
  if(A<0)for(;
A<0;
)d++, C+=F, A+=L, F+=R, L+=R;
C<0&&(A+=L, L+=R, d++, C+=F, F+=R), C+=-P, A+=-B, B-=k, P-=k
}
const f=i-u;
if(a) {
  const i=e-d;
t.fillRange(l.sub5_anIntArrayArray36[f], n, i, r)
;
const a=e+d;
t.fillRange(l.sub5_anIntArrayArray36[f], i, a, s), t.fillRange(l.sub5_anIntArrayArray36[f], a, o, r), t.fillRange(l.sub5_anIntArrayArray36[h], n, i, r), t.fillRange(l.sub5_anIntArrayArray36[h], i, a, s), t.fillRange(l.sub5_anIntArrayArray36[h], a, o, r)
}
else t.fillRange(l.sub5_anIntArrayArray36[f], n, o, r), t.fillRange(l.sub5_anIntArrayArray36[h], n, o, r)
}
}
static sub8_method100(e, t, n, r, i, a) {
l.sub2_anInt902<=i-e&&e+i<=l.sub3_anInt2553&&n-e>=l.sub4_anInt3086&&l.sub5_anInt4230>=e+n?l.sub10_method896(a, t, e, r, i, n):l.sub14_method1082(e, a, i, t, r, n)
}
static sub32_method3885(e) {
(null==l.sub7_anIntArray678||l.sub7_anIntArray678.length<e)&&(l.sub7_anIntArray678=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(e))
}
static sub14_method1082(e, n, r, i, s, o) {
  l.sub32_method3885(e);
let c=e-n, u=e, h=0, d=-e;
c<0&&(c=0);
let p=c
;
if(l.sub4_anInt3086<=o&&o<=l.sub5_anInt4230) {
const n=l.sub5_anIntArrayArray36[o], u=a.clamp(r-e, l.sub2_anInt902, l.sub3_anInt2553), h=a.clamp(e+r, l.sub2_anInt902, l.sub3_anInt2553), d=a.clamp(r-c, l.sub2_anInt902, l.sub3_anInt2553), p=a.clamp(r+c, l.sub2_anInt902, l.sub3_anInt2553);
t.fillRange(n, u, d, i), 
t.fillRange(n, d, p, s), t.fillRange(n, p, h, i)
}
let f=-c, m=-1, g=-1;
for(;
h<u;
) {
  if(m+=2, f+=m, g+=2, f>=0&&p>=1&&(p--, f-=p<<1, l.sub7_anIntArray678[p]=h), h++, d+=g, d>=0) {
  u--, d-=u<<1;
const e=o-u, n=o+u;
if(l.sub4_anInt3086<=n&&e<=l.sub5_anInt4230)if(u>=c) {
const s=a.clamp(r+h, l.sub2_anInt902, l.sub3_anInt2553), o=a.clamp(r-h, l.sub2_anInt902, l.sub3_anInt2553);
l.sub5_anInt4230>=n&&t.fillRange(l.sub5_anIntArrayArray36[n], o, s, i), e>=l.sub4_anInt3086&&t.fillRange(l.sub5_anIntArrayArray36[e], o, s, i)
}
else {
const o=l.sub7_anIntArray678[u], c=a.clamp(r+h, l.sub2_anInt902, l.sub3_anInt2553), d=a.clamp(r-h, l.sub2_anInt902, l.sub3_anInt2553), p=a.clamp(r+o, l.sub2_anInt902, l.sub3_anInt2553), f=a.clamp(r-o, l.sub2_anInt902, l.sub3_anInt2553);
if(l.sub5_anInt4230>=n) {
const e=l.sub5_anIntArrayArray36[n];
t.fillRange(e, d, f, i), t.fillRange(e, f, p, s), t.fillRange(e, p, c, i)
}
if(l.sub4_anInt3086<=e) {
  const n=l.sub5_anIntArrayArray36[e];
t.fillRange(n, d, f, i), t.fillRange(n, f, p, s), t.fillRange(n, p, c, i)
}
}
}
const e=o+h, n=o-h
;
if(l.sub4_anInt3086<=e&&l.sub5_anInt4230>=n) {
  const o=u+r, d=r-u;
if(o>=l.sub2_anInt902&&l.sub3_anInt2553>=d) {
  const u=a.clamp(o, l.sub2_anInt902, l.sub3_anInt2553), f=a.clamp(d, l.sub2_anInt902, l.sub3_anInt2553)
;
if(h>=c)l.sub5_anInt4230>=e&&t.fillRange(l.sub5_anIntArrayArray36[e], f, u, i), l.sub4_anInt3086<=n&&t.fillRange(l.sub5_anIntArrayArray36[n], f, u, i);
else {
const o=p>=h?p:l.sub7_anIntArray678[h], c=a.clamp(r+o, l.sub2_anInt902, l.sub3_anInt2553), d=a.clamp(r-o, l.sub2_anInt902, l.sub3_anInt2553);
if(l.sub5_anInt4230>=e) {
  const n=l.sub5_anIntArrayArray36[e];
t.fillRange(n, f, d, i), t.fillRange(n, d, c, s), 
t.fillRange(n, c, u, i)
}
if(l.sub4_anInt3086<=n) {
  const e=l.sub5_anIntArrayArray36[n];
t.fillRange(e, f, d, i), t.fillRange(e, d, c, s), t.fillRange(e, c, u, i)
}
}
}
}
}
}
static sub10_method896(e, n, r, i, a, s) {
  l.sub32_method3885(r);
let o=0, c=-r, u=r-e, h=r, d=-1, p=-1
;
const f=l.sub5_anIntArrayArray36[s];
u<0&&(u=0);
let m=u;
const g=a-u;
t.fillRange(f, a-r, g, n);
const _=u+a;
let v=-u;
for(t.fillRange(f, g, _, i), t.fillRange(f, _, a+r, n);
h>o;
) {
  if(p+=2, c+=p, d+=2, v+=d, v>=0&&m>=1&&(l.sub7_anIntArray678[m]=o, m--, v-=m<<1), o++, 
c>=0) {
  if(h--, h>=u) {
  const e=l.sub5_anIntArrayArray36[s+h], r=a+o, i=l.sub5_anIntArrayArray36[s-h], c=a-o;
t.fillRange(e, c, r, n), t.fillRange(i, c, r, n)
}
else {
const e=l.sub5_anIntArrayArray36[h+s], r=l.sub7_anIntArray678[h], c=l.sub5_anIntArrayArray36[s-h], u=o+a, d=a-r, p=r+a, f=a-o;
t.fillRange(e, f, d, n), t.fillRange(e, d, p, i), t.fillRange(e, p, u, n), t.fillRange(c, f, d, n), t.fillRange(c, d, p, i), t.fillRange(c, p, u, n)
}
c-=h<<1
}
const e=l.sub5_anIntArrayArray36[s+o], r=l.sub5_anIntArrayArray36[s-o], f=h+a, g=a-h;
if(u<=o)t.fillRange(e, g, f, n), t.fillRange(r, g, f, n);
else {
  const s=o>m?l.sub7_anIntArray678[o]:m, c=s+a, u=a-s;
t.fillRange(e, g, u, n), t.fillRange(e, u, c, i), 
t.fillRange(e, c, f, n), t.fillRange(r, g, u, n), t.fillRange(r, u, c, i), t.fillRange(r, c, f, n)
}
}
}
static sub28_method3323(e, t, n, r, i) {
e===i?l.sub32_method4032(i, n, r, t):l.sub2_anInt902<=t-i&&l.sub3_anInt2553>=t+i&&r-e>=l.sub4_anInt3086&&l.sub5_anInt4230>=r+e?l.sub19_method4379(e, t, n, r, i):l.sub26_method4814(r, e, n, i, t)
}
static sub32_method4032(e, t, n, r) {
r-e>=l.sub2_anInt902&&l.sub3_anInt2553>=r+e&&n-e>=l.sub4_anInt3086&&n+e<=l.sub5_anInt4230?l.sub11_method565(n, r, e, t):l.sub29_method3463(n, r, e, t)
}
static sub29_method3463(e, n, r, i) {
  let s=0, o=r, c=-1, u=-r
;
const h=a.clamp(r+n, l.sub2_anInt902, l.sub3_anInt2553), d=a.clamp(n-r, l.sub2_anInt902, l.sub3_anInt2553);
for(t.fillRange(l.sub5_anIntArrayArray36[e], d, h, i);
o>s;
) {
  if(c+=2, u+=c, u>0) {
  o--, u-=o<<1;
const r=e-o, c=o+e
;
if(c>=l.sub4_anInt3086&&r<=l.sub5_anInt4230) {
  const e=a.clamp(n+s, l.sub2_anInt902, l.sub3_anInt2553), o=a.clamp(n-s, l.sub2_anInt902, l.sub3_anInt2553);
l.sub5_anInt4230>=c&&t.fillRange(l.sub5_anIntArrayArray36[c], o, e, i), 
l.sub4_anInt3086<=r&&t.fillRange(l.sub5_anIntArrayArray36[r], o, e, i)
}
}
s++;
const r=e-s, h=e+s;
if(l.sub4_anInt3086<=h&&r<=l.sub5_anInt4230) {
  const e=a.clamp(n+o, l.sub2_anInt902, l.sub3_anInt2553), s=a.clamp(n-o, l.sub2_anInt902, l.sub3_anInt2553)
;
h<=l.sub5_anInt4230&&t.fillRange(l.sub5_anIntArrayArray36[h], s, e, i), l.sub4_anInt3086<=r&&t.fillRange(l.sub5_anIntArrayArray36[r], s, e, i)
}
}
}
static sub11_method565(e, n, r, i) {
  t.fillRange(l.sub5_anIntArrayArray36[e], n-r, r+n, i);
let a=0, s=r, o=-r, c=-1
;
for(;
s>a;
) {
  if(c+=2, a++, o+=c, o>=0) {
  s--, o-=s<<1;
const r=l.sub5_anIntArrayArray36[e-s], c=l.sub5_anIntArrayArray36[e+s], u=n-a, h=n+a;
t.fillRange(c, u, h, i), t.fillRange(r, u, h, i)
}
const r=n+s, u=n-s, h=l.sub5_anIntArrayArray36[e+a], d=l.sub5_anIntArrayArray36[e-a];
t.fillRange(h, u, r, i), t.fillRange(d, u, r, i)
}
}
static sub19_method4379(e, n, r, i, a) {
  t.fillRange(l.sub5_anIntArrayArray36[i], n-a, a+n, r);
let s=0, o=e
;
const c=a*a, u=e*e, h=c<<1, d=e<<1, p=u<<1;
let f=u-h*(d-1), m=p+(1-d)*c;
const g=c<<2;
let _=3*p, v=h*((e<<1)-3);
const y=u<<2;
let b=y, x=(e-1)*g;
for(;
o>0;
) {
  if(m<0)for(;
m<0;
)s++, m+=_, f+=b, b+=y, _+=y;
o--, f<0&&(f+=b, m+=_, _+=y, b+=y, s++);
const e=i-o;
m+=-x
;
const a=n+s;
x-=g;
const c=o+i;
f+=-v, v-=g;
const u=n-s;
t.fillRange(l.sub5_anIntArrayArray36[e], u, a, r), t.fillRange(l.sub5_anIntArrayArray36[c], u, a, r)
}
}
static sub26_method4814(e, n, r, i, s) {
  let o=n, c=0;
const u=n*n, h=i*i, d=h<<1, p=u<<1, f=n<<1
;
let m=u-(f-1)*d, g=(1-f)*h+p;
const _=h<<2, v=u<<2;
let y=3*p, b=v, x=((n<<1)-3)*d;
if(e>=l.sub4_anInt3086&&l.sub5_anInt4230>=e) {
  const n=a.clamp(s+i, l.sub2_anInt902, l.sub3_anInt2553), o=a.clamp(s-i, l.sub2_anInt902, l.sub3_anInt2553)
;
t.fillRange(l.sub5_anIntArrayArray36[e], o, n, r)
}
let E=_*(n-1);
for(;
o>0;
) {
  if(g<0)for(;
g<0;
)g+=y, m+=b, b+=v, y+=v, c++;
o--, m<0&&(m+=b, b+=v, g+=y, c++, y+=v), g+=-E;
const n=e-o;
m+=-x, E-=_;
const i=o+e;
if(x-=_, i>=l.sub4_anInt3086&&l.sub5_anInt4230>=n) {
const e=a.clamp(c+s, l.sub2_anInt902, l.sub3_anInt2553), o=a.clamp(s-c, l.sub2_anInt902, l.sub3_anInt2553);
l.sub4_anInt3086<=n&&t.fillRange(l.sub5_anIntArrayArray36[n], o, e, r), i<=l.sub5_anInt4230&&t.fillRange(l.sub5_anIntArrayArray36[i], o, e, r)
}
}
}
static sub18_method4374(e, t) {
  l.sub5_anInt4230=e, l.sub3_anInt2553=t, l.sub4_anInt3086=0, l.sub2_anInt902=0
}
static sub35_method4335(e) {
  l.sub5_anIntArrayArray36=e
}
}
l.sub5_anInt4230=100, l.sub4_anInt3086=0, l.sub7_anIntArray678=null, l.sub3_anInt2553=100, 
l.sub2_anInt902=0, l.sub5_anIntArrayArray36=null, l.__class="MergedStatics";
class c {
  constructor() {
  void 0===this.prev&&(this.prev=null), void 0===this.next&&(this.next=null), void 0===this.key&&(this.key=0)
}
isLinked() {
  return null!=this.prev
}
unlink() {
null!=this.prev&&(this.prev.next=this.next, this.next.prev=this.prev, this.prev=null, this.next=null)
}
}
c.__class="Node";
class u {
  constructor(e) {
  if("number"==typeof e||null===e)void 0===this.nextNextGaussian&&(this.nextNextGaussian=0), 
void 0===this.seedhi&&(this.seedhi=0), void 0===this.seedlo&&(this.seedlo=0), this.haveNextNextGaussian=!1, this.setSeed$long(e);
else {
  if(void 0!==e)throw new Error("invalid overload");
 {
  void 0===this.nextNextGaussian&&(this.nextNextGaussian=0), 
void 0===this.seedhi&&(this.seedhi=0), void 0===this.seedlo&&(this.seedlo=0), this.haveNextNextGaussian=!1;
const e=u.uniqueSeed+++Date.now(), t=16777215&Math.floor(e*u.twoToTheMinus24), n=e-t*u.twoToThe24|0;
this.setSeed$int$int(t, n)
}
}
}
static __static_initialize() {
  u.__static_initialized||(u.__static_initialized=!0, u.__static_initializer_0())
}
static twoToTheXMinus24_$LI$() {
  return u.__static_initialize(), null==u.twoToTheXMinus24&&(u.twoToTheXMinus24=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(25)), u.twoToTheXMinus24
}
static twoToTheXMinus48_$LI$() {
  return u.__static_initialize(), null==u.twoToTheXMinus48&&(u.twoToTheXMinus48=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(33)), u.twoToTheXMinus48
}
static __static_initializer_0() {
  let e=152587890625e-16;
for(let t=32;
t>=0;
t--)u.twoToTheXMinus48_$LI$()[t]=e, e*=.5;
let t=1;
for(let e=24;
e>=0;
e--)u.twoToTheXMinus24_$LI$()[e]=t, t*=.5
}
nextBoolean() {
  return 0!==this.nextInternal(1)
}
nextBytes(e) {
let t=0, n=0, r=0;
for(;
n<e.length;
)0===r?(t=0|this.nextInternal(32), r=3):r--, e[n++]=0|t, t>>=8
}
nextDouble() {
  return this.nextInternal(26)*u.twoToTheMinus26+this.nextInternal(27)*u.twoToTheMinus53
}
nextFloat() {
return Math.fround(this.nextInternal(24)*u.twoToTheMinus24)
}
nextGaussian() {
  if(this.haveNextNextGaussian)return this.haveNextNextGaussian=!1, this.nextNextGaussian;
let e, t, n;
do {
  e=2*this.nextDouble()-1, t=2*this.nextDouble()-1, n=e*e+t*t
}
while(n>=1)
;
const r=0===n?0:Math.sqrt(-2*Math.log(n)/n);
return this.nextNextGaussian=t*r, this.haveNextNextGaussian=!0, e*r
}
nextInt() {
  return 0|this.nextInternal(32)
}
nextLong() {
return(((e=this.nextInternal(32))<0?Math.ceil(e):Math.floor(e))<<32)+(e=>e<0?Math.ceil(e):Math.floor(e))(this.nextInternal(32));
var e
}
setSeed$long(e) {
  this.setSeed$int$int(e>>24&16777215, 16777215&e)
}
next(e) {
  return 0|this.nextInternal(e)
}
nextInternal(e) {
  let t=this.seedhi*u.multiplierLo+this.seedlo*u.multiplierHi, n=this.seedlo*u.multiplierLo+11;
const r=Math.floor(n*u.twoToTheMinus24);
if(t+=r, n-=r*u.twoToThe24, t%=u.twoToThe24, this.seedhi=t, this.seedlo=n, 
e<=24)return Math.floor(this.seedhi*u.twoToTheXMinus24_$LI$()[e]);
 {
  let t=this.seedhi*(1<<e-24)+Math.floor(this.seedlo*u.twoToTheXMinus48_$LI$()[e]);
return t>=u.twoToThe31&&(t-=u.twoToThe32), t
}
}
setSeed$int$int(e, t) {
  this.seedhi=1502^e, 
this.seedlo=15525485^t, this.haveNextNextGaussian=!1
}
setSeed(e, t) {
  if("number"!=typeof e&&null!==e||"number"!=typeof t&&null!==t) {
  if("number"!=typeof e&&null!==e||void 0!==t)throw new Error("invalid overload");
return this.setSeed$long(e)
}
return this.setSeed$int$int(e, t)
}
}
u.__static_initialized=!1, u.multiplierHi=1502, u.multiplierLo=15525485, u.twoToThe24=16777216, u.twoToThe31=2147483648, u.twoToThe32=4294967296, u.twoToTheMinus24=5.960464477539063e-8, 
u.twoToTheMinus26=1.4901161193847656e-8, u.twoToTheMinus31=4.656612873077393e-10, u.twoToTheMinus53=11102230246251565e-32, u.uniqueSeed=0, u.__class="Random";
class h {
  static nextInt(e, t) {
  if(t<=0)throw Object.defineProperty(new Error, "__classes",  {
configurable:!0, value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.IllegalArgumentException", "java.lang.Exception"]
}
);
if(a.isPowerOfTwo(t))return e.nextInt()&t-1;
 {
const r=-2147483648-(4294967296%((n=t)<0?Math.ceil(n):Math.floor(n))|0)|0;
let i;
do {
  i=e.nextInt()
}
while(i>=r);
return h.method3538(i, t)
}
var n
}
static method3538(e, t) {
  return(e>>31&t-1)+(e+(e>>>31))%t
}
}
h.__class="RandomUtils";
class d {
  constructor() {
void 0===this.cursor&&(this.cursor=null), this.sentinel=new v, this.sentinel.secondaryPrev=this.sentinel, this.sentinel.secondaryNext=this.sentinel
}
static insertAfter(e, t) {
  null!=e.secondaryPrev&&e.unlinkSecondary(), e.secondaryNext=t.secondaryNext, 
e.secondaryPrev=t, e.secondaryPrev.secondaryNext=e, e.secondaryNext.secondaryPrev=e
}
head() {
  const e=this.sentinel.secondaryNext;
return e===this.sentinel?(this.cursor=null, null):(this.cursor=e.secondaryNext, e)
}
addTail(e) {
null!=e.secondaryPrev&&e.unlinkSecondary(), e.secondaryNext=this.sentinel, e.secondaryPrev=this.sentinel.secondaryPrev, e.secondaryPrev.secondaryNext=e, e.secondaryNext.secondaryPrev=e
}
size() {
  let e=0, t=this.sentinel.secondaryNext
;
for(;
this.sentinel!==t;
)t=t.secondaryNext, e++;
return e
}
removeHead() {
  const e=this.sentinel.secondaryNext;
return this.sentinel===e?null:(e.unlinkSecondary(), e)
}
clear() {
  for(;
;
) {
  const e=this.sentinel.secondaryNext
;
if(e===this.sentinel)return void(this.cursor=null);
e.unlinkSecondary()
}
}
next() {
  const e=this.cursor;
return this.sentinel===e?(this.cursor=null, null):(this.cursor=e.secondaryNext, e)
}
}
d.__class="SecondaryLinkedList";
class p {
static __static_initialize() {
  p.__static_initialized||(p.__static_initialized=!0, p.__static_initializer_0())
}
static INVERSE_SQUARE_ROOT_$LI$() {
  return p.__static_initialize(), null==p.INVERSE_SQUARE_ROOT&&(p.INVERSE_SQUARE_ROOT=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(32896)), p.INVERSE_SQUARE_ROOT
}
static __static_initializer_0() {
  let e=0;
for(let t=0;
t<256;
t++)for(let n=0;
n<=t;
n++)p.INVERSE_SQUARE_ROOT_$LI$()[e++]=255/Math.sqrt(Math.fround((t*t+n*n+65535)/65535))|0
}
}
p.__static_initialized=!1, p.__class="TextureMathUtils";
class f {
  constructor(e, t, n) {
  void 0===this.fillColor&&(this.fillColor=0), void 0===this.outlineWidth&&(this.outlineWidth=0), void 0===this.outlineColor&&(this.outlineColor=0), this.fillColor=e, 
this.outlineWidth=n, this.outlineColor=t
}
}
f.__class="TextureOpRasterizerShape";
class m extends c {
  constructor(e) {
  if(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)super(), void 0===this.bytes&&(this.bytes=null), 
void 0===this.position&&(this.position=0), this.bytes=e, this.position=0;
else {
  if("number"!=typeof e&&null!==e)throw new Error("invalid overload");
 {
  let e=arguments[0];
super(), void 0===this.bytes&&(this.bytes=null), 
void 0===this.position&&(this.position=0), this.bytes=n.allocate(e), this.position=0
}
}
}
static crc32$byte_A$int$int(e, t, n) {
  throw Object.defineProperty(new Error("removed"), "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
)
}
static crc32(e, t, n) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof t&&null!==t||"number"!=typeof n&&null!==n) {
if(!(null!=e&&e instanceof Array&&(0==e.length||null==e[0]||"number"==typeof e[0])||null===e)||"number"!=typeof t&&null!==t||void 0!==n)throw new Error("invalid overload");
return m.crc32$byte_A$int(e, t)
}
return m.crc32$byte_A$int$int(e, t, n)
}
static crc32$byte_A$int(e, t) {
  return m.crc32$byte_A$int$int(e, 0, t)
}
static getStringLength(e) {
  return e.length+1
}
writeString(e) {
  throw Object.defineProperty(new Error("removed"), "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
)
}
readShort() {
  this.position+=2;
let e=((255&this.bytes[this.position-2])<<8)+(255&this.bytes[this.position-1]);
return e>32767&&(e-=65536), e
}
writeUnsignedShortSmart(e) {
  if(e>=0&&e<128)this.writeByte(e);
else {
  if(!(e>=0&&e<32768))throw Object.defineProperty(new Error, "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.IllegalArgumentException", "java.lang.Exception"]
}
);
this.writeShort(e+32768)
}
}
writeByteC(e) {
  this.bytes[this.position++]=0|-e
}
readUnsignedShortSmart() {
return(255&this.bytes[this.position])<128?this.readUnsignedByte():this.readUnsignedShort()-32768
}
writeVarInt(e) {
  -128&e&&(-16384&e&&(-2097152&e&&(-268435456&e&&this.writeByte(e>>>28|128), this.writeByte(e>>>21|128)), this.writeByte(e>>>14|128)), 
this.writeByte(e>>>7|128)), this.writeByte(127&e)
}
writeByte(e) {
  this.bytes[this.position++]=0|e
}
writeLong(e) {
  this.bytes[this.position++]=e>>56, this.bytes[this.position++]=e>>48, this.bytes[this.position++]=e>>40, this.bytes[this.position++]=e>>32, 
this.bytes[this.position++]=e>>24, this.bytes[this.position++]=e>>16, this.bytes[this.position++]=e>>8, this.bytes[this.position++]=0|e
}
readIntAlt3Reverse() {
  return this.position+=4, 
((255&this.bytes[this.position-1])<<16)+((255&this.bytes[this.position-2])<<24)+((255&this.bytes[this.position-4])<<8)+(255&this.bytes[this.position-3])
}
writeIntAlt3(e) {
  this.bytes[this.position++]=e>>16, this.bytes[this.position++]=e>>24, 
this.bytes[this.position++]=0|e, this.bytes[this.position++]=e>>8
}
readShortLE() {
  this.position+=2;
let e=((255&this.bytes[this.position-1])<<8)+(255&this.bytes[this.position-2]);
return e>32767&&(e-=65536), e
}
writeByteS(e) {
this.bytes[this.position++]=128-e|0
}
readIntAlt3() {
  return this.position+=4, (255&this.bytes[this.position-2])+((255&this.bytes[this.position-4])<<16)+((255&this.bytes[this.position-3])<<24)+((255&this.bytes[this.position-1])<<8)
}
readUnsignedShortLEA() {
return this.position+=2, ((255&this.bytes[this.position-1])<<8)+(this.bytes[this.position-2]-128&255)
}
readUnsignedByteC() {
  return 255&-this.bytes[this.position++]
}
method4590() {
  return this.position+=3, 
((255&this.bytes[this.position-2])<<16)+((255&this.bytes[this.position-3])<<8)+(255&this.bytes[this.position-1])
}
writeIntAlt3Reverse(e) {
  this.bytes[this.position++]=e>>8, this.bytes[this.position++]=0|e, this.bytes[this.position++]=e>>24, 
this.bytes[this.position++]=e>>16
}
readString() {
  throw Object.defineProperty(new Error("removed"), "__classes",  {
  configurable:!0, value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
)
}
writeBytes(e, t) {
for(let n=0;
n<t;
n++)this.bytes[this.position++]=e[n]
}
readInt() {
  return this.position+=4, (255&this.bytes[this.position-1])+((255&this.bytes[this.position-4])<<24)+((255&this.bytes[this.position-3])<<16)+((255&this.bytes[this.position-2])<<8)
}
readVarLong(e) {
  if(--e<0||e>7)throw Object.defineProperty(new Error, "__classes",  {
  configurable:!0, value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.IllegalArgumentException", "java.lang.Exception"]
}
);
let t=0
;
for(let n=8*e;
n>=0;
n-=8)t|=(255&(e=>e<0?Math.ceil(e):Math.floor(e))(this.bytes[this.position++]))<<n;
return t
}
readShortSmart() {
  return(255&this.bytes[this.position])<128?this.readUnsignedByte()-64:this.readUnsignedShort()-49152
}
readUnsignedMultiSmart() {
  let e, t=0;
for(e=this.readUnsignedShortSmart();
32767===e;
e=this.readUnsignedShortSmart())t+=32767;
return t+e
}
writeIntLE(e) {
  this.bytes[this.position++]=0|e, this.bytes[this.position++]=e>>8, this.bytes[this.position++]=e>>16, 
this.bytes[this.position++]=e>>24
}
readBytesA(e, t) {
  for(let n=0;
n<t;
n++)e[n]=this.bytes[this.position++]-128|0
}
verifyCrc32() {
  return this.position-=4, m.crc32$byte_A$int$int(this.bytes, 0, this.position)===this.readInt()
}
writeMedium(e) {
this.bytes[this.position++]=e>>16, this.bytes[this.position++]=e>>8, this.bytes[this.position++]=0|e
}
writeShortLE(e) {
  this.bytes[this.position++]=0|e, this.bytes[this.position++]=e>>8
}
writeFloat(e) {
  const t=(e=> {
  let t=new ArrayBuffer(4)
;
return new Float32Array(t)[0]=e, new Uint32Array(t)[0]
}
)(e);
this.bytes[this.position++]=t>>24, this.bytes[this.position++]=t>>16, this.bytes[this.position++]=t>>8, this.bytes[this.position++]=0|t
}
readUnsignedByteS() {
return 128-this.bytes[this.position++]&255
}
writeVarLong(e, t) {
  if(--t<0||t>7)throw Object.defineProperty(new Error, "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.IllegalArgumentException", "java.lang.Exception"]
}
);
for(let n=8*t;
n>=0;
n-=8)this.bytes[this.position++]=e>>n
}
xteaDecrypt(e, t) {
  const n=(t-5)/8|0, r=this.position
;
this.position=5;
for(let t=0;
t<n;
t++) {
  let t=this.readInt(), n=this.readInt(), r=-957401312, i=32;
for(;
i-- >0;
)n-=(t<<4^t>>>5)+t^e[r>>>11&3]+r, r-=-1640531527, t-=(n<<4^n>>>5)+n^r+e[3&r];
this.position-=8, this.writeInt(t), this.writeInt(n)
}
this.position=r
}
readByteS() {
  return 128-this.bytes[this.position++]|0
}
readVarInt() {
  let e=this.bytes[this.position++], t=0;
for(;
e<0;
)t=(127&e|t)<<7, e=this.bytes[this.position++];
return t|e
}
writeIntLength(e) {
  this.bytes[this.position-e-4]=e>>24, 
this.bytes[this.position-e-3]=e>>16, this.bytes[this.position-e-2]=e>>8, this.bytes[this.position-e-1]=0|e
}
writeByteA(e) {
  this.bytes[this.position++]=e+128|0
}
readBytes(e, t) {
  for(let n=0;
n<t;
n++)e[n]=this.bytes[this.position++]
}
writeShortLE2(e) {
this.bytes[this.position++]=0|e, this.bytes[this.position++]=e>>8
}
writeShortA(e) {
  this.bytes[this.position++]=e>>8, this.bytes[this.position++]=e+128|0
}
readByteC() {
  return 0|-this.bytes[this.position++]
}
readUnsignedShort() {
  return this.position+=2, 
(255&this.bytes[this.position-1])+((255&this.bytes[this.position-2])<<8)
}
writeInt(e) {
  this.bytes[this.position++]=e>>24, this.bytes[this.position++]=e>>16, this.bytes[this.position++]=e>>8, this.bytes[this.position++]=0|e
}
readUnsignedMedium() {
return this.position+=3, (255&this.bytes[this.position-1])+((255&this.bytes[this.position-3])<<16)+((255&this.bytes[this.position-2])<<8)
}
readIntLE() {
  return this.position+=4, 
(255&this.bytes[this.position-4])+((255&this.bytes[this.position-1])<<24)+((255&this.bytes[this.position-2])<<16)+((255&this.bytes[this.position-3])<<8)
}
writeCrc32(e) {
  const t=m.crc32$byte_A$int$int(this.bytes, e, this.position);
return this.writeInt(t), 
t
}
readLong() {
  const e=4294967295&((t=this.readInt())<0?Math.ceil(t):Math.floor(t));
var t;
const n=4294967295&(e=>e<0?Math.ceil(e):Math.floor(e))(this.readInt());
return(e<<32)+n
}
readUnsignedByteA() {
  return this.bytes[this.position++]-128&255
}
writeIntLE2(e) {
  this.bytes[this.position++]=0|e, this.bytes[this.position++]=e>>8, this.bytes[this.position++]=e>>16, this.bytes[this.position++]=e>>24
}
readStringFast() {
  return 0===this.bytes[this.position]?(this.position++, null):this.readString()
}
readShortA() {
  this.position+=2;
let e=(this.bytes[this.position-1]-128&255)+((255&this.bytes[this.position-2])<<8);
return e>32767&&(e-=65536), e
}
xteaEncrypt(e) {
  const t=this.position/8|0;
this.position=0;
for(let n=0;
n<t;
n++) {
let t=this.readInt(), n=this.readInt(), r=0, i=32;
for(;
i-- >0;
)t+=n+(n<<4^n>>>5)^r+e[3&r], r+=-1640531527, n+=r+e[r>>>11&-1354760189]^(t>>>5^t<<4)+t;
this.position-=8, this.writeInt(t), this.writeInt(n)
}
}
readUnsignedByte() {
return 255&this.bytes[this.position++]
}
readUnsignedShortA() {
  return this.position+=2, ((255&this.bytes[this.position-2])<<8)+(this.bytes[this.position-1]-128&255)
}
writeShort(e) {
  this.bytes[this.position++]=e>>8, this.bytes[this.position++]=0|e
}
writeFloatLE(e) {
  const t=(e=> {
  let t=new ArrayBuffer(4);
return new Float32Array(t)[0]=e, new Uint32Array(t)[0]
}
)(e);
this.bytes[this.position++]=0|t, this.bytes[this.position++]=t>>8, this.bytes[this.position++]=t>>16, this.bytes[this.position++]=t>>24
}
readVersionedString() {
  throw Object.defineProperty(new Error("removed"), "__classes",  {
  configurable:!0, value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
)
}
readBytesReverse(e, t) {
for(let n=t-1;
n>=0;
n--)e[n]=this.bytes[this.position++]
}
readUnsignedShortLE() {
  return this.position+=2, ((255&this.bytes[this.position-1])<<8)+(255&this.bytes[this.position-2])
}
writeShortLEA(e) {
  this.bytes[this.position++]=e+128|0, 
this.bytes[this.position++]=e>>8
}
readByte() {
  return this.bytes[this.position++]
}
writeByteLength(e) {
  this.bytes[this.position-e-1]=0|e
}
}
m.__class="Buffer";
class g extends c {
  constructor(e, t) {
  super(), void 0===this.row&&(this.row=0), 
void 0===this.index&&(this.index=0), this.row=e, this.index=t
}
static VALID_$LI$() {
  return null==g.VALID&&(g.VALID=new g(0, 0)), g.VALID
}
}
g.__class="ColorImageCacheEntry";
class _ extends c {
  constructor(e, t) {
  super(), void 0===this.row&&(this.row=0), 
void 0===this.index&&(this.index=0), this.row=e, this.index=t
}
static VALID_$LI$() {
  return null==_.VALID&&(_.VALID=new _(0, 0)), _.VALID
}
}
_.__class="MonochromeImageCacheEntry";
class v extends c {
  constructor() {
  super(), 
void 0===this.secondaryPrev&&(this.secondaryPrev=null), void 0===this.secondaryKey&&(this.secondaryKey=0), void 0===this.secondaryNext&&(this.secondaryNext=null)
}
unlinkSecondary() {
null!=this.secondaryPrev&&(this.secondaryPrev.secondaryNext=this.secondaryNext, this.secondaryNext.secondaryPrev=this.secondaryPrev, this.secondaryPrev=null, this.secondaryNext=null)
}
isSecondaryLinked() {
  return null!=this.secondaryPrev
}
}
v.__class="SecondaryNode";
class y extends c {
  constructor(e, t) {
  super(), void 0===this.colorImageCache&&(this.colorImageCache=null), void 0===this.monochromeImageCache&&(this.monochromeImageCache=null), 
void 0===this.imageCacheCapacity&&(this.imageCacheCapacity=0), void 0===this.monochrome&&(this.monochrome=!1), void 0===this.childOps&&(this.childOps=null), this.monochrome=t, this.childOps=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(e)
}
static permutations_$LI$() {
  return null==y.permutations&&(y.permutations=new o(16)), y.permutations
}
static createTrigonometryTables() {
  if(null==y.SINE||null==y.COSINE) {
  y.COSINE=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(256), y.SINE=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(256);
for(let e=0;
e<256;
e++) {
  const t=e/255*6.283185307179586;
y.SINE[e]=4096*Math.sin(t)|0, y.COSINE[e]=4096*Math.cos(t)|0
}
}
}
static getPermutation(e) {
  let t=y.permutations_$LI$().get(e);
if(null==t) {
  const n=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(512), r=new u(e);
for(let e=0;
e<255;
e++)n[e]=0|e;
for(let e=0;
e<255;
e++) {
  const t=255-e, i=h.nextInt(r, t), a=n[i];
n[i]=n[t], n[t]=n[511-e]=a
}
t=new S(n), y.permutations_$LI$().put(e, t)
}
return t.value
}
static perlinFade(e) {
return((e*e>>12)*e>>12)*(40960+(e*(6*e-61440|0)>>12)|0)>>12
}
static decode(e) {
  e.readUnsignedByte();
const t=e.readUnsignedByte(), n=y.create(t);
n.imageCacheCapacity=e.readUnsignedByte();
const r=e.readUnsignedByte();
for(let t=0;
t<r;
t++) {
const t=e.readUnsignedByte();
n.decode(e, t)
}
return n.postDecode(), n
}
static create(e) {
return 0===e?new Z:1===e?new L:2===e?new V:3===e?new le:4===e?new R:5===e?new I:6===e?new N:7===e?new F:8===e?new U:9===e?new z:10===e?new O:11===e?new P:12===e?new ue:13===e?new Q:14===e?new he:15===e?new ce:16===e?new G:17===e?new H:18===e?new de:19===e?new te:20===e?new oe:21===e?new j:22===e?new W:23===e?new q:24===e?new K:25===e?new k:26===e?new M:27===e?new ae:28===e?new $:29===e?new re:30===e?new ne:31===e?new Y:32===e?new B:33===e?new D:34===e?new ee:35===e?new J:36===e?new se:37===e?new C:38===e?new X:39===e?new ie:null
}
getChildColorOutput(e, t) {
  if(!this.childOps[e].monochrome)return this.childOps[e].getColorOutput(t);
const n=[null, null, null], r=this.childOps[e].getMonochromeOutput(t);
return n[0]=r, n[2]=r, n[1]=r, n
}
decode(e, t) {
}
getSpriteId() {
  return-1
}
getTextureId() {
return-1
}
getMonochromeOutput(e) {
  throw Object.defineProperty(new Error("This operation does not have a monochrome output"), "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.IllegalStateException", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
)
}
getColorOutput(e) {
throw Object.defineProperty(new Error("This operation does not have a colour output"), "__classes",  {
  configurable:!0, value:["java.lang.Throwable", "java.lang.IllegalStateException", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
)
}
clearImageCache() {
  this.monochrome?(this.monochromeImageCache.clear(), this.monochromeImageCache=null):(this.colorImageCache.clear(), this.colorImageCache=null)
}
createImageCache(e, t) {
  const n=255===this.imageCacheCapacity?e:this.imageCacheCapacity
;
this.monochrome?this.monochromeImageCache=new A(n, e, t):this.colorImageCache=new r(n, e, t)
}
getChildMonochromeOutput(e, t) {
  return this.childOps[e].monochrome?this.childOps[e].getMonochromeOutput(t):this.childOps[e].getColorOutput(t)[0]
}
postDecode() {
}
}
y.COSINE=null, y.SINE=null, y.__class="TextureOp";
class b extends f {
  constructor(e, t, n, r, i, a, s, o, l, c) {
  super(-1, l, c), void 0===this.y1&&(this.y1=0), void 0===this.x0&&(this.x0=0), void 0===this.y0&&(this.y0=0), void 0===this.x1&&(this.x1=0), 
void 0===this.x2&&(this.x2=0), void 0===this.y2&&(this.y2=0), void 0===this.x3&&(this.x3=0), void 0===this.y3&&(this.y3=0), this.y1=r, this.x0=e, this.y0=t, this.x1=n, this.x2=i, this.y2=a, this.x3=s, this.y3=o
}
static create(e) {
return new b(e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readUnsignedMedium(), e.readUnsignedByte())
}
renderOutline(e, t) {
const n=e*this.x0>>12, r=e*this.x1>>12, i=t*this.y1>>12, a=e*this.x2>>12, s=t*this.y0>>12, o=t*this.y2>>12, c=t*this.y3>>12, u=e*this.x3>>12;
l.sub22_method4693(r, i, this.outlineColor, a, u, s, c, o, n)
}
renderFill(e, t) {
}
render(e, t) {
}
}
b.__class="TextureOpRasterizerBezierCurve";
class x extends f {
  constructor(e, t, n, r, i, a, s) {
  super(i, a, s), void 0===this.x&&(this.x=0), void 0===this.horizontalRadius&&(this.horizontalRadius=0), void 0===this.y&&(this.y=0), 
void 0===this.verticalRadius&&(this.verticalRadius=0), this.x=e, this.horizontalRadius=n, this.y=t, this.verticalRadius=r
}
static create(e) {
return new x(e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readUnsignedMedium(), e.readUnsignedMedium(), e.readUnsignedByte())
}
render(e, t) {
  const n=this.x*e>>12, r=this.horizontalRadius*e>>12, i=this.verticalRadius*t>>12, a=this.y*t>>12
;
l.sub18_method1745(r, this.fillColor, n, this.outlineColor, this.outlineWidth, a, i)
}
renderFill(e, t) {
  const n=this.x*e>>12, r=this.horizontalRadius*e>>12, i=this.verticalRadius*t>>12, a=this.y*t>>12;
l.sub28_method3323(i, n, this.fillColor, a, r)
}
renderOutline(e, t) {
}
}
x.__class="TextureOpRasterizerEllipse";
class E extends f {
  constructor(e, t, n, r, i, a) {
  super(-1, i, a), void 0===this.x1&&(this.x1=0), void 0===this.y0&&(this.y0=0), void 0===this.x0&&(this.x0=0), void 0===this.y1&&(this.y1=0), this.x1=n, 
this.y0=t, this.x0=e, this.y1=r
}
static create(e) {
  return new E(e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readUnsignedMedium(), e.readUnsignedByte())
}
renderFill(e, t) {
}
renderOutline(e, t) {
const n=this.x0*e>>12, r=this.x1*e>>12, i=this.y1*t>>12, a=this.y0*t>>12;
l.sub32_method4022(a, i, this.outlineColor, n, r)
}
render(e, t) {
}
}
E.__class="TextureOpRasterizerLine";
class w extends f {
  constructor(e, t, n, r, i, a, s) {
  super(i, a, s), 
void 0===this.x1&&(this.x1=0), void 0===this.y1&&(this.y1=0), void 0===this.x0&&(this.x0=0), void 0===this.y0&&(this.y0=0), this.x1=n, this.y1=r, this.x0=e, this.y0=t
}
static create(e) {
return new w(e.readShort(), e.readShort(), e.readShort(), e.readShort(), e.readUnsignedMedium(), e.readUnsignedMedium(), e.readUnsignedByte())
}
render(e, t) {
  const n=this.x0*e>>12, r=this.y0*t>>12, i=this.x1*e>>12, a=this.y1*t>>12
;
l.sub36_method4566(n, this.outlineColor, this.fillColor, this.outlineWidth, a, i, r)
}
renderOutline(e, t) {
  const n=this.x0*e>>12, r=this.x1*e>>12, i=this.y0*t>>12, a=this.y1*t>>12;
l.sub32_method3997(n, this.outlineColor, i, this.outlineWidth, a, r)
}
renderFill(e, t) {
const n=this.x0*e>>12, r=this.x1*e>>12, i=this.y0*t>>12, a=this.y1*t>>12;
l.sub29_method3429(n, a, r, i, this.fillColor)
}
}
w.__class="TextureOpRasterizerRectangle";
class S extends v {
  constructor(e) {
  super(), void 0===this.value&&(this.value=null), this.value=e
}
}
S.__class="ByteArraySecondaryNode", class extends v {
  constructor() {
  super(), void 0===this.innerWidth&&(this.innerWidth=0), void 0===this.yOffset&&(this.yOffset=0), void 0===this.xOffset&&(this.xOffset=0), void 0===this.height&&(this.height=0), 
void 0===this.width&&(this.width=0), void 0===this.innerHeight&&(this.innerHeight=0)
}
renderRotatedScaledTransparent$int$int$int$int$int$int(e, t, n, r, i, a) {
  throw new Error("cannot invoke abstract overloaded method... check your argument(s) type(s)")
}
renderRotatedScaledTransparent(e, t, n, r, i, a) {
  if("number"!=typeof e&&null!==e||"number"!=typeof t&&null!==t||"number"!=typeof n&&null!==n||"number"!=typeof r&&null!==r||"number"!=typeof i&&null!==i||"number"!=typeof a&&null!==a) {
if("number"!=typeof e&&null!==e||"number"!=typeof t&&null!==t||"number"!=typeof n&&null!==n||"number"!=typeof r&&null!==r||void 0!==i||void 0!==a)throw new Error("invalid overload");
return this.renderRotatedScaledTransparent$int$int$int$int(e, t, n, r)
}
return this.renderRotatedScaledTransparent$int$int$int$int$int$int(e, t, n, r, i, a)
}
renderRotatedScaledTransparent$int$int$int$int(e, t, n, r) {
  const i=this.innerWidth<<3;
n=(15&i)+(n<<4);
const a=this.innerHeight<<3;
e=(15&a)+(e<<4), 
this.renderRotatedScaledTransparent$int$int$int$int$int$int(i, a, n, e, t, r)
}
}
.__class="Sprite";
class T extends v {
  constructor(e) {
  super(), void 0===this.spriteIds&&(this.spriteIds=null), void 0===this.textureIds&&(this.textureIds=null), 
void 0===this.brightnessOp&&(this.brightnessOp=null), void 0===this.colorOp&&(this.colorOp=null), void 0===this.alphaOp&&(this.alphaOp=null), void 0===this.ops&&(this.ops=null);
let t=0;
const n=e.readUnsignedByte();
this.ops=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(null);
return t
}
)(n);
let r=0;
const i=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(n);
for(let a=0;
a<n;
a++) {
  const n=y.decode(e);
n.getSpriteId()>=0&&t++, n.getTextureId()>=0&&r++;
const s=n.childOps.length;
i[a]=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(s);
for(let t=0;
t<s;
t++)i[a][t]=e.readUnsignedByte();
this.ops[a]=n
}
this.textureIds=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(r);
let a=0;
this.spriteIds=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(t);
let s=0
;
for(let e=0;
e<n;
e++) {
  const t=this.ops[e], n=t.childOps.length;
for(let r=0;
r<n;
r++)t.childOps[r]=this.ops[i[e][r]];
const r=t.getSpriteId(), o=t.getTextureId();
r>0&&(this.spriteIds[s++]=r), o>0&&(this.textureIds[a++]=o), i[e]=null
}
this.colorOp=this.ops[e.readUnsignedByte()], this.alphaOp=this.ops[e.readUnsignedByte()], this.brightnessOp=this.ops[e.readUnsignedByte()]
}
static brightnessMap_$LI$() {
  return null==T.brightnessMap&&(T.brightnessMap=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0)
;
return t
}
)(256)), T.brightnessMap
}
static setBrightness(e) {
  if(T.brightness!==e) {
  for(let t=0;
t<256;
t++) {
  const n=255*Math.pow(t/255, e)|0;
T.brightnessMap_$LI$()[t]=n>255?255:n
}
T.brightness=e
}
}
static setSize(e, t) {
  if(e!==T.width) {
  T.normalisedX=(e=> {
let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(e);
for(let t=0;
t<e;
t++)T.normalisedX[t]=(t<<12)/e|0;
T.widthMask=e-1, T.width=e, T.widthTimes32=32*e
}
if(t!==T.height) {
  if(t===T.width)T.normalisedY=T.normalisedX;
else {
  T.normalisedY=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(t);
for(let e=0;
e<t;
e++)T.normalisedY[e]=(e<<12)/t|0
}
T.heightMask=t-1, T.height=t
}
}
getPixels(e, t, n, r, i, a) {
  T.setBrightness(r), T.setSize(e, t);
const s=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(e*t)
;
for(let n=0;
n<this.ops.length;
n++)this.ops[n].createImageCache(t, e);
let o, l, c;
T.loadedTextures=n, a?(c=e-1, o=-1, l=-1):(l=1, o=e, c=0);
let u=0;
for(let n=0;
n<t;
n++) {
  let t, r, a;
if(i&&(u=n), this.colorOp.monochrome) {
const e=this.colorOp.getMonochromeOutput(n);
r=e, a=e, t=e
}
else {
  const e=this.colorOp.getColorOutput(n);
t=e[0], a=e[2], r=e[1]
}
for(let n=c;
n!==o;
n+=l) {
  let o=t[n]>>4, l=r[n]>>4;
l>255&&(l=255);
let c=a[n]>>4;
o>255&&(o=255), c>255&&(c=255), l<0&&(l=0), o<0&&(o=0)
;
const h=T.brightnessMap_$LI$()[l], d=T.brightnessMap_$LI$()[o];
c<0&&(c=0);
const p=T.brightnessMap_$LI$()[c];
s[u++]=p+(d<<16)+(h<<8), i&&(u+=e-1)
}
}
for(let e=0;
e<this.ops.length;
e++)this.ops[e].clearImageCache();
return s
}
}
T.loadedTextures=null, 
T.spriteGroupId=-1, T.brightness=-1, T.width=0, T.height=0, T.widthMask=0, T.heightMask=0, T.normalisedX=null, T.normalisedY=null, T.widthTimes32=0, T.__class="Texture";
class A {
  constructor(e, t, n) {
  this.size=0, this.singleRow=-1, this.recentlyUsed=new s, 
this.invalid=!1, void 0===this.height&&(this.height=0), void 0===this.entries&&(this.entries=null), void 0===this.capacity&&(this.capacity=0), void 0===this.pixels&&(this.pixels=null), this.height=t, this.entries=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null)
;
return t
}
)(this.height), this.capacity=e, this.pixels=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([this.capacity, n])
}
static __static_initialize() {
A.__static_initialized||(A.__static_initialized=!0, A.__static_initializer_0())
}
static PERLIN_FADE_$LI$() {
  return A.__static_initialize(), null==A.PERLIN_FADE&&(A.PERLIN_FADE=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(4096)), A.PERLIN_FADE
}
static __static_initializer_0() {
  for(let e=0;
e<4096;
e++)A.PERLIN_FADE_$LI$()[e]=y.perlinFade(e)
}
get$() {
  if(this.capacity!==this.height)throw Object.defineProperty(new Error("Can only retrieve a full image cache"), "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
);
for(let e=0;
e<this.capacity;
e++)this.entries[e]=_.VALID_$LI$();
return this.pixels
}
get$int(e) {
if(this.capacity===this.height)return this.invalid=null==this.entries[e], this.entries[e]=_.VALID_$LI$(), this.pixels[e];
if(1===this.capacity)return this.invalid=e!==this.singleRow, this.singleRow=e, this.pixels[0];
 {
  let t=this.entries[e];
if(null==t) {
if(this.invalid=!0, this.capacity>this.size)t=new _(e, this.size), this.size++;
else {
  const n=this.recentlyUsed.tail();
t=new _(e, n.index), this.entries[n.row]=null, n.unlink()
}
this.entries[e]=t
}
else this.invalid=!1;
return this.recentlyUsed.addHead(t), 
this.pixels[t.index]
}
}
get(e) {
  if("number"==typeof e||null===e)return this.get$int(e);
if(void 0===e)return this.get$();
throw new Error("invalid overload")
}
clear() {
  for(let e=0;
e<this.capacity;
e++)this.pixels[e]=null;
this.pixels=null, this.entries=null, 
this.recentlyUsed.clear(), this.recentlyUsed=null
}
}
A.__static_initialized=!1, A.__class="MonochromeImageCache";
class C extends y {
  constructor() {
  super(0, !0), this.anInt4505=0, this.anInt4503=8192, this.anInt4508=2048, this.anInt4504=0, this.anInt4515=2048, 
this.anInt4507=12288, this.anInt4517=4096
}
method3687(e, t) {
  const n=(t-e)*this.anInt4507>>12;
let r=y.COSINE[255*n>>12&255];
return r=(r<<12)/this.anInt4507|0, r=(r<<12)/this.anInt4503|0, r=this.anInt4517*r>>12, r>e+t&&-r<e+t
}
method3690(e, t) {
const n=(t+e)*this.anInt4507>>12;
let r=y.COSINE[255*n>>12&255];
return r=(r<<12)/this.anInt4507|0, r=(r<<12)/this.anInt4503|0, r=r*this.anInt4517>>12, r>t-e&&t-e>-r
}
postDecode() {
  y.createTrigonometryTables()
}
decode(e, t) {
0===t?this.anInt4508=e.readUnsignedShort():1===t?this.anInt4505=e.readUnsignedShort():2===t?this.anInt4504=e.readUnsignedShort():3===t?this.anInt4515=e.readUnsignedShort():4===t?this.anInt4507=e.readUnsignedShort():5===t?this.anInt4517=e.readUnsignedShort():6===t&&(this.anInt4503=e.readUnsignedShort())
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=T.normalisedY[e]-2048;
for(let e=0;
e<T.width;
e++) {
  const r=T.normalisedX[e]-2048;
let i=r+this.anInt4508;
i=i>=-2048?i:i+4096
;
let a=n+this.anInt4505;
i=i<=2048?i:i-4096, a=a>=-2048?a:a+4096, a=a<=2048?a:a-4096;
let s=r+this.anInt4504, o=n+this.anInt4515;
s=s>=-2048?s:s+4096, s=s<=2048?s:s-4096, o=o>=-2048?o:o+4096, o=o<=2048?o:o-4096, 
t[e]=this.method3687(i, a)||this.method3690(s, o)?4096:0
}
}
return t
}
}
C.__class="TextureOp37";
class M extends y {
  constructor() {
  super(1, !0), this.minValue=0, this.maxValue=4096
}
decode(e, t) {
0===t?this.minValue=e.readUnsignedShort():1===t&&(this.maxValue=e.readUnsignedShort())
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.getChildMonochromeOutput(0, e)
;
for(let e=0;
e<T.width;
e++) {
  const r=n[e];
t[e]=r>=this.minValue&&r<=this.maxValue?4096:0
}
}
return t
}
}
M.__class="TextureOpBinary";
class I extends y {
  constructor() {
  super(1, !1), this.radiusY=1, this.radiusX=1
}
getColorOutput(e) {
const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const n=this.radiusY+this.radiusY+1, r=65536/n|0, i=65536/(this.radiusX+this.radiusX+1)|0, a=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(n)
;
for(let t=e-this.radiusY;
t<=e+this.radiusY;
t++) {
  const n=this.getChildColorOutput(0, t&T.heightMask), r=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([3, T.width])
;
let s=0, o=0;
const l=n[0];
let c=0;
const u=n[2], h=n[1];
for(let e=-this.radiusX;
e<=this.radiusX;
e++) {
  const t=T.widthMask&e;
c+=h[t], s+=l[t], o+=u[t]
}
const d=r[0], p=r[1], f=r[2];
let m=0;
for(;
T.width>m;
) {
  d[m]=i*s>>16, p[m]=c*i>>16, f[m]=i*o>>16
;
let e=m-this.radiusX&T.widthMask;
const t=c-h[e], n=s-l[e];
m++;
const r=o-u[e];
e=m+this.radiusX&T.widthMask, s=n+l[e], c=t+h[e], o=r+u[e]
}
a[t+this.radiusY-e]=r
}
const s=t[1], o=t[2], l=t[0];
for(let e=0;
e<T.width;
e++) {
  let t=0, i=0, c=0;
for(let r=0;
r<n;
r++) {
const n=a[r];
c+=n[2][e], t+=n[0][e], i+=n[1][e]
}
l[e]=r*t>>16, s[e]=r*i>>16, o[e]=c*r>>16
}
}
return t
}
decode(e, t) {
  0===t?this.radiusX=e.readUnsignedByte():1===t?this.radiusY=e.readUnsignedByte():2===t&&(this.monochrome=1===e.readUnsignedByte())
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.radiusY+this.radiusY+1, r=65536/n|0, i=65536/(this.radiusX+this.radiusX+1)|0, a=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(n)
;
for(let t=e-this.radiusY;
t<=e+this.radiusY;
t++) {
  const n=this.getChildMonochromeOutput(0, T.heightMask&t), r=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(T.width);
let s=0;
for(let e=-this.radiusX;
e<=this.radiusX;
e++)s+=n[e&T.widthMask];
let o=0
;
for(;
o<T.width;
) {
  r[o]=s*i>>16;
const e=s-n[o-this.radiusX&T.widthMask];
o++, s=e+n[T.widthMask&o+this.radiusX]
}
a[t+this.radiusY-e]=r
}
for(let e=0;
e<T.width;
e++) {
  let i=0;
for(let t=0;
t<n;
t++)i+=a[t][e];
t[e]=i*r>>16
}
}
return t
}
}
I.__class="TextureOpBoxBlur"
;
class R extends y {
  constructor() {
  super(0, !0), void 0===this.anInt4937&&(this.anInt4937=0), void 0===this.anIntArrayArray41&&(this.anIntArrayArray41=null), void 0===this.anInt4948&&(this.anInt4948=0), 
void 0===this.anIntArray536&&(this.anIntArray536=null), void 0===this.anInt4949&&(this.anInt4949=0), void 0===this.anIntArrayArray42&&(this.anIntArrayArray42=null), this.anInt4935=81, this.anInt4943=4, this.anInt4944=0, this.anInt4942=1024, 
this.anInt4941=1024, this.anInt4945=409, this.anInt4954=204, this.anInt4936=8
}
method4057() {
  const e=new u(this.anInt4936);
this.anInt4937=4096/this.anInt4936|0, this.anIntArray536=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(this.anInt4936+1), 
this.anIntArrayArray41=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([this.anInt4936, this.anInt4943+1]), this.anIntArrayArray42=function(e) {
  let t=function(e) {
if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([this.anInt4936, this.anInt4943]), this.anIntArray536[0]=0, this.anInt4949=4096/this.anInt4943|0;
const t=this.anInt4949/2|0
;
this.anInt4948=this.anInt4935/2|0;
const n=this.anInt4937/2|0;
for(let r=0;
r<this.anInt4936;
r++) {
  if(r>0) {
  let t=this.anInt4937;
t+=((h.nextInt(e, 4096)-2048)*this.anInt4954>>12)*n>>12, this.anIntArray536[r]=t+this.anIntArray536[r-1]
}
this.anIntArrayArray41[r][0]=0;
for(let n=0;
n<this.anInt4943;
n++) {
  if(n>0) {
  let i=this.anInt4949;
i+=t*((h.nextInt(e, 4096)-2048)*this.anInt4945>>12)>>12, this.anIntArrayArray41[r][n]=this.anIntArrayArray41[r][n-1]+i
}
this.anIntArrayArray42[r][n]=this.anInt4941<=0?4096:4096-h.nextInt(e, this.anInt4941)
}
this.anIntArrayArray41[r][this.anInt4943]=4096
}
this.anIntArray536[this.anInt4936]=4096
}
postDecode() {
  this.method4057()
}
decode(e, t) {
0===t?this.anInt4943=e.readUnsignedByte():1===t?this.anInt4936=e.readUnsignedByte():2===t?this.anInt4945=e.readUnsignedShort():3===t?this.anInt4954=e.readUnsignedShort():4===t?this.anInt4942=e.readUnsignedShort():5===t?this.anInt4944=e.readUnsignedShort():6===t?this.anInt4935=e.readUnsignedShort():7===t&&(this.anInt4941=e.readUnsignedShort())
}
getMonochromeOutput(e) {
  const n=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  let r, i=0;
for(r=this.anInt4944+T.normalisedY[e];
r<0;
r+=4096);
for(;
r>4096;
)r-=4096;
for(;
this.anInt4936>i&&r>=this.anIntArray536[i];
)i++
;
const a=i-1, s=this.anIntArray536[i], o=!(1&i);
if(this.anIntArray536[i-1]+this.anInt4948<r&&r<s-this.anInt4948)for(let e=0;
e<T.width;
e++) {
  const t=o?this.anInt4942:-this.anInt4942;
let r=T.normalisedX[e]+(t*this.anInt4949>>12), i=0;
for(;
r<0;
)r+=4096
;
for(;
r>4096;
)r-=4096;
for(;
i<this.anInt4943&&r>=this.anIntArrayArray41[a][i];
)i++;
const s=this.anIntArrayArray41[a][i], l=i-1;
this.anIntArrayArray41[a][l]+this.anInt4948<r&&s-this.anInt4948>r?n[e]=this.anIntArrayArray42[a][l]:n[e]=0
}
else t.fill$int_A$int$int$int(n, 0, T.width, 0)
}
return n
}
}
R.__class="TextureOpBricks";
class k extends y {
  constructor() {
  super(1, !1), this.maxValue=409, this.redFactor=4096, this.blueFactor=4096, this.colorDelta=[0, 0, 0], this.greenFactor=4096
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const n=this.getChildColorOutput(0, e), r=n[0], i=n[1], a=n[2], s=t[1], o=t[0], l=t[2];
for(let e=0;
e<T.width;
e++) {
  const t=r[e];
let n=t-this.colorDelta[0]
;
if(n<0&&(n=-n), n<=this.maxValue) {
  const n=i[e];
let r=n-this.colorDelta[1];
if(r<0&&(r=-r), r<=this.maxValue) {
  const r=a[e];
let i=r-this.colorDelta[2];
i<0&&(i=-i), i<=this.maxValue?(o[e]=t*this.redFactor>>12, s[e]=n*this.greenFactor>>12, 
l[e]=r*this.blueFactor>>12):(o[e]=t, s[e]=n, l[e]=r)
}
else o[e]=t, s[e]=n, l[e]=a[e]
}
else o[e]=t, s[e]=i[e], l[e]=a[e]
}
}
return t
}
decode(e, t) {
if(0===t)this.maxValue=e.readUnsignedShort();
else if(1===t)this.blueFactor=e.readUnsignedShort();
else if(2===t)this.greenFactor=e.readUnsignedShort();
else if(3===t)this.redFactor=e.readUnsignedShort();
else if(4===t) {
  const t=e.readUnsignedMedium()
;
this.colorDelta[0]=(16711680&t)<<4, this.colorDelta[2]=0, this.colorDelta[1]=t>>4&4080
}
}
}
k.__class="TextureOpBrightness";
class N extends y {
  constructor() {
  super(1, !1), this.minValue=0, this.maxValue=4096
}
decode(e, t) {
0===t?this.minValue=e.readUnsignedShort():1===t?this.maxValue=e.readUnsignedShort():2===t&&(this.monochrome=1===e.readUnsignedByte())
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
const n=this.getChildMonochromeOutput(0, e);
for(let e=0;
e<T.width;
e++) {
  const r=n[e];
r<this.minValue?t[e]=this.minValue:r>this.maxValue?t[e]=this.maxValue:t[e]=r
}
}
return t
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e)
;
if(this.colorImageCache.invalid) {
  const n=this.getChildColorOutput(0, e), r=n[0], i=n[1], a=t[0], s=n[2], o=t[1], l=t[2];
for(let e=0;
e<T.width;
e++) {
  const t=i[e], n=r[e], c=s[e];
n<this.minValue?a[e]=this.minValue:n>this.maxValue?a[e]=this.maxValue:a[e]=n, 
t<this.minValue?o[e]=this.minValue:t>this.maxValue?o[e]=this.maxValue:o[e]=t, c<this.minValue?l[e]=this.minValue:c>this.maxValue?l[e]=this.maxValue:l[e]=c
}
}
return t
}
}
N.__class="TextureOpClamp";
class D extends y {
  constructor() {
  super(1, !1), 
this.anInt3634=4096, this.aBoolean263=!0
}
decode(e, t) {
  0===t?this.anInt3634=e.readUnsignedShort():1===t&&(this.aBoolean263=1===e.readUnsignedByte())
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
const n=this.getChildMonochromeOutput(0, T.heightMask&e-1), r=this.getChildMonochromeOutput(0, e), i=this.getChildMonochromeOutput(0, e+1&T.heightMask), a=t[0], s=t[1], o=t[2];
for(let e=0;
e<T.width;
e++) {
const t=(i[e]-n[e])*this.anInt3634, l=this.anInt3634*(r[e+1&T.widthMask]-r[e-1&T.widthMask]), c=t>>12, u=l>>12, h=c*c>>12, d=u*u>>12, p=4096*Math.sqrt(Math.fround((h+d+4096)/4096))|0;
let f, m, g;
0===p?(m=0, g=0, f=0):(m=t/p|0, g=16777216/p|0, f=l/p|0), 
this.aBoolean263&&(f=2048+(f>>1), m=2048+(m>>1), g=2048+(g>>1)), a[e]=f, s[e]=m, o[e]=g
}
}
return t
}
}
D.__class="TextureOpColorEdgeDetector";
class L extends y {
  constructor(e) {
  if("number"==typeof e||null===e)super(0, !1), void 0===this.blue&&(this.blue=0), 
void 0===this.green&&(this.green=0), void 0===this.red&&(this.red=0), this.setColor(e);
else {
  if(void 0!==e)throw new Error("invalid overload");
 {
  let e=0;
super(0, !1), void 0===this.blue&&(this.blue=0), void 0===this.green&&(this.green=0), 
void 0===this.red&&(this.red=0), this.setColor(e)
}
void 0===this.blue&&(this.blue=0), void 0===this.green&&(this.green=0), void 0===this.red&&(this.red=0)
}
}
decode(e, t) {
  0===t&&this.setColor(e.readUnsignedMedium())
}
getColorOutput(e) {
const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const e=t[1], n=t[0], r=t[2];
for(let t=0;
t<T.width;
t++)n[t]=this.red, e[t]=this.green, r[t]=this.blue
}
return t
}
setColor(e) {
  this.green=e>>4&4080, this.red=e>>12&4080, 
this.blue=(255&e)<<4
}
}
L.__class="TextureOpColorFill";
class O extends y {
  constructor() {
  super(1, !1), void 0===this.samples&&(this.samples=null), this.colors=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(257)
}
setPreset(e) {
if(0!==e)if(1===e)this.samples=function() {
  let e=function(t) {
  if(0===t.length)return 0;
 {
  let n=[];
for(let r=0;
r<t[0];
r++)n.push(e(t.slice(1)));
return n
}
}
;
return e([2, 4])
}
(), this.samples[0][0]=0, this.samples[0][3]=0, this.samples[0][1]=0, 
this.samples[1][0]=4096, this.samples[0][2]=0, this.samples[1][2]=4096, this.samples[1][1]=4096, this.samples[1][3]=4096;
else if(2===e)this.samples=function() {
  let e=function(t) {
  if(0===t.length)return 0;
 {
  let n=[]
;
for(let r=0;
r<t[0];
r++)n.push(e(t.slice(1)));
return n
}
}
;
return e([8, 4])
}
(), this.samples[0][0]=0, this.samples[0][1]=2650, this.samples[0][2]=2602, this.samples[1][0]=2867, this.samples[2][0]=3072, this.samples[1][2]=1799, this.samples[1][1]=2313, 
this.samples[2][2]=1734, this.samples[3][2]=1220, this.samples[4][2]=963, this.samples[0][3]=2361, this.samples[5][2]=2152, this.samples[3][0]=3276, this.samples[2][1]=2618, this.samples[6][2]=1060, this.samples[4][0]=3481, this.samples[1][3]=1558, 
this.samples[7][2]=1413, this.samples[5][0]=3686, this.samples[6][0]=3891, this.samples[7][0]=4096, this.samples[3][1]=2296, this.samples[2][3]=1413, this.samples[3][3]=947, this.samples[4][1]=2072, this.samples[5][1]=2730, this.samples[6][1]=2232, 
this.samples[7][1]=1686, this.samples[4][3]=722, this.samples[5][3]=1766, this.samples[6][3]=915, this.samples[7][3]=1140;
else if(3===e)this.samples=function() {
  let e=function(t) {
  if(0===t.length)return 0;
 {
  let n=[]
;
for(let r=0;
r<t[0];
r++)n.push(e(t.slice(1)));
return n
}
}
;
return e([7, 4])
}
(), this.samples[0][3]=4096, this.samples[0][2]=0, this.samples[1][3]=4096, this.samples[2][3]=0, this.samples[0][0]=0, this.samples[3][3]=0, this.samples[4][3]=0, 
this.samples[1][2]=4096, this.samples[2][2]=4096, this.samples[5][3]=4096, this.samples[3][2]=4096, this.samples[0][1]=0, this.samples[1][0]=663, this.samples[1][1]=0, this.samples[6][3]=4096, this.samples[2][1]=0, this.samples[4][2]=0, this.samples[5][2]=0, 
this.samples[2][0]=1363, this.samples[3][0]=2048, this.samples[3][1]=4096, this.samples[4][0]=2727, this.samples[6][2]=0, this.samples[4][1]=4096, this.samples[5][0]=3411, this.samples[6][0]=4096, this.samples[5][1]=4096, 
this.samples[6][1]=0;
else if(4===e)this.samples=function() {
  let e=function(t) {
  if(0===t.length)return 0;
 {
  let n=[];
for(let r=0;
r<t[0];
r++)n.push(e(t.slice(1)));
return n
}
}
;
return e([6, 4])
}
(), this.samples[0][0]=0, this.samples[0][1]=0, this.samples[0][2]=0, 
this.samples[1][2]=0, this.samples[0][3]=0, this.samples[1][0]=1843, this.samples[1][1]=0, this.samples[2][0]=2457, this.samples[1][3]=1493, this.samples[2][1]=0, this.samples[3][1]=0, this.samples[2][2]=0, this.samples[3][2]=1124, this.samples[3][0]=2781, 
this.samples[2][3]=2939, this.samples[3][3]=3565, this.samples[4][0]=3481, this.samples[5][0]=4096, this.samples[4][3]=4031, this.samples[4][2]=3084, this.samples[4][1]=546, this.samples[5][2]=4096, this.samples[5][3]=4096, 
this.samples[5][1]=4096;
else if(5===e)this.samples=function() {
  let e=function(t) {
  if(0===t.length)return 0;
 {
  let n=[];
for(let r=0;
r<t[0];
r++)n.push(e(t.slice(1)));
return n
}
}
;
return e([16, 4])
}
(), this.samples[0][2]=192, this.samples[0][1]=80, 
this.samples[0][3]=321, this.samples[0][0]=0, this.samples[1][2]=449, this.samples[1][1]=321, this.samples[2][1]=578, this.samples[1][3]=562, this.samples[2][2]=690, this.samples[2][3]=803, this.samples[3][3]=1140, this.samples[3][1]=947, 
this.samples[3][2]=995, this.samples[1][0]=155, this.samples[2][0]=389, this.samples[3][0]=671, this.samples[4][2]=1397, this.samples[5][2]=1429, this.samples[4][0]=897, this.samples[4][3]=1509, this.samples[6][2]=1461, this.samples[5][3]=1413, 
this.samples[4][1]=1285, this.samples[6][3]=1333, this.samples[5][0]=1175, this.samples[7][3]=1702, this.samples[8][3]=2056, this.samples[6][0]=1368, this.samples[9][3]=2666, this.samples[10][3]=3276, this.samples[5][1]=1525, this.samples[7][0]=1507, 
this.samples[7][2]=1525, this.samples[6][1]=1734, this.samples[11][3]=3228, this.samples[8][0]=1736, this.samples[9][0]=2088, this.samples[7][1]=1413, this.samples[8][2]=1590, this.samples[9][2]=2056, this.samples[8][1]=1108, this.samples[10][0]=2355, 
this.samples[9][1]=1766, this.samples[11][0]=2691, this.samples[10][1]=2409, this.samples[12][0]=3031, this.samples[13][0]=3522, this.samples[10][2]=2586, this.samples[11][1]=3116, this.samples[11][2]=3148, this.samples[12][3]=3196, this.samples[14][0]=3727, 
this.samples[15][0]=4096, this.samples[12][2]=3710, this.samples[13][3]=3019, this.samples[13][2]=3421, this.samples[12][1]=3806, this.samples[14][3]=3228, this.samples[15][3]=2746, this.samples[13][1]=3437, this.samples[14][1]=3116, this.samples[15][1]=2377, 
this.samples[14][2]=3148, this.samples[15][2]=2505;
else {
  if(6!==e)throw Object.defineProperty(new Error("Invalid gradient preset"), "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
);
this.samples=function() {
  let e=function(t) {
  if(0===t.length)return 0;
 {
  let n=[];
for(let r=0;
r<t[0];
r++)n.push(e(t.slice(1)));
return n
}
}
;
return e([4, 4])
}
(), this.samples[0][3]=0, this.samples[0][1]=0, this.samples[1][3]=0, this.samples[0][2]=4096, this.samples[1][2]=4096, this.samples[2][3]=0, this.samples[2][2]=4096, this.samples[0][0]=2048, this.samples[3][3]=0, this.samples[1][1]=4096, this.samples[3][2]=0, 
this.samples[1][0]=2867, this.samples[2][1]=4096, this.samples[3][1]=4096, this.samples[2][0]=3276, this.samples[3][0]=4096
}
}
interpolate() {
  const e=this.samples.length;
if(!(e<=0))for(let t=0;
t<257;
t++) {
  let n=0;
const r=t<<4
;
for(let t=0;
t<e&&r>=this.samples[t][0];
t++)n++;
let i, a, s;
if(n>=e) {
  const t=this.samples[e-1];
s=t[3], i=t[1], a=t[2]
}
else {
  const e=this.samples[n];
if(n<=0)a=e[2], i=e[1], s=e[3];
else {
  const t=this.samples[n-1], o=(r-t[0]<<12)/(e[0]-t[0])|0, l=4096-o
;
a=e[2]*o+t[2]*l>>12, i=e[1]*o+t[1]*l>>12, s=e[3]*o+t[3]*l>>12
}
}
let o=a>>4;
o<0?o=0:o>255&&(o=255);
let l=s>>4, c=i>>4;
c<0?c=0:c>255&&(c=255), l<0?l=0:l>255&&(l=255), this.colors[t]=l|o<<8|c<<16
}
}
postDecode() {
  null==this.samples&&this.setPreset(1), 
this.interpolate()
}
decode(e, t) {
  if(0!==t)return;
const n=e.readUnsignedByte();
if(0===n) {
  this.samples=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([e.readUnsignedByte(), 4]);
for(let t=0;
t<this.samples.length;
t++)this.samples[t][0]=e.readUnsignedShort(), this.samples[t][1]=e.readUnsignedByte()<<4, this.samples[t][2]=e.readUnsignedByte()<<4, this.samples[t][3]=e.readUnsignedByte()<<4
}
else this.setPreset(n)
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const n=this.getChildMonochromeOutput(0, e), r=t[1], i=t[2], a=t[0];
for(let e=0;
e<T.width;
e++) {
  let t=n[e]>>4;
t<0&&(t=0), t>256&&(t=256)
;
const s=this.colors[t];
a[e]=s>>12&4080, r[e]=s>>4&4080, i[e]=(255&s)<<4
}
}
return t
}
}
O.__class="TextureOpColorGradient";
class P extends y {
  constructor() {
  super(1, !1), this.green=4096, this.red=4096, this.blue=4096
}
decode(e, t) {
0===t?this.red=e.readUnsignedShort():1===t?this.green=e.readUnsignedShort():2===t&&(this.blue=e.readUnsignedShort())
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
const n=this.getChildColorOutput(0, e), r=n[1], i=n[0], a=t[0], s=t[1], o=n[2], l=t[2];
for(let e=0;
e<T.width;
e++) {
  const t=i[e], n=o[e], c=r[e];
t===n&&n===c?(a[e]=this.red*t>>12, s[e]=this.green*n>>12, l[e]=this.blue*c>>12):(a[e]=this.red, s[e]=this.green, 
l[e]=this.blue)
}
}
return t
}
}
P.__class="TextureOpColorize";
class F extends y {
  constructor() {
  super(2, !1), this.function=6
}
decode(e, t) {
  0===t?this.function=e.readUnsignedByte():1===t&&(this.monochrome=1===e.readUnsignedByte())
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.getChildMonochromeOutput(0, e), r=this.getChildMonochromeOutput(1, e), i=this.function
;
if(1===i)for(let e=0;
e<T.width;
e++)t[e]=r[e]+n[e];
else if(2===i)for(let e=0;
e<T.width;
e++)t[e]=n[e]-r[e];
else if(3===i)for(let e=0;
e<T.width;
e++)t[e]=n[e]*r[e]>>12;
else if(4===i)for(let e=0;
e<T.width;
e++) {
  const i=r[e];
t[e]=0===i?4096:(n[e]<<12)/i|0
}
else if(5===i)for(let e=0;
e<T.width;
e++)t[e]=4096-((4096-n[e])*(4096-r[e])>>12);
else if(6===i)for(let e=0;
e<T.width;
e++) {
  const i=r[e];
t[e]=i>=2048?4096-((4096-i)*(4096-n[e])>>11):i*n[e]>>11
}
else if(7===i)for(let e=0;
e<T.width;
e++) {
  const i=n[e]
;
t[e]=4096===i?4096:(r[e]<<12)/(4096-i)|0
}
else if(8===i)for(let e=0;
e<T.width;
e++) {
  const i=n[e];
t[e]=0===i?0:4096-((4096-r[e]<<12)/i|0)
}
else if(9===i)for(let e=0;
e<T.width;
e++) {
  const i=n[e], a=r[e];
t[e]=i<a?i:a
}
else if(10===i)for(let e=0;
e<T.width;
e++) {
  const i=n[e], a=r[e];
t[e]=i<=a?a:i
}
else if(11===i)for(let e=0;
e<T.width;
e++) {
  const i=r[e], a=n[e];
t[e]=a>i?a-i:i-a
}
else if(12===i)for(let e=0;
e<T.width;
e++) {
  const i=n[e], a=r[e];
t[e]=i+a-(i*a>>11)
}
}
return t
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const n=this.getChildColorOutput(0, e), r=this.getChildColorOutput(1, e), i=t[0], a=t[1], s=n[0], o=t[2], l=n[1], c=r[2], u=n[2], h=r[1], d=r[0], p=this.function
;
if(1===p)for(let e=0;
e<T.width;
e++)i[e]=s[e]+d[e], a[e]=l[e]+h[e], o[e]=u[e]+c[e];
else if(2===p)for(let e=0;
e<T.width;
e++)i[e]=s[e]-d[e], a[e]=l[e]-h[e], o[e]=u[e]-c[e];
else if(3===p)for(let e=0;
e<T.width;
e++)i[e]=s[e]*d[e]>>12, a[e]=h[e]*l[e]>>12, 
o[e]=c[e]*u[e]>>12;
else if(4===p)for(let e=0;
e<T.width;
e++) {
  const t=h[e], n=d[e], r=c[e];
i[e]=0===n?4096:(s[e]<<12)/n|0, a[e]=0===t?4096:(l[e]<<12)/t|0, o[e]=0===r?4096:(u[e]<<12)/r|0
}
else if(5===p)for(let e=0;
e<T.width;
e++)i[e]=4096-((4096-s[e])*(4096-d[e])>>12), a[e]=4096-((4096-l[e])*(4096-h[e])>>12), o[e]=4096-((4096-u[e])*(4096-c[e])>>12);
else if(6===p)for(let e=0;
e<T.width;
e++) {
  const t=h[e], n=d[e], r=c[e]
;
i[e]=n>=2048?4096-((4096-s[e])*(4096-n)>>11):n*s[e]>>11, a[e]=t>=2048?4096-((4096-l[e])*(4096-t)>>11):l[e]*t>>11, o[e]=r>=2048?4096-((4096-u[e])*(4096-r)>>11):u[e]*r>>11
}
else if(7===p)for(let e=0;
e<T.width;
e++) {
  const t=u[e], n=l[e], r=s[e]
;
i[e]=4096===r?4096:(d[e]<<12)/(4096-r)|0, a[e]=4096===n?4096:(h[e]<<12)/(4096-n)|0, o[e]=4096===t?4096:(c[e]<<12)/(4096-t)|0
}
else if(8===p)for(let e=0;
e<T.width;
e++) {
  const t=l[e], n=u[e], r=s[e];
i[e]=0===r?0:4096-((4096-d[e]<<12)/r|0), 
a[e]=0===t?0:4096-((4096-h[e]<<12)/t|0), o[e]=0===n?0:4096-((4096-c[e]<<12)/n|0)
}
else if(9===p)for(let e=0;
e<T.width;
e++) {
  const t=u[e], n=c[e], r=h[e], p=d[e], f=s[e], m=l[e];
i[e]=f<p?f:p, a[e]=m<r?m:r, o[e]=t<n?t:n
}
else if(10===p)for(let e=0;
e<T.width;
e++) {
const t=s[e], n=u[e], r=c[e], p=d[e], f=h[e], m=l[e];
i[e]=t>p?t:p, a[e]=m>f?m:f, o[e]=n>r?n:r
}
else if(11===p)for(let e=0;
e<T.width;
e++) {
  const t=d[e], n=h[e], r=u[e], p=c[e], f=s[e], m=l[e];
i[e]=f<=t?t-f:f-t, a[e]=m<=n?n-m:m-n, o[e]=r<=p?p-r:r-p
}
else if(12===p)for(let e=0;
e<T.width;
e++) {
  const t=l[e], n=u[e], r=d[e], p=c[e], f=s[e], m=h[e];
i[e]=r+f-(f*r>>11), a[e]=t+m-(t*m>>11), o[e]=n+p-(n*p>>11)
}
}
return t
}
}
F.__class="TextureOpCombine";
class U extends y {
  constructor() {
  super(1, !0), 
void 0===this.markers&&(this.markers=null), void 0===this.firstMarker&&(this.firstMarker=null), void 0===this.lastMarker&&(this.lastMarker=null), this.aShortArray73=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(257), this.anInt3819=0
}
getMarker(e) {
return e<0?this.firstMarker:e<this.markers.length?this.markers[e]:this.lastMarker
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.getChildMonochromeOutput(0, e)
;
for(let e=0;
e<T.width;
e++) {
  let r=n[e]>>4;
r<0&&(r=0), r>256&&(r=256), t[e]=this.aShortArray73[r]
}
}
return t
}
method3182() {
  const e=this.anInt3819;
if(2===e)for(let e=0;
e<257;
e++) {
  const t=e<<4;
let n
;
for(n=1;
n<this.markers.length-1&&t>=this.markers[n][0];
n++);
const r=this.markers[n], i=this.markers[n-1], a=this.getMarker(n-2)[1], s=r[1], o=i[1], l=s-a, c=this.getMarker(n+1)[1], u=(t-i[0]<<12)/(r[0]-i[0])|0, h=c+o-a-s, d=u*u>>12
;
let p=((u*h>>12)*d>>12)+(d*(a-o-h)>>12)+(u*l>>12)+o;
p<=-32768&&(p=-32767), p>=32768&&(p=32767), this.aShortArray73[e]=0|p
}
else if(1===e)for(let e=0;
e<257;
e++) {
  const t=e<<4;
let n;
for(n=1;
this.markers.length-1>n&&this.markers[n][0]<=t;
n++);
const r=this.markers[n-1], i=this.markers[n], a=(t-r[0]<<12)/(i[0]-r[0])|0, s=4096-y.COSINE[a>>5&255]>>1, o=4096-s;
let l=s*i[1]+o*r[1]>>12;
l<=-32768&&(l=-32767), l>=32768&&(l=32767), this.aShortArray73[e]=0|l
}
else for(let e=0;
e<257;
e++) {
  const t=e<<4;
let n
;
for(n=1;
this.markers.length-1>n&&t>=this.markers[n][0];
n++);
const r=this.markers[n-1], i=this.markers[n], a=(t-r[0]<<12)/(i[0]-r[0])|0, s=4096-a;
let o=i[1]*a+s*r[1]>>12;
o<=-32768&&(o=-32767), o>=32768&&(o=32767), this.aShortArray73[e]=0|o
}
}
method3183() {
const e=this.markers[0], t=this.markers[1], n=this.markers[this.markers.length-1], r=this.markers[this.markers.length-2];
this.lastMarker=[r[0]+r[0]-n[0], r[1]+r[1]-n[1]], this.firstMarker=[e[0]+e[0]-t[0], e[1]+e[1]-t[1]]
}
postDecode() {
if(null==this.markers&&(this.markers=[[0, 0], [4096, 4096]]), this.markers.length<2)throw Object.defineProperty(new Error("Curve operation requires at least two markers"), "__classes",  {
  configurable:!0, 
value:["java.lang.Throwable", "java.lang.Object", "java.lang.RuntimeException", "java.lang.Exception"]
}
);
2===this.anInt3819&&this.method3183(), y.createTrigonometryTables(), this.method3182()
}
decode(e, t) {
  if(0===t) {
  this.anInt3819=e.readUnsignedByte(), 
this.markers=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([e.readUnsignedByte(), 2])
;
for(let t=0;
t<this.markers.length;
t++)this.markers[t][0]=e.readUnsignedShort(), this.markers[t][1]=e.readUnsignedShort()
}
}
}
U.__class="TextureOpCurve";
class B extends y {
  constructor() {
  super(1, !0), this.azimuth=3216, this.elevation=3216, this.depth=4096, 
this.anIntArray57=[0, 0, 0]
}
decode(e, t) {
  0===t?this.depth=e.readUnsignedShort():1===t?this.azimuth=e.readUnsignedShort():2===t&&(this.elevation=e.readUnsignedShort())
}
postDecode() {
  this.method642()
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
const n=T.widthTimes32*this.depth>>12, r=this.getChildMonochromeOutput(0, e-1&T.heightMask), i=this.getChildMonochromeOutput(0, e), a=this.getChildMonochromeOutput(0, T.heightMask&e+1);
for(let e=0;
e<T.width;
e++) {
const s=n*(i[T.widthMask&e-1]-i[T.widthMask&e+1])>>12;
let o=s>>4;
const l=(a[e]-r[e])*n>>12;
o<0&&(o=-o);
let c=l>>4;
c<0&&(c=-c), c>255&&(c=255), o>255&&(o=255);
const u=255&p.INVERSE_SQUARE_ROOT_$LI$()[o+((c+1)*c>>1)];
let h=s*u>>8, d=u*l>>8
;
h=this.anIntArray57[0]*h>>12;
let f=4096*u>>8;
d=this.anIntArray57[1]*d>>12, f=this.anIntArray57[2]*f>>12, t[e]=f+d+h
}
}
return t
}
method642() {
  const e=Math.cos(Math.fround(this.elevation/4096))
;
this.anIntArray57[0]=4096*Math.sin(Math.fround(this.azimuth/4096))*e|0, this.anIntArray57[1]=Math.cos(Math.fround(this.azimuth/4096))*e*4096|0, this.anIntArray57[2]=4096*Math.sin(Math.fround(this.elevation/4096))|0
;
const t=this.anIntArray57[0]*this.anIntArray57[0]>>12, n=this.anIntArray57[2]*this.anIntArray57[2]>>12, r=this.anIntArray57[1]*this.anIntArray57[1]>>12, i=4096*Math.sqrt(n+t+r>>12)|0;
0!==i&&(this.anIntArray57[0]=(this.anIntArray57[0]<<12)/i|0, 
this.anIntArray57[2]=(this.anIntArray57[2]<<12)/i|0, this.anIntArray57[1]=(this.anIntArray57[1]<<12)/i|0)
}
}
B.__class="TextureOpEmboss";
class z extends y {
  constructor() {
  super(1, !1), this.flipVertical=!0, this.flipHorizontal=!0
}
getMonochromeOutput(e) {
const n=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const r=this.getChildMonochromeOutput(0, this.flipVertical?T.heightMask-e:e)
;
if(this.flipHorizontal)for(let e=0;
e<T.width;
e++)n[e]=r[T.widthMask-e];
else t.copy$int_A$int$int_A$int$int(r, 0, n, 0, T.width)
}
return n
}
decode(e, t) {
0===t?this.flipHorizontal=1===e.readUnsignedByte():1===t?this.flipVertical=1===e.readUnsignedByte():2===t&&(this.monochrome=1===e.readUnsignedByte())
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
const n=this.getChildColorOutput(0, this.flipVertical?T.heightMask-e:e), r=n[0], i=n[1], a=t[0], s=n[2], o=t[1], l=t[2];
if(this.flipHorizontal)for(let e=0;
e<T.width;
e++)a[e]=r[T.widthMask-e], o[e]=i[T.widthMask-e], 
l[e]=s[T.widthMask-e];
else for(let e=0;
e<T.width;
e++)a[e]=r[e], o[e]=i[e], l[e]=s[e]
}
return t
}
}
z.__class="TextureOpFlip";
class G extends y {
  constructor() {
  super(0, !0), this.scaleX=1, this.ratio=204, this.scaleY=1
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid)for(let n=0;
n<T.width;
n++) {
  const r=T.normalisedX[n];
let i=r*this.scaleX>>12;
const a=T.normalisedY[e], s=a*this.scaleY>>12, o=this.scaleX*(r%(4096/this.scaleX|0))
;
if(a%(4096/this.scaleY|0)*this.scaleY<this.ratio) {
  for(i-=s;
i<0;
i+=4);
for(;
i>3;
)i-=4;
if(1!==i) {
  t[n]=0;
continue
}
if(o<this.ratio) {
  t[n]=0;
continue
}
}
if(o<this.ratio) {
  let e;
for(e=i-s;
e<0;
e+=4);
for(;
e>3;
)e-=4;
if(e>0) {
  t[n]=0;
continue
}
}
t[n]=4096
}
return t
}
decode(e, t) {
  0===t?this.scaleX=e.readUnsignedByte():1===t?this.scaleY=e.readUnsignedByte():2===t&&(this.ratio=e.readUnsignedShort())
}
}
G.__class="TextureOpHerringbone";
class V extends y {
  constructor() {
  super(0, !0)
}
getMonochromeOutput(e) {
return T.normalisedX
}
}
V.__class="TextureOpHorizontalGradient";
class H extends y {
  constructor() {
  super(1, !1), void 0===this.red&&(this.red=0), void 0===this.green&&(this.green=0), void 0===this.hue&&(this.hue=0), void 0===this.lightness&&(this.lightness=0), 
void 0===this.saturation&&(this.saturation=0), void 0===this.blue&&(this.blue=0), this.lightnessDelta=0, this.hueDelta=0, this.saturationDelta=0
}
hslToRgb(e, t, n) {
  const r=n>2048?t+n-(n*t>>12):n*(t+4096)>>12
;
if(r<=0)return void(this.red=this.green=this.blue=n);
const i=n+n-r, a=(e*=6)>>12;
let s=((r-i<<12)/r|0)*r>>12;
s=s*(e-(a<<12))>>12;
const o=r-s, l=i+s;
0===a?(this.green=l, this.red=r, this.blue=i):1===a?(this.green=r, this.red=o, 
this.blue=i):2===a?(this.red=i, this.green=r, this.blue=l):3===a?(this.red=i, this.green=o, this.blue=r):4===a?(this.red=l, this.green=i, this.blue=r):5===a&&(this.green=i, this.red=r, this.blue=o)
}
decode(e, t) {
0===t?this.hueDelta=e.readShort():1===t?this.saturationDelta=(e.readByte()<<12)/100|0:2===t&&(this.lightnessDelta=(e.readByte()<<12)/100|0)
}
rgbToHsl(e, t, n) {
  let r=e>t?e:t;
r=n>r?n:r;
let i=e<t?e:t;
i=n<i?n:i, this.lightness=(r+i)/2|0;
const a=r-i
;
if(a<=0)this.hue=0;
else {
  const o=(r-n<<12)/a|0, l=(r-e<<12)/a|0, c=(r-t<<12)/a|0;
this.hue=r===e?i===t?o+20480:4096-c:r===t?i===n?l+4096:12288-o:i===e?c+12288:20480-l, this.hue=(s=this.hue/6)<0?Math.ceil(s):Math.floor(s)
}
var s
;
this.lightness>0&&this.lightness<4096?this.saturation=(a<<12)/(this.lightness<=2048?2*this.lightness:8192-2*this.lightness)|0:this.saturation=0
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
const n=this.getChildColorOutput(0, e), r=n[0], i=n[1], a=t[0], s=n[2], o=t[1], l=t[2];
for(let e=0;
e<T.width;
e++) {
  for(this.rgbToHsl(r[e], i[e], s[e]), this.lightness+=this.lightnessDelta, this.saturation+=this.saturationDelta, 
this.saturation<0&&(this.saturation=0), this.hue+=this.hueDelta, this.saturation>4096&&(this.saturation=4096);
this.hue<0;
)this.hue+=4096;
for(this.lightness<0&&(this.lightness=0), this.lightness>4096&&(this.lightness=4096);
this.hue>4096;
)this.hue-=4096
;
this.hslToRgb(this.hue, this.saturation, this.lightness), a[e]=this.red, o[e]=this.green, l[e]=this.blue
}
}
return t
}
}
H.__class="TextureOpHslAdjust";
class j extends y {
  constructor() {
  super(3, !1)
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.getChildMonochromeOutput(0, e), r=this.getChildMonochromeOutput(1, e), i=this.getChildMonochromeOutput(2, e);
for(let e=0;
e<T.width;
e++) {
  const a=i[e]
;
t[e]=4096===a?n[e]:0===a?r[e]:a*n[e]+r[e]*(4096-a)>>12
}
}
return t
}
decode(e, t) {
  0===t&&(this.monochrome=1===e.readUnsignedByte())
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
const n=this.getChildMonochromeOutput(2, e), r=this.getChildColorOutput(0, e), i=this.getChildColorOutput(1, e), a=t[0], s=t[1], o=t[2], l=r[1], c=r[0], u=i[1], h=i[0], d=r[2], p=i[2];
for(let e=0;
e<T.width;
e++) {
  const t=n[e];
if(4096===t)a[e]=c[e], s[e]=l[e], 
o[e]=d[e];
else if(0===t)a[e]=h[e], s[e]=u[e], o[e]=p[e];
else {
  const n=4096-t;
a[e]=h[e]*n+c[e]*t>>12, s[e]=u[e]*n+t*l[e]>>12, o[e]=d[e]*t+n*p[e]>>12
}
}
}
return t
}
}
j.__class="TextureOpInterpolate";
class W extends y {
  constructor() {
  super(1, !1)
}
decode(e, t) {
0===t&&(this.monochrome=1===e.readUnsignedByte())
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.getChildMonochromeOutput(0, e);
for(let e=0;
e<T.width;
e++)t[e]=4096-n[e]
}
return t
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const n=this.getChildColorOutput(0, e), r=n[0], i=n[2], a=t[0], s=n[1], o=t[1], l=t[2];
for(let e=0;
e<T.width;
e++)a[e]=4096-r[e], o[e]=4096-s[e], l[e]=4096-i[e]
}
return t
}
}
W.__class="TextureOpInvert";
class $ extends y {
  constructor() {
  super(0, !0), void 0===this.anInt79&&(this.anInt79=0), this.anInt72=409, this.anInt81=1024, this.anInt77=1024, this.anInt82=819, this.anInt76=0, this.anInt75=1024, this.anInt84=1024, this.seed=0, 
this.anInt87=2048
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(!this.monochromeImageCache.invalid)return t;
let n=0;
const r=this.monochromeImageCache.get$();
let i=0, a=0, s=0, o=0, l=!0, c=0, d=!0;
const p=this.anInt84*T.width>>12
;
let f=0;
const m=this.anInt72*T.height>>12, g=T.width*this.anInt87>>12, _=this.anInt82*T.height>>12;
if(_<=1)return r[e];
this.anInt79=(T.width/8|0)*this.anInt81>>12;
const v=1+(T.width/p|0), y=new u(this.seed);
let b=function(e) {
  let t=function(e) {
if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([v, 3]), x=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([v, 3]);
for(;
;
)for(;
;
) {
  let e, u=p+h.nextInt(y, g-p), v=h.nextInt(y, _-m)+m, E=a+u;
if(E>T.width&&(u=T.width-a, E=T.width), l)e=0;
else {
  let t=o;
e=x[o][2];
let i=0, l=n+E;
for(l<0&&(l+=T.width), T.width<l&&(l-=T.width);
;
) {
  const u=x[t];
if(u[0]<=l&&l<=u[1]) {
if(t!==o) {
  let t=a+n;
t<0&&(t+=T.width), t>T.width&&(t-=T.width);
for(let t=1;
t<=i;
t++) {
  const n=x[(t+o)%c];
e=Math.max(e, n[2])
}
for(let n=0;
n<=i;
n++) {
  const i=x[(n+o)%c], a=i[2];
if(a!==e) {
  const n=i[1], o=i[0];
let c, u;
t<l?(c=Math.max(t, o), 
u=Math.min(l, n)):0===o?(u=Math.min(l, n), c=0):(c=Math.max(t, o), u=T.width), this.method69(e-a, u-c, s+c, a, y, r)
}
}
}
o=t;
break
}
t++, t>=c&&(t=0), i++
}
}
if(T.height<v+e?v=T.height-e:d=!1, E===T.width) {
  if(this.method69(v, u, a+i, e, y, r), d)return t;
l=!1
;
const p=f+1, m=b[f];
d=!0, m[1]=E, s=i, c=p, m[0]=a, m[2]=v+e, i=h.nextInt(y, T.width);
const g=x;
o=0, n=i-s, x=b;
let _=n;
for(b=g, n<0&&(_=n+T.width), f=0, T.width<_&&(_-=T.width);
;
) {
  const e=x[o];
if(_>=e[0]&&e[1]>=_) {
  a=0;
break
}
o++, c<=o&&(o=0)
}
}
else {
  const t=b[f++]
;
t[1]=E, t[2]=v+e, t[0]=a, this.method69(v, u, i+a, e, y, r), a=E
}
}
}
postDecode() {
}
method69(e, n, r, i, a, s) {
  const o=this.anInt77>0?4096-h.nextInt(a, this.anInt77):4096, l=this.anInt79*this.anInt75>>12, c=this.anInt79-(l>0?h.nextInt(a, l):0)
;
if(T.width<=r&&(r-=T.width), c>0) {
  if(e<=0||n<=0)return;
const a=n/2|0, l=e/2|0, u=a>=c?c:a, h=c>l?l:c, d=r+u, p=n-2*u;
for(let a=0;
a<e;
a++) {
  const l=s[a+i];
if(h<=a) {
  const i=e-a-1;
if(h<=i) {
  for(let e=0;
e<u;
e++)l[T.widthMask&r+e]=l[T.widthMask&n+r-e-1]=o*e/u|0
;
if(d+p<=T.width)t.fill$int_A$int$int$int(l, d, p, o);
else {
  const e=T.width-d;
t.fill$int_A$int$int$int(l, d, e, o), t.fill$int_A$int$int$int(l, 0, p-e, o)
}
}
else {
  const e=i*o/h|0;
if(0===this.anInt76)for(let t=0;
t<u;
t++) {
  const i=t*o/u|0
;
l[T.widthMask&r+t]=l[n+r-t-1&T.widthMask]=e*i>>12
}
else for(let t=0;
t<u;
t++) {
  const i=o*t/u|0;
l[T.widthMask&t+r]=l[T.widthMask&r+n-t-1]=e>i?i:e
}
if(T.width<p+d) {
  const n=T.width-d;
t.fill$int_A$int$int$int(l, d, n, e), t.fill$int_A$int$int$int(l, 0, p-n, e)
}
else t.fill$int_A$int$int$int(l, d, p, e)
}
}
else {
  const e=a*o/h|0;
if(0===this.anInt76)for(let t=0;
t<u;
t++) {
  const i=o*t/u|0;
l[T.widthMask&t+r]=l[r+n-t-1&T.widthMask]=i*e>>12
}
else for(let t=0;
t<u;
t++) {
  const i=o*t/u|0
;
l[t+r&T.widthMask]=l[n+r-t-1&T.widthMask]=e<=i?e:i
}
if(d+p>T.width) {
  const n=T.width-d;
t.fill$int_A$int$int$int(l, d, n, e), t.fill$int_A$int$int$int(l, 0, p-n, e)
}
else t.fill$int_A$int$int$int(l, d, p, e)
}
}
}
else if(T.width>=n+r)for(let a=0;
a<e;
a++)t.fill$int_A$int$int$int(s[a+i], r, n, o);
else {
  const a=T.width-r;
for(let l=0;
l<e;
l++) {
  const e=s[l+i];
t.fill$int_A$int$int$int(e, r, a, o), t.fill$int_A$int$int$int(e, 0, n-a, o)
}
}
}
decode(e, t) {
0===t?this.seed=e.readUnsignedByte():1===t?this.anInt84=e.readUnsignedShort():2===t?this.anInt87=e.readUnsignedShort():3===t?this.anInt72=e.readUnsignedShort():4===t?this.anInt82=e.readUnsignedShort():5===t?this.anInt81=e.readUnsignedShort():6===t?this.anInt76=e.readUnsignedByte():7===t?this.anInt75=e.readUnsignedShort():8===t&&(this.anInt77=e.readUnsignedShort())
}
}
$.__class="TextureOpIrregularBricks";
class q extends y {
  constructor() {
  super(1, !1)
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const n=t[0], r=t[1], i=t[2];
for(let t=0;
t<T.width;
t++) {
  this.method4301(t, e)
;
const a=this.getChildColorOutput(0, q.y0);
n[t]=a[0][q.x0], r[t]=a[1][q.x0], i[t]=a[2][q.x0]
}
}
return t
}
decode(e, t) {
  0===t&&(this.monochrome=1===e.readUnsignedByte())
}
method4301(e, t) {
const n=T.normalisedX[e], r=T.normalisedY[t], i=Math.fround(Math.atan2(n-2048, r-2048));
i>=-3.141592653589793&&i<=-2.356194490192345?(q.x0=e, q.y0=t):i<=-1.5707963267948966&&i>=-2.356194490192345?(q.y0=e, 
q.x0=t):i<=-.7853981633974483&&i>=-1.5707963267948966?(q.x0=T.width-t, q.y0=e):i<=0&&i>=-.7853981633974483?(q.y0=T.height-t, q.x0=e):i>=0&&i<=.7853981633974483?(q.x0=T.width-e, 
q.y0=T.height-t):i>=.7853981633974483&&i<=1.5707963267948966?(q.x0=T.width-t, q.y0=T.height-e):i>=1.5707963267948966&&i<=2.356194490192345?(q.x0=t, q.y0=T.height-e):i>=2.356194490192345&&i<=3.141592653589793&&(q.y0=t, q.x0=T.width-e), q.x0&=T.widthMask, 
q.y0&=T.heightMask
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid)for(let n=0;
n<T.width;
n++) {
  this.method4301(n, e);
const r=this.getChildMonochromeOutput(0, q.y0);
t[n]=r[q.x0]
}
return t
}
}
q.y0=0, 
q.x0=0, q.__class="TextureOpKaleidoscope";
class X extends y {
  constructor() {
  super(0, !0), this.seed=0, this.minAngle=0, this.count=2e3, this.maxAngle=4096, this.length=16
}
postDecode() {
  y.createTrigonometryTables()
}
decode(e, t) {
0===t?this.seed=e.readUnsignedByte():1===t?this.count=e.readUnsignedShort():2===t?this.length=e.readUnsignedByte():3===t?this.minAngle=e.readUnsignedShort():4===t&&(this.maxAngle=e.readUnsignedShort())
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const e=this.maxAngle>>1, t=this.monochromeImageCache.get$(), n=new u(this.seed);
for(let r=0;
r<this.count;
r++) {
let r=this.maxAngle>0?this.minAngle+h.nextInt(n, this.maxAngle)-e:this.minAngle;
r=r>>4&255;
let i=h.nextInt(n, T.width), a=h.nextInt(n, T.height), s=i+(y.COSINE[r]*this.length>>12), o=a+(y.SINE[r]*this.length>>12), l=o-a, c=s-i;
if(0!==c||0!==l) {
  l<0&&(l=-l), 
c<0&&(c=-c);
const e=l>c;
if(e) {
  const e=s, t=i;
i=a, s=o, a=t, o=e
}
if(i>s) {
  const e=i;
i=s;
const t=a;
s=e, a=o, o=t
}
let r=a;
const u=s-i;
let d=-u/2|0, p=o-a;
const f=1024-(h.nextInt(n, 4096)>>2);
p<0&&(p=-p);
const m=2048/u|0, g=o<=a?-1:1;
for(let n=i;
n<s;
n++) {
  d+=p
;
const a=f+(n-i)*m+1024, s=r&T.heightMask, o=T.widthMask&n;
d>0&&(d+=-u, r+=g), e?t[s][o]=a:t[o][s]=a
}
}
}
}
return t
}
}
X.__class="TextureOpLineNoise";
class Y extends y {
  constructor() {
  super(0, !0), this.anInt1159=20, this.anInt1157=0, this.anInt1160=1365, 
this.anInt1164=0
}
decode(e, t) {
  0===t?this.anInt1160=e.readUnsignedShort():1===t?this.anInt1159=e.readUnsignedShort():2===t?this.anInt1164=e.readUnsignedShort():3===t&&(this.anInt1157=e.readUnsignedShort())
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid)for(let n=0;
n<T.width;
n++) {
  const r=this.anInt1164+((T.normalisedX[n]<<12)/this.anInt1160|0), i=this.anInt1157+((T.normalisedY[e]<<12)/this.anInt1160|0)
;
let a=i, s=r, o=0, l=r*r>>12, c=i*i>>12;
for(;
l+c<16384&&o<this.anInt1159;
)o++, a=i+2*(a*s>>12), s=r+l-c, c=a*a>>12, l=s*s>>12;
t[n]=o>=this.anInt1159-1?0:(o<<12)/this.anInt1159|0
}
return t
}
}
Y.__class="TextureOpMandelbrot";
class K extends y {
  constructor() {
super(1, !0)
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.getChildColorOutput(0, e), r=n[2], i=n[1], a=n[0];
for(let e=0;
e<T.width;
e++)t[e]=(i[e]+a[e]+r[e])/3|0
}
return t
}
}
K.__class="TextureOpMonochrome";
class J extends y {
  constructor() {
  super(1, !0), this.anInt4832=4096
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
const n=this.getChildMonochromeOutput(0, e-1&T.heightMask), r=this.getChildMonochromeOutput(0, e), i=this.getChildMonochromeOutput(0, e+1&T.heightMask);
for(let e=0;
e<T.width;
e++) {
const a=this.anInt4832*(i[e]-n[e]), s=this.anInt4832*(r[T.widthMask&e+1]-r[T.widthMask&e-1])>>12, o=a>>12, l=o*o>>12, c=s*s>>12, u=4096*Math.sqrt(Math.fround((l+c+4096)/4096))|0, h=0===u?0:16777216/u|0;
t[e]=4096-h
}
}
return t
}
decode(e, t) {
0===t&&(this.anInt4832=e.readUnsignedShort())
}
}
J.__class="TextureOpMonochromeEdgeDetector";
class Z extends y {
  constructor(e) {
  if("number"==typeof e||null===e)super(0, !0), void 0===this.value&&(this.value=0), this.value=4096, this.value=e;
else {
if(void 0!==e)throw new Error("invalid overload");
 {
  let e=4096;
super(0, !0), void 0===this.value&&(this.value=0), this.value=4096, this.value=e
}
void 0===this.value&&(this.value=0)
}
}
decode(e, t) {
  0===t&&(this.value=(e.readUnsignedByte()<<12)/255|0)
}
getMonochromeOutput(e) {
  const n=this.monochromeImageCache.get$int(e);
return this.monochromeImageCache.invalid&&t.fill$int_A$int$int$int(n, 0, T.width, this.value), n
}
}
Z.__class="TextureOpMonochromeFill";
class Q extends y {
  constructor() {
  super(0, !0)
}
noise(e, t) {
  let n=e+57*t;
return n^=n<<1, 4096-((n*(15731*n*n+789221|0)+1376312589&2147483647)/262144|0)|0
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=T.normalisedY[e]
;
for(let e=0;
e<T.width;
e++)t[e]=this.noise(T.normalisedX[e], n)%4096
}
return t
}
}
Q.__class="TextureOpNoise";
class ee extends y {
  constructor() {
  super(0, !0), void 0===this.aShortArray37&&(this.aShortArray37=null), 
void 0===this.aShortArray38&&(this.aShortArray38=null), this.permutation=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(512), this.aBoolean181=!0, this.anInt2620=1638, this.anInt2625=4, this.anInt2628=4, this.seed=0, this.anInt2631=4
}
method2049() {
if(this.anInt2620>0) {
  this.aShortArray38=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(this.anInt2628), this.aShortArray37=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(this.anInt2628)
;
for(let e=0;
e<this.anInt2628;
e++)this.aShortArray37[e]=4096*Math.pow(Math.fround(this.anInt2620/4096), e)|0, this.aShortArray38[e]=0|Math.pow(2, e)
}
else if(null!=this.aShortArray37&&this.aShortArray37.length===this.anInt2628) {
  this.aShortArray38=(e=> {
let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(this.anInt2628);
for(let e=0;
e<this.anInt2628;
e++)this.aShortArray38[e]=0|Math.pow(2, e)
}
}
decode(e, t) {
if(0===t)this.aBoolean181=1===e.readUnsignedByte();
else if(1===t)this.anInt2628=e.readUnsignedByte();
else if(2===t) {
  if(this.anInt2620=e.readShort(), this.anInt2620<0) {
  this.aShortArray37=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(this.anInt2628)
;
for(let t=0;
t<this.anInt2628;
t++)this.aShortArray37[t]=0|e.readShort()
}
}
else 3===t?this.anInt2631=this.anInt2625=e.readUnsignedByte():4===t?this.seed=e.readUnsignedByte():5===t?this.anInt2631=e.readUnsignedByte():6===t&&(this.anInt2625=e.readUnsignedByte())
}
method2051(e, t, n, r, i, a) {
  const s=a-4096;
let o=e>>12, l=o+1
;
o&=255, l>=i&&(l=0);
const c=(e&=4095)-4096, u=255&l, h=3&this.permutation[r+o];
let d;
d=h<=1?0===h?a+e:a-e:2===h?e-a:-a-e;
const p=3&this.permutation[r+u], f=A.PERLIN_FADE_$LI$()[e];
let m;
m=p>1?2===p?c-a:-c-a:0===p?a+c:a-c
;
const g=3&this.permutation[o+t], _=d+(f*(m-d)>>12);
let v;
v=g>1?2===g?e-s:-e-s:0===g?s+e:s-e;
const y=3&this.permutation[t+u];
let b;
return b=y<=1?0===y?s+c:s-c:2===y?c-s:-s-c, _+((v+((b-v)*f>>12)-_)*n>>12)
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
return this.monochromeImageCache.invalid&&this.method2053(t, e), t
}
method2053(e, t) {
  const n=this.anInt2625*T.normalisedY[t];
if(1===this.anInt2628) {
const t=this.aShortArray37[0], r=this.aShortArray38[0]<<12, i=r*this.anInt2631>>12, a=this.anInt2625*r>>12;
let s=r*n>>12;
const o=s>>12;
s&=4095;
const l=255&this.permutation[255&o], c=A.PERLIN_FADE_$LI$()[s];
let u=o+1;
a<=u&&(u=0)
;
const h=255&this.permutation[255&u];
if(this.aBoolean181)for(let n=0;
n<T.width;
n++) {
  const a=T.normalisedX[n]*this.anInt2631;
let o=this.method2051(r*a>>12, h, c, l, i, s);
o=o*t>>12, e[n]=2048+(o>>1)
}
else for(let n=0;
n<T.width;
n++) {
const a=T.normalisedX[n]*this.anInt2631, o=this.method2051(r*a>>12, h, c, l, i, s);
e[n]=t*o>>12
}
return
}
const r=this.aShortArray37[0];
if(r>8||r<-8) {
  const t=this.aShortArray38[0]<<12;
let i=t*n>>12;
const a=i>>12, s=this.anInt2631*t>>12, o=t*this.anInt2625>>12
;
i&=4095;
const l=255&this.permutation[255&a], c=A.PERLIN_FADE_$LI$()[i];
let u=a+1;
u>=o&&(u=0);
const h=255&this.permutation[255&u];
for(let n=0;
n<T.width;
n++) {
  const a=this.anInt2631*T.normalisedX[n], o=this.method2051(t*a>>12, h, c, l, s, i);
e[n]=r*o>>12
}
}
for(let t=1;
t<this.anInt2628;
t++) {
  const r=this.aShortArray37[t];
if(r>8||r<-8) {
  const i=this.aShortArray38[t]<<12, a=i*this.anInt2631>>12;
let s=n*i>>12;
const o=this.anInt2625*i>>12, l=s>>12;
let c=l+1;
s&=4095;
const u=255&this.permutation[255&l]
;
c>=o&&(c=0);
const h=255&this.permutation[255&c], d=A.PERLIN_FADE_$LI$()[s];
if(this.aBoolean181&&t===this.anInt2628-1)for(let t=0;
t<T.width;
t++) {
  const n=T.normalisedX[t]*this.anInt2631;
let o=this.method2051(n*i>>12, h, d, u, a, s);
o=e[t]+(r*o>>12), 
e[t]=2048+(o>>1)
}
else for(let t=0;
t<T.width;
t++) {
  const n=T.normalisedX[t]*this.anInt2631, o=this.method2051(i*n>>12, h, d, u, a, s);
e[t]+=r*o>>12
}
}
}
}
postDecode() {
  this.permutation=y.getPermutation(this.seed), this.method2049()
;
for(let e=this.anInt2628-1;
e>=1;
e--) {
  const t=this.aShortArray37[e];
if(t>8||t<-8)break;
this.anInt2628--
}
}
}
ee.__class="TextureOpPerlinNoise";
class te extends y {
  constructor() {
  super(3, !1), this.magnitude=32768
}
postDecode() {
  y.createTrigonometryTables()
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=this.getChildMonochromeOutput(1, e), r=this.getChildMonochromeOutput(2, e);
for(let i=0;
i<T.width;
i++) {
const a=n[i]>>4&255, s=this.magnitude*r[i]>>12, o=s*y.SINE[a]>>12, l=T.heightMask&e+(o>>12), c=s*y.COSINE[a]>>12, u=T.widthMask&i+(c>>12), h=this.getChildMonochromeOutput(0, l);
t[i]=h[u]
}
}
return t
}
decode(e, t) {
0===t?this.magnitude=e.readUnsignedShort()<<4:1===t&&(this.monochrome=1===e.readUnsignedByte())
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
const n=this.getChildMonochromeOutput(1, e), r=this.getChildMonochromeOutput(2, e), i=t[0], a=t[1], s=t[2];
for(let t=0;
t<T.width;
t++) {
const o=r[t]*this.magnitude>>12, l=255*n[t]>>12&255, c=o*y.SINE[l]>>12, u=(o*y.COSINE[l]>>12>>12)+t&T.widthMask, h=(c>>12)+e&T.heightMask, d=this.getChildColorOutput(0, h);
i[t]=d[0][u], a[t]=d[1][u], s[t]=d[2][u]
}
}
return t
}
}
te.__class="TextureOpPolarDistortion";
class ne extends y {
  constructor() {
  super(1, !1), this.range=2048, this.minValue=1024, this.maxValue=3072
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
const n=this.getChildMonochromeOutput(0, e);
for(let e=0;
e<T.width;
e++)t[e]=this.minValue+(n[e]*this.range>>12)
}
return t
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
const n=this.getChildColorOutput(0, e), r=n[0], i=n[1], a=t[0], s=t[2], o=t[1], l=n[2];
for(let e=0;
e<T.width;
e++)a[e]=this.minValue+(this.range*r[e]>>12), o[e]=this.minValue+(this.range*i[e]>>12), s[e]=this.minValue+(this.range*l[e]>>12)
}
return t
}
postDecode() {
  this.range=this.maxValue-this.minValue
}
decode(e, t) {
  0===t?this.minValue=e.readUnsignedShort():1===t?this.maxValue=e.readUnsignedShort():2===t&&(this.monochrome=1===e.readUnsignedByte())
}
}
ne.__class="TextureOpRange";
class re extends y {
constructor() {
  super(0, !0), void 0===this.ops&&(this.ops=null)
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
return this.monochromeImageCache.invalid&&this.render(this.monochromeImageCache.get$()), t
}
getColorOutput(e) {
const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid) {
  const e=T.width, t=function(e) {
  let t=function(e) {
  if(0===e.length)return 0;
 {
  let n=[];
for(let r=0;
r<e[0];
r++)n.push(t(e.slice(1)));
return n
}
}
;
return t(e)
}
([T.height, e]), n=this.colorImageCache.get$();
this.render(t);
for(let e=0;
e<T.height;
e++) {
  const r=n[e], i=r[1], a=r[2], s=t[e], o=r[0];
for(let e=0;
e<T.width;
e++) {
  const t=s[e];
a[e]=(255&t)<<4, i[e]=t>>4&4080, o[e]=t>>12&4080
}
}
}
return t
}
decode(e, t) {
  if(0===t) {
this.ops=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(null);
return t
}
)(e.readUnsignedByte());
for(let t=0;
t<this.ops.length;
t++) {
  const n=e.readUnsignedByte()
;
0===n?this.ops[t]=E.create(e):1===n?this.ops[t]=b.create(e):2===n?this.ops[t]=w.create(e):3===n&&(this.ops[t]=x.create(e))
}
}
else 1===t&&(this.monochrome=1===e.readUnsignedByte())
}
render(e) {
  const t=T.width, n=T.height;
if(l.sub35_method4335(e), 
l.sub18_method4374(T.heightMask, T.widthMask), null!=this.ops)for(let e=0;
e<this.ops.length;
e++) {
  const r=this.ops[e], i=r.outlineColor;
r.fillColor>=0?i>=0?r.render(t, n):r.renderFill(t, n):i>=0&&r.renderOutline(t, n)
}
}
}
re.__class="TextureOpRasterizer"
;
class ie extends y {
  constructor() {
  super(0, !1), void 0===this.height&&(this.height=0), void 0===this.width&&(this.width=0), void 0===this.pixels&&(this.pixels=null), this.spriteId=-1
}
loadSprite() {
  if(null!=this.pixels)return!0;
if(this.spriteId>=0) {
const e=T.loadedTextures.getSprite(this.spriteId);
return this.width=e.width, this.height=e.height, this.pixels=e.data, !0
}
return!1
}
decode(e, t) {
  0===t&&(this.spriteId=e.readUnsignedShort())
}
clearImageCache() {
  super.clearImageCache(), this.pixels=null
}
getSpriteId() {
  return this.spriteId
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid&&this.loadSprite()) {
  const n=t[0], r=t[1], i=t[2];
let a=(T.height===this.height?e:e*this.height/T.height|0)*this.width
;
if(this.width===T.width)for(let e=0;
e<T.width;
e++)n[e]=this.pixels[a++], r[e]=this.pixels[a++], i[e]=this.pixels[a++], a++;
else for(let e=0;
e<T.width;
e++) {
  const t=this.width*e/T.width|0;
n[e]=this.pixels[4*(a+t)+0]<<4, r[e]=this.pixels[4*(a+t)+1]<<4, 
i[e]=this.pixels[4*(a+t)+2]<<4
}
}
return t
}
}
ie.__class="TextureOpSprite";
class ae extends y {
  constructor() {
  super(0, !0), void 0===this.anIntArray498&&(this.anIntArray498=null), void 0===this.anIntArray499&&(this.anIntArray499=null), this.frequency=10, 
this.ratio=2048, this.mode=0
}
decode(e, t) {
  0===t?this.frequency=e.readUnsignedByte():1===t?this.ratio=e.readUnsignedShort():2===t&&(this.mode=e.readUnsignedByte())
}
postDecode() {
  this.method3784()
}
method3784() {
  this.anIntArray498=(e=> {
  let t=[]
;
for(;
e-- >0;
)t.push(0);
return t
}
)(this.frequency+1);
const e=4096/this.frequency|0;
this.anIntArray499=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(this.frequency+1);
const t=e*this.ratio>>12;
let n=0
;
for(let r=0;
r<this.frequency;
r++)this.anIntArray498[r]=n, this.anIntArray499[r]=t+n, n+=e;
this.anIntArray498[this.frequency]=4096, this.anIntArray499[this.frequency]=this.anIntArray499[0]+4096
}
getMonochromeOutput(e) {
const n=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const r=T.normalisedY[e];
if(0===this.mode) {
  let e=0;
for(let t=0;
t<this.frequency;
t++)if(r>=this.anIntArray498[t]&&r<this.anIntArray498[t+1]) {
r<this.anIntArray499[t]&&(e=4096);
break
}
t.fill$int_A$int$int$int(n, 0, T.width, e)
}
else for(let e=0;
e<T.width;
e++) {
  let t=0, i=0;
const a=T.normalisedX[e], s=this.mode;
1===s?t=a:2===s?t=2048+(r+a-4096>>1):3===s&&(t=2048+(a-r>>1))
;
for(let e=0;
e<this.frequency;
e++)if(this.anIntArray498[e]<=t&&t<this.anIntArray498[e+1]) {
  t<this.anIntArray499[e]&&(i=4096);
break
}
n[e]=i
}
}
return n
}
}
ae.__class="TextureOpSquareWaveform";
class se extends y {
  constructor() {
  super(0, !1), 
void 0===this.width&&(this.width=0), void 0===this.height&&(this.height=0), void 0===this.pixels&&(this.pixels=null), this.textureId=-1
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid&&this.loadTexture()) {
let n=this.width*(T.height===this.height?e:e*this.height/T.height|0);
const r=t[0], i=t[2], a=t[1];
if(this.width===T.width)for(let e=0;
e<T.width;
e++) {
  const t=this.pixels[n++];
i[e]=(255&t)<<4, a[e]=t>>4&4080, r[e]=t>>12&4080
}
else for(let e=0;
e<T.width;
e++) {
  const t=this.width*e/T.width|0, s=this.pixels[t+n];
i[e]=(255&s)<<4, a[e]=s>>4&4080, r[e]=s>>12&4080
}
}
return t
}
loadTexture() {
  if(null!=this.pixels)return!0;
if(this.textureId>=0) {
const e=T.loadedTextures.getTexture(this.textureId);
this.width=e.width, this.height=e.height, this.pixels=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(0|e.data.length);
const t=e.data
;
for(let n=0;
n<e.data.length/4;
n++)this.pixels[n]=t[4*n+0]<<16|t[4*n+1]<<8|t[4*n+2];
return!0
}
return!1
}
decode(e, t) {
  0===t&&(this.textureId=e.readUnsignedShort())
}
clearImageCache() {
  super.clearImageCache(), this.pixels=null
}
getTextureId() {
return this.textureId
}
}
se.__class="TextureOpTexture";
class oe extends y {
  constructor() {
  super(1, !1), this.horizontalTiles=4, this.verticalTiles=4
}
decode(e, t) {
  0===t?this.horizontalTiles=e.readUnsignedByte():1===t&&(this.verticalTiles=e.readUnsignedByte())
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=T.width/this.horizontalTiles|0, r=T.height/this.verticalTiles|0;
let i;
if(r>0) {
  const t=e%r
;
i=this.getChildMonochromeOutput(0, T.height*t/r|0)
}
else i=this.getChildMonochromeOutput(0, 0);
for(let e=0;
e<T.width;
e++)if(n>0) {
  const r=e%n;
t[e]=i[r*T.width/n|0]
}
else t[e]=i[0]
}
return t
}
getColorOutput(e) {
  const t=this.colorImageCache.get$int(e)
;
if(this.colorImageCache.invalid) {
  const n=T.width/this.horizontalTiles|0, r=T.height/this.verticalTiles|0;
let i;
if(r>0) {
  const t=e%r;
i=this.getChildColorOutput(0, t*T.height/r|0)
}
else i=this.getChildColorOutput(0, 0)
;
const a=i[0], s=i[1], o=i[2], l=t[0], c=t[1], u=t[2];
for(let e=0;
e<T.width;
e++) {
  let t;
if(n<=0)t=0;
else {
  const r=e%n;
t=T.width*r/n|0
}
l[e]=a[t], c[e]=s[t], u[e]=o[t]
}
}
return t
}
}
oe.__class="TextureOpTile";
class le extends y {
  constructor() {
  super(0, !0)
}
getMonochromeOutput(e) {
  const n=this.monochromeImageCache.get$int(e);
return this.monochromeImageCache.invalid&&t.fill$int_A$int$int$int(n, 0, T.width, T.normalisedY[e]), n
}
}
le.__class="TextureOpVerticalGradient";
class ce extends y {
  constructor() {
super(0, !0), this.aShortArray81=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(512), this.anInt4553=2, this.anInt4552=2048, this.seed=0, this.anInt4548=1, this.anInt4551=5, this.permutation=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0);
return t
}
)(512), 
this.anInt4557=5
}
postDecode() {
  this.permutation=y.getPermutation(this.seed), this.method3715()
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
const n=T.normalisedY[e]*this.anInt4557+2048, r=n>>12, i=r+1;
for(let e=0;
e<T.width;
e++) {
  ce.anInt5205=2147483647, ce.anInt2979=2147483647, ce.anInt2464=2147483647, ce.anInt4260=2147483647;
const a=T.normalisedX[e]*this.anInt4551+2048, s=a>>12, o=s+1
;
for(let e=r-1;
e<=i;
e++) {
  const t=255&this.permutation[255&(e>=this.anInt4557?e-this.anInt4557:e)];
for(let r=s-1;
r<=o;
r++) {
  let i=2*(255&this.permutation[t+(this.anInt4551<=r?r-this.anInt4551:r)&255])
;
const s=a-(r<<12)-this.aShortArray81[i++], o=n-(e<<12)-this.aShortArray81[i], l=this.anInt4548;
let c;
if(1===l)c=o*o+s*s>>12;
else if(3===l) {
  const e=s>=0?s:-s, t=o<0?-o:o;
c=t>=e?t:e
}
else if(4===l) {
const e=4096*Math.sqrt(Math.fround((s<0?-s:s)/4096))|0, t=(4096*Math.sqrt(Math.fround((o>=0?o:-o)/4096))|0)+e;
c=t*t>>12
}
else if(5===l) {
  const e=s*s, t=o*o;
c=4096*Math.sqrt(Math.sqrt(Math.fround((e+t)/16777216)))|0
}
else c=2===l?(s<0?-s:s)+(o>=0?o:-o):4096*Math.sqrt(Math.fround((s*s+o*o)/16777216))|0;
c<ce.anInt4260?(ce.anInt5205=ce.anInt2979, ce.anInt2979=ce.anInt2464, ce.anInt2464=ce.anInt4260, ce.anInt4260=c):c<ce.anInt2464?(ce.anInt5205=ce.anInt2979, 
ce.anInt2979=ce.anInt2464, ce.anInt2464=c):c<ce.anInt2979?(ce.anInt5205=ce.anInt2979, ce.anInt2979=c):ce.anInt5205>c&&(ce.anInt5205=c)
}
}
const l=this.anInt4553
;
0===l?t[e]=ce.anInt4260:1===l?t[e]=ce.anInt2464:3===l?t[e]=ce.anInt2979:4===l?t[e]=ce.anInt5205:2===l&&(t[e]=ce.anInt2464-ce.anInt4260)
}
}
return t
}
method3715() {
  const e=new u(this.seed);
if(this.aShortArray81=(e=> {
  let t=[];
for(;
e-- >0;
)t.push(0)
;
return t
}
)(512), this.anInt4552>0)for(let t=0;
t<512;
t++)this.aShortArray81[t]=0|h.nextInt(e, this.anInt4552)
}
decode(e, t) {
0===t?this.anInt4551=this.anInt4557=e.readUnsignedByte():1===t?this.seed=e.readUnsignedByte():2===t?this.anInt4552=e.readUnsignedShort():3===t?this.anInt4553=e.readUnsignedByte():4===t?this.anInt4548=e.readUnsignedByte():5===t?this.anInt4551=e.readUnsignedByte():6===t&&(this.anInt4557=e.readUnsignedByte())
}
}
ce.anInt5205=0, ce.anInt2979=0, ce.anInt2464=0, ce.anInt4260=0, ce.__class="TextureOpVoronoiNoise";
class ue extends y {
  constructor() {
  super(0, !0), this.shape=0, this.frequency=1, this.waveform=0
}
getMonochromeOutput(e) {
const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=T.normalisedY[e], r=n-2048>>1;
for(let e=0;
e<T.width;
e++) {
  const i=T.normalisedX[e], a=i-2048>>1;
let s;
if(0===this.shape)s=(i-n)*this.frequency;
else {
const e=r*r+a*a>>12, t=4096*Math.sqrt(Math.fround(e/4096))|0;
s=this.frequency*t*3.141592653589793|0
}
let o=s-(-4096&s);
if(0===this.waveform)o=y.SINE[o>>4&255]+4096>>1;
else if(2===this.waveform) {
  let e=o-2048;
e<0&&(e=-e), o=2048-e<<1
}
t[e]=o
}
}
return t
}
postDecode() {
  y.createTrigonometryTables()
}
decode(e, t) {
  0===t?this.shape=e.readUnsignedByte():1===t?this.waveform=e.readUnsignedByte():3===t&&(this.frequency=e.readUnsignedByte())
}
}
ue.__class="TextureOpWaveform";
class he extends y {
  constructor() {
super(0, !0), this.thickness=585
}
decode(e, t) {
  0===t&&(this.thickness=e.readUnsignedShort())
}
getMonochromeOutput(e) {
  const t=this.monochromeImageCache.get$int(e);
if(this.monochromeImageCache.invalid) {
  const n=T.normalisedY[e];
for(let e=0;
e<T.width;
e++) {
const r=T.normalisedX[e];
if(this.thickness<r&&4096-this.thickness>r&&n>2048-this.thickness&&this.thickness+2048>n) {
  let n=2048-r;
n=n<0?-n:n, n<<=12, n=(e=>e<0?Math.ceil(e):Math.floor(e))(n/2048-this.thickness), t[e]=4096-n
}
else if(2048-this.thickness<r&&this.thickness+2048>r) {
  let r=n-2048;
r=r>=0?r:-r, r-=this.thickness, r<<=12, t[e]=r/(2048-this.thickness)|0
}
else if(n<this.thickness||n>4096-this.thickness) {
  let n=r-2048;
n=n<0?-n:n, n-=this.thickness, n<<=12, 
t[e]=n/(2048-this.thickness)|0
}
else if(this.thickness<=r&&r<=4096-this.thickness)t[e]=0;
else {
  let r=2048-n;
r=r<0?-r:r, r<<=12, r=(e=>e<0?Math.ceil(e):Math.floor(e))(r/2048-this.thickness), t[e]=4096-r
}
}
}
return t
}
}
he.__class="TextureOpWeave"
;
class de extends ie {
  getColorOutput(e) {
  const t=this.colorImageCache.get$int(e);
if(this.colorImageCache.invalid&&this.loadSprite()) {
  const n=t[1], r=t[2], i=this.height*(e%this.height), a=t[0];
for(let e=0;
e<T.width;
e++) {
  const t=this.pixels[i+e%this.width]
;
r[e]=(255&t)<<4, n[e]=t>>4&4080, a[e]=t>>12&4080
}
}
return t
}
}
de.__class="TextureOpTiledSprite", A.PERLIN_FADE_$LI$(), A.__static_initialize(), T.brightnessMap_$LI$(), y.permutations_$LI$(), _.VALID_$LI$(), g.VALID_$LI$(), p.INVERSE_SQUARE_ROOT_$LI$(), 
p.__static_initialize(), u.twoToTheXMinus48_$LI$(), u.twoToTheXMinus24_$LI$(), u.__static_initialize(), n.largeBuffers_$LI$(), n.mediumBuffers_$LI$(), n.smallBuffers_$LI$(), e.exports= {
  Texture:T, Buffer:m
}
}
()
}
, 5880:e=> {
  "use strict";
e.exports=Math.pow
}
, 
5881:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t//0-7,  often 0, -1, -10, -45\r\n\t"0x01":  {
   "name":                           "unk01",  "read": ["tuple", "ubyte", "byte"] 
}
, \r\n\r\n\t//weird,  often at min or max of int range\r\n\t"0x03":  {
   "name":                           "unk03",  "read": ["array", 6, "short"] 
}
, \r\n\t"0x04":  {
   "name":                           "unk04",  "read": ["struct", \r\n\t\t["unk0", "ubyte"], //always 1 or 2\r\n\t\t["unk1_0000", "ushort"], //always 0\r\n\t\t["unk2", "ushort"]//weird,  1-496\r\n\t] 
}
, \r\n\r\n\t//always 2\r\n\t"0x06":  {
   "name":                           "unk06",  "read": "ubyte" 
}
, \r\n\r\n\t//these flags often come together\r\n\t//36/57 uses\r\n\t"0x08":  {
   "name":                           "unk08",  "read": "true" 
}
, \r\n\t//37/57 uses\r\n\t"0x09":  {
   "name":                           "unk09",  "read": "true" 
}
, \r\n\t//31/57 uses\r\n\t"0x0A":  {
   "name":                           "unk0A",  "read": "true" 
}
\r\n
}
'
