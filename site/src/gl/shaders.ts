// GLSL compartilhado. Ruido simplex 3D (Ashima), usado tanto no
// fundo quanto no restante da cena.

export const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

// Fundo: fbm com domain warping duplo. Paleta escura: carvao, verde
// profundo, teal e indigo. O mouse desloca o dominio.
export const BACKDROP_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const BACKDROP_FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2  uRes;
uniform vec2  uMouse;   // -1..1, suavizado
uniform float uMotion;  // 0 quando prefers-reduced-motion

varying vec2 vUv;

${SIMPLEX_3D}

// Glifos 3x5 codificados: cada linha e um octal (bit 2 = pixel esquerdo).
// '0' = 111 101 101 101 111 -> 31599 ; '1' = 010 110 010 010 111 -> 29874
float bitGlyph(float n, vec2 l) {
  float row = 4.0 - floor(l.y * 5.0);        // y cresce para cima; linha 0 do codigo e o topo
  float col = floor(l.x * 3.0);
  float r = floor(mod(n / pow(8.0, row), 8.0));
  return floor(mod(r / pow(2.0, 2.0 - col), 2.0));
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p = p * 2.02 + vec3(11.3, 7.1, 5.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 1.6;

  float t = uTime * 0.03 * uMotion;
  vec2 m = uMouse * 0.15 * uMotion;

  // domain warp: p -> q -> r -> valor final
  vec2 q = vec2(
    fbm(vec3(p + m, t)),
    fbm(vec3(p + vec2(4.2, 1.3) - m, t * 1.1))
  );
  vec2 r = vec2(
    fbm(vec3(p + 2.4 * q + vec2(1.7, 9.2), t * 0.8)),
    fbm(vec3(p + 2.4 * q + vec2(8.3, 2.8) + m * 1.6, t * 0.9))
  );
  float f = fbm(vec3(p + 2.6 * r, t * 0.6));

  vec3 carbon  = vec3(0.039, 0.039, 0.047);  // #0a0a0c
  vec3 forest  = vec3(0.050, 0.120, 0.160);  // deep teal (igual ao app)
  vec3 chart   = vec3(0.176, 0.827, 0.749);  // teal-400
  vec3 ember   = vec3(0.100, 0.080, 0.200);  // indigo suave (igual ao app)

  float fN = f * 0.5 + 0.5;
  vec3 col = mix(carbon, forest, smoothstep(0.2, 0.8, fN) * 0.85);
  col = mix(col, chart * 0.30, smoothstep(0.68, 0.98, fN) * 0.35);
  col = mix(col, ember * 0.9, smoothstep(0.55, 1.0, length(q) * 0.45 + fN * 0.25) * 0.45);

  // vinheta
  float vig = 1.0 - smoothstep(0.35, 1.45, length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  col *= mix(0.55, 1.0, vig);

  // -- camada de bits --
  // grade esparsa de 0/1; cada coluna deriva para baixo numa
  // velocidade propria e o brilho de cada celula oscila.
  vec2 cellSize = vec2(34.0, 46.0);
  vec2 px = vUv * uRes;
  float colId = floor(px.x / cellSize.x);
  px.y += uTime * uMotion * (10.0 + 26.0 * fract(sin(colId * 12.9) * 437.5));
  vec2 cell = floor(px / cellSize);
  vec2 luv  = fract(px / cellSize);

  float h1 = hash21(cell);
  float h2 = hash21(cell + 71.0);
  float cellOn = step(0.74, h1);            // ~26% das celulas tem bit
  float n = mix(31599.0, 29874.0, step(0.5, h2));
  float g = cellOn * bitGlyph(n, luv);
  float tw = 0.5 + 0.5 * sin(uTime * (0.5 + h2 * 1.2) * uMotion + h1 * 40.0);

  col += chart * g * (0.045 + 0.075 * tw) * vig;

  // grao fino
  float grain = fract(sin(dot(uv * uRes, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.028;

  gl_FragColor = vec4(col, 1.0);
}
`;
