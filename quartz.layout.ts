import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { contactLinks } from "./quartz/contactLinks"
import { SimpleSlug } from "./quartz/util/path"

// Pages with a hand-authored hero component that replaces the generic
// breadcrumbs/title/meta chrome (Landing, AboutHero, ContactCards).
const CUSTOM_HERO_SLUGS = ["index", "About-me", "Contact"]
const isCustomHeroPage = (slug: string | undefined) => CUSTOM_HERO_SLUGS.includes(slug ?? "")

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.SiteHeader(), Component.Darkmode(), Component.ReadingProgress()],
  footer: Component.Footer({
    iconLinks: contactLinks,
  }),
  afterBody: [
    Component.SpaceBackground(),
    Component.MagnetCursor(),
    Component.Comments({
      provider: "remark42",
      options: {
        host: "https://comments.suryaansh.dev",
        site_id: "suryaansh",
        // simple_view: true,
        no_footer: true,
      },
    }),
  ],
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Landing(),
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "",
        limit: 4,
        showTags: false,
        linkToMore: "Blogs" as SimpleSlug,
        filter: (f) => (f.slug ?? "").startsWith("Blogs/") && !(f.slug ?? "").endsWith("/index"),
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.LandingGraphTeaser(),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: { depth: -1, showTags: true },
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.LandingFooterQuote(),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => !isCustomHeroPage(page.fileData.slug),
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => !isCustomHeroPage(page.fileData.slug),
    }),
    Component.ConditionalRender({
      component: Component.AudioPlayer(),
      condition: (page) => !isCustomHeroPage(page.fileData.slug),
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => !isCustomHeroPage(page.fileData.slug),
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) => !isCustomHeroPage(page.fileData.slug),
    }),
    Component.AboutHero(),
    Component.ContactCards(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph({
      localGraph: {
        depth: 1,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
