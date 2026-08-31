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
  if (pageType !== "content") {
    pt.afterBody = [...(pt.afterBody ?? []), ...GLOBAL_AFTER_BODY]
  }
}

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
