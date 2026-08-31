let tickId: number | null = null

function tick() {
  const el = document.getElementById("site-header-clock")
  if (!el) return
  const time = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  })
  el.textContent = `${time} IST`
}

function initClock() {
  tick()
  if (tickId === null) {
    tickId = window.setInterval(tick, 1000)
  }
}

function cleanupClock() {
  if (tickId !== null) {
    window.clearInterval(tickId)
    tickId = null
  }
}

// --- Theme swap ------------------------------------------------------------
// Flipping `saved-theme` re-resolves --dark/--light on :root, which starts a
// transition on every element declaring `transition: color`/`border-color`.
// Those transitions were observed to stall permanently at their midpoint
// (.landing-index-title stuck at rgb(134,125,124), exactly halfway between the
// two inks), leaving mismatched patches. Adding `theme-swapping` suppresses all
// transitions (see custom.scss) so the palette change lands atomically.
//
// The class is added synchronously in the `themechange` listener, which the
// darkmode plugin dispatches immediately after `setAttribute` — style recalc is
// batched until before paint, so both the new theme and `transition: none` are
// in effect by the time anything is recomputed. It is also added on the
// toggle's pointerdown (capture) as a belt-and-braces guard in case a future
// change forces a reflow in between.
let swapFrame: number | null = null
let swapTimer: number | null = null

function endThemeSwap() {
  document.documentElement.classList.remove("theme-swapping")
  if (swapFrame !== null) {
    cancelAnimationFrame(swapFrame)
    swapFrame = null
  }
  if (swapTimer !== null) {
    window.clearTimeout(swapTimer)
    swapTimer = null
  }
}

function beginThemeSwap() {
  document.documentElement.classList.add("theme-swapping")
  if (swapFrame !== null) cancelAnimationFrame(swapFrame)
  if (swapTimer !== null) window.clearTimeout(swapTimer)

  // Two frames: one for the swap to be committed, one for it to be painted.
  swapFrame = requestAnimationFrame(() => {
    swapFrame = requestAnimationFrame(endThemeSwap)
  })
  // rAF is throttled to zero in a backgrounded or occluded tab, so a theme
  // toggle immediately before switching away would otherwise leave
  // `theme-swapping` — and therefore `transition: none` on everything —
  // latched until the tab was foregrounded again. Whichever fires first wins.
  swapTimer = window.setTimeout(endThemeSwap, 120)
}

function onTogglePointerDown(e: Event) {
  const target = e.target as HTMLElement | null
  if (target?.closest(".darkmode")) beginThemeSwap()
}

document.addEventListener("themechange", beginThemeSwap)
document.addEventListener("pointerdown", onTogglePointerDown, true)

document.addEventListener("nav", () => {
  initClock()
})

if (typeof window.addCleanup === "function") {
  window.addCleanup(() => {
    cleanupClock()
    document.removeEventListener("themechange", beginThemeSwap)
    document.removeEventListener("pointerdown", onTogglePointerDown, true)
    endThemeSwap()
  })
}
