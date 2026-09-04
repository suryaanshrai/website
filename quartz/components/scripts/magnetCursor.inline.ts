import { onPointerInert } from "./util"

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
// Set when the ring fades back in after being inert (see handleMagnetInert
// below), so the very next real pointer position snaps the ring straight
// there instead of easing in from wherever it was frozen — the ring is still
// transparent for that one frame, so the snap is invisible, but a multi-frame
// glide at ease 0.16-0.22 while the opacity transition runs would not be.
let magnetNeedsSnap = false

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

  if (magnetNeedsSnap) {
    magnetState.x = magnetState.tx
    magnetState.y = magnetState.ty
    magnetState.w = magnetState.tw
    magnetState.h = magnetState.th
    magnetNeedsSnap = false
  }
}

// Covers both cases that used to leave the ring stuck: the pointer parked
// over the comments iframe (which swallows pointermove for its own document,
// so magnetState.tx/ty just stopped updating), and the pointer leaving the
// browser window (the old handler here listened for `pointerleave` on
// `window`, which never fires — the pointer has already left the only target
// that event fires on). See `onPointerInert` in ./util.
function handleMagnetInert(inert: boolean) {
  const ring = document.getElementById("magnet-cursor")
  if (ring) ring.style.opacity = inert ? "0" : "1"
  if (!inert) magnetNeedsSnap = true
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
  window.addEventListener("pointermove", handleMagnetPointerMove, { passive: true })
  onPointerInert(handleMagnetInert)

  if (magnetRaf === null) {
    magnetRaf = requestAnimationFrame(magnetLoop)
  }
}

function cleanupMagnetCursor() {
  window.removeEventListener("pointermove", handleMagnetPointerMove)
}

document.addEventListener("nav", () => {
  initMagnetCursor()
})

if (typeof window.addCleanup === "function") {
  window.addCleanup(cleanupMagnetCursor)
}
