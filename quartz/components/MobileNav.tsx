import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { NAV_ITEMS, isActive } from "./SiteHeader"
// @ts-ignore
import script from "./scripts/mobileNav.inline"
// @ts-ignore
import styles from "./styles/mobileNav.scss"

const MobileNav: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const currentSlug = fileData.slug ?? ("index" as FullSlug)
  const home = resolveRelative(currentSlug, "index" as FullSlug)

  // A native modal <dialog>: the browser provides the inert page, focus
  // containment, Esc, and focus return to the menu button on close.
  return (
    <dialog class="site-mobile-nav" id="site-mobile-nav" aria-label="Site menu">
      <div class="site-mobile-nav-top">
        <a href={home} class="site-mobile-nav-brand" aria-label="Home">
          <span class="site-header-name">suryaansh</span>
          <span class="site-header-tld">.DEV</span>
        </a>
        <form method="dialog" class="site-mobile-nav-close-form">
          <button class="site-mobile-nav-close" aria-label="Close menu" autofocus>
            ✕
          </button>
        </form>
      </div>
      <nav class="site-mobile-nav-links" aria-label="Sections">
        {NAV_ITEMS.map((item) => {
          const active = isActive(currentSlug, item.slug)
          return (
            <a
              href={resolveRelative(currentSlug, item.slug)}
              class={`site-mobile-nav-link ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </a>
          )
        })}
      </nav>
    </dialog>
  )
}

MobileNav.css = styles
MobileNav.afterDOMLoaded = script

export default (() => MobileNav) satisfies QuartzComponentConstructor
