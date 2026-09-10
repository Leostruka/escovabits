import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 900;

// Atlas 2 células: "0" à esquerda, "1" à direita. Desenhado num canvas
// offscreen — sem asset externo.
function makeGlyphAtlas(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#5eead4";
  ctx.font = "700 96px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("0", 64, 68);
  ctx.fillText("1", 192, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const VERT = /* glsl */ `
attribute float aRand;
uniform float uTime;
uniform float uSize;
uniform float uMotion;
varying float vGlyph;
varying float vFade;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 / -mv.z);

  // cada bit troca de valor num instante proprio
  float tick = floor(uTime * (0.6 + aRand * 1.4) * uMotion + aRand * 97.0);
  vGlyph = step(0.5, fract(sin(tick * 91.7 + aRand * 771.3) * 43758.5453));

  // profundidade -> esmaecimento dos bits do fundo
  vFade = 1.0 - smoothstep(4.0, 7.0, -mv.z);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uAtlas;
uniform vec2 uCanvas;
varying float vGlyph;
varying float vFade;

void main() {
  vec2 uv = vec2(gl_PointCoord.x * 0.5 + vGlyph * 0.5, gl_PointCoord.y);
  vec4 tex = texture2D(uAtlas, uv);
  if (tex.a < 0.08) discard;

  // vinheta nas bordas do canvas - nenhum bit e cortado seco
  vec2 d = min(gl_FragCoord.xy, uCanvas - gl_FragCoord.xy);
  float edge = smoothstep(0.0, 42.0, min(d.x, d.y));

  gl_FragColor = vec4(tex.rgb, tex.a * vFade * edge);
}
`;

function Bits() {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const spin = useRef({ x: 0, y: 0 });

  const { geometry, uniforms } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const rand = new Float32Array(COUNT);

    // distribuição de Fibonacci numa casca esférica com jitter
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const jitter = 1.2 + (Math.random() - 0.5) * 0.3;
      pos[i * 3] = Math.cos(theta) * r * jitter;
      pos[i * 3 + 1] = y * jitter;
      pos[i * 3 + 2] = Math.sin(theta) * r * jitter;
      rand[i] = Math.random();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const u = {
      uTime: { value: 0 },
      uSize: { value: 46.0 },
      uMotion: { value: reduced ? 0 : 1 },
      uAtlas: { value: makeGlyphAtlas() },
      uCanvas: { value: new THREE.Vector2(1, 1) },
    };
    return { geometry: g, uniforms: u };
  }, []);

  useFrame(({ clock, pointer, size, viewport }) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = clock.elapsedTime;
      mat.current.uniforms.uCanvas.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
    }
    if (points.current) {
      spin.current.x += (pointer.y * 0.4 - spin.current.x) * 0.05;
      spin.current.y += (pointer.x * 0.6 - spin.current.y) * 0.05;
      points.current.rotation.x = clock.elapsedTime * 0.08 + spin.current.x;
      points.current.rotation.y = clock.elapsedTime * 0.14 + spin.current.y;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BitSphere() {
  return (
    <Canvas
      className="orb-canvas"
      style={{ overflow: "visible" }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <Bits />
    </Canvas>
  );
}
