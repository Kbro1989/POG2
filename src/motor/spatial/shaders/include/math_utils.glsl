#ifndef POG2_MATH_UTILS_GLSL
#define POG2_MATH_UTILS_GLSL

const float PI = 3.14159265359;
const float INV_PI = 0.31830988618;
const float TWOPI = 6.28318530718;
const float INV_TWOPI = 0.15915494309;
const float PI_OVER_2 = 1.57079632679;
const float PI_OVER_4 = 0.78539816339;
const float SQRT_2_PI = 0.7978845608;
const float INV_EIGHT = 0.125;

float SpecPowToBeckmannRoughness(float f) {
    return sqrt(2.0 / (f + 2.0));
}

float PerceptualRoughnessToRoughness(float f) {
    return f * f;
}

float RoughnessToPerceptualRoughness(float f) {
    return sqrt(f);
}

#endif // POG2_MATH_UTILS_GLSL
