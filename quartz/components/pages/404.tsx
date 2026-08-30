import { i18n } from "../../i18n"
import { FullSlug, resolveRelative } from "../../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/notFound.scss"

const NotFound: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
  // If baseUrl contains a pathname after the domain, use this as the home link
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname
  const slug = fileData.slug ?? ("404" as FullSlug)
  const blogsHref = resolveRelative(slug, "blogs" as FullSlug)

  return (
    <article class="popover-hint not-found">
      <div class="not-found-eyebrow">SIGNAL LOST · 404</div>
      <h1 class="not-found-title">
        This corner of the garden <span class="not-found-italic">isn't planted</span> yet
      </h1>
      <p class="not-found-copy">{i18n(cfg.locale).pages.error.notFound}</p>
      <div class="not-found-art">
        <img src={baseDir + "static/404.png"} alt="404 Not Found" />
        <p>Oops! Looks like you've ventured into the void.</p>
      </div>
      <div class="not-found-actions">
        <a href={baseDir} class="not-found-btn not-found-btn-primary" data-magnet>
          {i18n(cfg.locale).pages.error.home}
        </a>
        <a href={blogsHref} class="not-found-btn" data-magnet>
          Browse all notes
        </a>
      </div>
    </article>
  )
}

NotFound.css = style

export default (() => NotFound) satisfies QuartzComponentConstructor
