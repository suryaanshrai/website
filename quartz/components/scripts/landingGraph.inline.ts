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

// The design hardcodes its palette per theme, and its light branch still holds
// the pre-redesign violet (#4a2f7a / #6d5f85 / rgba(60,40,90)) — which would
// paint purple on the maroon paper. Read the live theme tokens instead, chosen
// to match the design's dark values: the hub is the accent (#cbb6f5 -> the
// theme's --secondary) and a plain node is the lighter grey (#8a7ea8 ->
// --darkgray, not --gray, which is dimmer than the design draws it).
function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement)
  return {
    edge: hexToRgb(readVar(s, "--secondary", "#7a2f24")),
    hub: readVar(s, "--secondary", "#7a2f24"),
    node: readVar(s, "--darkgray", "#6b5c45"),
    hover: readVar(s, "--tertiary", "#3f6b64"),
  }
}

/**
 * The landing page's drifting constellation.
 *
 * This is the approved design's own model, and it is deliberately NOT a force
 * simulation. An earlier pass replaced the design's drift with link springs,
 * charge repulsion, a centre pull and a cooling schedule, on the theory that a
 * "real" graph layout would look better. It did not: the springs pulled every
 * node into a knot in the middle, the walls clamped whatever escaped, and the
 * cooling then froze those nodes exactly where they had been clamped — so the
 * graph ended up as rows of dots pinned along the edges of the box.
 *
 * What the design actually does, and what is restored here: nodes are scattered
 * across the whole box, each carries a tiny constant velocity (a node takes the
 * better part of a minute to cross the frame), they bounce off the walls rather
 * than sticking to them, and the cursor nudges nearby ones aside. Edges fade out
 * with length, so the picture reads as a constellation rather than a mesh.
 *
 * Kept from the rewrite, because none of it changes the look:
 *   - a fixed timestep, so the drift is the same speed on a 60Hz laptop and a
 *     120Hz phone (the design's own version runs twice as fast on the latter);
 *   - the palette read from theme tokens rather than hardcoded;
 *   - sizing on a ResizeObserver rather than a layout read every frame;
 *   - honouring prefers-reduced-motion;
 *   - pausing while scrolled out of view.
 */
function buildGraph(host: HTMLElement) {
  // The SPA morph can replace this element; `dataset.built` would then survive
  // on a node that no longer holds a canvas, leaving the section permanently
  // blank. Treat "marked built but empty" as not built.
  if (host.dataset.built && host.querySelector("canvas")) return
  host.dataset.built = "1"

  const canvas = document.createElement("canvas")
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;"
  canvas.setAttribute("aria-hidden", "true")
  host.appendChild(canvas)
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

  // The design calls its `size()` inside the animation loop, forcing a layout
  // read and a full canvas reallocation on every frame. Nothing here depends on
  // the canvas size except the paint, so observe the host instead.
  const size = () => {
    const w = Math.max(1, Math.floor(host.clientWidth * dpr))
    const h = Math.max(1, Math.floor(host.clientHeight * dpr))
    if (canvas.width === w && canvas.height === h) return
    canvas.width = w
    canvas.height = h
  }
  size()
  const resizeObserver = new ResizeObserver(size)
  resizeObserver.observe(host)

  let palette = readPalette()
  const onThemeChange = () => {
    palette = readPalette()
    paint()
  }
  document.addEventListener("themechange", onThemeChange)

  const N = 34
  // Scattered across the box, but seeded INSIDE the bounce band. The design
  // seeds over the full 0-1 range, which puts roughly one node in twelve outside
  // the band on each axis from the very first frame — and see the reflection
  // note in `step()` for why a node that starts out there never gets back in.
  const nodes: GraphNode[] = Array.from({ length: N }, (_, i) => ({
    x: 0.07 + Math.random() * 0.86,
    y: 0.08 + Math.random() * 0.84,
    vx: (Math.random() - 0.5) * 0.0004,
    vy: (Math.random() - 0.5) * 0.0004,
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
    }
    start()
  }
  const onPointerLeave = () => {
    mx = -1
    my = -1
    drag = null
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
  }
  const onPointerUp = () => {
    drag = null
    host.style.cursor = "grab"
  }

  host.addEventListener("pointermove", onPointerMove)
  host.addEventListener("pointerleave", onPointerLeave)
  host.addEventListener("pointerdown", onPointerDown)
  host.addEventListener("pointerup", onPointerUp)

  // One tick is 1/60s of drift.
  //
  // The reflection only fires when the node is actually heading OUT of the box.
  // The design flips the sign whenever a node is past the line at all, which
  // means anything that ends up outside — seeded there, or nudged there by the
  // cursor — flips every single frame and vibrates on the spot forever instead
  // of bouncing back in. That is what put the row of dots along the edges.
  const step = () => {
    for (let i = 0; i < N; i++) {
      if (i === drag) continue
      const n = nodes[i]
      n.x += n.vx
      n.y += n.vy
      if ((n.x < 0.04 && n.vx < 0) || (n.x > 0.96 && n.vx > 0)) n.vx *= -1
      if ((n.y < 0.05 && n.vy < 0) || (n.y > 0.95 && n.vy > 0)) n.vy *= -1

      if (mx > 0) {
        const dx = n.x - mx
        const dy = n.y - my
        const d = Math.hypot(dx, dy)
        if (d < 0.18 && d > 0.001) {
          // The cursor displaces nodes directly rather than accelerating them,
          // so they part around it and settle back instead of being flung.
          n.x += (dx / d) * (0.18 - d) * 0.06
          n.y += (dy / d) * (0.18 - d) * 0.06
        }
      }
    }
  }

  function paint() {
    const W = canvas.width
    const H = canvas.height
    ctx!.clearRect(0, 0, W, H)

    const [er, eg, eb] = palette.edge
    ctx!.lineWidth = dpr * 0.6
    edges.forEach(([a, b]) => {
      const A = nodes[a]
      const B = nodes[b]
      const d = Math.hypot(A.x - B.x, A.y - B.y)
      // Long edges fade out entirely — that is what makes it read as a
      // constellation instead of a tangle of lines across the whole box.
      const edgeAlpha = Math.max(0, 0.34 - d * 0.45)
      if (edgeAlpha <= 0) return
      ctx!.strokeStyle = `rgba(${er},${eg},${eb},${edgeAlpha})`
      ctx!.beginPath()
      ctx!.moveTo(A.x * W, A.y * H)
      ctx!.lineTo(B.x * W, B.y * H)
      ctx!.stroke()
    })

    nodes.forEach((n) => {
      const near = mx > 0 && Math.hypot(n.x - mx, n.y - my) < 0.06
      ctx!.beginPath()
      ctx!.arc(n.x * W, n.y * H, n.r * dpr * (near ? 1.7 : 1), 0, Math.PI * 2)
      ctx!.fillStyle = near ? palette.hover : n.hub ? palette.hub : palette.node
      ctx!.fill()
    })
  }

  // Tied to the animation frame, the design's constants drift twice as fast on a
  // 120Hz phone as on the 60Hz desktop they were authored against. Advancing in
  // fixed 1/60s slices makes the motion identical everywhere.
  const STEP_MS = 1000 / 60
  const MAX_SUBSTEPS = 5
  let raf: number | null = null
  let lastT = 0
  let acc = 0
  let onScreen = true

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    if (document.hidden || !onScreen || !host.isConnected) {
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
      n++
    }
    // Never try to replay a long stall (a backgrounded tab, a slow frame) — that
    // would fast-forward the drift visibly on return.
    if (n >= MAX_SUBSTEPS) acc = 0

    paint()
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

  // Off-screen the drift is invisible but still costs a frame of work forever.
  const visibility = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting)
      if (onScreen) start()
    },
    { rootMargin: "200px 0px" },
  )
  visibility.observe(host)

  const onMotionPreferenceChange = () => {
    if (reduceMotion.matches) {
      stop()
      paint()
    } else {
      start()
    }
  }
  reduceMotion.addEventListener("change", onMotionPreferenceChange)

  if (reduceMotion.matches) {
    // Still a constellation, just a still one.
    paint()
  } else {
    start()
  }

  if (typeof window.addCleanup === "function") {
    window.addCleanup(() => {
      stop()
      resizeObserver.disconnect()
      visibility.disconnect()
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
