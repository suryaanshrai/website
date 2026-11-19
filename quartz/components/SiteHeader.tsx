import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
// @ts-ignore
import script from "./scripts/siteHeader.inline"
// @ts-ignore
import styles from "./styles/siteHeader.scss"

interface NavItem {
  label: string
  slug: FullSlug
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Blogs", slug: "blogs" as FullSlug },
  { label: "Projects", slug: "projects" as FullSlug },
  { label: "Poetry", slug: "poetry" as FullSlug },
  { label: "Education", slug: "education" as FullSlug },
  { label: "Entertainment", slug: "entertainment" as FullSlug },
  { label: "About", slug: "about-me" as FullSlug },
  { label: "Contact", slug: "contact" as FullSlug },
]

export function isActive(current: string, target: string): boolean {
  return current === target || current.startsWith(`${target}/`)
}

const SiteHeader: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const currentSlug = fileData.slug ?? ("index" as FullSlug)
  const home = resolveRelative(currentSlug, "index" as FullSlug)

  return (
    <>
      <a href={home} class="site-header-brand" data-magnet aria-label="Home">
        <span class="site-header-name">suryaansh</span>
        <span class="site-header-tld">.DEV</span>
      </a>
      <nav class="site-header-nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = isActive(currentSlug, item.slug)
          return (
            <a
              href={resolveRelative(currentSlug, item.slug)}
              class={`site-header-link ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
              data-magnet
            >
              {item.label}
            </a>
          )
        })}
      </nav>
      <span class="site-header-clock" id="site-header-clock">
        --:--:-- IST
      </span>
      <button
        type="button"
        class="site-header-nav-toggle"
        id="site-header-nav-toggle"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="site-mobile-nav"
      >
        <span />
        <span />
        <span />
      </button>
    </>
  )
}

SiteHeader.css = styles
SiteHeader.afterDOMLoaded = script

export default (() => SiteHeader) satisfies QuartzComponentConstructor
