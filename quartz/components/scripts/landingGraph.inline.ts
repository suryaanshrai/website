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
  // `size()` used to run inside the animation loop, forcing a layout read and a
  // full canvas reallocation on every single frame. The host only changes size
  // on resize, so observe that instead.
  const size = () => {
    canvas.width = Math.max(1, Math.floor(host.clientWidth * dpr))
    canvas.height = Math.max(1, Math.floor(host.clientHeight * dpr))
  }
  size()
  const resizeObserver = new ResizeObserver(size)
  resizeObserver.observe(host)

  let palette = readPalette()
  const onThemeChange = () => {
    palette = readPalette()
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
    }
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
    for (const [a, b] of edges) {
      const A = nodes[a]
      const B = nodes[b]
      const dx = B.x - A.x
      const dy = B.y - A.y
      const d = Math.hypot(dx, dy) || 0.0001
      const f = ((d - LINK_REST) / d) * LINK_K
      const fx = dx * f
      const fy = dy * f
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
        const dy = A.y - B.y
        const d2 = dx * dx + dy * dy
        if (d2 > 0.09 || d2 < 1e-8) continue
        const d = Math.sqrt(d2)
        const f = CHARGE / d2
        A.vx += (dx / d) * f
        A.vy += (dy / d) * f
        B.vx -= (dx / d) * f
        B.vy -= (dy / d) * f
      }
    }

    nodes.forEach((n, i) => {
      if (i === drag) return
      n.vx += (0.5 - n.x) * CENTER_K
      n.vy += (0.5 - n.y) * CENTER_K

      if (mx > 0) {
        const dx = n.x - mx
        const dy = n.y - my
        const d = Math.hypot(dx, dy)
        if (d < 0.18 && d > 0.001) {
          n.vx += (dx / d) * (0.18 - d) * 0.006
          n.vy += (dy / d) * (0.18 - d) * 0.006
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

  let raf: number | null = null
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (document.hidden || !host.isConnected) return

    step()

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const [er, eg, eb] = palette.edge
    ctx.lineWidth = dpr * 0.6
    edges.forEach(([a, b]) => {
      const A = nodes[a]
      const B = nodes[b]
      const d = Math.hypot(A.x - B.x, A.y - B.y)
      const alpha = Math.max(0, 0.42 - d * 0.5)
      ctx.strokeStyle = `rgba(${er},${eg},${eb},${alpha})`
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
  raf = requestAnimationFrame(loop)

  if (typeof window.addCleanup === "function") {
    window.addCleanup(() => {
      if (raf !== null) cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      document.removeEventListener("themechange", onThemeChange)
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
