let gl: WebGLRenderingContext | null = null
let uniforms: {
  res: WebGLUniformLocation | null
  time: WebGLUniformLocation | null
  mouse: WebGLUniformLocation | null
  theme: WebGLUniformLocation | null
  ripple: WebGLUniformLocation | null
} | null = null
let raf: number | null = null
let onResize: (() => void) | null = null
let startTime = 0

const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
let rippleAt: [number, number] | null = null
let ripple = 0

function getTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("saved-theme") === "light" ? "light" : "dark"
}

const VERTEX_SRC = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`

const FRAGMENT_SRC = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_theme; uniform vec3 u_ripple;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v += a*noise(p); p*=2.02; a*=0.5; } return v; }
float stars(vec2 uv, float density, float size, float t){
  vec2 g = uv*density; vec2 i = floor(g); vec2 f = fract(g);
  float h = hash(i);
  if(h < 0.965) return 0.0;
  vec2 c = vec2(hash(i+1.3), hash(i+7.7));
  float d = length(f-c);
  float tw = 0.55 + 0.45*sin(t*1.7 + h*60.0);
  return smoothstep(size, 0.0, d) * tw;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5*u_res) / u_res.y;
  float t = u_time * 0.035;

  vec2 q = uv * 1.15;
  q += 0.16 * vec2(fbm(q*1.4 + t), fbm(q*1.4 - t + 4.7));
  float neb = fbm(q*1.9 + vec2(t*0.6, -t*0.4));
  neb = pow(smoothstep(0.28, 1.0, neb), 1.6);

  float depth = smoothstep(1.25, 0.0, length(uv - m*0.25));
  neb *= 0.55 + 0.75*depth;

  vec3 violet = vec3(0.710, 0.549, 0.941);
  vec3 cyan = vec3(0.337, 0.769, 0.847);
  vec3 maroon = vec3(0.40, 0.16, 0.11);
  vec3 teal = vec3(0.20, 0.34, 0.32);
  float xmix = smoothstep(-0.5, 0.9, uv.x + 0.35*fbm(q*2.4));
  vec3 colDark = mix(violet, cyan, xmix) * neb * 0.62;
  vec3 colLight = mix(maroon, teal, xmix) * neb * 0.4;
  vec3 col = mix(colDark, colLight, u_theme);

  float s = stars(uv + vec2(t*0.12, 0.0), 26.0, 0.055, u_time)
          + 0.6*stars(uv*1.7 + vec2(-t*0.07, t*0.03), 46.0, 0.04, u_time*0.8)
          + 0.35*stars(uv*2.6 + vec2(t*0.04, 0.0), 78.0, 0.03, u_time*1.4);
  col += vec3(0.86, 0.84, 0.95) * s * 0.85 * (1.0 - u_theme);
  col += vec3(0.32, 0.22, 0.15) * s * 0.35 * u_theme;

  float md = length(uv - m);
  vec3 haloDark = vec3(0.42, 0.30, 0.62) * smoothstep(0.42, 0.0, md) * 0.30 + vec3(0.25, 0.55, 0.62) * smoothstep(0.06, 0.0, md) * 0.5;
  vec3 haloLight = vec3(0.40, 0.20, 0.14) * smoothstep(0.42, 0.0, md) * 0.22 + vec3(0.22, 0.30, 0.28) * smoothstep(0.06, 0.0, md) * 0.32;
  col += mix(haloDark, haloLight, u_theme);

  if(u_ripple.z > 0.0){
    vec2 rp = (u_ripple.xy - 0.5*u_res) / u_res.y;
    float r = u_ripple.z;
    float ring = smoothstep(0.03, 0.0, abs(length(uv - rp) - r*0.75)) * (1.0 - r);
    vec3 rippleDark = vec3(0.55, 0.45, 0.80);
    vec3 rippleLight = vec3(0.42, 0.22, 0.16);
    col += mix(rippleDark, rippleLight, u_theme) * ring * 0.9;
  }

  vec3 dark = vec3(0.031, 0.024, 0.055) + col;
  vec3 paper = vec3(0.925, 0.890, 0.804) + col;
  vec3 outc = mix(dark, paper, u_theme);

  float vig = smoothstep(1.55, 0.35, length(uv));
  outc *= mix(0.72, 1.0, vig);
  gl_FragColor = vec4(outc, 1.0);
}`

function compile(context: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = context.createShader(type)!
  context.shaderSource(shader, src)
  context.compileShader(shader)
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    console.warn(context.getShaderInfoLog(shader))
  }
  return shader
}

function handlePointerMove(e: PointerEvent) {
  mouse.tx = e.clientX / Math.max(window.innerWidth, 1)
  mouse.ty = 1 - e.clientY / Math.max(window.innerHeight, 1)
}

function handlePointerDown(e: PointerEvent) {
  rippleAt = [
    e.clientX / Math.max(window.innerWidth, 1),
    1 - e.clientY / Math.max(window.innerHeight, 1),
  ]
  ripple = 0.001
}

function pointerEffectsEnabled(): boolean {
  return (
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

// The canvas is opaque (`alpha: false`) and covers the whole viewport at
// z-index -1. Mobile browsers drop WebGL contexts aggressively when a tab is
// backgrounded; with no handler the last-drawn frame stayed painted in the old
// theme forever, which is one of the ways stale patches survived a theme swap.
// Preventing the default keeps the context recoverable, and `restored` rebuilds
// the program from scratch.
function handleContextLost(e: Event) {
  e.preventDefault()
  if (raf !== null) {
    cancelAnimationFrame(raf)
    raf = null
  }
  gl = null
  uniforms = null
}

function handleContextRestored() {
  initNebulaBg()
}

function draw(now: number) {
  raf = requestAnimationFrame(draw)

  const canvas = document.getElementById("space-canvas") as HTMLCanvasElement | null
  if (!canvas || !canvas.isConnected || !gl || !uniforms || document.hidden) return

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const t = reduceMotion ? 0 : (now - startTime) / 1000

  mouse.x += (mouse.tx - mouse.x) * 0.06
  mouse.y += (mouse.ty - mouse.y) * 0.06

  gl.uniform1f(uniforms.time, t)
  gl.uniform2f(uniforms.mouse, mouse.x * canvas.width, mouse.y * canvas.height)

  if (ripple > 0) {
    ripple = Math.min(ripple + 0.012, 1.0)
    if (ripple >= 1) ripple = 0
    const r = rippleAt ?? [0.5, 0.5]
    gl.uniform3f(uniforms.ripple, r[0] * canvas.width, r[1] * canvas.height, ripple)
  } else {
    gl.uniform3f(uniforms.ripple, 0, 0, 0)
  }

  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function syncTheme() {
  if (gl && uniforms) {
    gl.uniform1f(uniforms.theme, getTheme() === "light" ? 1 : 0)
  }
}

function initNebulaBg() {
  const canvas = document.getElementById("space-canvas") as HTMLCanvasElement | null
  if (!canvas) return

  // Re-bind window listeners idempotently (safe across repeated SPA navigations)
  window.removeEventListener("pointermove", handlePointerMove)
  window.removeEventListener("pointerdown", handlePointerDown)
  // The pointer-follow and tap-ripple are hover-device affordances. Bound to
  // `window`, the ripple fired on *every* tap anywhere on the page, so the whole
  // background pulsed each time a touch user tapped a link — the "tap bounce".
  // Neither effect is meaningful without a hovering cursor, so bind them only
  // where one exists, and never under reduced motion.
  if (pointerEffectsEnabled()) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerdown", handlePointerDown)
  }

  canvas.removeEventListener("webglcontextlost", handleContextLost)
  canvas.removeEventListener("webglcontextrestored", handleContextRestored)
  canvas.addEventListener("webglcontextlost", handleContextLost)
  canvas.addEventListener("webglcontextrestored", handleContextRestored)

  // SPA navigation: the canvas element (and its WebGL context) survives the
  // body morph since it's identical markup on every page. Do NOT recreate the
  // context or touch canvas.width/height here - just resync theme and make
  // sure the render loop is alive.
  if (gl && uniforms) {
    syncTheme()
    if (onResize) onResize()
    if (raf === null) raf = requestAnimationFrame(draw)
    return
  }

  const context = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    powerPreference: "low-power",
  })
  if (!context) return
  gl = context

  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SRC))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC))
  gl.linkProgram(program)
  gl.useProgram(program)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, "p")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  uniforms = {
    res: gl.getUniformLocation(program, "u_res"),
    time: gl.getUniformLocation(program, "u_time"),
    mouse: gl.getUniformLocation(program, "u_mouse"),
    theme: gl.getUniformLocation(program, "u_theme"),
    ripple: gl.getUniformLocation(program, "u_ripple"),
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  onResize = () => {
    const w = Math.floor(canvas.clientWidth * dpr)
    const h = Math.floor(canvas.clientHeight * dpr)
    canvas.width = w
    canvas.height = h
    gl!.viewport(0, 0, w, h)
    gl!.uniform2f(uniforms!.res, w, h)
  }
  onResize()
  window.addEventListener("resize", onResize)

  syncTheme()
  startTime = performance.now()
  raf = requestAnimationFrame(draw)
}

function cleanupNebulaBg() {
  window.removeEventListener("pointermove", handlePointerMove)
  window.removeEventListener("pointerdown", handlePointerDown)
  const canvas = document.getElementById("space-canvas")
  canvas?.removeEventListener("webglcontextlost", handleContextLost)
  canvas?.removeEventListener("webglcontextrestored", handleContextRestored)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNebulaBg)
} else {
  initNebulaBg()
}

document.addEventListener("nav", () => {
  initNebulaBg()
})

document.addEventListener("themechange", () => {
  syncTheme()
})

if (typeof window.addCleanup === "function") {
  window.addCleanup(cleanupNebulaBg)
}
