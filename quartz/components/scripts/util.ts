export function registerEscapeHandler(outsideContainer: HTMLElement | null, cb: () => void) {
  if (!outsideContainer) return
  function click(this: HTMLElement, e: HTMLElementEventMap["click"]) {
    if (e.target !== this) return
    e.preventDefault()
    e.stopPropagation()
    cb()
  }

  function esc(e: HTMLElementEventMap["keydown"]) {
    if (!e.key.startsWith("Esc")) return
    e.preventDefault()
    cb()
  }

  outsideContainer?.addEventListener("click", click)
  window.addCleanup(() => outsideContainer?.removeEventListener("click", click))
  document.addEventListener("keydown", esc)
  window.addCleanup(() => document.removeEventListener("keydown", esc))
}

export function removeAllChildren(node: HTMLElement) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

// AliasRedirect emits HTML redirects which also have the link[rel="canonical"]
// containing the URL it's redirecting to.
// Extracting it here with regex is _probably_ faster than parsing the entire HTML
// with a DOMParser effectively twice (here and later in the SPA code), even if
// way less robust - we only care about our own generated redirects after all.
const canonicalRegex = /<link rel="canonical" href="([^"]*)">/

export async function fetchCanonical(url: URL): Promise<Response> {
  const res = await fetch(`${url}`)
  if (!res.headers.get("content-type")?.startsWith("text/html")) {
    return res
  }

  // reading the body can only be done once, so we need to clone the response
  // to allow the caller to read it if it's was not a redirect
  const text = await res.clone().text()
  const [_, redirect] = text.match(canonicalRegex) ?? []
  return redirect ? fetch(`${new URL(redirect, url)}`) : res
}

// Tracks whether the pointer is somewhere this document can no longer see it
// move: over an iframe (which swallows pointermove/pointerdown for its own
// document, so whatever was last computed here just stays put forever), or
// off the browser window entirely. Pointer-follow effects (the cursor ring,
// the WebGL halo) should fade out on `inert` rather than freeze at the
// boundary — `cb` fires once per transition so callers can drive that fade.
//
// Safe to call again on every `nav` re-init, matching this codebase's
// idempotent-rebind idiom elsewhere (see `initNebulaBg`/`initMagnetCursor`):
// each call tears down its own previous listeners before re-binding.
const inertCleanups = new WeakMap<(inert: boolean) => void, () => void>()

export function onPointerInert(cb: (inert: boolean) => void): void {
  inertCleanups.get(cb)?.()

  let inert = false
  function setInert(next: boolean) {
    if (next === inert) return
    inert = next
    cb(inert)
  }

  // Bubbles, so this is delegated on `document` rather than bound to the
  // iframe directly — the comments iframe is only inserted once its
  // container scrolls into view, and delegation covers it with no
  // MutationObserver needed. The pointer entering an iframe still fires
  // `pointerover` on it in the parent document; only pointer *movement*
  // inside the embedded document is invisible from here.
  function handleOver(e: PointerEvent) {
    setInert((e.target as Element | null)?.tagName === "IFRAME")
  }
  // The pointer leaving the viewport altogether — `window.pointerleave`
  // never fires (the pointer has left the target it would fire on), so this
  // binds to the root element instead.
  function handleLeaveWindow() {
    setInert(true)
  }
  // Alt-tabbing away while the pointer still hovers an already-inert iframe
  // (or into/out of one without a pointer move) — re-derive from focus
  // rather than blindly setting either state, so this never fights the
  // pointerover/pointerleave handlers above.
  function syncFocusInert() {
    setInert(document.activeElement?.tagName === "IFRAME")
  }

  document.addEventListener("pointerover", handleOver, { passive: true })
  document.documentElement.addEventListener("pointerleave", handleLeaveWindow)
  window.addEventListener("blur", syncFocusInert)
  window.addEventListener("focus", syncFocusInert)

  const cleanup = () => {
    document.removeEventListener("pointerover", handleOver)
    document.documentElement.removeEventListener("pointerleave", handleLeaveWindow)
    window.removeEventListener("blur", syncFocusInert)
    window.removeEventListener("focus", syncFocusInert)
  }
  inertCleanups.set(cb, cleanup)
  if (typeof window.addCleanup === "function") {
    window.addCleanup(cleanup)
  }
}
