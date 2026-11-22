/** Original procedural materials: no image textures or external models. */
export const orbVertexShader = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

export const orbFragmentShader = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScene;
const float TAU = 6.28318530718;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3; a *= 0.5;
  }
  return v;
}
mat2 rotate(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float tide(float t) {
  float phase = mod(t, 10.0);
  if (phase < 2.0) return 0.0;
  if (phase < 5.0) return smoothstep(2.0, 5.0, phase);
  if (phase < 7.0) return 1.0;
  return 1.0 - smoothstep(7.0, 10.0, phase);
}
float waterline(vec2 uv, float t) {
  return mix(0.22, 1.19, tide(t)) - uv.x * 0.1
    + 0.028 * sin(uv.x * 8.0 + t * 0.7)
    + 0.012 * sin(uv.x * 23.0 - t * 1.1)
    + (noise(vec2(uv.x * 38.0, t * 0.35)) - 0.5) * 0.021;
}
float crater(vec2 p, vec2 center, float radius) {
  float d = length(p - center) / radius;
  return -0.15 * exp(-d * d * 3.0) + 0.05 * exp(-pow((d - 0.9) * 5.0, 2.0));
}
vec3 moonScene(vec2 uv) {
  vec3 sky = mix(vec3(0.015, 0.055, 0.09), vec3(0.08, 0.19, 0.23), uv.y);
  vec3 color = sky;

  vec2 p = (uv - vec2(0.5, 0.62)) / 0.30;
  float r2 = dot(p, p);
  color += vec3(0.11, 0.2, 0.21) * exp(-r2 * 0.9) * 0.3;
  if (r2 < 1.0) {
    vec3 normal = vec3(p, sqrt(1.0 - r2));
    float light = max(dot(normal, normalize(vec3(-0.6, 0.7, 1.15))), 0.0);
    float relief = fbm(p * 7.0) * 0.15;
    relief += crater(p, vec2(-0.34, 0.3), 0.24);
    relief += crater(p, vec2(0.27, -0.27), 0.31);
    relief += crater(p, vec2(-0.46, -0.38), 0.16);
    relief += crater(p, vec2(0.42, 0.44), 0.14);
    vec3 moon = mix(vec3(0.10, 0.21, 0.28), vec3(0.91, 0.97, 0.91), light);
    moon *= 0.86 + relief;
    float edge = 1.0 - smoothstep(1.0 - 5.0 / uResolution.x, 1.0, r2);
    color = mix(color, moon, edge);
  }
  return color;
}
vec3 sea(vec2 uv, float t) {
  float depth = waterline(uv, t) - uv.y;
  vec3 color = moonScene(uv);
  // Oblique, intersecting ripples perturb the surface normal and refract moonlight.
  vec2 q = vec2((uv.x - 0.5) * (1.35 - uv.y * 0.4), uv.y);
  float a = dot(q, vec2(31.0, 24.0)) - t * 1.5;
  float b = dot(q, vec2(-19.0, 39.0)) - t * 0.85;
  vec2 slope = vec2(0.14, 0.11) * cos(a) + vec2(-0.09, 0.18) * cos(b);
  vec3 normal = normalize(vec3(-slope, 1.0));
  vec2 refracted = uv + slope * 0.028 * smoothstep(0.0, 0.08, depth);
  vec3 submerged = moonScene(refracted);
  float absorption = 1.0 - exp(-max(depth, 0.0) * 5.2);
  vec3 water = mix(submerged * vec3(0.7, 0.99, 1.04), vec3(0.012, 0.16, 0.22), absorption);
  water *= 0.87 + 0.13 * sin(a + b * 0.3);
  vec3 halfVector = normalize(vec3(-0.5, 0.7, 1.8));
  float specular = pow(max(dot(normal, halfVector), 0.0), 48.0);
  float reflection = exp(-pow((uv.x - 0.5 + slope.x * 0.18) * 4.5, 2.0));
  water += vec3(0.38, 0.62, 0.6) * specular * reflection * 0.7;
  float lace = noise(q * vec2(105.0, 64.0) + vec2(t * 0.22, -t * 0.6));
  float foam = exp(-pow(depth / (0.012 + lace * 0.012), 2.0));
  foam *= 0.42 + 0.58 * smoothstep(0.2, 0.8, lace);
  float remnants = exp(-pow((depth - 0.047 - sin(q.x * 30.0 - t) * 0.008) / 0.011, 2.0));
  foam += remnants * smoothstep(0.55, 0.85, lace) * 0.3;
  water = mix(water, vec3(0.7, 0.9, 0.84), foam * 0.8);
  float edge = smoothstep(-0.006, 0.008, depth);
  return mix(color, water, edge);
}

vec3 diskLight(vec3 p, float t, vec3 eye) {
  float radius = length(p.xz);
  float angle = atan(p.z, p.x);
  float flow = angle - t * 0.18 / pow(radius, 1.5);
  float eddy = fbm(vec2(radius * 6.0, sin(flow) * 2.4 + cos(flow * 2.0)));
  float bands = 0.48 + 0.52 * sin(radius * 47.0 + eddy * 8.0 - t * 0.12);
  float spiral = 0.65 + 0.35 * sin(flow * 4.0 + radius * 11.0 + eddy * 3.0);
  float edge = smoothstep(1.02, 1.22, radius) * (1.0 - smoothstep(1.95, 2.25, radius));
  float heat = pow(1.1 / radius, 1.7);
  vec3 tangent = normalize(vec3(-p.z, 0.0, p.x));
  float doppler = 0.62 + 0.55 * max(dot(tangent, normalize(eye - p)), 0.0);
  vec3 hot = mix(vec3(0.85, 0.22, 0.055), vec3(1.0, 0.81, 0.47), clamp(heat, 0.0, 1.0));
  return hot * edge * (0.8 + bands * 0.9) * spiral * doppler * heat * 2.15;
}
vec3 blackHole(vec2 uv, float t) {
  vec2 screen = (uv - 0.5) * 2.0;
  // A ninety-second roll and an inclined orbit change real 3D viewing geometry.
  screen = rotate(-0.3 + t * TAU / 90.0) * screen;
  float orbit = t * TAU / 110.0;
  vec3 eye = vec3(sin(orbit) * 4.6, 1.45 + 0.3 * sin(t * TAU / 80.0), cos(orbit) * 4.6);
  vec3 forward = normalize(-eye);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 ray = normalize(forward + screen.x * right * 0.62 + screen.y * up * 0.62);
  vec3 point = eye;
  vec3 color = vec3(0.0);
  float transmission = 1.0;
  float closest = 8.0;
  bool captured = false;
  // Trace bent rays through a three-dimensional emitting annulus and dark sphere.
  for (int i = 0; i < 96; i++) {
    float radius = length(point);
    closest = min(closest, radius);
    if (radius < 0.68) { captured = true; break; }
    float stepSize = clamp(radius * 0.08, 0.02, 0.28);
    vec3 previous = point;
    ray = normalize(ray - point * (0.52 * stepSize / (radius * radius * radius)));
    point += ray * stepSize;
    if (previous.y * point.y < 0.0) {
      float f = previous.y / (previous.y - point.y);
      vec3 hit = mix(previous, point, f);
      float diskRadius = length(hit.xz);
      if (diskRadius > 0.92 && diskRadius < 2.12) {
        color += diskLight(hit, t, eye) * transmission;
        transmission *= 0.16;
      }
    }
    if (radius > 7.5 && dot(point, ray) > 0.0) break;
  }
  vec3 background = mix(vec3(0.012, 0.016, 0.035), vec3(0.045, 0.035, 0.08), exp(-dot(screen, screen) * 1.2));
  float stars = pow(hash(floor((ray.xy / max(abs(ray.z), 0.2)) * 360.0)), 130.0);
  background += vec3(0.4, 0.47, 0.65) * stars * 0.25;
  if (!captured) color += background * transmission;
  float photon = exp(-pow((closest - 0.78) / 0.075, 2.0));
  color += vec3(1.0, 0.58, 0.2) * photon * 0.5 * transmission;
  float inner = exp(-pow((closest - 0.7) / 0.16, 2.0));
  color += vec3(1.0, 0.38, 0.1) * inner * 0.12 * transmission;
  return pow(vec3(1.0) - exp(-color * 1.15), vec3(0.88));
}

vec3 dawnScene(vec2 uv, float t) {
  // A low, large sun over a nearly still morning sea.
  vec3 high = vec3(0.96, 0.66, 0.51);
  vec3 low = vec3(1.0, 0.82, 0.62);
  vec3 color = mix(high, low, smoothstep(0.05, 0.75, uv.y));

  float horizon = 0.27;
  vec2 p = (uv - vec2(0.5, 0.45 + 0.004 * sin(t * 0.18))) / 0.29;
  float r2 = dot(p, p);
  float r = sqrt(r2);

  // Wide corona and slow rays: the sun should read before the glass edge.
  color += vec3(1.0, 0.50, 0.18) * exp(-r2 * 2.0) * 0.24;
  float ang = atan(p.y, p.x);
  float rays = pow(0.5 + 0.5 * cos(ang * 13.0 + t * 0.07), 9.0);
  color += vec3(1.0, 0.62, 0.26) * rays * smoothstep(0.82, 1.12, r)
    * (1.0 - smoothstep(1.28, 2.45, r)) * 0.15;

  if (r2 < 1.0) {
    vec3 n = vec3(p, sqrt(1.0 - r2));
    float light = max(dot(n, normalize(vec3(-0.45, 0.60, 0.80))), 0.0);
    float gran = fbm(p * 7.0 + vec2(t * 0.035, -t * 0.025));
    vec3 sun = mix(vec3(0.90, 0.30, 0.055), vec3(1.0, 0.94, 0.63), pow(light, 1.2));
    sun *= 0.84 + 0.24 * gran;
    sun *= 0.72 + 0.38 * sqrt(max(1.0 - r2, 0.0));
    float spot = smoothstep(0.66, 0.9, fbm(p * 12.0 + vec2(0.4, -t * 0.02)));
    sun -= vec3(0.34, 0.12, 0.015) * spot * 0.3;
    color = mix(color, sun, smoothstep(1.0, 0.94, r2));
  }

  // Calm water below the horizon; only slow, shallow ripples.
  float water = 1.0 - smoothstep(horizon - 0.01, horizon + 0.01, uv.y);
  vec3 sea = mix(vec3(0.018, 0.085, 0.13), vec3(0.12, 0.29, 0.31),
    smoothstep(0.0, horizon, uv.y));
  float ripple = sin(uv.x * 33.0 + sin(uv.y * 17.0 - t * 0.38) * 2.0 + t * 0.3) * 0.5 + 0.5;
  sea += vec3(0.22, 0.34, 0.31) * ripple * 0.05;
  float refl = exp(-pow((uv.x - 0.5) * 9.0, 2.0)) * (1.0 - smoothstep(0.0, horizon, uv.y));
  float glint = pow(0.5 + 0.5 * sin(uv.y * 108.0 - t * 1.15 + sin(uv.x * 19.0) * 2.0), 6.0);
  sea += vec3(1.0, 0.65, 0.30) * refl * (0.22 + 0.28 * glint);
  color = mix(color, sea, water);

  // Thin horizon light and morning mist.
  color += vec3(1.0, 0.67, 0.34) * exp(-pow((uv.y - horizon) * 27.0, 2.0)) * 0.22;
  color += vec3(1.0, 0.86, 0.68) * smoothstep(horizon + 0.04, horizon + 0.18, uv.y)
    * (1.0 - water) * 0.025;
  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 color = uScene < 0.5 ? sea(uv, uTime)
    : uScene < 1.5 ? blackHole(uv, uTime)
    : dawnScene(uv, uTime);
  vec2 p = uv * 2.0 - 1.0;
  float glass = 1.0 - smoothstep(0.5, 1.15, length(p));
  color *= mix(0.56, 1.0, glass);
  gl_FragColor = vec4(color, 1.0);
}
`;
