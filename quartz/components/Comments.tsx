import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import giscusScript from "./scripts/comments.inline"
// @ts-ignore
import remark42Script from "./scripts/remark42.inline"

type Options =
  | {
    provider: "giscus"
    options: {
      repo: `${string}/${string}`
      repoId: string
      category: string
      categoryId: string
      themeUrl?: string
      lightTheme?: string
      darkTheme?: string
      mapping?: "url" | "title" | "og:title" | "specific" | "number" | "pathname"
      strict?: boolean
      reactionsEnabled?: boolean
      inputPosition?: "top" | "bottom"
      lang?: string
    }
  }
  | {
    provider: "remark42"
    options: {
      host: string
      site_id: string
      no_footer?: boolean
      simple_view?: boolean
    }
  }

function boolToStringBool(b: boolean): string {
  return b ? "1" : "0"
}

export default ((opts: Options) => {
  const Comments: QuartzComponent = ({ displayClass, fileData, cfg }: QuartzComponentProps) => {
    // check if comments should be displayed according to frontmatter
    const disableComment: boolean =
      (typeof fileData.frontmatter?.comments !== "undefined" &&
        (!fileData.frontmatter?.comments || fileData.frontmatter?.comments === "false")) ||
      fileData.frontmatter?.["disable-comments"] === true ||
      fileData.frontmatter?.["disable-comments"] === "true"

    if (disableComment) {
      return <></>
    }

    if (opts.provider === "remark42") {
      return (
        <div
          class={classNames(displayClass, "remark42")}
          id="remark42"
          data-host={opts.options.host}
          data-site-id={opts.options.site_id}
          data-no-footer={boolToStringBool(opts.options.no_footer ?? false)}
          data-simple-view={boolToStringBool(opts.options.simple_view ?? false)}
        ></div>
      )
    }

    return (
      <div
        class={classNames(displayClass, "giscus")}
        data-repo={opts.options.repo}
        data-repo-id={opts.options.repoId}
        data-category={opts.options.category}
        data-category-id={opts.options.categoryId}
        data-mapping={opts.options.mapping ?? "url"}
        data-strict={boolToStringBool(opts.options.strict ?? true)}
        data-reactions-enabled={boolToStringBool(opts.options.reactionsEnabled ?? true)}
        data-input-position={opts.options.inputPosition ?? "bottom"}
        data-light-theme={opts.options.lightTheme ?? "light"}
        data-dark-theme={opts.options.darkTheme ?? "dark"}
        data-theme-url={
          opts.options.themeUrl ?? `https://${cfg.baseUrl ?? "example.com"}/static/giscus`
        }
        data-lang={opts.options.lang ?? "en"}
      ></div>
    )
  }

  Comments.afterDOMLoaded = opts.provider === "remark42" ? remark42Script : giscusScript

  return Comments
}) satisfies QuartzComponentConstructor<Options>
