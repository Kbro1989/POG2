#ifndef POG2_BRDF_UTILS_GLSL
#define POG2_BRDF_UTILS_GLSL

#include "math_utils.glsl"

float BlinnPhongNDF(float specPow, float cosTheta) {
    return (specPow + 2.0) * INV_EIGHT * pow(cosTheta, specPow);
}

float GGXTrowbridgeReitzNDF(float cosTheta, float roughness) {
    float alpha2 = roughness * roughness;
    float cos2 = cosTheta * cosTheta;
    float denom = cos2 * (alpha2 - 1.0) + 1.0;
    return alpha2 / (PI * (denom * denom + 0.0001));
}

float BeckmannNDF(float cosTheta, float roughness) {
    float alpha2 = roughness * roughness;
    float cos2 = cosTheta * cosTheta;
    return exp((cos2 - 1.0) / (alpha2 * cos2)) / (PI * alpha2 * cos2 * cos2);
}

float SchlickSmithVis(float cosTheta, float roughness, float cosThetaV) {
    float k = 1.0 / sqrt(PI_OVER_4 * cosTheta + PI_OVER_2);
    float omk = 1.0 - k;
    float vis = (roughness * omk + k) * (cosThetaV * omk + k);
    return 1.0 / (vis + 0.0001);
}

vec3 CookTorranceBRDF(float specPow, float roughness, vec3 normal, vec3 view, vec3 halfVec, vec3 light, vec3 albedo, float fresnel) {
    float cosTheta = max(0.0, dot(view, halfVec));
    float ndf = GGXTrowbridgeReitzNDF(PerceptualRoughnessToRoughness(roughness), cosTheta);
    float vis = SchlickSmithVis(specPow, fresnel, max(0.0, dot(view, light)));
    return normal * (ndf * vis);
}

#endif // POG2_BRDF_UTILS_GLSL
