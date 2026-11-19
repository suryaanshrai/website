import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/readingProgress.inline"

const ReadingProgress: QuartzComponent = () => {
  return <div class="reading-progress" id="reading-progress" aria-hidden="true" />
}

// Driven by the page's own scroll position where scroll-driven animations
// exist; the script only fills in elsewhere. Either way it is a transform, so
// scrolling never triggers layout.
ReadingProgress.css = `
.reading-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--secondary), var(--tertiary));
  transform-origin: 0 50%;
  transform: scaleX(0);
}

@supports (animation-timeline: scroll()) {
  @keyframes reading-progress-grow {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  .reading-progress {
    animation: reading-progress-grow auto linear both;
    animation-timeline: scroll(root block);
  }
}
`
ReadingProgress.afterDOMLoaded = script

export default (() => ReadingProgress) satisfies QuartzComponentConstructor
