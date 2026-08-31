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
 * Both asides are omitted from the markup entirely when their slot is empty, so
 * the grid collapses to a single column on list and landing pages instead of
 * reserving dead gutters.
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
          <div class={bodyClass}>
            {hasLeft && (
              <aside class="site-aside site-aside-left">
                {left.map((BodyComponent) => (
                  <BodyComponent {...componentData} />
                ))}
              </aside>
            )}
            <div class="site-column center">
              <Content {...componentData} />
              <div class="page-footer">
                {afterBody.map((BodyComponent) => (
                  <BodyComponent {...componentData} />
                ))}
              </div>
            </div>
            {hasRight && (
              <aside class="site-aside site-aside-right">
                {right.map((BodyComponent) => (
                  <BodyComponent {...componentData} />
                ))}
              </aside>
            )}
          </div>
        </main>
        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}
      </>
    )
  },
}
