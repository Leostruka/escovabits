import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { BACKDROP_FRAG, BACKDROP_VERT } from "./shaders";

function Quad() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));
  const target = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMotion: { value: 1 },
    }),
    []
  );

  useMemo(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      uniforms.uMotion.value = 0;
    }
  }, [uniforms]);

  useFrame(({ clock, pointer }) => {
    if (!mat.current) return;
    target.current.set(pointer.x, pointer.y);
    mouse.current.lerp(target.current, 0.06);
    mat.current.uniforms.uTime.value = clock.elapsedTime;
    mat.current.uniforms.uMouse.value.copy(mouse.current);
    mat.current.uniforms.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={BACKDROP_VERT}
        fragmentShader={BACKDROP_FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: "low-power", alpha: false }}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      >
        <Quad />
      </Canvas>
    </div>
  );
}
