#ifndef POG2_PACK_UTILS_GLSL
#define POG2_PACK_UTILS_GLSL

// High-fidelity packing/unpacking for depth and normals
// Ported from RSMV WebViewer core logic

highp float UnpackRGBAToFloat(highp vec4 rgba) {
    const highp vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
    return dot(rgba, bitShifts);
}

vec4 PackFloatToRGBA(highp float val) {
    const highp vec4 bitShift = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
    const highp vec4 bitMask = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
    highp vec4 res = mod(val * bitShift * vec4(255.0), vec4(256.0)) / vec4(255.0);
    return res - res.xxyz * bitMask;
}

vec3 NormalUnpackSphereMap(vec2 uv) {
    vec4 f = vec4(uv.s / 32767.0 - 1.0, uv.t / 32767.0 - 1.0, 1.0, -1.0);
    float u = dot(f.xyz, -f.xyw);
    f.xy *= sqrt(u);
    f.z = u;
    return f.xyz * 2.0 + vec3(0.0, 0.0, -1.0);
}

#endif // POG2_PACK_UTILS_GLSL
