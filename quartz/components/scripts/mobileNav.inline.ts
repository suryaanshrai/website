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

const MOBILE = "(max-width: 800px)"

// On mobile the left sidebar (site title + explorer) is hidden, because it
// rendered as a second sticky bar stacked above the real header. The explorer
// itself is still wanted, so relocate the live element into the drawer rather
// than re-implementing the tree: moving a node preserves its listeners and the
// plugin's own render-on-`nav` continues to work. Above the breakpoint it is
// moved back so the desktop sidebar is unaffected.
function syncExplorerPlacement() {
  const explorer = document.querySelector(".explorer")
  const tree = document.getElementById("site-mobile-nav-tree")
  const sidebar = document.querySelector(".left.sidebar")
  if (!explorer) return

  if (window.matchMedia(MOBILE).matches) {
    if (tree && explorer.parentElement !== tree) tree.appendChild(explorer)
  } else if (sidebar && explorer.parentElement !== sidebar) {
    sidebar.appendChild(explorer)
  }
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
  syncExplorerPlacement()
  // The explorer plugin rebuilds its tree on `nav` too, and ordering between
  // the two listeners isn't guaranteed — re-assert placement after it settles.
  requestAnimationFrame(syncExplorerPlacement)
}

// Tapping a file in the relocated tree should dismiss the drawer like any other
// nav link. Delegated, because the tree is re-rendered by its own plugin.
function onTreeClick(e: Event) {
  const target = e.target as HTMLElement | null
  if (target?.closest("#site-mobile-nav-tree a")) closeNav()
}

const mobileQuery = window.matchMedia(MOBILE)

document.addEventListener("nav", setup)
document.addEventListener("click", onTreeClick)
mobileQuery.addEventListener("change", syncExplorerPlacement)

if (typeof window.addCleanup === "function") {
  window.addCleanup(() => {
    document.removeEventListener("keydown", onKeydown)
    document.removeEventListener("click", onTreeClick)
    mobileQuery.removeEventListener("change", syncExplorerPlacement)
    document.body.style.overflow = ""
  })
}
