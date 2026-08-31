import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"

const Header = HeaderConstructor()

/**
 * The site's own page shell, replacing Quartz's three-column CSS grid.
 *
 * The stock `default` frame nests the header inside the middle grid column, so
 * on a 1500px-capped page with a 320px explorer rail the top bar only ever got
 * ~850px and its nav wrapped onto a second line inside a narrow rounded box.
 * The approved design has no such box: the rail is full-bleed and sticky, and
 * the page under it is a single centred column that widens to 1560px.
 *
 * Structure emitted here:
 *
 *   header.site-rail            full-bleed, sticky, brand / nav / controls
 *   main.site-main              max-width 1560, the design's page padding
 *     .site-lede                beforeBody — breadcrumb, title, meta, tags
 *     .site-body                the reading grid
 *       aside.site-aside-left   CONTENTS (table of contents)
 *       .site-column            article + afterBody
 *       aside.site-aside-right  LINKED FROM / LOCAL GRAPH
 *   footer
 *
 * Both asides are always emitted and are collapsed by CSS when their slot is
 * empty, so `.site-body` has the same child shape on every page type — see the
 * comment at the markup below for why that matters to SPA navigation.
 */

/**
 * Pages whose whole layout is hand-authored (the landing hero and index, the
 * About long-form column, the Contact card grid). They are all `content` pages
 * as far as the layout config is concerned, so the rails can't be dropped per
 * page type — but the design gives none of them a table of contents, a backlinks
 * list or a graph, and rendering the rails anyway left an empty 300px gutter and
 * a stray graph panel floating beside the comments.
 */
const OWN_LAYOUT: ReadonlySet<string> = new Set(["index", "about-me", "contact"])

export const SiteFrame: PageFrame = {
  name: "site",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer,
  }: PageFrameProps) {
    const railless = OWN_LAYOUT.has(componentData.fileData.slug ?? "")
    const hasLeft = !railless && left.length > 0
    const hasRight = !railless && right.length > 0
    const bodyClass = ["site-body", hasLeft ? "has-contents" : null, hasRight ? "has-aside" : null]
      .filter(Boolean)
      .join(" ")

    return (
      <>
        {/* First thing in the tab order on every page: without it a keyboard
            user walks the wordmark, seven nav pills and four controls before
            reaching a single word of the article. */}
        <a href="#site-content" class="site-skip-link">
          Skip to content
        </a>
        <div class="page-header site-rail">
          <Header {...componentData}>
            {header.map((HeaderComponent) => (
              <HeaderComponent {...componentData} />
            ))}
          </Header>
        </div>
        <main class="site-main">
          <div class="popover-hint site-lede">
            {beforeBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
          {/* Both rails are ALWAYS emitted, empty when unused, and collapsed by
              CSS (`.site-body:not(.has-contents) > .site-aside-left`). Emitting
              them conditionally changed the child list of `.site-body` between
              page types — one child on a folder page, three on an article — and
              the SPA morph diffs children positionally, so navigating from a
              folder into an article rebuilt this entire subtree. That destroyed
              and replaced the background canvas living in `.page-footer` below,
              which is why the starfield vanished on exactly that navigation.
              Keeping the shape constant gives the morph nothing to rebuild. */}
          <div class={bodyClass}>
            <aside class="site-aside site-aside-left">
              {hasLeft && left.map((BodyComponent) => <BodyComponent {...componentData} />)}
            </aside>
            <div class="site-column center" id="site-content" tabIndex={-1}>
              <Content {...componentData} />
              <div class="page-footer">
                {afterBody.map((BodyComponent) => (
                  <BodyComponent {...componentData} />
                ))}
              </div>
            </div>
            <aside class="site-aside site-aside-right">
              {hasRight && right.map((BodyComponent) => <BodyComponent {...componentData} />)}
            </aside>
          </div>
        </main>
        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}
      </>
    )
  },
}
