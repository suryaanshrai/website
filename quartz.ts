import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { PageTypes } from "./quartz/plugins"
import * as Component from "./quartz/components"
import { Darkmode } from "@quartz-community/darkmode"
import { Search } from "@quartz-community/search"
import { ReaderMode } from "@quartz-community/reader-mode"
import { contactLinks } from "./quartz/contactLinks"

const config = await loadQuartzConfig()

const base = await loadQuartzLayout()
const contentBase = base.byPageType.content ?? base.defaults

const HEADER = [
  Component.SiteHeader(),
  Search({ enablePreview: true }),
  Darkmode(),
  ReaderMode(),
  Component.ReadingProgress(),
]
const FOOTER = [Component.Footer({ iconLinks: contactLinks })]
const GLOBAL_AFTER_BODY = [
  Component.MobileNav(),
  Component.SpaceBackground(),
  Component.MagnetCursor(),
  Component.Comments({
    provider: "remark42",
    options: {
      host: "https://comments.suryaansh.dev",
      site_id: "suryaansh",
      no_footer: true,
    },
  }),
]

export const layout = await loadQuartzLayout({
  defaults: {
    header: HEADER,
    footer: FOOTER,
  },
  byPageType: {
    content: {
      beforeBody: [
        Component.Landing(),
        Component.RecentWriting(),
        Component.LandingGraphTeaser(),
        Component.LandingFooterQuote(),
        ...(contentBase.beforeBody ?? []),
        Component.AudioPlayer(),
        Component.AboutHero(),
        Component.ContactCards(),
      ],
      afterBody: [...(contentBase.afterBody ?? []), ...GLOBAL_AFTER_BODY],
    },
  },
})

// `resolveLayout()` (in the page-type dispatcher) always finds a concrete — if empty —
// header/footer array already baked into `byPageType[pageType]` by config-loader's
// structural backfill, so `defaults.header`/`defaults.footer` above are otherwise
// unreachable for every real page type. Stamp them explicitly. Also extend the shared
// afterBody effects (background, cursor, comments) to non-content page types, matching
// the v4 site-wide `sharedPageComponents.afterBody` behavior; `content` already has them.
for (const [pageType, pt] of Object.entries(layout.byPageType)) {
  pt.header = HEADER
  pt.footer = FOOTER
  // Every page type renders through the site's own shell (quartz/components/
  // frames/SiteFrame.tsx) rather than Quartz's three-column grid. See that file
  // for why: the stock frame nests the top rail inside the middle grid column.
  pt.frame = "site"
  if (pageType !== "content") {
    pt.afterBody = [...(pt.afterBody ?? []), ...GLOBAL_AFTER_BODY]
  }
}

// Folder titles in the vault are prefixed with an Obsidian emoji ("⚙️Projects",
// "👨‍💻Blogs", "📡Contact"). At the design's editorial scale the page title is set
// at up to 5rem, so a leading emoji renders as a ~60px colour glyph next to the
// serif — and the same character then repeats through the breadcrumb, the browser
// tab, the index rows and the OG image. The approved design has no emoji in any
// of that chrome, so strip the prefix once, at the source, and every consumer of
// `frontmatter.title` agrees.
//
// Only *leading* pictographs are removed, and only when something is left over:
// a title that is entirely emoji ("❌ ⭕ ❌") is a deliberate name and is kept
// exactly as written. Body text is untouched.
const LEADING_PICTOGRAPHS = /^(?:[\p{Extended_Pictographic}‍️︎⃣]|[\u{1F1E6}-\u{1F1FF}])+\s*/u

function stripLeadingEmoji(title: string): string {
  const stripped = title.replace(LEADING_PICTOGRAPHS, "").trim()
  return stripped.length > 0 ? stripped : title
}

config.plugins.transformers.push({
  name: "SiteTitleNormalizer",
  markdownPlugins() {
    return [
      () => (_tree: unknown, file: { data: { frontmatter?: { title?: string } } }) => {
        const frontmatter = file.data.frontmatter
        if (typeof frontmatter?.title === "string") {
          frontmatter.title = stripLeadingEmoji(frontmatter.title)
        }
      },
    ]
  },
})

// `loadQuartzConfig()` already baked a `PageTypeDispatcher` built from the plain
// `quartz.config.yaml` layout into `config.plugins.emitters`. Swap it for one built
// from our overridden `layout` so the TS-level customizations above actually render.
const dispatcherIndex = config.plugins.emitters.findIndex((e) => e.name === "PageTypeDispatcher")
if (dispatcherIndex !== -1) {
  config.plugins.emitters[dispatcherIndex] = PageTypes.PageTypeDispatcher({
    defaults: layout.defaults,
    byPageType: layout.byPageType,
  })
}

export default config
