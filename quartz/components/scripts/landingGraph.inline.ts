interface GraphNode {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hub: boolean
}

function getGraphTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("saved-theme") === "light" ? "light" : "dark"
}

function buildGraph(host: HTMLElement) {
  if (host.dataset.built) return
  host.dataset.built = "1"

  const canvas = document.createElement("canvas")
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;"
  host.appendChild(canvas)
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const size = () => {
    canvas.width = host.clientWidth * dpr
    canvas.height = host.clientHeight * dpr
  }
  size()

  const N = 34
  const nodes: GraphNode[] = Array.from({ length: N }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
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

  let raf: number | null = null
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (document.hidden || !host.isConnected) return
    size()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const W = canvas.width
    const H = canvas.height
    const light = getGraphTheme() === "light"

    nodes.forEach((n, i) => {
      if (i !== drag) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0.04 || n.x > 0.96) n.vx *= -1
        if (n.y < 0.05 || n.y > 0.95) n.vy *= -1
        if (mx > 0) {
          const dx = n.x - mx
          const dy = n.y - my
          const d = Math.hypot(dx, dy)
          if (d < 0.18 && d > 0.001) {
            n.x += (dx / d) * (0.18 - d) * 0.06
            n.y += (dy / d) * (0.18 - d) * 0.06
          }
        }
      }
    })

    ctx.lineWidth = dpr * 0.6
    edges.forEach(([a, b]) => {
      const A = nodes[a]
      const B = nodes[b]
      const d = Math.hypot(A.x - B.x, A.y - B.y)
      ctx.strokeStyle = light
        ? `rgba(60,40,90,${Math.max(0, 0.32 - d * 0.4)})`
        : `rgba(181,140,240,${Math.max(0, 0.34 - d * 0.45)})`
      ctx.beginPath()
      ctx.moveTo(A.x * W, A.y * H)
      ctx.lineTo(B.x * W, B.y * H)
      ctx.stroke()
    })

    nodes.forEach((n) => {
      const near = mx > 0 && Math.hypot(n.x - mx, n.y - my) < 0.06
      ctx.beginPath()
      ctx.arc(n.x * W, n.y * H, n.r * dpr * (near ? 1.7 : 1), 0, Math.PI * 2)
      ctx.fillStyle = near ? "#56c4d8" : n.hub ? (light ? "#4a2f7a" : "#cbb6f5") : light ? "#6d5f85" : "#8a7ea8"
      ctx.fill()
    })
  }
  raf = requestAnimationFrame(loop)

  if (typeof window.addCleanup === "function") {
    window.addCleanup(() => {
      if (raf !== null) cancelAnimationFrame(raf)
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
