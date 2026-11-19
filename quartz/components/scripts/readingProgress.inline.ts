// Fallback only: where scroll-driven animations exist, CSS drives the bar.
function updateProgress() {
  const bar = document.getElementById("reading-progress")
  if (!bar) return
  const el = document.scrollingElement || document.documentElement
  const max = el.scrollHeight - el.clientHeight
  bar.style.transform = `scaleX(${max > 0 ? el.scrollTop / max : 0})`
}

if (!CSS.supports("animation-timeline: scroll()")) {
  window.addEventListener("scroll", updateProgress, { passive: true })
  document.addEventListener("nav", updateProgress)
}
