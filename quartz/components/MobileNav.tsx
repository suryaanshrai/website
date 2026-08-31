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

  return (
    <div class="site-mobile-nav" id="site-mobile-nav" aria-hidden="true">
      <div class="site-mobile-nav-top">
        <a href={home} class="site-mobile-nav-brand" aria-label="Home">
          <span class="site-header-name">suryaansh</span>
          <span class="site-header-tld">.DEV</span>
        </a>
        <button
          type="button"
          class="site-mobile-nav-close"
          id="site-mobile-nav-close"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>
      <nav class="site-mobile-nav-links">
        {NAV_ITEMS.map((item) => (
          <a
            href={resolveRelative(currentSlug, item.slug)}
            class={`site-mobile-nav-link ${isActive(currentSlug, item.slug) ? "active" : ""}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

MobileNav.css = styles
MobileNav.afterDOMLoaded = script

export default (() => MobileNav) satisfies QuartzComponentConstructor
