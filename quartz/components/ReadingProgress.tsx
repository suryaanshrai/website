import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/readingProgress.inline"

const ReadingProgress: QuartzComponent = () => {
  return <div class="reading-progress" id="reading-progress" aria-hidden="true" />
}

ReadingProgress.css = `
.reading-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: linear-gradient(90deg, var(--secondary), var(--tertiary));
  transition: width 80ms linear;
}

@media (prefers-reduced-motion: reduce) {
  .reading-progress {
    transition: none;
  }
}
`
ReadingProgress.afterDOMLoaded = script

export default (() => ReadingProgress) satisfies QuartzComponentConstructor
