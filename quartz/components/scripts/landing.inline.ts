function isIndexPage(): boolean {
  return document.body.dataset.slug === "index"
}

function handleRowEnter(this: HTMLElement) {
  const kicker = document.getElementById("landing-preview-kicker")
  const body = document.getElementById("landing-preview-body")
  if (kicker) kicker.textContent = this.dataset.kicker ?? ""
  if (body) body.textContent = this.dataset.body ?? ""
}

function handleRowLeave() {
  const kicker = document.getElementById("landing-preview-kicker")
  const body = document.getElementById("landing-preview-body")
  if (kicker) kicker.textContent = "STATUS · IDLE"
  if (body) body.textContent = "Hover an entry to preview what lives inside it."
}

function handleOpenGraphClick(e: MouseEvent) {
  e.preventDefault()
  const icon = document.querySelector(".popover-hint .global-graph-icon") as HTMLElement | null
  icon?.click()
}

// Scroll choreography. The page had no entrance motion at all — every section
// was simply present. Reveals are a translate + fade (never a bare opacity
// fade, which reads as nothing happening), on the single site entrance curve,
// staggered between siblings. Elements are only hidden once the observer is
// actually wired up, so with JS disabled or on an unsupported browser the page
// renders fully visible rather than blank.
const REVEAL_TARGETS = [
  ".landing-section-head",
  ".landing-currently-card",
  ".recent-writing-row",
  ".landing-graph-copy",
  ".landing-graph-canvas",
  ".landing-index-row",
].join(",")

let revealObserver: IntersectionObserver | null = null
let revealFailsafe: number | null = null

function revealAll() {
  document
    .querySelectorAll<HTMLElement>(".will-reveal")
    .forEach((el) => el.classList.add("is-revealed"))
}

function initReveals() {
  if (!("IntersectionObserver" in window)) return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  revealObserver?.disconnect()
  if (revealFailsafe !== null) window.clearTimeout(revealFailsafe)
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.add("is-revealed")
        revealObserver?.unobserve(el)
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  )

  document.querySelectorAll<HTMLElement>(REVEAL_TARGETS).forEach((el) => {
    // Stagger within a group, capped so a long list never waits noticeably.
    const siblings = el.parentElement ? [...el.parentElement.children] : []
    const index = Math.min(siblings.indexOf(el), 5)
    el.style.setProperty("--reveal-delay", `${Math.max(index, 0) * 70}ms`)
    el.classList.add("will-reveal")
    revealObserver!.observe(el)
  })

  // Failsafe. IntersectionObserver callbacks are delivered through the
  // rendering pipeline, so a document that is never rendered — a background
  // tab at load, a restored bfcache entry, an occluded window — can leave every
  // observed element at opacity 0 with no way back. Content being permanently
  // invisible is far worse than a missed animation, so reveal unconditionally
  // if the observer hasn't done it shortly after load.
  revealFailsafe = window.setTimeout(revealAll, 1200)
}

function initLanding() {
  if (!isIndexPage()) return
  initReveals()

  const rows = document.querySelectorAll<HTMLElement>(".landing-index-row")
  rows.forEach((row) => {
    row.removeEventListener("mouseenter", handleRowEnter)
    row.removeEventListener("mouseleave", handleRowLeave)
    row.addEventListener("mouseenter", handleRowEnter)
    row.addEventListener("mouseleave", handleRowLeave)
  })

  const openGraphLink = document.getElementById("landing-open-graph")
  openGraphLink?.removeEventListener("click", handleOpenGraphClick)
  openGraphLink?.addEventListener("click", handleOpenGraphClick)
}

document.addEventListener("nav", () => {
  initLanding()
})

if (typeof window.addCleanup === "function") {
  window.addCleanup(() => {
    revealObserver?.disconnect()
    revealObserver = null
    if (revealFailsafe !== null) {
      window.clearTimeout(revealFailsafe)
      revealFailsafe = null
    }
  })
}
