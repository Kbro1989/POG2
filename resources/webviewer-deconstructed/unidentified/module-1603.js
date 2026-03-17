// Module ID: 1603
// Category: unidentified
// Size: 36695 bytes
// Parameters: 


}
, 1695:e=> {
  "use strict"
;
e.exports=' {
  \r\n    "0x01": {
  "name":"unk01", "read":["struct", \r\n        ["cols", "ubyte"], \r\n        ["columndata", ["nullarray", "ubyte", 255, ["struct", \r\n            ["id", ["ref", "$opcode", [0, 6]]], \r\n            ["flags", ["ref", "$opcode", [6, 2]]], \r\n            ["$i", 0], \r\n            ["columns", ["chunkedarray", "ubyte", [\r\n                ["type", "varushort"]\r\n            ], [\r\n                ["$colindex", ["accum", "$i", 1]], \r\n                ["unk", ["opt", "$opcode&0x80 && $colindex==1", "ubyte"]], //this is dumb,  there is currently no way to read a byte between chunkedarray chunks\r\n                ["default", ["opt", "$opcode&0x80", ["match", ["ref", "type"],  {
  \r\n                    "0x24":"string", \r\n                    "other":"int"\r\n                
}
]]]\r\n            ]]]\r\n        ]]]\r\n    ]
}
, \r\n    "0x02": {
  "name":"unk02", "read":["struct", \r\n        ["unkint", "uint"], \r\n        ["cols", "ubyte"], \r\n        ["columndata", ["nullarray", "ubyte", 255, ["struct", \r\n            ["id", ["ref", "$opcode", [0, 6]]], \r\n            ["flags", ["ref", "$opcode", [6, 2]]], \r\n            ["$i", 0], \r\n            ["$default", 0], \r\n            ["unkbyte", "ubyte"], \r\n            ["columns", ["chunkedarray", "ubyte", [\r\n                ["type", "varushort"], \r\n                ["$colindex", ["accum", "$i", 1]]\r\n            ], [\r\n                ["hasdefault", ["accum", "$default", ["match",  {
  "$colindex==1":"ubyte", "other":0
}
]]]\r\n            ], [\r\n                ["unk1", ["opt", "hasdefault&0x02 && $colindex==1", "ubyte"]], //this is dumb,  there is currently no way to read a byte between chunkedarray chunks\r\n                ["defaultint", ["opt", "hasdefault&0x02 && type!=0x24", "int"]], \r\n                ["defaultstring", ["opt", "hasdefault&0x02 && type==0x24", "string"]], \r\n                ["unk2", ["opt", "hasdefault&0x02 && $colindex==1", "ubyte"]]\r\n            ]]]\r\n        ]]]\r\n    ]
}
\r\n
}
\r\n\r\n// alternative if the first byte were a version (it isn\'t because an empty dbtable starts with the 0x00 footer byte)\r\n// ["struct", \r\n//     ["version", "ubyte"], \r\n//     ["unkint", ["opt", "version>=2", "uint"]], \r\n//     ["cols", "ubyte"], \r\n//     ["columndata", ["nullarray", "ubyte", 255, ["struct", \r\n//         ["id", ["ref", "$opcode", [0, 6]]], \r\n//         ["flags", ["ref", "$opcode", [6, 2]]], \r\n//         ["$i", 0], \r\n//         ["$default", 0], \r\n//         ["unkbyte", ["opt", "version>=2", "ubyte"]], \r\n//         ["columns", ["chunkedarray", "ubyte", [\r\n//             ["type", "varushort"], \r\n//             ["$colindex", ["accum", "$i", 1]]\r\n//         ], [\r\n//             ["flagsbyte", ["accum", "$default", ["match",  {
  "$colindex==1 && version>=2":"ubyte", "other":0
}
]]]\r\n//         ], [\r\n//             ["hasdefault", ["match",  {
  "version>=2 && flagsbyte&0x2":1, "version<=1 && id&0x80":1, "other":0
}
]], \r\n//             ["unk1", ["opt", "hasdefault==1 && $colindex==1", "ubyte"]], //this is dumb,  there is currently no way to read a byte between chunkedarray chunks\r\n//             ["defaultint", ["opt", "hasdefault==1 && type!=0x24", "int"]], \r\n//             ["defaultstring", ["opt", "hasdefault==1 && type==0x24", "string"]], \r\n//             ["unk2", ["opt", "hasdefault==1 && $colindex==1", "ubyte"]]\r\n//         ]]]\r\n//     ]]]\r\n// ]'
}
, 1739:e=> {
  "use strict"
;
e.exports=' {
  \r\n\t"0x01":  {
   "name":                           "model",  "read": "varuint" 
}
, \r\n\t"0x02":  {
   "name":                        "sequence",  "read": "varuint" 
}
, \r\n\t"0x04":  {
   "name":                          "scaleX",  "read": "ushort" 
}
, \r\n\t"0x05":  {
   "name":                       "scaleYorZ",  "read": "ushort" 
}
, \r\n\t"0x06":  {
   "name":                        "rotation",  "read": "ushort" 
}
, \r\n\t"0x07":  {
   "name":                         "ambient",  "read": "ubyte" 
}
, \r\n\t"0x08":  {
   "name":                        "contrast",  "read": "ubyte" 
}
, \r\n\t"0x0a":  {
   "name":                           "unk0a",  "read": "true" 
}
, \r\n\t"0x28":  {
   "name":                  "replace_colors",  "read": ["array", "ubyte", ["tuple", "ushort", "ushort"]] 
}
, \r\n\t"0x29":  {
   "name":               "replace_materials",  "read": ["array", "ubyte", ["tuple", "ushort", "ushort"]] 
}
, \r\n\t"0x2c":  {
   "name":                           "unk2c",  "read": "ushort" 
}
, \r\n\t"0x2e":  {
   "name":                           "unk2e",  "read": "true" 
}
\r\n
}
'
}
, 1826:e=> {
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
\r\n\r\n#define isNaN isnan\r\n\r\n#ifndef GL_ARB_derivative_control\r\n#define dFdxFine dFdx\r\n#define dFdyFine dFdy\r\n#define fwidthFine fwidth\r\n#endif\r\n\r\n/***************************************************/\r\n\r\n/***************************************************/\r\n/***************** Effect Defines ******************/\r\n/***************************************************/\r\n#define VIEW_TRANSFORMS\r\n#define WATER_COMMON\r\n\r\n/*************************************************/\r\n\r\n/***************************************************/\r\n/********** Mandatory Shader Fragments *************/\r\n/***************************************************/\r\n\r\n#define GRAPHICS_QUALITY_LOW 0\r\n#define GRAPHICS_QUALITY_MEDIUM 1\r\n#define GRAPHICS_QUALITY_HIGH 2\r\n#define GRAPHICS_QUALITY_ULTRA 3\r\n\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_X 3.0\r\n#define MATERIAL_SETTINGS_SLOT_PIXEL_RESOLUTION_Y 4.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_X 42.0\r\n#define MATERIAL_SETTINGS_SLOTS_DIMENSION_COUNT_Y 32.0\r\n#define MATERIAL_SETTINGS_TEXTURE_RESOLUTION 128.0\r\n#ifndef MATH_UTILS_INC\r\n#define MATH_UTILS_INC\r\nconst float PI = 3.14159,  INV_PI = .31831,  TWOPI = PI * 2.,  INV_TWOPI = 1. / TWOPI,  PI_OVER_4 = PI / 4.,  PI_OVER_2 = PI / 2.,  SQRT_2_PI = .797885,  INV_EIGHT = .125;
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
\r\nUNIFORM_BUFFER_END\r\n\r\n/***************************************************/\r\n\r\nuniform lowp vec4 uWaterFeatureFlags;
\r\nuniform highp vec4 uWaterNormalMapTextureScales_FlowNoiseScale;
\r\nuniform highp vec2 uWaterTickFade;
\r\nuniform mat4 uModelMatrix;
\r\n\r\nUNIFORM_BUFFER_BEGIN(ViewTransforms)\r\nuniform highp vec3 uCameraPosition;
\r\nuniform highp mat4 uViewMatrix;
\r\nuniform highp mat4 uProjectionMatrix;
\r\nuniform highp mat4 uViewProjMatrix;
\r\nuniform highp vec4 uZBufferParams;
\r\nUNIFORM_BUFFER_END\r\nout highp vec4 vPosition_WaterDepth;
\r\nout vec4 vColour;
\r\nout highp vec4 vFlowControlMask_ViewSpaceDepth;
\r\nout highp vec4 vNoisyPatchFlow0_NoisyPatchFlow1;
\r\nout highp vec4 vNoisyPatchFlow2_UVPack_NormalsFlow0Map0;
\r\nout highp vec4 vUVPack_NormalsFlow0Map1_NormalsFlow0Map2;
\r\nout highp vec4 vUVPack_NormalsFlow1Map0_NormalsFlow1Map1;
\r\nout highp vec4 vUVPack_NormalsFlow1Map2_NormalsFlow2Map0;
\r\nout highp vec4 vUVPack_NormalsFlow2Map1_NormalsFlow2Map2;
\r\nout highp vec4 vUVPack_NormalMapMacroUV_EmissiveUV[3];
\r\nout highp vec2 vUVPack_FoamUV;
\r\nattribute vec4 aWaterPosition_Depth,  aVertexColour;
\r\nattribute vec2 aWaterFlowDataPatchFlow0,  aWaterFlowDataPatchFlow1,  aWaterFlowDataPatchFlow2;
\r\nattribute vec4 aWaterFlowDataFlowNoise0_FlowNoise1,  aWaterFlowDataFlowNoise2_FlowIndex_Spare;
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
\r\n#endif\r\n#endif\r\n\r\n#ifndef VOLUMETRIC_FUNCTIONS_INC\r\n#define VOLUMETRIC_FUNCTIONS_INC\r\n#if defined(SUNLIGHT_SHADOWS) && defined(VOLUMETRIC_SCATTERING) && defined(SUNLIGHT_DIRECT_LIGHTING)\r\n#define VOLUMETRIC_SCATTERING_SUPPORTED\r\nuniform vec4 uMieG,  uVolumetricScatteringParameters;
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
\r\n#endif\r\n#endif\r\n\r\n#if __VERSION__ <= 120\r\n#ifdef in\r\n#undef in\r\n#endif\r\n#ifdef out\r\n#undef out\r\n#endif\r\n#endif\r\n\r\nvec2 GetFlowOrientedUV(vec2 v,  vec2 u,  float d,  float E)\r\n {
  \r\n    float T = dot(u,  u);
\r\n    const float q = 1e-06;
\r\n    vec2 e = T < q ? vec2(0.,  1.) : normalize(u),  t = vec2(e.t,  -e.s);
\r\n    highp float f = length(u * d * E);
\r\n    return vec2(dot(t,  v),  dot(e,  v) + f);
\r\n
}
\r\nvec2 GetFlowOrientedUV(vec4 e,  vec2 v,  float d,  vec2 u,  float f)\r\n {
  \r\n    vec2 q = vec2(e.sp);
\r\n    float t = sign(u.t);
\r\n    return GetFlowOrientedUV(q,  v * t,  d,  f) * u;
\r\n
}
\r\n#if defined(WATER_NORMAL_MAPS)\r\nvec2 TransformNormalMapTexCoordFlowAligned(in NormalMapTexCoordParams v,  vec2 u,  vec2 d,  vec2 f)\r\n {
  \r\n    const float q = .5;
\r\n    highp float E = uWaterTickFade.s * q;
\r\n    float t = v.flowSpeed_spareyzw.s;
\r\n    vec2 T = GetFlowOrientedUV(u,  v.flowRotation * d,  t,  E),  a = (v.uvRotation * T + f * t * E) * v.uvScale_uvOffset.st + v.uvScale_uvOffset.pq;
\r\n    return a;
\r\n
}
\r\nvec2 TransformNormalMapTexCoordAxisAligned(in NormalMapTexCoordParams v,  vec2 u,  vec2 d,  vec2 f)\r\n {
  \r\n    const float q = .5;
\r\n    highp float t = uWaterTickFade.s * q;
\r\n    vec2 p = (d + f) * v.flowSpeed_spareyzw.s,  E = v.flowRotation * p * t,  a = v.uvRotation * (u + E) * v.uvScale_uvOffset.st + v.uvScale_uvOffset.pq;
\r\n    return a;
\r\n
}
\r\n#if !defined(GLES2_COMPAT_MODE)\r\nvoid ComputeNormalMapDetailTexCoords(vec2 v,  vec2 d,  vec2 f,  vec2 u,  vec2 t,  vec2 a,  vec2 p,  vec2 s,  vec2 E)\r\n {
  \r\n    vec2 q = vec2(1.),  S = vec2(-1.),  g = vec2(1.,  -1.),  T = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[0],  v,  u,  p * q),  e = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[1],  d,  u,  p * S),  G = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[2],  f,  u,  p * g),  C = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[0],  v,  t,  s * q),  P = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[1],  d,  t,  s * S),  W = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[2],  f,  t,  s * g),  D = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[0],  v,  a,  E * q),  o = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[1],  d,  a,  E * S),  r = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[2],  f,  a,  E * g);
\r\n    vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.pq = T;
\r\n    vUVPack_NormalsFlow0Map1_NormalsFlow0Map2 = vec4(e,  G);
\r\n    vUVPack_NormalsFlow1Map0_NormalsFlow1Map1 = vec4(C,  P);
\r\n    vUVPack_NormalsFlow1Map2_NormalsFlow2Map0 = vec4(W,  D);
\r\n    vUVPack_NormalsFlow2Map1_NormalsFlow2Map2 = vec4(o,  r);
\r\n
}
\r\nvoid ComputeNormalMapMacroTexCoords(vec2 v,  vec2 d,  vec2 f)\r\n {
  \r\n    const float q = .25;
\r\n    const vec2 t = vec2(.1,  -.13) * q;
\r\n    const float u = .1;
\r\n    vUVPack_NormalMapMacroUV_EmissiveUV[0].st = TransformNormalMapTexCoordAxisAligned(uWaterNormalMapMacroTexCoordParams[0],  v * u,  t,  vec2(0.));
\r\n    vUVPack_NormalMapMacroUV_EmissiveUV[1].st = TransformNormalMapTexCoordAxisAligned(uWaterNormalMapMacroTexCoordParams[1],  d * u,  t,  vec2(0.));
\r\n    vUVPack_NormalMapMacroUV_EmissiveUV[2].st = TransformNormalMapTexCoordAxisAligned(uWaterNormalMapMacroTexCoordParams[2],  f * u,  t,  vec2(0.));
\r\n
}
\r\n#else\r\nvoid ComputeNormalMapDetailTexCoords(vec2 v,  vec2 d,  vec2 f,  vec2 t,  vec2 u,  vec2 E,  vec2 a)\r\n {
  \r\n    vec2 q = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[0],  v,  d,  u),  e = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[0],  v,  f,  E),  S = TransformNormalMapTexCoordFlowAligned(uWaterNormalMapTexCoordParams[0],  v,  t,  a);
\r\n    vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.pq = q;
\r\n    vUVPack_NormalsFlow1Map0_NormalsFlow2Map0 = vec4(e,  S);
\r\n
}
\r\n#endif\r\n#endif\r\n#if defined(WATER_EMISSIVE) && !defined(GLES2_COMPAT_MODE)\r\n#define EMISSIVE_UV_MODE_AXIS_ALIGNED (0)\r\n#define EMISSIVE_UV_MODE_FLOW_ALIGNED (1)\r\nvoid GetEmissiveFlow(out vec2 v,  out vec2 d,  out vec2 t,  vec2 u,  vec2 f,  vec2 q,  float E)\r\n {
  \r\n    float a = cos(E),  S = sin(E);
\r\n    mat2 T = mat2(vec2(a,  -S),  vec2(S,  a));
\r\n    vec2 G = T * u,  e = T * f,  p = T * q;
\r\n    const float g = 1e-06;
\r\n    vec3 C = vec3(G,  dot(G,  G)),  s = vec3(e,  dot(e,  e)),  r = vec3(p,  dot(p,  p));
\r\n    if (C.p < g)\r\n        C = s.p > r.p ? s : r;
\r\n    if (s.p < g)\r\n        s = r.p > C.p ? r : C;
\r\n    if (r.p < g)\r\n        r = C.p > s.p ? C : s;
\r\n    v = C.st;
\r\n    d = s.st;
\r\n    t = r.st;
\r\n
}
\r\nvoid ComputeEmissiveTexCoords(vec4 v,  vec2 d,  vec2 f,  vec2 E)\r\n {
  \r\n    float t = uEmissiveFlowSpeed_EmissiveFlowRotation_EmissiveUVScale.s,  q = uEmissiveFlowSpeed_EmissiveFlowRotation_EmissiveUVScale.t,  u = uEmissiveMapScale_EmissiveUVMode.s;
\r\n    vec2 a = uEmissiveFlowSpeed_EmissiveFlowRotation_EmissiveUVScale.pq,  p = vec2(0.,  0.),  s = vec2(0.,  0.),  e = vec2(0.,  0.);
\r\n    GetEmissiveFlow(p,  s,  e,  d,  f,  E,  q);
\r\n    const float T = .5;
\r\n    highp float S = uWaterTickFade.s * T;
\r\n    vec2 G = v.sp * u;
\r\n    if (int(uEmissiveMapScale_EmissiveUVMode.t) == EMISSIVE_UV_MODE_FLOW_ALIGNED)\r\n        vUVPack_NormalMapMacroUV_EmissiveUV[0].pq = GetFlowOrientedUV(G,  p,  t,  S) * a,  vUVPack_NormalMapMacroUV_EmissiveUV[1].pq = GetFlowOrientedUV(G,  s,  t,  S) * a,  vUVPack_NormalMapMacroUV_EmissiveUV[2].pq = GetFlowOrientedUV(G,  e,  t,  S) * a;
\r\n    else\r\n     {
  \r\n        vec2 g = sign(a);
\r\n        vUVPack_NormalMapMacroUV_EmissiveUV[0].pq = G * a + p * g * t * S;
\r\n        vUVPack_NormalMapMacroUV_EmissiveUV[1].pq = G * a + s * g * t * S;
\r\n        vUVPack_NormalMapMacroUV_EmissiveUV[2].pq = G * a + e * g * t * S;
\r\n    
}
\r\n
}
\r\n#endif\r\nvoid main()\r\n {
  \r\n    vec3 u = aWaterPosition_Depth.stp;
\r\n    vec4 v = uModelMatrix * vec4(u,  1.);
\r\n    vPosition_WaterDepth.stp = v.stp;
\r\n    vPosition_WaterDepth.q = aWaterPosition_Depth.q;
\r\n#if defined(CLIP_PLANE_CLAMP) && defined(CLIP_PLANE)\r\n    v.t = -uClipPlane.q;
\r\n#endif\r\n    gl_Position = uViewProjMatrix * v;
\r\n#if defined(CLIP_PLANE_CLAMP) && defined(CLIP_PLANE)\r\n    return;
\r\n#endif\r\n\r\n#if defined(CAUSTICS_COMPUTE) || defined(CAUSTICS_STENCIL)\r\n    const float E = 256.;
\r\n    if (abs(vPosition_WaterDepth.t - uCausticsPlaneHeight) > E)\r\n     {
  \r\n        gl_Position.q = -1.;
\r\n        return;
\r\n    
}
\r\n#endif\r\n    vColour = aVertexColour;
\r\n#if defined(LIGHT_SCATTERING) || defined(FOG_DISTANCE) || defined(SUNLIGHT_SHADOWS) || defined(VOLUMETRIC_SCATTERING_SUPPORTED)\r\n    vec3 t = v.stp - uCameraPosition;
\r\n    float d = length(t);
\r\n#endif\r\n\r\n#if defined(SUNLIGHT_SHADOWS)\r\n    vec3 f = vec3(uViewMatrix[0][2],  uViewMatrix[1][2],  uViewMatrix[2][2]);
\r\n    vFlowControlMask_ViewSpaceDepth.q = abs(dot(t.stp,  f));
\r\n#endif\r\n\r\n#if defined(LIGHT_SCATTERING) || defined(FOG_DISTANCE)\r\n    t /= d;
\r\n#if defined(LIGHT_SCATTERING) && defined(SUNLIGHT_DIRECT_LIGHTING)\r\n    ComputeInOutScattering(t,  d,  uInvSunDirection,  vOutScattering,  vInScattering);
\r\n#else\r\n    vOutScattering = vec3(1.);
\r\n    vInScattering = vec3(0.);
\r\n#endif\r\n\r\n#if defined(FOG_DISTANCE)\r\n    float q = FogBasedOnDistance(d);
\r\n    q = q + q * uWaterTickFade.t - uWaterTickFade.t;
\r\n    vInScattering = mix(vInScattering,  uFogColour.stp,  q);
\r\n    vOutScattering *= 1. - q;
\r\n    vColour.q = q;
\r\n#else\r\n    vColour.q = 0.;
\r\n#endif\r\n\r\n#endif\r\n\r\n#if defined(VOLUMETRIC_SCATTERING_SUPPORTED)\r\n    vec4 a = GetScatteredInRay2(8,  t,  d,  100.);
\r\n    vec3 T = vec3(1.),  S = vec3(0.);
\r\n    GetInAndOutScattering(a,  T,  S);
\r\n    vInScattering += S;
\r\n    vOutScattering *= T;
\r\n#endif\r\n    float g = uWaterNormalMapTextureScales_FlowNoiseScale.q;
\r\n    vec2 p = aWaterFlowDataFlowNoise0_FlowNoise1.st / 127. * g,  e = aWaterFlowDataFlowNoise0_FlowNoise1.pq / 127. * g,  s = aWaterFlowDataFlowNoise2_FlowIndex_Spare.st / 127. * g,  G = -aWaterFlowDataPatchFlow0 * (1. / 4095.),  r = -aWaterFlowDataPatchFlow1 * (1. / 4095.),  C = -aWaterFlowDataPatchFlow2 * (1. / 4095.);
\r\n    int W = int(aWaterFlowDataFlowNoise2_FlowIndex_Spare.p);
\r\n    vFlowControlMask_ViewSpaceDepth.stp = vec3(W == 0 ? 1. : 0.,  W == 1 ? 1. : 0.,  W == 2 ? 1. : 0.);
\r\n    vNoisyPatchFlow0_NoisyPatchFlow1.st = G + p;
\r\n    vNoisyPatchFlow0_NoisyPatchFlow1.pq = r + e;
\r\n    vNoisyPatchFlow2_UVPack_NormalsFlow0Map0.st = C + s;
\r\n#if defined(WATER_NORMAL_MAPS) || defined(WATER_FOAM_MAP)\r\n\r\n#if !defined(GLES2_COMPAT_MODE)\r\n    vUVPack_FoamUV = v.sp * uWaterNormalMapTextureScales_FlowNoiseScale.s;
\r\n#endif\r\n    vec2 o = v.sp * uWaterNormalMapTextureScales_FlowNoiseScale.s,  P = v.sp * uWaterNormalMapTextureScales_FlowNoiseScale.t,  D = v.sp * uWaterNormalMapTextureScales_FlowNoiseScale.p;
\r\n#if defined(WATER_NORMAL_MAPS)\r\n\r\n#if !defined(GLES2_COMPAT_MODE)\r\n    ComputeNormalMapDetailTexCoords(o,  P,  D,  G,  r,  C,  p,  e,  s);
\r\n    ComputeNormalMapMacroTexCoords(o,  P,  D);
\r\n#else\r\n    ComputeNormalMapDetailTexCoords(o,  G,  r,  C,  p,  e,  s);
\r\n#endif\r\n\r\n#endif\r\n\r\n#endif\r\n\r\n#if defined(WATER_EMISSIVE) && !defined(GLES2_COMPAT_MODE)\r\n    ComputeEmissiveTexCoords(v,  G,  r,  C);
\r\n#endif\r\n
}
\r\n"
}
, 1901:e=> {
  "use strict";
e.exports='["struct", \r\n\t["header_always_2", "ubyte"], \r\n\t["probably_framemap_id", "ushort"], \r\n\t["flags", ["array", "ushort", "ubyte"]], \r\n\t["animdata", ["buffer", ["bytesleft"], "ubyte"]]\r\n]'
}
, 1910:e=> {
  "use strict"
;
e.exports='["struct", \r\n\t// ["byte0", ["match", "buildnr",  {
  ">458":"ubyte", "other":0
}
]], \r\n\t["byte0", "ubyte"], \r\n\t// ["switchsize", ["match", "buildnr",  {
  ">=495":["footer", 2, "ushort"], "other":0
}
]], \r\n\t["switchsize", ["footer", 2, "ushort"]], \r\n\t["switches", ["footer", ["ref", "switchsize"], \r\n\t\t// ["array", ["match", "buildnr",  {
  ">=495":"ubyte", "other":0
}
], ["array", "ushort", ["struct", \r\n\t\t["array", "ubyte", ["array", "ushort", ["struct", \r\n\t\t\t["value", "int"], \r\n\t\t\t["jump", "uint"]\r\n\t\t]]]\r\n\t]], \r\n\t// ["longargcount", ["match", "buildnr",  {
  ">641":["footer", 2, "ushort"], "other":0
}
]], \r\n\t["longargcount", ["footer", 2, "ushort"]], \r\n\t["stringargcount", ["footer", 2, "ushort"]], \r\n\t["intargcount", ["footer", 2, "ushort"]], \r\n\t// ["locallongcount", ["match", "buildnr",  {
  ">641":["footer", 2, "ushort"], "other":0
}
]], \r\n\t["locallongcount", ["footer", 2, "ushort"]], \r\n\t["localstringcount", ["footer", 2, "ushort"]], \r\n\t["localintcount", ["footer", 2, "ushort"]], \r\n\t["instructioncount", ["footer", 4, "uint"]], \r\n\t["opcodedata", ["array", ["ref", "instructioncount"], ["scriptopt"]]]\r\n]'
