// Module ID: 7244
// Category: unidentified
// Size: 85173 bytes
// Parameters: e,t,n

"use strict"
;
var r=n(9092)(), i=n(6556)("Object.prototype.toString"), a=function(e) {
  return!(r&&e&&"object"==typeof e&&Symbol.toStringTag in e)&&"[object Arguments]"===i(e)
}
, s=function(e) {
return!!a(e)||null!==e&&"object"==typeof e&&"length"in e&&"number"==typeof e.length&&e.length>=0&&"[object Array]"!==i(e)&&"callee"in e&&"[object Function]"===i(e.callee)
}
, o=function() {
  return a(arguments)
}
();
a.isLegacyArguments=s, e.exports=o?a:s
}
, 
7274:e=> {
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
\r\n\r\n#define isNaN isnan\r\n\r\n#ifndef GL_ARB_derivative_control\r\n#define dFdxFine dFdx\r\n#define dFdyFine dFdy\r\n#define fwidthFine fwidth\r\n#endif\r\n\r\n/***************************************************/\r\n\r\n/***************************************************/\r\n/***************** Effect Defines ******************/\r\n/***************************************************/\r\n#define AMBIENT_LIGHTING\r\n#define DIFFUSE_LIGHTING\r\n#define ALBEDO_LIGHTING\r\n#define TEXTURE_ALBEDO_GLOBAL\r\n#define SUNLIGHT_DIRECT_LIGHTING\r\n#define TEXTURE_ATLAS\r\n#define ALPHA_ENABLED\r\n#define VIEW_TRANSFORMS\r\n#define TINT\r\n\r\n/*************************************************/\r\n\r\n/***************************************************/\r\n/********** Mandatory Shader Fragments *************/\r\n/***************************************************/\r\n\r\n#define GRAPHICS_QUALITY_LOW 0\r\n#define GRAPHICS_QUALITY_MEDIUM 1\r\n#define GRAPHICS_QUALITY_HIGH 2\r\n#define GRAPHICS_QUALITY_ULTRA 3\r\n\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_X 3.0\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_Y 4.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X 42.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_Y 32.0\r\n#define MATERIAL_SETTINGS_TEXTURE_RESOLUTION 128.0\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
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
\r\nUNIFORM_BUFFER_END\r\n\r\n/***************************************************/\r\n\r\nuniform highp float uTextureAnimationTime;
\r\n\r\nUNIFORM_BUFFER_BEGIN(ViewTransforms)\r\nuniform highp vec3 uCameraPosition;
\r\nuniform highp mat4 uViewMatrix;
\r\nuniform highp mat4 uProjectionMatrix;
\r\nuniform highp mat4 uViewProjMatrix;
\r\nuniform highp vec4 uZBufferParams;
\r\nUNIFORM_BUFFER_END\r\n\r\nUNIFORM_BUFFER_BEGIN(Sunlight)\r\nuniform highp vec3 uInvSunDirection;
\r\nuniform mediump vec3 uAmbientColour;
\r\nuniform mediump vec3 uSunColour;
\r\nuniform mediump float uDummy;
\r\nUNIFORM_BUFFER_END\r\n#ifndef LIGHT_SCATTERING_VS_UNIFORMS\r\n#define LIGHT_SCATTERING_VS_UNIFORMS\r\nUNIFORM_BUFFER_BEGIN(SimpleScattering)\r\nuniform mediump vec3 uOutscatteringAmount;
\r\nuniform mediump vec3 uInscatteringAmount;
\r\nuniform mediump vec3 uScatteringTintColour;
\r\nuniform highp vec4 uScatteringParameters;
\r\nUNIFORM_BUFFER_END\r\n#endif\r\n#ifndef BRDF_INC\r\n#define BRDF_INC\r\n#ifndef NDF_INC\r\n#define NDF_INC\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
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
\r\n#endif\r\nuniform float uAlphaTestThreshold;
\r\nuniform vec4 uAtlasMeta;
\r\nuniform sampler2D uTextureAtlas;
\r\nuniform sampler2D uTextureAtlasSettings;
\r\nuniform samplerCube uGlobalEnvironmentMap;
\r\nuniform vec4 uGlobalEnvironmentMappingParams;
\r\nuniform vec4 uTint;
\r\nin highp vec3 vWorldPosition;
\r\nin highp vec3 vNormal;
\r\nin mediump vec4 vVertexAlbedo;
\r\nin vec2 vTextureUV;
\r\nflat in vec3 vMaterialSettingsSlotXY_BatchFlags;
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
\r\n#define SRGB_TEXTURES\r\n#define STANDARD_DERIVATIVES\r\n#define TEXTURE_LOD\r\n#define TEXTURE_GRAD\r\n#define TEXTURE_MIP_LIMIT\r\n#define LOOKUP_MODE_DYNAMIC\r\n\r\n#define TEXTURE_SETTINGS_USE_TEXEL_OFFSETS\r\n#ifndef CONVERSION_UTILS_INC\r\n#define CONVERSION_UTILS_INC\r\nvec3 SRGBToLinear(vec3 srgbColour)\r\n {
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
\r\n#endif\r\n\r\nfloat getMipMapLevel(vec2 v,  vec2 p)\r\n {
  \r\n    float d = 0.;
\r\n#if defined(STANDARD_DERIVATIVES)\r\n    float L = max(dot(v,  v),  dot(p,  p));
\r\n    d = .5 * log2(L);
\r\n    d = max(0.,  d);
\r\n#endif\r\n    return d;
\r\n
}
\r\n#if defined(DEBUG_TEXEL_DENSITY)\r\nvec3 GetTexelDensityDebugColour(vec2 v,  float p,  vec3 d)\r\n {
  \r\n    float t = length(fwidth(v) * p),  s = length(fwidth(d)),  L = t / s,  h = uDebugTexelDensity.s,  f = uDebugTexelDensity.t,  o = uDebugTexelDensity.p,  T = uDebugTexelDensity.q;
\r\n    vec3 c;
\r\n    c.s = smoothstep(f / (T + 1.),  h,  L);
\r\n    c.t = 1. - smoothstep(0.,  f * (T + 1.),  abs(L - f));
\r\n    c.p = smoothstep(1. - (f + o * T),  1. - o,  1. - L);
\r\n    c *= c;
\r\n    return c;
\r\n
}
\r\n#endif\r\n#if defined(LOOKUP_MODE_DYNAMIC) && !defined(NO_SAMPLER_WRAP)\r\nflat in mediump float vSamplerWrap;
\r\n#endif\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\nvoid getTexelBias_inner(float v,  highp vec2 t,  highp vec3 d,  highp vec3 p,  highp vec3 s,  vec4 c,  vec2 m,  vec2 g,  float L,  sampler2D f,  out vec4 i,  out vec4 h,  out vec4 o)\r\n {
  \r\n    float T = c.s;
\r\n    highp float q = c.t,  l = c.p;
\r\n    float P = c.q;
\r\n    highp vec3 S = vec3(d.s,  p.s,  s.s),  y = vec3(d.t,  p.t,  s.t),  a = vec3(d.p,  p.p,  s.p);
\r\n    const vec2 u = vec2(1.);
\r\n    vec3 D = .5 / a;
\r\n    highp vec2 r,  C,  Y;
\r\n#if !defined(LOOKUP_MODE_CLAMP) && !defined(LOOKUP_MODE_REPEAT)\r\n    const float G = .5,  e = .25,  n = .125,  E = .0625;
\r\n    vec4 O = step(.5,  fract(L * vec4(G,  e,  n,  E)));
\r\n#endif\r\n\r\n#if defined(LOOKUP_MODE_CLAMP)\r\n    r = clamp(t,  vec2(D.s),  u - vec2(D.s));
\r\n#elif defined(LOOKUP_MODE_REPEAT)\r\n    r = mod(t,  u);
\r\n#else\r\n    const vec2 N = vec2(.5),  M = vec2(2.);
\r\n    vec2 x = clamp(t,  vec2(D.s),  u - vec2(D.s)),  R = mod(t,  u),  A = t - M * floor(N * t),  U = u - abs(u - A);
\r\n    r = O.st * x + O.pq * R + (u - O.st - O.pq) * U;
\r\n#endif\r\n    r = r * a.s * l;
\r\n    r += vec2(S.s,  y.s) * q * l;
\r\n    if (v > 1.)\r\n     {
  \r\n#if defined(LOOKUP_MODE_CLAMP)\r\n        C = clamp(t,  vec2(D.t),  u - vec2(D.t));
\r\n#elif defined(LOOKUP_MODE_REPEAT)\r\n        C = mod(t,  u);
\r\n#else\r\n        vec2 I = clamp(t,  vec2(D.t),  u - vec2(D.t)),  K = R,  B = U;
\r\n        C = O.st * I + O.pq * K + (u - O.st - O.pq) * B;
\r\n#endif\r\n        C = C * a.t * l;
\r\n        C += vec2(S.t,  y.t) * q * l;
\r\n        if (v > 2.)\r\n         {
  \r\n#if defined(LOOKUP_MODE_CLAMP)\r\n            Y = clamp(t,  vec2(D.p),  u - vec2(D.p));
\r\n#elif defined(LOOKUP_MODE_REPEAT)\r\n            Y = mod(t,  u);
\r\n#else\r\n            vec2 b = clamp(t,  vec2(D.p),  u - vec2(D.p)),  X = R,  V = U;
\r\n            Y = O.st * b + O.pq * X + (u - O.st - O.pq) * V;
\r\n#endif\r\n            Y = Y * a.p * l;
\r\n            Y += vec2(S.p,  y.p) * q * l;
\r\n        
}
\r\n    
}
\r\n    h = vec4(0.);
\r\n    o = vec4(0.);
\r\n#if defined(TEXTURE_MIP_LIMIT)\r\n\r\n#if defined(TEXTURE_GRAD)\r\n    highp vec2 I = m * l,  K = g * l,  B = I * a.s,  X = K * a.s;
\r\n    const vec2 b = vec2(.025);
\r\n    B = clamp(B,  -b,  b);
\r\n    X = clamp(X,  -b,  b);
\r\n    i = texture2DGrad(f,  r,  B,  X);
\r\n    if (v > 1.)\r\n     {
  \r\n        B = I * a.t;
\r\n        X = K * a.t;
\r\n        B = clamp(B,  -b,  b);
\r\n        X = clamp(X,  -b,  b);
\r\n        h = texture2DGrad(f,  C,  B,  X);
\r\n        if (v > 2.)\r\n            B = I * a.p,  X = K * a.p,  B = clamp(B,  -b,  b),  X = clamp(X,  -b,  b),  o = texture2DGrad(f,  Y,  B,  X);
\r\n    
}
\r\n#else\r\n    i = texture2D(f,  r);
\r\n    if (v > 1.)\r\n     {
  \r\n        h = texture2D(f,  C);
\r\n        if (v > 2.)\r\n            o = texture2D(f,  Y);
\r\n    
}
\r\n#endif\r\n\r\n#else\r\n\r\n#if defined(TEXTURE_LOD)\r\n    vec2 V = m * a.s,  W = g * a.s;
\r\n    float F = getMipMapLevel(V,  W);
\r\n    F = min(F,  P);
\r\n    i = texture2DLod(f,  r,  F);
\r\n    if (v > 1.)\r\n     {
  \r\n        V = m * a.t;
\r\n        W = g * a.t;
\r\n        F = getMipMapLevel(V,  W);
\r\n        F = min(F,  P);
\r\n        h = texture2DLod(f,  C,  F);
\r\n        if (v > 2.)\r\n            V = m * a.p,  W = g * a.p,  F = getMipMapLevel(V,  W),  F = min(F,  P),  o = texture2DLod(f,  Y,  F);
\r\n    
}
\r\n#else\r\n    i = texture2D(f,  r);
\r\n    if (v > 1.)\r\n     {
  \r\n        h = texture2D(f,  C);
\r\n        if (v > 2.)\r\n            o = texture2D(f,  Y);
\r\n    
}
\r\n#endif\r\n\r\n#endif\r\n
}
\r\nvoid getTexel_inner(float v,  vec2 f,  highp vec3 d,  highp vec3 t,  highp vec3 p,  vec4 s,  vec2 h,  vec2 o,  float b,  sampler2D B,  out vec4 D,  out vec4 L,  out vec4 u)\r\n {
  \r\n    getTexelBias_inner(v,  f,  d,  t,  p,  s,  h,  o,  b,  B,  D,  L,  u);
\r\n#if defined(SRGB_TEXTURES)\r\n    if (v > 1.)\r\n        L = vec4(LinearToSRGB(L.stp),  L.q);
\r\n    if (v > 2.)\r\n        u = vec4(LinearToSRGB(u.stp),  u.q);
\r\n#else\r\n    D = vec4(SRGBToLinear(D.stp),  D.q);
\r\n#endif\r\n
}
\r\nvoid getTexel_inner(float v,  vec2 f,  highp vec3 d,  highp vec3 t,  highp vec3 p,  vec4 s,  float h,  sampler2D o,  out vec4 b,  out vec4 B,  out vec4 u)\r\n {
  \r\n    vec2 X = vec2(0.),  i = vec2(0.);
\r\n#if defined(STANDARD_DERIVATIVES)\r\n    X = dFdx(f);
\r\n    i = dFdy(f);
\r\n#endif\r\n    getTexel_inner(v,  f,  d,  t,  p,  s,  X,  i,  h,  o,  b,  B,  u);
\r\n
}
\r\nvoid getTexel(vec2 v,  highp vec3 o,  vec4 h,  vec2 g,  vec2 s,  float f,  sampler2D e,  out vec4 c)\r\n {
  \r\n    vec3 t = vec3(1.),  l = vec3(1.);
\r\n    vec4 i = vec4(0.),  p = vec4(0.);
\r\n    getTexel_inner(1.,  v,  o,  t,  l,  h,  g,  s,  f,  e,  c,  i,  p);
\r\n
}
\r\nvoid getTexel(vec2 v,  highp vec3 o,  vec4 h,  float g,  sampler2D s,  out vec4 f)\r\n {
  \r\n    vec3 e = vec3(1.),  l = vec3(1.);
\r\n    vec4 t = vec4(0.),  p = vec4(0.);
\r\n    getTexel_inner(1.,  v,  o,  e,  l,  h,  g,  s,  f,  t,  p);
\r\n
}
\r\nvoid getTexel(vec2 v,  highp vec3 o,  highp vec3 h,  vec4 g,  vec2 s,  vec2 f,  float e,  sampler2D t,  out vec4 l,  out vec4 p)\r\n {
  \r\n    vec3 i = vec3(1.);
\r\n    vec4 c = vec4(0.);
\r\n    getTexel_inner(2.,  v,  o,  h,  i,  g,  s,  f,  e,  t,  l,  p,  c);
\r\n
}
\r\nvoid getTexel(vec2 v,  highp vec3 o,  highp vec3 h,  vec4 g,  float s,  sampler2D f,  out vec4 e,  out vec4 t)\r\n {
  \r\n    vec3 l = vec3(1.);
\r\n    vec4 p = vec4(0.);
\r\n    getTexel_inner(2.,  v,  o,  h,  l,  g,  s,  f,  e,  t,  p);
\r\n
}
\r\nvoid getTexel(vec2 v,  highp vec3 o,  highp vec3 h,  highp vec3 g,  vec4 s,  vec2 f,  vec2 e,  float t,  sampler2D l,  out vec4 p,  out vec4 i,  out vec4 c)  {
   getTexel_inner(3.,  v,  o,  h,  g,  s,  f,  e,  t,  l,  p,  i,  c);
}
\r\nvoid getTexel(vec2 v,  highp vec3 o,  highp vec3 h,  highp vec3 g,  vec4 s,  float f,  sampler2D e,  out vec4 t,  out vec4 l,  out vec4 p)  {
   getTexel_inner(3.,  v,  o,  h,  g,  s,  f,  e,  t,  l,  p);
}
\r\n\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\n#ifndef TEXTURE_SETTINGS_INC\r\n#define TEXTURE_SETTINGS_INC\r\nstruct TextureSettings\r\n {
  \r\n    highp vec3 textureMeta1;
\r\n    highp vec3 textureMeta2;
\r\n    highp vec2 uvAnim;
\r\n    float wrapping;
\r\n    float specular;
\r\n    float normalScale;
\r\n#if defined(REFRACTION)\r\n    vec4 refraction;
\r\n#endif\r\n#if defined(VIEWPORTMAP)\r\n    vec4 viewportMapUVScaleAndAnim;
\r\n#endif\r\n#if defined(DEBUG_MATERIAL_HIGHLIGHT)\r\n    highp float materialID;
\r\n#endif\r\n
}
;
\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\nvoid getTextureSettings(vec2 s,  out TextureSettings v)\r\n {
  \r\n    const highp float d = 1. / 255.,  S = 1. / 65535.,  e = 32767.,  t = 1. / 32767.;
\r\n    const float f = 1. / MATERIAL_SETTINGS_TEXTURE_RESOLUTION;
\r\n    vec2 i = (floor(s + .5) * vec2(MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_X,  MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_Y) + .5) * f;
\r\n    const float u = f;
\r\n    vec4 T = texture2DLodCompat(uTextureAtlasSettings,  i,  0.),  U,  n,  D,  m,  a,  R;
\r\n    float h;
\r\n    vec4 r;
\r\n#if defined(TEXTURE_SETTINGS_USE_TEXEL_OFFSETS)\r\n\r\n#define SAMPLE_OFFSET_SLOTSIZES_AND_WRAPPING ivec2(2,  0)\r\n\r\n#define SAMPLE_OFFSET_UV_ANIM ivec2(0,  1)\r\n\r\n#define SAMPLE_OFFSET_SPECULAR_NORMAL_SCALE ivec2(1,  1)\r\n\r\n#define SAMPLE_OFFSET_REFRACTION ivec2(0,  2)\r\n\r\n#define SAMPLE_OFFSET_SLOTETC ivec2(1,  2)\r\n\r\n#define SAMPLE_OFFSET_VIEWPORTMAP_UVSCALE ivec2(2,  2)\r\n\r\n#define SAMPLE_OFFSET_VIEWPORTMAP_UVANIMATION ivec2(0,  3)\r\n\r\n#define SAMPLE_OFFSET_DEBUG ivec2(2,  3)\r\n    U = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_SLOTSIZES_AND_WRAPPING);
\r\n    n = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_UV_ANIM);
\r\n#if defined(SPECULAR_LIGHTING) || defined(USE_NORMAL_MAP)\r\n    D = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_SPECULAR_NORMAL_SCALE);
\r\n#endif\r\n\r\n#if defined(REFRACTION)\r\n    m = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_REFRACTION);
\r\n#endif\r\n    h = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_SLOTETC).q;
\r\n#if defined(VIEWPORTMAP)\r\n    a = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_VIEWPORTMAP_UVSCALE);
\r\n    R = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_VIEWPORTMAP_UVANIMATION);
\r\n#endif\r\n\r\n#if defined(DEBUG_MATERIAL_HIGHLIGHT)\r\n    r = textureLodOffset(uTextureAtlasSettings,  i,  0.,  SAMPLE_OFFSET_DEBUG);
\r\n#endif\r\n\r\n#else\r\n    vec2 g = vec2(u * 2.,  0.),  o = vec2(0.,  u),  M = vec2(u,  u),  p = vec2(0.,  u * 2.),  X = vec2(u,  u * 2.),  q = vec2(u * 2.,  u * 2.),  E = vec2(0.,  u * 3.),  A = vec2(u * 2.,  u * 3.);
\r\n    U = texture2DLodCompat(uTextureAtlasSettings,  i + g,  0.);
\r\n    n = texture2DLodCompat(uTextureAtlasSettings,  i + o,  0.);
\r\n#if defined(SPECULAR_LIGHTING) || defined(USE_NORMAL_MAP)\r\n    D = texture2DLodCompat(uTextureAtlasSettings,  i + M,  0.);
\r\n#endif\r\n\r\n#if defined(REFRACTION)\r\n    m = texture2DLodCompat(uTextureAtlasSettings,  i + p,  0.);
\r\n#endif\r\n    h = texture2DLodCompat(uTextureAtlasSettings,  i + X,  0.).q;
\r\n#if defined(VIEWPORTMAP)\r\n    a = texture2DLodCompat(uTextureAtlasSettings,  i + q,  0.);
\r\n    R = texture2DLodCompat(uTextureAtlasSettings,  i + E,  0.);
\r\n#endif\r\n\r\n#if defined(DEBUG_MATERIAL_HIGHLIGHT)\r\n    r = texture2DLodCompat(uTextureAtlasSettings,  i + A,  0.);
\r\n#endif\r\n\r\n#endif\r\n    T = floor(T * 255. + .5);
\r\n    U = floor(U * 255. + .5);
\r\n    h = floor(h * 255. + .5);
\r\n    const float V = .5,  c = .25,  L = .125,  P = .0625;
\r\n    vec4 N = step(.5,  fract(h * vec4(V,  c,  L,  P)));
\r\n    T += vec4(256.) * N;
\r\n    vec2 w = U.st * uAtlasMeta.t;
\r\n    v.textureMeta1 = vec3(T.st,  w.s);
\r\n    v.textureMeta2 = vec3(T.pq,  w.t);
\r\n    v.wrapping = U.q;
\r\n#if defined(SPECULAR_LIGHTING) || defined(USE_NORMAL_MAP)\r\n    v.specular = UnpackVec2ToFloat(D.st) * d;
\r\n    v.normalScale = UnpackVec2ToFloat(D.pq) * d;
\r\n    v.normalScale = v.normalScale * .1 - 8.;
\r\n#else\r\n    v.specular = 0.;
\r\n    v.normalScale = 0.;
\r\n#endif\r\n    highp vec2 G = vec2(UnpackVec2ToFloat(n.st),  UnpackVec2ToFloat(n.pq)) - e;
\r\n    G *= step(1.5,  abs(G));
\r\n    v.uvAnim = G * t * 2.;
\r\n#if defined(REFRACTION)\r\n    v.refraction = m;
\r\n    v.refraction.t = v.refraction.t * 2. + 1.;
\r\n    v.refraction.p = UnpackVec2ToFloat(v.refraction.pq) * S * 10.;
\r\n#endif\r\n\r\n#if defined(VIEWPORTMAP)\r\n    highp vec2 C = vec2(UnpackVec2ToFloat(a.st),  UnpackVec2ToFloat(a.pq)) - e,  Y = vec2(UnpackVec2ToFloat(R.st),  UnpackVec2ToFloat(R.pq)) - e;
\r\n    C *= step(1.5,  abs(C));
\r\n    Y *= step(1.5,  abs(Y));
\r\n    v.viewportMapUVScaleAndAnim = vec4(C * t * 2.,  Y * t * 2.);
\r\n#endif\r\n\r\n#if defined(DEBUG_MATERIAL_HIGHLIGHT)\r\n    v.materialID = UnpackVec2ToFloat(r.st);
\r\n#endif\r\n
}
\r\nvoid getTextureSettings1D(float v,  out TextureSettings i)\r\n {
  \r\n    const float d = 1. / MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X;
\r\n    float S = floor((v + .5) * d),  u = v - S * MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X;
\r\n    getTextureSettings(vec2(u,  S),  i);
\r\n
}
\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\n#endif\r\n#ifndef CONVERSION_UTILS_INC\r\n#define CONVERSION_UTILS_INC\r\nvec3 SRGBToLinear(vec3 srgbColour)\r\n {
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
\r\n#endif\r\n\r\nconst highp float CAUSTICS_FIXED_POINT_SCALE = 10000.;
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
\r\n#endif\r\n\r\n#ifndef DISTANCE_FOG_UNIFORMS\r\n#define DISTANCE_FOG_UNIFORMS\r\n#if defined(FOG_DISTANCE)\r\nUNIFORM_BUFFER_BEGIN(DistanceFog)\r\nuniform mediump vec4 uFogColour;
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
\r\n#endif\r\n#endif\r\n\r\n#if defined(TEXTURE_ATLAS) && defined(NORMAL_MAP)\r\n#define USE_NORMAL_MAP\r\n#endif\r\n\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\n#if defined(TEXTURE_ATLAS)\r\nvoid CalculateDerivatives(inout highp vec2 v,  inout highp vec2 d,  inout highp vec3 g,  inout highp vec3 h,  highp vec2 S,  highp vec3 T)\r\n {
  \r\n#if defined(STANDARD_DERIVATIVES)\r\n    v = dFdx(S);
\r\n    d = dFdy(S);
\r\n#if defined(PER_FRAGMENT_TANGENTS)\r\n    g = dFdxFine(T);
\r\n    h = dFdyFine(T);
\r\n#endif\r\n\r\n#endif\r\n
}
\r\n#if defined(RT7_MATERIAL)\r\nvoid SampleTexturesRT7(inout vec4 v,  inout vec4 d,  inout vec4 S,  vec2 T,  TextureSettings h,  float g,  vec2 i,  vec2 u)\r\n {
  \r\n#if defined(TEXTURE_ATLAS)\r\n\r\n#if !defined(TEXTURE_ALBEDO_GLOBAL)\r\n    if (fract(g * 8.) > .5)\r\n     {
  \r\n#endif\r\n        getTexel(T,  h.textureMeta1,  h.textureMeta2,  h.textureMeta3,  uAtlasMeta,  i,  u,  h.wrapping,  uTextureAtlas,  v,  d,  S);
\r\n#if defined(ETC_CHANNEL_SWIZZLE)\r\n        d = d.qtps;
\r\n        S = S.sqpt;
\r\n#endif\r\n\r\n#if !defined(TEXTURE_ALBEDO_GLOBAL)\r\n    
}
\r\n#endif\r\n\r\n#endif\r\n
}
\r\n#else\r\nvoid SampleTextures(inout vec4 v,  inout vec4 d,  vec2 T,  TextureSettings h,  float S,  vec2 i,  vec2 u)\r\n {
  \r\n#if defined(TEXTURE_ATLAS)\r\n\r\n#if !defined(TEXTURE_ALBEDO_GLOBAL)\r\n    if (fract(S * 8.) > .5)\r\n     {
  \r\n#endif\r\n\r\n#if defined(HDR_SCALE) || defined(USE_NORMAL_MAP)\r\n        getTexel(T,  h.textureMeta1,  h.textureMeta2,  uAtlasMeta,  i,  u,  h.wrapping,  uTextureAtlas,  v,  d);
\r\n#if defined(ETC_CHANNEL_SWIZZLE)\r\n        d = d.qtps;
\r\n#endif\r\n\r\n#else\r\n    getTexel(T,  h.textureMeta1,  uAtlasMeta,  i,  u,  h.wrapping,  uTextureAtlas,  v);
\r\n#endif\r\n\r\n#if !defined(TEXTURE_ALBEDO_GLOBAL)\r\n    
}
\r\n#endif\r\n\r\n#if defined(HDR_SCALE)\r\n    v = HDRScale(v,  d.s);
\r\n#endif\r\n\r\n#endif\r\n
}
\r\n#endif\r\n#endif\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\nvoid ComputeTangentBitangentFromDerivatives(inout vec3 v,  inout vec3 p,  highp vec3 h,  highp vec3 d,  highp vec3 A,  highp vec2 r,  highp vec2 S)\r\n {
  \r\n    highp vec3 q = cross(h,  d),  c = cross(A,  h),  n = c * r.s + q * S.s,  s = c * r.t + q * S.t;
\r\n    highp float D = dot(n,  n),  a = dot(s,  s),  i = max(D,  a),  t = inversesqrt(i);
\r\n    n *= t;
\r\n    s *= t;
\r\n    if (isNaN(D + a) || i <= 0.)\r\n        n = s = h;
\r\n    v = n;
\r\n    p = s;
\r\n
}
\r\nvec3 ComputeBitangent(vec3 v,  vec4 h)\r\n {
  \r\n    highp vec3 p = cross(v,  h.stp);
\r\n    p *= h.q;
\r\n    return p;
\r\n
}
\r\nvec3 ApplyNormalMap(highp vec3 v,  highp vec3 h,  highp vec3 d,  highp vec3 A,  highp vec2 p,  highp vec2 S)\r\n {
  \r\n    highp vec3 D,  s;
\r\n    ComputeTangentBitangentFromDerivatives(D,  s,  h,  d,  A,  p,  S);
\r\n#if defined(DEBUG_TANGENTS)\r\n    gl_FragColor.stp = normalize(D) * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n\r\n#if defined(DEBUG_BITANGENTS)\r\n    gl_FragColor.stp = normalize(s) * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n    highp vec3 r = v.s * D + v.t * s + v.p * h;
\r\n    r = normalize(r);
\r\n    return abs(r.s) + abs(r.t) + abs(r.p) < .5 ? h : r;
\r\n
}
\r\nvec3 ApplyNormalMap(vec3 v,  vec3 A,  vec3 s,  vec3 S)\r\n {
  \r\n#if defined(DEBUG_TANGENTS)\r\n    gl_FragColor.stp = s * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n\r\n#if defined(DEBUG_BITANGENTS)\r\n    gl_FragColor.stp = S * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n    highp vec3 p = v.s * s + v.t * S + v.p * A;
\r\n    p = normalize(p);
\r\n    return p;
\r\n
}
\r\nvec3 ApplyNormalMap(vec3 v,  vec3 h,  vec4 r)\r\n {
  \r\n    vec3 p = ComputeBitangent(h,  r);
\r\n    return ApplyNormalMap(v,  h,  r.stp,  p);
\r\n
}
\r\nvec3 ApplyNormalMapTerrain(vec3 v,  highp vec3 h,  highp vec3 r,  highp vec3 S)\r\n {
  \r\n    highp vec3 p = cross(h,  r),  s = cross(S,  h),  D = s * r.s + p * S.s,  n = s * r.p + p * S.p;
\r\n    highp float A = inversesqrt(max(dot(D,  D),  dot(n,  n)));
\r\n    D *= A;
\r\n    n *= A;
\r\n#if defined(DEBUG_TANGENTS)\r\n    gl_FragColor.stp = normalize(D) * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n\r\n#if defined(DEBUG_BITANGENTS)\r\n    gl_FragColor.stp = normalize(n) * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n    highp vec3 d = v.s * D + v.t * n + v.p * h;
\r\n    d = normalize(d);
\r\n    return isNaN(d.s) ? h : d;
\r\n
}
\r\nvec3 ApplyNormalMapTerrain(vec3 v,  vec3 h)\r\n {
  \r\n    const vec3 p = vec3(0.,  0.,  1.);
\r\n    vec3 D = cross(p,  h),  s = cross(D,  h);
\r\n    return ApplyNormalMap(v,  h,  D,  s);
\r\n
}
\r\n\r\nvec3 UnpackCompressedNormal(vec3 U)\r\n {
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
\r\n\r\n#if defined(VIEWPORTMAP)\r\nvec3 SampleViewportMapColour(highp vec2 v,  highp vec4 e)\r\n {
  \r\n    v = v * uViewportLookupScale.st;
\r\n    vec2 t;
\r\n#if defined(OGLES2_BACKEND)\r\n    t = uViewportMapTextureSize.st;
\r\n#else\r\n    t = vec2(textureSize(uViewportMap,  0));
\r\n#endif\r\n    v.s *= uViewportLookupScale.p * uViewportLookupScale.t / (t.s / t.t);
\r\n    v *= e.st;
\r\n    highp float u = uTextureAnimationTime;
\r\n    v += e.pq * u;
\r\n    return texture2DLodCompat(uViewportMap,  v,  0.).stp;
\r\n
}
\r\n#endif\r\n\r\n#ifndef VOLUMETRIC_FUNCTIONS_INC\r\n#define VOLUMETRIC_FUNCTIONS_INC\r\n#if defined(SUNLIGHT_SHADOWS) && defined(VOLUMETRIC_SCATTERING) && defined(SUNLIGHT_DIRECT_LIGHTING)\r\n#define VOLUMETRIC_SCATTERING_SUPPORTED\r\nuniform vec4 uMieG,  uVolumetricScatteringParameters;
\r\n#if defined(VOLUMETRIC_GROUND_FOG)\r\nuniform vec4 uGroundFogHeight_Falloff;
\r\n#endif\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\nuniform sampler3D sNoiseTex;
\r\nuniform vec4 u3DNoiseFrequency_Strength,  u3DNoiseWind_Power;
\r\n#endif\r\nuniform float uTime;
\r\nfloat ShadowSample(vec4 u,  vec4 v,  float s)\r\n {
  \r\n    int d = int(uMappingParams.q);
\r\n    vec4 f;
\r\n    int G;
\r\n#if defined(CASCADE_SPLIT_SELECTION)\r\n    G = ShadowMapSelectCascadeBySplit(s,  uCascadeFrustumViewDepths,  uCascadeSplitSelectionFlags);
\r\n#if defined(USE_LIGHT_VIEW_PROJ_TEX_MATRIX)\r\n    f = uSunlightViewProjTexMatrix[G] * u;
\r\n#else\r\n    f = v * uSunlightProjTexMatScale[G] + uSunlightProjTexMatOffset[G];
\r\n#endif\r\n\r\n#else\r\n\r\n#if defined(USE_LIGHT_VIEW_PROJ_TEX_MATRIX)\r\n    G = ShadowMapSelectCascadeByMap(f,  u,  uSunlightViewProjTexMatrix,  uCascadeMinAtlasExtents);
\r\n#else\r\n    G = ShadowMapSelectCascadeByMap(f,  v,  uSunlightProjTexMatScale,  uSunlightProjTexMatOffset,  uCascadeMinAtlasExtents);
\r\n#endif\r\n\r\n#endif\r\n    return G >= d ? 1. : ShadowDepthMapFilter1x1(uSunlightShadowMap,  f);
\r\n
}
\r\nfloat PhaseFunction(float v,  vec4 s)  {
   return s.q * (s.s / pow(s.t - s.p * v,  1.5));
}
\r\nvec4 GetScatteredInRay(int s,  vec3 u,  float v,  float d,  vec4 f)\r\n {
  \r\n    float G = uSunlightFadeAttenParams.t * 1.4,  m = min(G,  v);
\r\n    vec3 V = uCameraPosition,  t = V + u * m;
\r\n    vec4 x = uSunlightViewMatrix * vec4(V,  1.),  e = uSunlightViewMatrix * vec4(t,  1.),  i = uSunlightViewMatrix * vec4(V,  0.),  n = uSunlightViewMatrix * vec4(t,  0.);
\r\n    vec3 E = vec3(uViewMatrix[0][2],  uViewMatrix[1][2],  uViewMatrix[2][2]);
\r\n    int S = int(uMappingParams.q);
\r\n    float q = 0.,  p = 1. / float(s),  N = d * p,  h = m * p;
\r\n    vec2 r = vec2(0.,  0.);
\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\n    vec3 P = vec3(.05 * uTime),  a = u3DNoiseWind_Power.stp * uTime;
\r\n    const float o = .31;
\r\n    float c = u3DNoiseFrequency_Strength.s * o;
\r\n    vec3 l = a * u3DNoiseFrequency_Strength.s,  T = a * c;
\r\n#endif\r\n    for (int X = 0;
 X < s;
 ++X)\r\n     {
  \r\n        vec3 U = mix(V,  t,  N);
\r\n        vec4 I = mix(x,  e,  N);
\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\n        vec4 M = mix(i,  n,  N);
\r\n        vec3 C = M.sts * vec3(.001) + P,  g = M.sts * vec3(.001) - P;
\r\n        I.sp += vec2(texture3D(sNoiseTex,  g).s,  texture3D(sNoiseTex,  g).s) * 128. - 64.;
\r\n#endif\r\n        float R = 0.;
\r\n#if defined(USE_CASCADE_SPLIT_SELECTION)\r\n        vec3 O = U.stp - uCameraPosition;
\r\n        R = abs(dot(O,  E));
\r\n#endif\r\n        float F = ShadowSample(vec4(U,  1.f),  I,  R),  D = 1.,  w = 1.;
\r\n#if defined(VOLUMETRIC_GROUND_FOG)\r\n        if (uGroundFogHeight_Falloff.t != 0.)\r\n         {
  \r\n            float L = max(0.,  (U.t - uGroundFogHeight_Falloff.s) * uGroundFogHeight_Falloff.t);
\r\n            w = exp(-L) * 100.;
\r\n        
}
\r\n#endif\r\n\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\n        if (u3DNoiseFrequency_Strength.t != 0.)\r\n         {
  \r\n            vec3 L = U * u3DNoiseFrequency_Strength.s + l;
\r\n            float y = float(texture3D(sNoiseTex,  L));
\r\n            vec3 A = U * c + T;
\r\n            float H = float(texture3D(sNoiseTex,  A)),  W = pow(mix(y,  H,  .8) + .5,  u3DNoiseWind_Power.q);
\r\n            w *= max(0,  mix(1.,  W,  u3DNoiseFrequency_Strength.t));
\r\n        
}
\r\n#endif\r\n        D += w;
\r\n        float L = D * h,  W = uVolumetricScatteringParameters.s * L;
\r\n        q += uVolumetricScatteringParameters.t * L;
\r\n        r += W * exp(-q) * vec2(F,  1. - F);
\r\n        N += p;
\r\n    
}
\r\n    if (v > G)\r\n     {
  \r\n        float L = v - G,  U = uVolumetricScatteringParameters.s * L;
\r\n        q += uVolumetricScatteringParameters.t * L;
\r\n        r += vec2(U * exp(-q),  0.);
\r\n    
}
\r\n    float U = r.s + r.t;
\r\n    if (U > 0.)\r\n     {
  \r\n        float L = r.s / U,  g = uVolumetricScatteringParameters.q;
\r\n        L = pow(L,  g);
\r\n        r.st = U * vec2(L,  1. - L);
\r\n        r.s = r.s * PhaseFunction(dot(u,  uInvSunDirection),  f);
\r\n    
}
\r\n    return vec4(r.s,  q,  r.t,  1.);
\r\n
}
\r\nvec4 GetScatteredInRay2(int s,  vec3 u,  float v,  float f)  {
   return GetScatteredInRay(s,  u,  v,  f,  uMieG);
}
\r\nvec4 GetScatteredInRayLine(int s,  vec3 u,  float v,  vec3 f,  float d,  float G)\r\n {
  \r\n    vec4 L = GetScatteredInRay2(s,  u,  v,  G),  t = GetScatteredInRay2(s,  mix(u,  f,  .33),  mix(v,  d,  .33),  G),  m = GetScatteredInRay2(s,  mix(u,  f,  .66),  mix(v,  d,  .66),  G),  U = GetScatteredInRay2(s,  f,  d,  G);
\r\n    return L * .15 + t * .2 + m * .3 + U * .35;
\r\n
}
\r\n#endif\r\n#endif\r\n\r\n#ifndef APPLY_VOLUMETRICS_INC\r\n#define APPLY_VOLUMETRICS_INC\r\n#ifndef VOLUMETRIC_FUNCTIONS_INC\r\n#define VOLUMETRIC_FUNCTIONS_INC\r\n#if defined(SUNLIGHT_SHADOWS) && defined(VOLUMETRIC_SCATTERING) && defined(SUNLIGHT_DIRECT_LIGHTING)\r\n#define VOLUMETRIC_SCATTERING_SUPPORTED\r\nuniform vec4 uMieG,  uVolumetricScatteringParameters;
\r\n#if defined(VOLUMETRIC_GROUND_FOG)\r\nuniform vec4 uGroundFogHeight_Falloff;
\r\n#endif\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\nuniform sampler3D sNoiseTex;
\r\nuniform vec4 u3DNoiseFrequency_Strength,  u3DNoiseWind_Power;
\r\n#endif\r\nuniform float uTime;
\r\nfloat ShadowSample(vec4 u,  vec4 v,  float s)\r\n {
  \r\n    int d = int(uMappingParams.q);
\r\n    vec4 f;
\r\n    int G;
\r\n#if defined(CASCADE_SPLIT_SELECTION)\r\n    G = ShadowMapSelectCascadeBySplit(s,  uCascadeFrustumViewDepths,  uCascadeSplitSelectionFlags);
\r\n#if defined(USE_LIGHT_VIEW_PROJ_TEX_MATRIX)\r\n    f = uSunlightViewProjTexMatrix[G] * u;
\r\n#else\r\n    f = v * uSunlightProjTexMatScale[G] + uSunlightProjTexMatOffset[G];
\r\n#endif\r\n\r\n#else\r\n\r\n#if defined(USE_LIGHT_VIEW_PROJ_TEX_MATRIX)\r\n    G = ShadowMapSelectCascadeByMap(f,  u,  uSunlightViewProjTexMatrix,  uCascadeMinAtlasExtents);
\r\n#else\r\n    G = ShadowMapSelectCascadeByMap(f,  v,  uSunlightProjTexMatScale,  uSunlightProjTexMatOffset,  uCascadeMinAtlasExtents);
\r\n#endif\r\n\r\n#endif\r\n    return G >= d ? 1. : ShadowDepthMapFilter1x1(uSunlightShadowMap,  f);
\r\n
}
\r\nfloat PhaseFunction(float v,  vec4 s)  {
   return s.q * (s.s / pow(s.t - s.p * v,  1.5));
}
\r\nvec4 GetScatteredInRay(int s,  vec3 u,  float v,  float d,  vec4 f)\r\n {
  \r\n    float G = uSunlightFadeAttenParams.t * 1.4,  m = min(G,  v);
\r\n    vec3 V = uCameraPosition,  t = V + u * m;
\r\n    vec4 x = uSunlightViewMatrix * vec4(V,  1.),  e = uSunlightViewMatrix * vec4(t,  1.),  i = uSunlightViewMatrix * vec4(V,  0.),  n = uSunlightViewMatrix * vec4(t,  0.);
\r\n    vec3 E = vec3(uViewMatrix[0][2],  uViewMatrix[1][2],  uViewMatrix[2][2]);
\r\n    int S = int(uMappingParams.q);
\r\n    float q = 0.,  p = 1. / float(s),  N = d * p,  h = m * p;
\r\n    vec2 r = vec2(0.,  0.);
\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\n    vec3 P = vec3(.05 * uTime),  a = u3DNoiseWind_Power.stp * uTime;
\r\n    const float o = .31;
\r\n    float c = u3DNoiseFrequency_Strength.s * o;
\r\n    vec3 l = a * u3DNoiseFrequency_Strength.s,  T = a * c;
\r\n#endif\r\n    for (int X = 0;
 X < s;
 ++X)\r\n     {
  \r\n        vec3 U = mix(V,  t,  N);
\r\n        vec4 I = mix(x,  e,  N);
\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\n        vec4 M = mix(i,  n,  N);
\r\n        vec3 C = M.sts * vec3(.001) + P,  g = M.sts * vec3(.001) - P;
\r\n        I.sp += vec2(texture3D(sNoiseTex,  g).s,  texture3D(sNoiseTex,  g).s) * 128. - 64.;
\r\n#endif\r\n        float R = 0.;
\r\n#if defined(USE_CASCADE_SPLIT_SELECTION)\r\n        vec3 O = U.stp - uCameraPosition;
\r\n        R = abs(dot(O,  E));
\r\n#endif\r\n        float F = ShadowSample(vec4(U,  1.f),  I,  R),  D = 1.,  w = 1.;
\r\n#if defined(VOLUMETRIC_GROUND_FOG)\r\n        if (uGroundFogHeight_Falloff.t != 0.)\r\n         {
  \r\n            float L = max(0.,  (U.t - uGroundFogHeight_Falloff.s) * uGroundFogHeight_Falloff.t);
\r\n            w = exp(-L) * 100.;
\r\n        
}
\r\n#endif\r\n\r\n#if defined(VOLUMETRIC_SCATTERING_NOISE)\r\n        if (u3DNoiseFrequency_Strength.t != 0.)\r\n         {
  \r\n            vec3 L = U * u3DNoiseFrequency_Strength.s + l;
\r\n            float y = float(texture3D(sNoiseTex,  L));
\r\n            vec3 A = U * c + T;
\r\n            float H = float(texture3D(sNoiseTex,  A)),  W = pow(mix(y,  H,  .8) + .5,  u3DNoiseWind_Power.q);
\r\n            w *= max(0,  mix(1.,  W,  u3DNoiseFrequency_Strength.t));
\r\n        
}
\r\n#endif\r\n        D += w;
\r\n        float L = D * h,  W = uVolumetricScatteringParameters.s * L;
\r\n        q += uVolumetricScatteringParameters.t * L;
\r\n        r += W * exp(-q) * vec2(F,  1. - F);
\r\n        N += p;
\r\n    
}
\r\n    if (v > G)\r\n     {
  \r\n        float L = v - G,  U = uVolumetricScatteringParameters.s * L;
\r\n        q += uVolumetricScatteringParameters.t * L;
\r\n        r += vec2(U * exp(-q),  0.);
\r\n    
}
\r\n    float U = r.s + r.t;
\r\n    if (U > 0.)\r\n     {
  \r\n        float L = r.s / U,  g = uVolumetricScatteringParameters.q;
\r\n        L = pow(L,  g);
\r\n        r.st = U * vec2(L,  1. - L);
\r\n        r.s = r.s * PhaseFunction(dot(u,  uInvSunDirection),  f);
\r\n    
}
\r\n    return vec4(r.s,  q,  r.t,  1.);
\r\n
}
\r\nvec4 GetScatteredInRay2(int s,  vec3 u,  float v,  float f)  {
   return GetScatteredInRay(s,  u,  v,  f,  uMieG);
}
\r\nvec4 GetScatteredInRayLine(int s,  vec3 u,  float v,  vec3 f,  float d,  float G)\r\n {
  \r\n    vec4 L = GetScatteredInRay2(s,  u,  v,  G),  t = GetScatteredInRay2(s,  mix(u,  f,  .33),  mix(v,  d,  .33),  G),  m = GetScatteredInRay2(s,  mix(u,  f,  .66),  mix(v,  d,  .66),  G),  U = GetScatteredInRay2(s,  f,  d,  G);
\r\n    return L * .15 + t * .2 + m * .3 + U * .35;
\r\n
}
\r\n#endif\r\n#endif\r\n\r\n#if defined(VOLUMETRIC_SCATTERING) && defined(SUNLIGHT_DIRECT_LIGHTING)\r\nuniform vec3 uVolumetricLitFogColour,  uVolumetricUnlitFogColour;
\r\nuniform mat4 uVolumetricDitherMat;
\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\nvoid GetInAndOutScattering(vec4 v,  out vec3 u,  out vec3 G)\r\n {
  \r\n    vec3 A = uSunColour * uVolumetricLitFogColour,  o = uAmbientColour * uVolumetricUnlitFogColour;
\r\n    u = vec3(exp(-v.t));
\r\n    G = v.s * A + v.p * o;
\r\n
}
\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\nvec4 ApplyVolumetricScattering(vec4 v,  vec4 u)\r\n {
  \r\n    vec3 A = vec3(1.),  o = vec3(0.);
\r\n    GetInAndOutScattering(u,  A,  o);
\r\n    return vec4(v.stp * A + o,  v.q);
\r\n
}
\r\nfloat CalculateScatteringOffset(vec2 v)\r\n {
  \r\n    vec2 u = vec2(floor(mod(v.st,  4.)));
\r\n    return uVolumetricDitherMat[int(u.s)][int(u.t)];
\r\n
}
\r\n#endif\r\n#endif\r\n\r\n#ifndef LIGHTING_UTILS_H\r\n#define LIGHTING_UTILS_H\r\n#ifndef LIGHTING_INC\r\n#define LIGHTING_INC\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\n#ifndef FRESNEL_INC\r\n#define FRESNEL_INC\r\nvec3 FresnelSchlick(vec3 F,  float f,  highp float h)\r\n {
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
\r\n#endif\r\n#endif\r\n\r\n#ifndef STIPPLE_TRANSPARENCY_UTILS_INC\r\n#define STIPPLE_TRANSPARENCY_UTILS_INC\r\n#if defined(STIPPLE_TRANSPARENCY_CLIP_NEAR) || defined(STIPPLE_TRANSPARENCY_CLIP_FAR) || defined(STIPPLE_TRANSPARENCY_ALPHA)\r\n#ifndef STIPPLE_COMMON_INC\r\n#define STIPPLE_COMMON_INC\r\nhighp float GetStippleViewSpaceDepthFromPos(vec3 S)\r\n {
  \r\n    vec3 u = vec3(uViewMatrix[0][2],  uViewMatrix[1][2],  uViewMatrix[2][2]);
\r\n    return dot(S,  u);
\r\n
}
\r\n#endif\r\n\r\n#ifndef NOISE_UTILS_INC\r\n#define NOISE_UTILS_INC\r\nvec4 permute(vec4 t)\r\n {
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
\r\n#endif\r\n\r\n#define STIPPLE_TRANSPARENCY_ENABLED\r\n#if defined(STIPPLE_TRANSPARENCY_CLIP_NEAR) || defined(STIPPLE_TRANSPARENCY_CLIP_FAR)\r\nuniform vec4 uStippleTransparencyClipParams;
\r\n#endif\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\nfloat GetStippleTransparencyAlpha(float S,  inout float R)\r\n {
  \r\n    float f = 1.;
\r\n#if defined(STIPPLE_TRANSPARENCY_CLIP_NEAR)\r\n    float d = (S - (uZBufferParams.q + uStippleTransparencyClipParams.s)) * uStippleTransparencyClipParams.t;
\r\n    f *= clamp(d,  0.,  1.);
\r\n#endif\r\n\r\n#if defined(STIPPLE_TRANSPARENCY_CLIP_FAR)\r\n    float u = 1. - (S - (abs(uZBufferParams.p) - uStippleTransparencyClipParams.p)) * uStippleTransparencyClipParams.q;
\r\n    f *= clamp(u,  0.,  1.);
\r\n#endif\r\n\r\n#if defined(STIPPLE_TRANSPARENCY_ALPHA)\r\n    f *= clamp(R + .005,  0.,  1.);
\r\n    R = 1.;
\r\n#endif\r\n    return f;
\r\n
}
\r\nbool IsStipplePixelVisible(highp vec3 S,  highp vec2 R,  inout float d)\r\n {
  \r\n    float u = GetStippleViewSpaceDepthFromPos(S);
\r\n    return GetStippleTransparencyAlpha(u,  d) > GetInterleavedGradientNoise(R);
\r\n
}
\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\n#endif\r\n#endif\r\n\r\n#ifndef STIPPLE_CUTOUT_UTILS_INC\r\n#define STIPPLE_CUTOUT_UTILS_INC\r\n#if defined(STIPPLE_TRANSPARENCY_CUTOUT)\r\n#ifndef STIPPLE_COMMON_INC\r\n#define STIPPLE_COMMON_INC\r\nhighp float GetStippleViewSpaceDepthFromPos(vec3 S)\r\n {
  \r\n    vec3 u = vec3(uViewMatrix[0][2],  uViewMatrix[1][2],  uViewMatrix[2][2]);
\r\n    return dot(S,  u);
\r\n
}
\r\n#endif\r\n\r\n#ifndef NOISE_UTILS_INC\r\n#define NOISE_UTILS_INC\r\nvec4 permute(vec4 t)\r\n {
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
\r\n#endif\r\n\r\n#define STIPPLE_CUTOUT_STIPPLED_ALPHA_MULTIPLIER 2.0\r\nfloat GetStippleCutoutAdjustedAlpha(vec3 S,  vec2 u,  float G)\r\n {
  \r\n    float v = uStippleCutoutPosDepthVisibility.p,  p = GetStippleViewSpaceDepthFromPos(S);
\r\n    const float T = 500.,  f = 500.,  t = 1. / f;
\r\n    float i = 0.f;
\r\n    if (p < v + T)\r\n     {
  \r\n        float l = abs(p - (v + T));
\r\n        l = clamp(l * t,  0.,  1.);
\r\n        vec2 c = u * 2. - vec2(1.),  a = c - uStippleCutoutPosDepthVisibility.st;
\r\n        a = a;
\r\n        float d = uProjectionMatrix[1][1] / uProjectionMatrix[0][0];
\r\n        a.s *= d;
\r\n        float I = uStippleCutoutPosDepthVisibility.q,  R = uStippleCutoutStartRangeAndMinAlpha.s,  s = uStippleCutoutStartRangeAndMinAlpha.t,  e = uStippleCutoutStartRangeAndMinAlpha.p,  o = clamp((length(a) - R) * s,  0.,  1.);
\r\n        i = mix(pow(l * (1. - o),  2.),  0.,  I) - e;
\r\n    
}
\r\n    return i;
\r\n
}
\r\nbool IsStippleCutoutVisible(vec3 S,  vec2 v,  vec2 l)  {
   return GetStippleCutoutAdjustedAlpha(S,  v,  STIPPLE_CUTOUT_STIPPLED_ALPHA_MULTIPLIER) > GetInterleavedGradientNoise(l);
}
\r\n#endif\r\n#endif\r\n\r\n#ifndef FRESNEL_INC\r\n#define FRESNEL_INC\r\nvec3 FresnelSchlick(vec3 F,  float f,  highp float h)\r\n {
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
\r\n#endif\r\n\r\n#ifndef LIGHTING_INC\r\n#define LIGHTING_INC\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\n#ifndef FRESNEL_INC\r\n#define FRESNEL_INC\r\nvec3 FresnelSchlick(vec3 F,  float f,  highp float h)\r\n {
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
\r\n#if __VERSION__ <= 120\r\n#define in varying\r\n#define out varying\r\n#endif\r\n\r\n#endif\r\n\r\nvoid main()\r\n {
  \r\n#if defined(DEBUG_VERTEX_BONE_COLOUR)\r\n    gl_FragColor = vec4(vVertexAlbedo);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(ALPHA_ENABLED)\r\n    if (vVertexAlbedo.q == 0.)\r\n     {
  \r\n        discard;
\r\n    
}
\r\n#endif\r\n    highp vec4 d = vec4(vWorldPosition.stp,  1.);
\r\n#if defined(CLIP_PLANE) && !defined(PUSH_TO_FARPLANE)\r\n    if (dot(d,  uClipPlane) < 0.)\r\n     {
  \r\n        discard;
\r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(TEXTURE_ATLAS)\r\n    TextureSettings D;
\r\n    getTextureSettings(vMaterialSettingsSlotXY_BatchFlags.st,  D);
\r\n#endif\r\n    highp vec2 v = vec2(0.),  p = vec2(0.);
\r\n    highp vec3 r = vec3(0.),  q = vec3(0.);
\r\n    vec4 u = vec4(1.),  s;
\r\n#if defined(COMPRESSED_NORMALS)\r\n    s = vec4(0.,  .5,  0.,  .5);
\r\n#else\r\n    s = vec4(0.,  .5,  1.,  .5);
\r\n#endif\r\n    highp vec3 S = d.stp - uCameraPosition;
\r\n#if defined(TEXTURE_ATLAS)\r\n    highp float G = uTextureAnimationTime;
\r\n    vec2 t = vTextureUV + fract(D.uvAnim * G);
\r\n    CalculateDerivatives(v,  p,  r,  q,  t,  S);
\r\n    SampleTextures(u,  s,  t,  D,  vMaterialSettingsSlotXY_BatchFlags.p,  v,  p);
\r\n#endif\r\n    float i = 1.,  g = 0.,  C = 0.;
\r\n    vec3 n = step(.5,  fract(vMaterialSettingsSlotXY_BatchFlags.p * vec3(64.,  32.,  16.)));
\r\n#if !defined(TEXTURE_ALBEDO_GLOBAL)\r\n    n.sp *= step(.5,  fract(vMaterialSettingsSlotXY_BatchFlags.p * 8.));
\r\n#endif\r\n    i += n.s * u.q * 4.;
\r\n    g = n.t;
\r\n    C = n.p * u.q;
\r\n    u.q = min(u.q + n.s + n.p,  1.);
\r\n    vec4 f = u * vVertexAlbedo;
\r\n#if defined(DEBUG_GEOMETRY_INSTANCE_COLOUR)\r\n    gl_FragColor = vec4(uDebugInstanceColour.stp,  f.q);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(ALPHA_ENABLED)\r\n    if (f.q <= uAlphaTestThreshold)\r\n     {
  \r\n        discard;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(STIPPLE_TRANSPARENCY_CUTOUT) && defined(VIEWPORTLOOKUPSCALE)\r\n    if (fract(vMaterialSettingsSlotXY_BatchFlags.p * 4.) > .5)\r\n     {
  \r\n#if defined(ALPHA_ENABLED)\r\n        if (uAlphaTestThreshold > .01)\r\n         {
  \r\n            if (IsStippleCutoutVisible(S,  gl_FragCoord.st * uViewportLookupScale.st,  gl_FragCoord.st))\r\n             {
  \r\n                discard;
\r\n            
}
\r\n        
}
\r\n        else\r\n            f.q *= 1.f - GetStippleCutoutAdjustedAlpha(S,  gl_FragCoord.st * uViewportLookupScale.st,  1.);
\r\n#else\r\n        if (IsStippleCutoutVisible(S,  gl_FragCoord.st * uViewportLookupScale.st,  gl_FragCoord.st))\r\n         {
  \r\n            discard;
\r\n        
}
\r\n#endif\r\n    
}
\r\n#endif\r\n\r\n#if defined(STIPPLE_TRANSPARENCY_ENABLED)\r\n    if (!IsStipplePixelVisible(S,  gl_FragCoord.st,  f.q))\r\n     {
  \r\n        discard;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(GOURAUD_SHADING)\r\n    gl_FragColor = f;
\r\n    return;
\r\n#endif\r\n    highp vec3 e = normalize(vNormal),  T = vec3(0.,  1.,  0.),  P = vec3(0.,  1.,  0.);
\r\n#if defined(PER_FRAGMENT_TANGENTS)\r\n    ComputeTangentBitangentFromDerivatives(T,  P,  e,  r,  q,  v,  p);
\r\n#endif\r\n\r\n#if defined(USE_NORMAL_MAP)\r\n\r\n#if !defined(PER_FRAGMENT_TANGENTS)\r\n    T = normalize(vTangent.stp);
\r\n    P = ComputeBitangent(e,  vTangent);
\r\n#endif\r\n    vec3 A = UnpackNormal(s.tpq,  D.normalScale);
\r\n    e = ApplyNormalMap(A,  e,  T,  P);
\r\n#endif\r\n\r\n#if defined(DEBUG_TANGENTS) || defined(DEBUG_BITANGENTS)\r\n\r\n#if defined(DEBUG_TANGENTS)\r\n    gl_FragColor.stp = normalize(T) * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n\r\n#if defined(DEBUG_BITANGENTS)\r\n    gl_FragColor.stp = normalize(P) * .5 + .5;
\r\n    gl_FragColor.q = 1.;
\r\n#endif\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(VIEWPORTMAP)\r\n    f.stp = SampleViewportMapColour(gl_FragCoord.st,  D.viewportMapUVScaleAndAnim);
\r\n#endif\r\n\r\n#if defined(DEBUG_TEXEL_DENSITY)\r\n\r\n#if defined(TEXTURE_ATLAS)\r\n    gl_FragColor = vec4(GetTexelDensityDebugColour(vTextureUV,  D.textureMeta1.p,  S),  1.);
\r\n#else\r\n    gl_FragColor = vec4(1.);
\r\n#endif\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(VIEWPORTLOOKUPSCALE)\r\n    vec2 E = gl_FragCoord.st * uFullScreenLookupScale.st;
\r\n#endif\r\n    float h = 1.;
\r\n#if defined(SSAO) && !defined(REFRACTION)\r\n    h = texture2D(uSSAOMap,  E).s;
\r\n#endif\r\n    LightingTerms m;
\r\n    ClearLightingTerms(m);
\r\n    m.Diffuse = uAmbientColour;
\r\n    vec3 l = vec3(1.,  1.,  1.);
\r\n#if defined(IRRADIANCE_LIGHTING)\r\n    l = EvaluateSHLighting2ndOrder(e,  uIrradianceSHCoefs);
\r\n    m.Diffuse *= l;
\r\n#endif\r\n\r\n#if defined(SSAO)\r\n    m.Diffuse *= h;
\r\n#endif\r\n    highp float V = length(S);
\r\n    highp vec3 a = S / V;
\r\n    LightingTerms R;
\r\n    ClearLightingTerms(R);
\r\n#if defined(SUNLIGHT_DIRECT_LIGHTING)\r\n    int I = -1;
\r\n    float F = 0.;
\r\n#if defined(DEFERRED_SHADOWS)\r\n    R = EvaluateSunlightRT5(F,  e,  P,  -a,  E,  D.specular,  g);
\r\n#else\r\n    highp vec3 O = vec3(uViewMatrix[0][2],  uViewMatrix[1][2],  uViewMatrix[2][2]);
\r\n    highp float o = abs(dot(S,  O));
\r\n    float L = step(.5,  fract(vMaterialSettingsSlotXY_BatchFlags.p * 2.));
\r\n    R = EvaluateSunlightRT5(I,  F,  d,  e,  P,  o,  -a,  D.specular,  g,  L);
\r\n#endif\r\n\r\n#else\r\n    R.Diffuse = vec3(1.);
\r\n#endif\r\n\r\n#if defined(TEXTURE_ATLAS) && defined(DEBUG_MATERIAL_HIGHLIGHT)\r\n    if (uDebugMaterialHighlight != -1.)\r\n     {
  \r\n        float c = mix(.1,  .5,  length(R.Diffuse)),  N = .1;
\r\n        vec3 U = mix(vec3(N) * c,  vec3(0,  1,  0),  D.materialID == uDebugMaterialHighlight ? 1 : 0);
\r\n        gl_FragColor = vec4(U,  1);
\r\n        if (uDebugReturn != 0.)\r\n         {
  \r\n            return;
\r\n        
}
\r\n    
}
\r\n#endif\r\n    float N = FresnelSchlick(.8,  max(0.,  dot(-a,  e)),  5.);
\r\n#if defined(TEXTURE_ATLAS) && defined(GLOBAL_ENVIRONMENTMAPPING)\r\n    if (C > 0.)\r\n     {
  \r\n        vec3 c = reflect(-a,  e);
\r\n        c.s = -c.s;
\r\n        c.t = -c.t;
\r\n        m.Specular = textureCubeSRGB(uGlobalEnvironmentMap,  c).stp * h;
\r\n#if defined(NORMALIZED_ENVIRONMENTMAPPING)\r\n        m.Specular *= l * uGlobalEnvironmentMappingParams.q;
\r\n#endif\r\n        f.stp = mix(f.stp,  m.Specular,  C * N);
\r\n    
}
\r\n#endif\r\n    vec4 c = vec4(0.,  0.,  0.,  f.q);
\r\n#if defined(POINT_LIGHTING)\r\n    vec3 U = vec3(0.,  0.,  0.),  M = vec3(0.,  0.,  0.);
\r\n    const vec3 B = vec3(.65,  .65,  .65);
\r\n    const float H = 1.,  b = 5.;
\r\n    EvaluatePointLights(U,  M,  B,  D.specular,  H,  b,  -a,  vWorldPosition.stp,  e,  o,  vTilePosition);
\r\n#if defined(DEBUG_POINTLIGHTS)\r\n    gl_FragColor = vec4(U,  f.q);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(DEBUG_POINTLIGHTS_SPECULAR)\r\n    gl_FragColor = vec4(M,  f.q);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(DIFFUSE_LIGHTING)\r\n    R.Diffuse += U;
\r\n#else\r\n    R.Diffuse = U;
\r\n#endif\r\n\r\n#if defined(POINT_LIGHTING_SPECULAR)\r\n    R.Specular += M;
\r\n#endif\r\n\r\n#else\r\n\r\n#if defined(DEBUG_POINTLIGHTS)\r\n    gl_FragColor = vec4(0.,  0.,  0.,  1.);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if defined(DEBUG_POINTLIGHTS_SPECULAR)\r\n    gl_FragColor = vec4(0.,  0.,  0.,  1.);
\r\n    if (uDebugReturn != 0.)\r\n     {
  \r\n        return;
\r\n    
}
\r\n#endif\r\n\r\n#if !defined(DIFFUSE_LIGHTING)\r\n    R.Diffuse = vec3(0.);
\r\n#endif\r\n\r\n#endif\r\n    float x = 0.;
\r\n#if defined(CAUSTICS)\r\n    x = CalculateCausticsTerm(vWorldPosition.stp,  F,  e);
\r\n#endif\r\n\r\n#if defined(AMBIENT_LIGHTING)\r\n    c.stp += m.Diffuse;
\r\n#endif\r\n    c.stp += R.Diffuse;
\r\n#if defined(SPECULAR_LIGHTING)\r\n    c.stp += R.Specular * i;
\r\n#endif\r\n\r\n#if defined(CAUSTICS)\r\n    c.stp += uSunColour * x;
\r\n#endif\r\n\r\n#if defined(ALBEDO_LIGHTING)\r\n    c.stp *= f.stp;
\r\n#endif\r\n\r\n#if defined(DEBUG_EMISSIVE_MAP)\r\n    c.stp = vec3(g);
\r\n#else\r\n    if (g > 0.)\r\n        c.q *= c.q;
\r\n    c.stp = mix(c.stp,  f.stp,  g);
\r\n#endif\r\n\r\n#if defined(REFRACTION)\r\n    if (D.refraction.s > 0. || D.refraction.p > 0.)\r\n        c.stp = CalculateRefractionColour(vWorldPosition.stp,  e,  -a,  D.specular,  D.refraction,  e.sp,  c);
\r\n#endif\r\n\r\n#if defined(LIGHT_SCATTERING) || defined(FOG_DISTANCE)\r\n    c.stp = ApplyInOutScattering(c.stp,  vOutScattering,  vInScattering);
\r\n#endif\r\n\r\n#if defined(VOLUMETRIC_SCATTERING_SUPPORTED)\r\n    vec4 Y = GetScatteredInRay2(8,  a,  V,  CalculateScatteringOffset(gl_FragCoord.st));
\r\n    c = ApplyVolumetricScattering(c,  Y);
\r\n#endif\r\n\r\n#if defined(TINT) && defined(PUSH_TO_FARPLANE)\r\n    c.stp += uTint.stp;
\r\n#endif\r\n\r\n#if defined(DEBUG_ALBEDO)\r\n    c = f;
\r\n#endif\r\n\r\n#if defined(DEBUG_NORMALS)\r\n    c.stp = e * .5 + .5;
\r\n    c.q = 1.;
\r\n#endif\r\n\r\n#if defined(DEBUG_FRESNEL)\r\n    c.stp = vec3(N,  N,  N);
\r\n    c.q = 1.;
\r\n#endif\r\n\r\n#if defined(DEBUG_SPECULAR_MAP)\r\n    c.stp = vec3(max(0.,  (i - .5) / 4.));
\r\n#endif\r\n\r\n#if defined(SUNLIGHT_SHADOWS) && defined(DEBUG_SUNLIGHT_SHADOW_CASCADE) && !defined(DEFERRED_SHADOWS)\r\n    c.stp = ShadowMapCascadeColour(I,  int(uMappingParams.q)).stp;
\r\n#endif\r\n\r\n#if defined(DEBUG_RT7_EMISSIVE) || defined(DEBUG_RT7_METALNESS) || defined(DEBUG_RT7_ROUGHNESS)\r\n    c = vec4(1.,  0.,  1.,  1.);
\r\n#endif\r\n\r\n#if defined(FORCE_OPAQUE)\r\n    c.q = 1.;
\r\n#endif\r\n\r\n#if defined(PREMULTIPLY_ALPHA)\r\n    c.stp *= c.q;
\r\n#endif\r\n    gl_FragColor = c;
\r\n
}
\r\n"
}
, 7293:e=> {
  "use strict";
e.exports=function(e, t) {
  var n, r, i, a, s, o, l, c, u, h, d, p, f, m, g, _, v, y, b, x, E, w, S, T, A;
n=e.state, r=e.next_in, T=e.input, i=r+(e.avail_in-5), a=e.next_out, A=e.output, s=a-(t-e.avail_out), o=a+(e.avail_out-257), l=n.dmax, c=n.wsize, u=n.whave, 
h=n.wnext, d=n.window, p=n.hold, f=n.bits, m=n.lencode, g=n.distcode, _=(1<<n.lenbits)-1, v=(1<<n.distbits)-1;
e:do {
  f<15&&(p+=T[r++]<<f, f+=8, p+=T[r++]<<f, f+=8), y=m[p&_];
t:for(;
;
) {
  if(p>>>=b=y>>>24, f-=b, 0==(b=y>>>16&255))A[a++]=65535&y;
else {
  if(!(16&b)) {
if(64&b) {
  if(32&b) {
  n.mode=12;
break e
}
e.msg="invalid literal/length code", n.mode=30;
break e
}
y=m[(65535&y)+(p&(1<<b)-1)];
continue t
}
for(x=65535&y, (b&=15)&&(f<b&&(p+=T[r++]<<f, f+=8), x+=p&(1<<b)-1, p>>>=b, f-=b), f<15&&(p+=T[r++]<<f, f+=8, p+=T[r++]<<f, f+=8), 
y=g[p&v];
;
) {
  if(p>>>=b=y>>>24, f-=b, 16&(b=y>>>16&255)) {
  if(E=65535&y, f<(b&=15)&&(p+=T[r++]<<f, (f+=8)<b&&(p+=T[r++]<<f, f+=8)), (E+=p&(1<<b)-1)>l) {
  e.msg="invalid distance too far back", n.mode=30;
break e
}
if(p>>>=b, f-=b, E>(b=a-s)) {
  if((b=E-b)>u&&n.sane) {
e.msg="invalid distance too far back", n.mode=30;
break e
}
if(w=0, S=d, 0===h) {
  if(w+=c-b, b<x) {
  x-=b;
do {
  A[a++]=d[w++]
}
while(--b);
w=a-E, S=A
}
}
else if(h<b) {
  if(w+=c+h-b, (b-=h)<x) {
  x-=b;
do {
  A[a++]=d[w++]
}
while(--b);
if(w=0, h<x) {
  x-=b=h;
do {
  A[a++]=d[w++]
}
while(--b)
;
w=a-E, S=A
}
}
}
else if(w+=h-b, b<x) {
  x-=b;
do {
  A[a++]=d[w++]
}
while(--b);
w=a-E, S=A
}
for(;
x>2;
)A[a++]=S[w++], A[a++]=S[w++], A[a++]=S[w++], x-=3;
x&&(A[a++]=S[w++], x>1&&(A[a++]=S[w++]))
}
else {
  w=a-E;
do {
  A[a++]=A[w++], A[a++]=A[w++], A[a++]=A[w++], x-=3
}
while(x>2)
;
x&&(A[a++]=A[w++], x>1&&(A[a++]=A[w++]))
}
break
}
if(64&b) {
  e.msg="invalid distance code", n.mode=30;
break e
}
y=g[(65535&y)+(p&(1<<b)-1)]
}
}
break
}
}
while(r<i&&a<o);
r-=x=f>>3, p&=(1<<(f-=x<<3))-1, e.next_in=r, e.next_out=a, e.avail_in=r<i?i-r+5:5-(r-i), 
e.avail_out=a<o?o-a+257:257-(a-o), n.hold=p, n.bits=f
}
}
, 7421:e=> {
  "use strict"
;
e.exports='["array", 4096, ["struct", \r\n\t["flags", "unsigned byte"], \r\n\t["shape", ["opt", ["flags", 0, "bitflag"], "unsigned byte"]], \r\n\t["overlay", ["opt", ["flags", 0, "bitflag"], "variable unsigned short"]], \r\n\t["settings", ["opt", ["flags", 1, "bitflag"], "unsigned byte"]], \r\n\t["underlay", ["opt", ["flags", 2, "bitflag"], "variable unsigned short"]], \r\n\t["height", ["opt", ["flags", 3, "bitflag"], "unsigned byte"]]\r\n]]'
