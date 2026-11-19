// System-aware two-state theme toggle.
//
// No stored value means "follow the OS". Toggling flips whatever is on screen;
// if the result matches the OS the stored value is cleared instead of pinned,
// so later OS changes apply again. A stored value is never cleared just
// because the OS later happens to match it (time-of-day OS switching would
// otherwise make it impossible to pin a scheme).
//
// `saved-theme` on <html> and the `themechange` event stay the public contract:
// site CSS, the graph, comments and mermaid all key off them.
type Scheme = "light" | "dark"
const KEY = "theme"
const systemDark = window.matchMedia("(prefers-color-scheme: dark)")

const parse = (v: string | null): Scheme | null => (v === "light" || v === "dark" ? v : null)
const system = (): Scheme => (systemDark.matches ? "dark" : "light")

// Kept in memory too, so the toggle still works for this page when storage is blocked.
let stored: Scheme | null = null
try {
  stored = parse(localStorage.getItem(KEY))
} catch {}

function apply(notify: boolean) {
  const theme = stored ?? system()
  const root = document.documentElement
  const changed = root.getAttribute("saved-theme") !== theme
  root.setAttribute("saved-theme", theme)

  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", stored ?? "light dark")

  // The theme-color metas are keyed on the OS scheme via `media`; under an
  // override both have to carry the pinned scheme's color.
  const metas = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')]
  for (const m of metas) m.dataset.color ??= m.content
  const pinned = metas.find((m) => m.media.includes(theme))?.dataset.color
  for (const m of metas) m.content = stored && pinned ? pinned : m.dataset.color!

  if (notify && changed) {
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }))
  }
}

function toggle() {
  const target: Scheme = (stored ?? system()) === "dark" ? "light" : "dark"
  stored = target === system() ? null : target
  try {
    if (stored) localStorage.setItem(KEY, stored)
    else localStorage.removeItem(KEY)
  } catch {}
  apply(true)
}

apply(false)

// Delegated, so the button needs no rebinding after SPA morphs.
document.addEventListener("click", (e) => {
  if ((e.target as Element | null)?.closest?.(".darkmode")) toggle()
})
systemDark.addEventListener("change", () => apply(true))
window.addEventListener("storage", (e) => {
  if (e.key !== KEY && e.key !== null) return
  stored = parse(e.newValue)
  apply(true)
})
// The SPA router swaps the <head> metas back to their defaults on every navigation.
document.addEventListener("nav", () => apply(false))
