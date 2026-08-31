function getEls() {
  const nav = document.getElementById("site-mobile-nav")
  const toggle = document.getElementById("site-header-nav-toggle")
  const close = document.getElementById("site-mobile-nav-close")
  return { nav, toggle, close }
}

function openNav() {
  const { nav, toggle } = getEls()
  if (!nav || !toggle) return
  nav.classList.add("open")
  nav.setAttribute("aria-hidden", "false")
  toggle.setAttribute("aria-expanded", "true")
  toggle.setAttribute("aria-label", "Close menu")
  document.body.style.overflow = "hidden"
}

function closeNav() {
  const { nav, toggle } = getEls()
  if (!nav || !toggle) return
  nav.classList.remove("open")
  nav.setAttribute("aria-hidden", "true")
  toggle.setAttribute("aria-expanded", "false")
  toggle.setAttribute("aria-label", "Open menu")
  document.body.style.overflow = ""
}

function onToggleClick() {
  const { nav } = getEls()
  if (nav?.classList.contains("open")) {
    closeNav()
  } else {
    openNav()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeNav()
}

function setup() {
  const { nav, toggle, close } = getEls()
  toggle?.addEventListener("click", onToggleClick)
  close?.addEventListener("click", closeNav)
  nav?.querySelectorAll(".site-mobile-nav-link").forEach((link) => {
    link.addEventListener("click", closeNav)
  })
  document.addEventListener("keydown", onKeydown)
  closeNav()
}

document.addEventListener("nav", setup)

if (typeof window.addCleanup === "function") {
  window.addCleanup(() => {
    document.removeEventListener("keydown", onKeydown)
    document.body.style.overflow = ""
  })
}
