import { Controller } from "@hotwired/stimulus"

// Subtle, slow-drifting WebGL gradient background.
// Vanilla WebGL — no deps. Pauses under prefers-reduced-motion and when offscreen.
export default class extends Controller {
  connect() {
    const canvas = this.element
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true })
    if (!gl) return

    this.gl = gl
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    this.resize()
    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(canvas)

    this.compile(gl)
    this.startTime = performance.now()

    if (this.prefersReducedMotion) {
      this.render(0)
    } else {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }

  disconnect() {
    cancelAnimationFrame(this.rafId)
    this.observer?.disconnect()
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    this.gl.canvas.width = w * dpr
    this.gl.canvas.height = h * dpr
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
  }

  compile(gl) {
    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `
    // Slow-drifting low-saturation cool gradient. Opacity baked low via alpha.
    const frag = `
      precision mediump float;
      uniform vec2 u_res;
      uniform float u_time;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.03;
        float n = noise(uv * 2.5 + vec2(t, t * 0.6)) * 0.5
                + noise(uv * 5.0 - vec2(t * 0.4, t)) * 0.25;
        vec3 c1 = vec3(0.05, 0.12, 0.16); // deep teal
        vec3 c2 = vec3(0.10, 0.08, 0.20); // muted indigo
        vec3 col = mix(c1, c2, n);
        gl_FragColor = vec4(col, 0.12);
      }
    `
    const prog = gl.createProgram()
    const vs = this.shader(gl, vert, gl.VERTEX_SHADER)
    const fs = this.shader(gl, frag, gl.FRAGMENT_SHADER)
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    this.prog = prog

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1, 1, -1, -1, 1, 1, 1 ]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "a_pos")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    this.uRes = gl.getUniformLocation(prog, "u_res")
    this.uTime = gl.getUniformLocation(prog, "u_time")
  }

  shader(gl, src, type) {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }

  tick = () => {
    this.render((performance.now() - this.startTime) / 1000)
    this.rafId = requestAnimationFrame(this.tick)
  }

  render(time) {
    const gl = this.gl
    gl.useProgram(this.prog)
    gl.uniform2f(this.uRes, gl.canvas.width, gl.canvas.height)
    gl.uniform1f(this.uTime, time)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
