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

document.addEventListener("nav", () => {
  initClock()
})

if (typeof window.addCleanup === "function") {
  window.addCleanup(cleanupClock)
}
