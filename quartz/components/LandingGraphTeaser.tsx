import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/landingGraph.inline"
// @ts-ignore
import styles from "./styles/landingGraph.scss"

// The graph plugin's own globalGraph defaults (quartz.config.yaml sets no
// graph options), as it emits them on article pages.
// shortcut: duplicated, not read from the plugin; update it if graph options are ever configured.
const GLOBAL_GRAPH_CFG = JSON.stringify({
  drag: true,
  zoom: true,
  depth: -1,
  scale: 0.9,
  repelForce: 0.5,
  centerForce: 0.2,
  linkDistance: 30,
  fontSize: 0.6,
  opacityScale: 1,
  showTags: true,
  removeTags: [],
  focusOnHover: true,
  enableRadial: true,
})

const LandingGraphTeaser: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null

  return (
    <section class="landing-section landing-graph-section">
      <div class="landing-graph-copy">
        <h2>
          Everything here is <span class="landing-italic">linked</span> to something else.
        </h2>
        <p>
          Notes reference notes. A blog about Dostoevsky sits a hop away from a poem, which sits a
          hop away from a piece on router registration. The graph is the point — drag it around.
        </p>
        {/* The graph plugin wires every `.global-graph-icon` to open every
            `.global-graph-outer` on the page (and closes it on Esc or an
            outside click). The home page has no rails, so the section carries
            its own overlay for the plugin to render into. */}
        <button type="button" class="landing-section-link global-graph-icon" data-magnet>
          OPEN THE GRAPH →
        </button>
      </div>
      <div class="landing-graph-canvas" data-landing-graph>
        <div class="landing-graph-label" data-graph-label>
          GRAPH
        </div>
      </div>
      {/* Outside the revealed blocks: their transforms would trap this
          position: fixed overlay inside them. */}
      <div class="graph landing-global-graph">
        <div class="global-graph-outer">
          <div class="global-graph-container" data-cfg={GLOBAL_GRAPH_CFG} />
        </div>
      </div>
    </section>
  )
}

LandingGraphTeaser.afterDOMLoaded = script
LandingGraphTeaser.css = styles

export default (() => LandingGraphTeaser) satisfies QuartzComponentConstructor
