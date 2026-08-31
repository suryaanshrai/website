import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/landingGraph.inline"
// @ts-ignore
import styles from "./styles/landingGraph.scss"

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
        <a href="#" class="landing-section-link" id="landing-open-graph" data-magnet>
          OPEN THE GRAPH →
        </a>
      </div>
      <div class="landing-graph-canvas" data-landing-graph>
        <div class="landing-graph-label" data-graph-label>
          GRAPH
        </div>
      </div>
    </section>
  )
}

LandingGraphTeaser.afterDOMLoaded = script
LandingGraphTeaser.css = styles

export default (() => LandingGraphTeaser) satisfies QuartzComponentConstructor
