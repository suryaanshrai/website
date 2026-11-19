// The drawer is a modal <dialog>, so focus trapping, Esc, page inertness and
// focus return are the browser's job. This script only opens it, closes it
// when a link is followed, and mirrors the open state onto the menu button.
const drawer = () => document.getElementById("site-mobile-nav") as HTMLDialogElement | null

function syncToggle() {
  document
    .getElementById("site-header-nav-toggle")
    ?.setAttribute("aria-expanded", drawer()?.open ? "true" : "false")
}

// Delegated and bound once: the header and drawer survive SPA morphs, and
// document listeners run before the router's window-level click handler, so a
// followed link closes the drawer before the page is swapped.
document.addEventListener("click", (e) => {
  const target = e.target as Element | null
  const d = drawer()
  if (!d) return
  if (target?.closest("#site-header-nav-toggle") && !d.open) {
    d.showModal()
    syncToggle()
  } else if (target?.closest(".site-mobile-nav-link") && d.open) {
    d.close()
  }
})

// `close` doesn't bubble; capture catches Esc, the ✕ form and close() alike.
document.addEventListener(
  "close",
  (e) => {
    if ((e.target as Element).id === "site-mobile-nav") syncToggle()
  },
  true,
)

document.addEventListener("prenav", () => {
  if (drawer()?.open) drawer()!.close()
})
document.addEventListener("nav", syncToggle)
