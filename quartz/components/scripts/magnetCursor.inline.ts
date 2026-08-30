interface MagnetState {
  x: number
  y: number
  tx: number
  ty: number
  w: number
  h: number
  tw: number
  th: number
  tr: number
}

const magnetState: MagnetState = {
  x: -100,
  y: -100,
  tx: -100,
  ty: -100,
  w: 34,
  h: 34,
  tw: 34,
  th: 34,
  tr: 999,
}
let magnetTarget: HTMLElement | null = null
let magnetRaf: number | null = null

function handleMagnetPointerMove(e: PointerEvent) {
  const ring = document.getElementById("magnet-cursor")
  if (!ring) return
  ring.style.opacity = "1"

  const el = (e.target as HTMLElement | null)?.closest?.("[data-magnet]") as HTMLElement | null
  magnetTarget = el

  if (el) {
    const b = el.getBoundingClientRect()
    magnetState.tx = b.left + b.width / 2
    magnetState.ty = b.top + b.height / 2
    magnetState.tw = b.width + 14
    magnetState.th = b.height + 12
    magnetState.tr = Math.max(10, parseFloat(getComputedStyle(el).borderRadius) || 12) + 6
  } else {
    magnetState.tx = e.clientX
    magnetState.ty = e.clientY
    magnetState.tw = 34
    magnetState.th = 34
    magnetState.tr = 999
  }
}

function handleMagnetPointerLeave() {
  const ring = document.getElementById("magnet-cursor")
  if (ring) ring.style.opacity = "0"
}

function magnetLoop() {
  magnetRaf = requestAnimationFrame(magnetLoop)
  const ring = document.getElementById("magnet-cursor")
  if (!ring) return

  const ease = magnetTarget ? 0.22 : 0.16
  magnetState.x += (magnetState.tx - magnetState.x) * ease
  magnetState.y += (magnetState.ty - magnetState.y) * ease
  magnetState.w += (magnetState.tw - magnetState.w) * 0.2
  magnetState.h += (magnetState.th - magnetState.h) * 0.2

  ring.style.transform = `translate3d(${magnetState.x - magnetState.w / 2}px, ${magnetState.y - magnetState.h / 2}px, 0)`
  ring.style.width = `${magnetState.w}px`
  ring.style.height = `${magnetState.h}px`
  ring.style.borderRadius = `${magnetState.tr}px`
}

function initMagnetCursor() {
  if (window.matchMedia("(hover: none)").matches) return

  window.removeEventListener("pointermove", handleMagnetPointerMove)
  window.removeEventListener("pointerleave", handleMagnetPointerLeave)
  window.addEventListener("pointermove", handleMagnetPointerMove, { passive: true })
  window.addEventListener("pointerleave", handleMagnetPointerLeave)

  if (magnetRaf === null) {
    magnetRaf = requestAnimationFrame(magnetLoop)
  }
}

function cleanupMagnetCursor() {
  window.removeEventListener("pointermove", handleMagnetPointerMove)
  window.removeEventListener("pointerleave", handleMagnetPointerLeave)
}

document.addEventListener("nav", () => {
  initMagnetCursor()
})

if (typeof window.addCleanup === "function") {
  window.addCleanup(cleanupMagnetCursor)
}
