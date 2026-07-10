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
        header: "Outfit",
        body: "Space Grotesk",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#f7f5fa",
          lightgray: "#eae5f4",
          gray: "#9c8eb9",
          darkgray: "#2b1e3e",
          dark: "#0d0814",
          secondary: "#4a4e8f", // Cosmic Blue
          tertiary: "#8b5cf6",
          highlight: "rgba(74, 78, 143, 0.1)",
          textHighlight: "rgba(74, 78, 143, 0.2)",
        },
        darkMode: {
          light: "#090514", // Deep obsidian space background
          lightgray: "#171126", // Dark purple panels
          gray: "#514375", // Nebula grey
          darkgray: "#d3c2eb", // Nebula silver / lavender
          dark: "#ffffff", // Pure white headers
          secondary: "#a490c2", // Soft Lavender links/accents
          tertiary: "#00f2fe", // Cosmic Cyan highlights
          highlight: "rgba(164, 144, 194, 0.15)",
          textHighlight: "rgba(0, 242, 254, 0.3)",
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
