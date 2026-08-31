function getEls() {
  const nav = document.getElementById("site-mobile-nav")
  const toggle = document.getElementById("site-header-nav-toggle")
  const close = document.getElementById("site-mobile-nav-close")
  return { nav, toggle, close }
}

function focusablesIn(nav: HTMLElement): HTMLElement[] {
  return Array.from(nav.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  )
}

function openNav() {
  const { nav, toggle } = getEls()
  if (!nav || !toggle) return
  nav.classList.add("open")
  nav.setAttribute("aria-hidden", "false")
  toggle.setAttribute("aria-expanded", "true")
  toggle.setAttribute("aria-label", "Close menu")
  document.body.style.overflow = "hidden"
  // The drawer covers the whole viewport, so focus has to move into it —
  // otherwise the keyboard is still on the toggle behind a full-screen panel.
  focusablesIn(nav)[0]?.focus()
}

function closeNav(restoreFocus = false) {
  const { nav, toggle } = getEls()
  if (!nav || !toggle) return
  const hadFocus = nav.contains(document.activeElement)
  nav.classList.remove("open")
  nav.setAttribute("aria-hidden", "true")
  toggle.setAttribute("aria-expanded", "false")
  toggle.setAttribute("aria-label", "Open menu")
  document.body.style.overflow = ""
  // Closing the drawer while focus was inside it would otherwise drop focus to
  // the document and send the next Tab back to the top of the page.
  if (restoreFocus && hadFocus) toggle.focus()
}

// Tab must not walk out of an open full-screen drawer into the page underneath.
function onTrapKeydown(e: KeyboardEvent) {
  if (e.key !== "Tab") return
  const { nav } = getEls()
  if (!nav?.classList.contains("open")) return

  const items = focusablesIn(nav)
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement

  if (e.shiftKey && (active === first || !nav.contains(active))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

function onToggleClick() {
  const { nav } = getEls()
  if (nav?.classList.contains("open")) {
    closeNav(true)
  } else {
    openNav()
  }
}

function onCloseClick() {
  closeNav(true)
}

function onLinkClick() {
  // Navigating away — the destination page owns focus, so don't pull it back.
  closeNav(false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeNav(true)
}

function setup() {
  const { nav, toggle, close } = getEls()
  toggle?.addEventListener("click", onToggleClick)
  close?.addEventListener("click", onCloseClick)
  nav?.querySelectorAll(".site-mobile-nav-link").forEach((link) => {
    link.addEventListener("click", onLinkClick)
  })
  document.addEventListener("keydown", onKeydown)
  document.addEventListener("keydown", onTrapKeydown, true)
  closeNav(false)
}

document.addEventListener("nav", setup)

if (typeof window.addCleanup === "function") {
  window.addCleanup(() => {
    document.removeEventListener("keydown", onKeydown)
    document.removeEventListener("keydown", onTrapKeydown, true)
    document.body.style.overflow = ""
  })
}
