function updateProgress() {
  const bar = document.getElementById("reading-progress")
  if (!bar) return
  const el = document.scrollingElement || document.documentElement
  const max = el.scrollHeight - el.clientHeight
  const pct = max > 0 ? (el.scrollTop / max) * 100 : 0
  bar.style.width = `${pct}%`
}

function initReadingProgress() {
  window.removeEventListener("scroll", updateProgress)
  window.addEventListener("scroll", updateProgress, { passive: true })
  updateProgress()
}

function cleanupReadingProgress() {
  window.removeEventListener("scroll", updateProgress)
}

document.addEventListener("nav", () => {
  initReadingProgress()
})

if (typeof window.addCleanup === "function") {
  window.addCleanup(cleanupReadingProgress)
}
