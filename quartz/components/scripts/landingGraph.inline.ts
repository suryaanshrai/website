interface GraphNode {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hub: boolean
}

interface Palette {
  edge: [number, number, number]
  hub: string
  node: string
  hover: string
}

function readVar(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const v = styles.getPropertyValue(name).trim()
  return v || fallback
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim()
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h
  const n = parseInt(full.slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// The palette used to be hardcoded per theme, and the light-mode branch still
// held the pre-redesign violet (#4a2f7a / #6d5f85 / rgba(60,40,90)), so the
// graph painted purple on the maroon paper. Read the live theme tokens instead
// so the canvas can never drift from the rest of the site again.
function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement)
  return {
    edge: hexToRgb(readVar(s, "--secondary", "#7a2f24")),
    hub: readVar(s, "--secondary", "#7a2f24"),
    node: readVar(s, "--gray", "#7d6f52"),
    hover: readVar(s, "--tertiary", "#3f6b64"),
  }
}

function buildGraph(host: HTMLElement) {
  if (host.dataset.built) return
  host.dataset.built = "1"

  const canvas = document.createElement("canvas")
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;"
  canvas.setAttribute("aria-hidden", "true")
  host.appendChild(canvas)
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

  // A force-directed layout needs a cooling schedule or it never resolves — the
  // centre pull and the charge repulsion just trade energy forever. `alpha`
  // scales every force and decays toward zero, so the graph finds its shape and
  // then holds it. Interaction reheats it.
  //
  // Declared up here, ahead of `size()`, because the first `size()` call happens
  // during setup and reheats.
  let alpha = 1
  const ALPHA_DECAY = 0.985
  const ALPHA_MIN = 0.004

  const reheat = (to = 0.55) => {
    alpha = Math.max(alpha, to)
    start()
  }

  // The very first `size()` runs during setup, before the loop state below
  // exists and before anything has been laid out — it must not try to start the
  // animation. Only genuine resizes after setup reheat.
  let booted = false

  // `size()` used to run inside the animation loop, forcing a layout read and a
  // full canvas reallocation on every single frame. The host only changes size
  // on resize, so observe that instead.
  const size = () => {
    const w = Math.max(1, Math.floor(host.clientWidth * dpr))
    const h = Math.max(1, Math.floor(host.clientHeight * dpr))
    if (canvas.width === w && canvas.height === h) return
    canvas.width = w
    canvas.height = h
    // The aspect ratio feeds the force pass, so a resize invalidates the settled
    // layout — let it find the new shape rather than leaving it stretched.
    if (booted) reheat(0.4)
  }
  size()
  const resizeObserver = new ResizeObserver(size)
  resizeObserver.observe(host)

  let palette = readPalette()
  const onThemeChange = () => {
    palette = readPalette()
    // Repaint in the new palette even if the layout has already parked.
    start()
  }
  document.addEventListener("themechange", onThemeChange)

  const N = 34
  const nodes: GraphNode[] = Array.from({ length: N }, (_, i) => ({
    x: 0.5 + (Math.random() - 0.5) * 0.7,
    y: 0.5 + (Math.random() - 0.5) * 0.7,
    vx: 0,
    vy: 0,
    r: i < 5 ? 4.4 : 2.4 + Math.random() * 1.4,
    hub: i < 5,
  }))
  const edges: [number, number][] = []
  nodes.forEach((_, i) => {
    const a = Math.floor(Math.random() * Math.min(5, N))
    if (a !== i) edges.push([i, a])
    const b = Math.floor(Math.random() * N)
    if (b !== i && Math.random() > 0.55) edges.push([i, b])
  })

  const label = host.querySelector<HTMLElement>("[data-graph-label]")
  if (label) label.textContent = `GRAPH · ${N} NODES · ${edges.length} EDGES`

  let mx = -1
  let my = -1
  let drag: number | null = null

  const onPointerMove = (e: PointerEvent) => {
    const b = host.getBoundingClientRect()
    mx = (e.clientX - b.left) / b.width
    my = (e.clientY - b.top) / b.height
    if (drag !== null) {
      nodes[drag].x = mx
      nodes[drag].y = my
      nodes[drag].vx = 0
      nodes[drag].vy = 0
      reheat(0.5)
    } else {
      // Hover only needs the loop awake to repaint the highlight, not a fresh
      // layout — so wake it without adding energy.
      start()
    }
  }
  const onPointerLeave = () => {
    mx = -1
    my = -1
    drag = null
    // One more frame to clear the hover highlight; it parks itself after.
    start()
  }
  const onPointerDown = () => {
    let best: number | null = null
    let bd = 0.05
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - mx, n.y - my)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    drag = best
    host.style.cursor = drag !== null ? "grabbing" : "grab"
    reheat(0.7)
  }
  const onPointerUp = () => {
    drag = null
    host.style.cursor = "grab"
    reheat(0.4)
  }

  host.addEventListener("pointermove", onPointerMove)
  host.addEventListener("pointerleave", onPointerLeave)
  host.addEventListener("pointerdown", onPointerDown)
  host.addEventListener("pointerup", onPointerUp)

  const LINK_REST = 0.17
  const LINK_K = 0.0016
  const CHARGE = 0.00022
  const CENTER_K = 0.0006
  const DAMPING = 0.94

  // Previously the nodes just drifted at a constant velocity and bounced off the
  // walls, which never resolved into a graph-like shape. A real (if small) force
  // pass — link springs, local charge repulsion, a gentle pull to centre and
  // velocity damping — lets the layout settle the way the design shows it.
  const step = () => {
    // Positions are normalised 0-1 on both axes, but the canvas is not square,
    // so a step of 0.01 in y is a different number of pixels than 0.01 in x.
    // Measuring distance in x-units (and converting the y force back afterwards)
    // keeps the springs isotropic — otherwise the layout stretches along
    // whichever axis is longer, which is most of the time on a phone.
    const ay = canvas.height / Math.max(1, canvas.width)
    const invAy = 1 / Math.max(0.0001, ay)

    for (const [a, b] of edges) {
      const A = nodes[a]
      const B = nodes[b]
      const dx = B.x - A.x
      const dy = (B.y - A.y) * ay
      const d = Math.hypot(dx, dy) || 0.0001
      const f = ((d - LINK_REST) / d) * LINK_K * alpha
      const fx = dx * f
      const fy = dy * f * invAy
      A.vx += fx
      A.vy += fy
      B.vx -= fx
      B.vy -= fy
    }

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const A = nodes[i]
        const B = nodes[j]
        const dx = A.x - B.x
        const dy = (A.y - B.y) * ay
        const d2 = dx * dx + dy * dy
        if (d2 > 0.09 || d2 < 1e-8) continue
        const d = Math.sqrt(d2)
        const f = (CHARGE / d2) * alpha
        const ux = dx / d
        const uy = (dy / d) * invAy
        A.vx += ux * f
        A.vy += uy * f
        B.vx -= ux * f
        B.vy -= uy * f
      }
    }

    nodes.forEach((n, i) => {
      if (i === drag) return
      n.vx += (0.5 - n.x) * CENTER_K * alpha
      n.vy += (0.5 - n.y) * CENTER_K * alpha

      if (mx > 0) {
        const dx = n.x - mx
        const dy = (n.y - my) * ay
        const d = Math.hypot(dx, dy)
        if (d < 0.18 && d > 0.001) {
          const push = (0.18 - d) * 0.006
          n.vx += (dx / d) * push
          n.vy += (dy / d) * push * invAy
        }
      }

      n.vx *= DAMPING
      n.vy *= DAMPING
      n.x += n.vx
      n.y += n.vy

      if (n.x < 0.04) {
        n.x = 0.04
        n.vx = Math.abs(n.vx) * 0.5
      }
      if (n.x > 0.96) {
        n.x = 0.96
        n.vx = -Math.abs(n.vx) * 0.5
      }
      if (n.y < 0.05) {
        n.y = 0.05
        n.vy = Math.abs(n.vy) * 0.5
      }
      if (n.y > 0.95) {
        n.y = 0.95
        n.vy = -Math.abs(n.vy) * 0.5
      }
    })
  }

  const paint = () => {
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const [er, eg, eb] = palette.edge
    ctx.lineWidth = dpr * 0.6
    edges.forEach(([a, b]) => {
      const A = nodes[a]
      const B = nodes[b]
      const d = Math.hypot(A.x - B.x, A.y - B.y)
      const edgeAlpha = Math.max(0, 0.42 - d * 0.5)
      ctx.strokeStyle = `rgba(${er},${eg},${eb},${edgeAlpha})`
      ctx.beginPath()
      ctx.moveTo(A.x * W, A.y * H)
      ctx.lineTo(B.x * W, B.y * H)
      ctx.stroke()
    })

    nodes.forEach((n) => {
      const near = mx > 0 && Math.hypot(n.x - mx, n.y - my) < 0.06
      ctx.beginPath()
      ctx.arc(n.x * W, n.y * H, n.r * dpr * (near ? 1.7 : 1), 0, Math.PI * 2)
      ctx.fillStyle = near ? palette.hover : n.hub ? palette.hub : palette.node
      ctx.fill()
    })
  }

  // The simulation advances in fixed 1/60s slices rather than once per animation
  // frame. Tied to the frame rate, the same constants moved the graph twice as
  // fast on a 120Hz phone as on the 60Hz desktop they were tuned against — which
  // is exactly how it read: aggressively fast, but only on mobile.
  const STEP_MS = 1000 / 60
  const MAX_SUBSTEPS = 5
  let raf: number | null = null
  let lastT = 0
  let acc = 0

  // A function declaration, not a `const` arrow: `start()` is reachable from
  // `reheat()`, which the theme and resize handlers can call, and a hoisted
  // declaration removes any chance of a temporal-dead-zone throw during setup.
  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    if (document.hidden || !host.isConnected) {
      lastT = now
      return
    }

    let dt = now - lastT
    lastT = now
    if (!isFinite(dt) || dt < 0) dt = STEP_MS
    acc += Math.min(dt, 250)

    let n = 0
    while (acc >= STEP_MS && n < MAX_SUBSTEPS) {
      acc -= STEP_MS
      step()
      alpha *= ALPHA_DECAY
      n++
    }
    // Never try to catch up on a long stall (a backgrounded tab, a slow frame);
    // dropping the backlog is what keeps this from spiralling.
    if (n >= MAX_SUBSTEPS) acc = 0

    paint()

    // Settled, and nobody is touching it: stop entirely. The old loop ran a full
    // force pass every frame for as long as the page was open.
    if (alpha <= ALPHA_MIN && drag === null && mx < 0) stop()
  }

  function start() {
    if (raf !== null || reduceMotion.matches) return
    lastT = performance.now()
    acc = 0
    raf = requestAnimationFrame(frame)
  }

  function stop() {
    if (raf === null) return
    cancelAnimationFrame(raf)
    raf = null
  }

  // Under reduced motion the graph still needs to exist — it just resolves off
  // screen and is painted once, with no animation at all.
  const settleAndPaint = () => {
    for (let i = 0; i < 600 && alpha > ALPHA_MIN; i++) {
      step()
      alpha *= ALPHA_DECAY
    }
    paint()
  }

  const onMotionPreferenceChange = () => {
    if (reduceMotion.matches) {
      stop()
      settleAndPaint()
    } else {
      reheat()
    }
  }
  reduceMotion.addEventListener("change", onMotionPreferenceChange)

  booted = true
  if (reduceMotion.matches) {
    settleAndPaint()
  } else {
    start()
  }

  if (typeof window.addCleanup === "function") {
    window.addCleanup(() => {
      stop()
      resizeObserver.disconnect()
      document.removeEventListener("themechange", onThemeChange)
      reduceMotion.removeEventListener("change", onMotionPreferenceChange)
      host.removeEventListener("pointermove", onPointerMove)
      host.removeEventListener("pointerleave", onPointerLeave)
      host.removeEventListener("pointerdown", onPointerDown)
      host.removeEventListener("pointerup", onPointerUp)
    })
  }
}

function initLandingGraph() {
  const host = document.querySelector<HTMLElement>("[data-landing-graph]")
  if (host) buildGraph(host)
}

document.addEventListener("nav", () => {
  initLandingGraph()
})
