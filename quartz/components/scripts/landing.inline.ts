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

function initLanding() {
  if (!isIndexPage()) return

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
