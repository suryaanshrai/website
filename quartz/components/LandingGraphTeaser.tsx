import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const LandingGraphTeaser: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null

  return (
    <section class="landing-section landing-graph-teaser">
      <h2>
        Everything here is <span class="landing-italic">linked</span> to something else.
      </h2>
      <p>
        Notes reference notes. A blog about Dostoevsky sits a hop away from a poem, which sits a hop
        away from a piece on router registration. The graph is the point — drag it around.
      </p>
      <a href="#" class="landing-section-link" id="landing-open-graph" data-magnet>
        OPEN THE GRAPH →
      </a>
    </section>
  )
}

LandingGraphTeaser.css = `
.landing-graph-teaser {
  max-width: 1560px;
  margin: 0 auto;
  padding: 0 40px 20px;
  box-sizing: border-box;

  h2 {
    font-family: var(--titleFont);
    font-weight: 400;
    font-size: clamp(1.9rem, 3.6vw, 2.6rem);
    line-height: 1.15;
    margin: 0 0 16px;
    color: var(--dark);
  }

  .landing-italic {
    font-style: italic;
    color: var(--secondary);
  }

  p {
    max-width: 60ch;
    font-size: 1rem;
    line-height: 1.75;
    color: var(--darkgray);
    margin: 0 0 18px;
  }
}
`

export default (() => LandingGraphTeaser) satisfies QuartzComponentConstructor
