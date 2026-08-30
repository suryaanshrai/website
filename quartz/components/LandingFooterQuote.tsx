import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const LandingFooterQuote: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null

  return (
    <div class="landing-footer-quote">
      <p>&ldquo;The quieter you become, the more you are able to hear.&rdquo;</p>
      <span>— RUMI</span>
    </div>
  )
}

LandingFooterQuote.css = `
.landing-footer-quote {
  max-width: 1560px;
  margin: 0 auto;
  padding: 40px 40px 0;
  box-sizing: border-box;
  border-top: 1px solid var(--lightgray);

  p {
    font-family: var(--titleFont);
    font-size: 1.4rem;
    line-height: 1.3;
    color: var(--dark);
    margin: 0 0 8px;
  }

  span {
    font-family: var(--codeFont);
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    color: var(--gray);
  }
}
`

export default (() => LandingFooterQuote) satisfies QuartzComponentConstructor
