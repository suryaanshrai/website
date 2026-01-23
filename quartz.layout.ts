import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    iconLinks: [
      {
        label: "Topmate",
        href: "https://topmate.io/suryaanshrai/",
        src: "/static/topmate.png",
        external: true,
        spinOnHover: true,
      },
      {
        label: "Resume",
        href: "https://resume.suryaansh.dev/",
        src: "/static/resume.gif",
        external: true,
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/suryaansh-rai/",
        src: "/static/Linkedin.gif",
        external: true,
      },
      {
        label: "Email",
        href: "mailto:contact@suryaansh.dev",
        src: "/static/mail.gif",
        external: false,
        size: "large",
      },
      {
        label: "RSS",
        href: "/index.xml",
        src: "/static/rss.gif",
        external: false,
        size: "large",
      },
    ],
  }),
  afterBody: [
    Component.SunlitBackground(),
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
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.AudioPlayer(),
    Component.ContentMeta(),
    Component.TagList(),
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
