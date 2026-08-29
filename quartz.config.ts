import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "suryaansh.dev",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "suryaansh.dev",
    ignorePatterns: [],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: { name: "Instrument Serif", weights: [400], includeItalic: true },
        body: { name: "Space Grotesk", weights: [300, 400, 500, 600, 700] },
        code: { name: "JetBrains Mono", weights: [400, 500] },
      },
      colors: {
        lightMode: {
          light: "#f6f2ea", // void (paper)
          lightgray: "#ece4d6",
          gray: "#8b8298", // faint
          darkgray: "#554d64", // muted
          dark: "#16121c", // ink
          secondary: "#6d3fb0", // violet
          tertiary: "#1c7f93", // cyan
          highlight: "rgba(109, 63, 176, 0.1)",
          textHighlight: "rgba(28, 127, 147, 0.2)",
        },
        darkMode: {
          light: "#08060e", // void
          lightgray: "#140f1e",
          gray: "#6b6383", // faint
          darkgray: "#a79dbe", // muted
          dark: "#efeaf7", // ink
          secondary: "#b58cf0", // violet
          tertiary: "#56c4d8", // cyan
          highlight: "rgba(196, 178, 235, 0.14)",
          textHighlight: "rgba(86, 196, 216, 0.3)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
        includeTags: true,
        // rssFullHtml: true,
        includeEmptyFiles: false,
        rssLimit: 15,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
