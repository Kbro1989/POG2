#ifndef POG2_CONVERSION_UTILS_GLSL
#define POG2_CONVERSION_UTILS_GLSL

vec3 SRGBToLinear(vec3 srgb) {
#ifdef GAMMA_CORRECT_INPUTS
    return srgb * srgb;
#else
    return pow(srgb, vec3(2.2));
#endif
}

vec3 LinearToSRGB(vec3 linear) {
    return max(vec3(1.055) * pow(linear, vec3(0.416667)) - vec3(0.055), vec3(0.0));
}

float LinearToSRGB(float linear) {
    return pow(linear, 1.0 / 2.2);
}

vec3 LinearToSRGBRunescape(vec3 linear) {
    return sqrt(linear);
}

float LinearToSRGBRunescape(float linear) {
    return sqrt(linear);
}

vec4 RGBtoHSL(vec4 col) {
    float r = col.r, g = col.g, b = col.b;
    float minVal = min(min(r, g), b);
    float maxVal = max(max(r, g), b);
    float delta = maxVal - minVal;
    float l = (minVal + maxVal) * 0.5;
    float s = 0.0, h = 0.0;
    
    if (l > 0.0 && l < 1.0) {
        float denom = l < 0.5 ? l : 1.0 - l;
        s = delta / (denom * 2.0);
    }
    
    if (delta > 0.0) {
        vec3 mask = vec3(maxVal == r && maxVal != g ? 1.0 : 0.0, maxVal == g && maxVal != b ? 1.0 : 0.0, maxVal == b && maxVal != r ? 1.0 : 0.0);
        vec3 offset = vec3((g - b) / delta, 2.0 + (b - r) / delta, 4.0 + (r - g) / delta);
        h += dot(offset, mask);
        h *= (1.0 / 6.0);
        if (h < 0.0) h += 1.0;
    }
    return vec4(h, s, l, col.a);
}

vec4 HSLtoRGB(vec4 hsl) {
    float h = hsl.x, s = hsl.y, l = hsl.z;
    vec3 res = vec3(6.0 * (h - (2.0/3.0)), 0.0, 6.0 * (1.0 - h));
    if (h < (2.0/3.0)) res = vec3(0.0, 6.0 * ((2.0/3.0) - h), 6.0 * (h - (1.0/3.0)));
    if (h < (1.0/3.0)) res = vec3(6.0 * ((1.0/3.0) - h), 6.0 * h, 0.0);
    res = min(res, 1.0);
    float lum2 = 2.0 * s, invLum = 1.0 - s, invRad = 1.0 - l, rad2 = 2.0 * l - 1.0;
    vec3 c = lum2 * res + invLum;
    vec3 final = l >= 0.5 ? (invRad * c + rad2) : (l * c);
    return vec4(final, hsl.w);
}

#endif // POG2_CONVERSION_UTILS_GLSL
