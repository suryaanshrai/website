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
        title: {
          name: "Fraunces",
          weights: [400, 600, 800],
          includeItalic: true,
        },
        header: "Schibsted Grotesk",
        body: "Schibsted Grotesk",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          // slightly translucent surfaces so the Sunlit background can breathe
          light: "rgba(255, 253, 250, 0.70)",
          lightgray: "rgba(229, 229, 229, 0.65)",
          gray: "rgba(184, 184, 184, 0.75)",
          darkgray: "#2b2b2b",
          dark: "#0f131c",

          // warm/cool accents closer to Sunlit
          secondary: "#2b5b6f",
          tertiary: "#db7a2a",

          highlight: "rgba(252, 204, 131, 0.18)",
          textHighlight: "rgba(252, 204, 131, 0.45)",
        },
        darkMode: {
          light: "rgba(15, 19, 28, 0.62)",
          lightgray: "rgba(40, 49, 63, 0.55)",
          gray: "rgba(100, 100, 100, 0.75)",
          darkgray: "#e6e8ee",
          dark: "#fffdfa",

          secondary: "#9fb3bf",
          tertiary: "#fccc83",

          highlight: "rgba(252, 204, 131, 0.14)",
          textHighlight: "rgba(252, 204, 131, 0.32)",
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
