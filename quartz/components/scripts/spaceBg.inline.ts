let gl: WebGLRenderingContext | null = null
let uniforms: {
  res: WebGLUniformLocation | null
  time: WebGLUniformLocation | null
  mouse: WebGLUniformLocation | null
  theme: WebGLUniformLocation | null
  ripple: WebGLUniformLocation | null
  pointer: WebGLUniformLocation | null
} | null = null
let raf: number | null = null
let onResize: (() => void) | null = null
let startTime = 0
// The element the current WebGL context belongs to. `.animation-container`
// carries `data-persist`, but the SPA morph can still replace the node when the
// surrounding structure differs between page types — and a context bound to a
// detached canvas paints nothing. Comparing identity on every `nav` is what
// makes the background survive that.
let boundCanvas: HTMLCanvasElement | null = null
let renderScale = 1

const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
let rippleAt: [number, number] | null = null
// Time-based rather than a per-frame accumulator, so the ripple takes the
// same wall-clock duration at 60Hz and 120Hz instead of running at double
// speed on high-refresh displays. `u_ripple.z` carries age (0..1) to the
// shader; null means "no ripple in flight".
let rippleStart: number | null = null
const RIPPLE_DURATION_MS = 900

function getTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("saved-theme") === "light" ? "light" : "dark"
}

const VERTEX_SRC = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`

const FRAGMENT_SRC = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_theme; uniform vec3 u_ripple;
// 1 where a real cursor exists, 0 on touch. The mouse-anchored terms below are
// cursor *responses*; with no cursor to respond to they were still drawn at the
// initial (0.5, 0.5), parking a permanent mark in the middle of every phone
// screen — clearly visible once light mode started subtracting rather than adding.
uniform float u_pointer;

// The classic \`fract(sin(dot(p, k)) * 43758.5)\` hash is the usual cause of
// blocky patches on phones: fbm pushes p out to ~30x, and mobile GPUs implement
// sin() with much coarser range reduction than desktop ones, so above a few
// hundred radians neighbouring cells collapse onto the same value and the noise
// grows visible rectangular structure. This variant never leaves [0,1) and uses
// no transcendentals, so it is stable on every GPU.
float hash(vec2 p){
  vec3 v = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  v += dot(v, v.yzx + 33.33);
  return fract((v.x + v.y) * v.z);
}

// Interleaved gradient noise, used only to dither the final colour.
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  // Quintic, not cubic: smoothstep's second derivative is discontinuous at the
  // cell boundary, which shows up as a faint grid of creases across a large
  // smooth gradient like this one.
  vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
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
  // Normalise by the SHORT side, not always by height. On a landscape desktop
  // these are the same thing, so the look there is unchanged. On a portrait
  // phone height is ~2.1x width, so dividing by height shrank the uv range to
  // about a quarter of the desktop's — the shader was drawing one enormous
  // nebula lobe blown up across the screen, which is what read as "patchy" and
  // put visible soft edges through the middle of the viewport. Against the short
  // side the feature size per screen matches the design on both orientations.
  float shortSide = min(u_res.x, u_res.y);
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / shortSide;
  vec2 m = (u_mouse - 0.5*u_res) / shortSide;
  float t = u_time * 0.035;

  // Click ripple: a small lens that bends whatever's behind it and settles,
  // rather than a ring of light drawn over the scene. \`dUv\` is what the
  // nebula, stars and vignette below actually sample — undisturbed (== uv)
  // whenever no ripple is in flight, so the resting frame is bit-for-bit
  // identical to before this existed. Two crests (a leading wave and a
  // fainter trailing one) is what reads as water rather than one drawn
  // circle; swell/decay is a two-stage envelope — fast in, slow settle —
  // rather than the mechanical linear fade a per-frame step gives you.
  vec2 dUv = uv;
  float rippleGlow = 0.0;
  if(u_ripple.z > 0.0){
    vec2 rp = (u_ripple.xy - 0.5*u_res) / shortSide;
    float age = u_ripple.z;
    float swell = smoothstep(0.0, 0.18, age);
    float decay = pow(1.0 - age, 2.0);
    float envelope = swell * decay;
    float radius = 0.30 * (1.0 - pow(1.0 - age, 3.0));

    vec2 toFrag = uv - rp;
    float d = length(toFrag);
    vec2 dir = d > 0.0001 ? toFrag / d : vec2(0.0);

    float crest = exp(-pow((d - radius) / 0.055, 2.0))
                + 0.45 * exp(-pow((d - radius * 0.62) / 0.055, 2.0));
    float wave = crest * envelope;

    dUv = uv - dir * wave * 0.035;
    rippleGlow = wave;
  }

  vec2 q = dUv * 1.15;
  q += 0.16 * vec2(fbm(q*1.4 + t), fbm(q*1.4 - t + 4.7));
  float neb = fbm(q*1.9 + vec2(t*0.6, -t*0.4));
  neb = pow(smoothstep(0.28, 1.0, neb), 1.6);

  float depth = smoothstep(1.25, 0.0, length(uv - m*0.25*u_pointer));
  neb *= 0.55 + 0.75*depth;

  vec3 violet = vec3(0.710, 0.549, 0.941);
  vec3 cyan = vec3(0.337, 0.769, 0.847);
  vec3 maroon = vec3(0.40, 0.16, 0.11);
  vec3 teal = vec3(0.20, 0.34, 0.32);
  float xmix = smoothstep(-0.5, 0.9, dUv.x + 0.35*fbm(q*2.4));
  vec3 colDark = mix(violet, cyan, xmix) * neb * 0.62;
  vec3 colLight = mix(maroon, teal, xmix) * neb * 0.4;
  vec3 col = mix(colDark, colLight, u_theme);

  float s = stars(dUv + vec2(t*0.12, 0.0), 26.0, 0.055, u_time)
          + 0.6*stars(dUv*1.7 + vec2(-t*0.07, t*0.03), 46.0, 0.04, u_time*0.8)
          + 0.35*stars(dUv*2.6 + vec2(t*0.04, 0.0), 78.0, 0.03, u_time*1.4);
  col += vec3(0.86, 0.84, 0.95) * s * 0.85 * (1.0 - u_theme);
  col += vec3(0.32, 0.22, 0.15) * s * 0.35 * u_theme;

  float md = length(uv - m);
  vec3 haloDark = vec3(0.42, 0.30, 0.62) * smoothstep(0.42, 0.0, md) * 0.30 + vec3(0.25, 0.55, 0.62) * smoothstep(0.06, 0.0, md) * 0.5;
  vec3 haloLight = vec3(0.40, 0.20, 0.14) * smoothstep(0.42, 0.0, md) * 0.22 + vec3(0.22, 0.30, 0.28) * smoothstep(0.06, 0.0, md) * 0.32;
  col += mix(haloDark, haloLight, u_theme) * u_pointer;

  // Rim highlight on the wavefront itself — a sixth of the old ring's
  // strength, since the displacement above is now what carries the effect.
  if(rippleGlow > 0.0){
    vec3 rippleDark = vec3(0.55, 0.45, 0.80);
    vec3 rippleLight = vec3(0.42, 0.22, 0.16);
    col += mix(rippleDark, rippleLight, u_theme) * rippleGlow * 0.16;
  }

  // Dark mode is light emitted into a void, so the nebula, the stars and the
  // cursor halo all ADD. Light mode is the opposite premise — the design calls
  // it "aged paper + iron-gall ink", and its own paper layers are dark stains
  // and ruled lines laid ON the sheet. Adding the same accumulation to a ground
  // that already sits at 0.9 only clipped it toward white, which is why the
  // light theme read as a blown-out wash with a hot spot under the cursor.
  // Subtracting turns exactly the same field into washes and flecks of ink.
  vec3 dark = vec3(0.031, 0.024, 0.055) + col;
  vec3 paper = vec3(0.925, 0.890, 0.804) - col * 1.15;
  vec3 outc = mix(dark, paper, u_theme);

  float vig = smoothstep(1.55, 0.35, length(dUv));
  outc *= mix(0.72, 1.0, vig);

  // A near-black ground with a wide, very gradual gradient across it is the
  // worst case for an 8-bit framebuffer: consecutive output steps land many
  // pixels apart and the eye reads them as flat bands with hard edges. One
  // quantisation step of noise dissolves them at no visible cost.
  outc += (ign(gl_FragCoord.xy) - 0.5) / 255.0;

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
  rippleStart = performance.now()
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
  boundCanvas = null
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

  if (rippleStart !== null) {
    // Clamp above 0 so age never lands on exactly 0.0 the first frame after a
    // click, which would fail the shader's `u_ripple.z > 0.0` gate for one frame.
    const age = Math.max(0.0001, (now - rippleStart) / RIPPLE_DURATION_MS)
    if (age >= 1) {
      rippleStart = null
      gl.uniform3f(uniforms.ripple, 0, 0, 0)
    } else {
      const r = rippleAt ?? [0.5, 0.5]
      gl.uniform3f(uniforms.ripple, r[0] * canvas.width, r[1] * canvas.height, age)
    }
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

function syncPointer() {
  if (gl && uniforms) {
    gl.uniform1f(uniforms.pointer, pointerEffectsEnabled() ? 1 : 0)
  }
}

function initNebulaBg() {
  const canvas = document.getElementById("space-canvas") as HTMLCanvasElement | null
  if (!canvas) return

  // If the live canvas is not the one the context was created for, the morph
  // swapped the node out from under us. Anything we still hold — the context,
  // the uniform locations, the resize closure — belongs to a detached element
  // and can only paint into nothing, so drop it all and start cold.
  if (boundCanvas !== null && boundCanvas !== canvas) {
    if (raf !== null) {
      cancelAnimationFrame(raf)
      raf = null
    }
    if (onResize) window.removeEventListener("resize", onResize)
    onResize = null
    gl = null
    uniforms = null
    boundCanvas = null
  }

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
    syncPointer()
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
    pointer: gl.getUniformLocation(program, "u_pointer"),
  }
  boundCanvas = canvas

  renderScale = Math.min(window.devicePixelRatio || 1, 1.5)
  // Resolves the canvas by id on every call rather than closing over the element
  // it was created with: the previous closure kept measuring a node the morph
  // had already detached, so `clientWidth` read 0 and the replacement was left
  // at the 300x150 canvas default — a blank background.
  onResize = () => {
    const c = document.getElementById("space-canvas") as HTMLCanvasElement | null
    if (!c || !c.isConnected || !gl || !uniforms) return
    const w = Math.max(1, Math.floor(c.clientWidth * renderScale))
    const h = Math.max(1, Math.floor(c.clientHeight * renderScale))
    if (c.width !== w || c.height !== h) {
      c.width = w
      c.height = h
    }
    gl.viewport(0, 0, w, h)
    gl.uniform2f(uniforms.res, w, h)
  }
  onResize()
  window.addEventListener("resize", onResize)

  syncTheme()
  syncPointer()
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
