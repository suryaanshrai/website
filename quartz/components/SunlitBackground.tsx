import { QuartzComponent, QuartzComponentConstructor } from "./types"
import styles from "./styles/sunlitBackground.scss"

const SunlitBackground: QuartzComponent = () => {
  // NOTE: This is intentionally decorative only.
  // It is positioned `fixed` and placed behind all content via CSS.
  return (
    <div id="sunlit-bg" data-persist="" aria-hidden="true">
      <div class="sunlit-stage">
        <div class="sunlit-glow" />
        <div class="sunlit-glow-bounce" />

        <div class="sunlit-perspective">
          <div class="sunlit-dapple" />

          <div class="sunlit-blinds" aria-hidden="true">
            <div class="sunlit-shutters">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div class="sunlit-shutter" key={idx} />
              ))}
            </div>
            <div class="sunlit-vertical">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div class="sunlit-bar" key={idx} />
              ))}
            </div>
          </div>
        </div>

        <div class="sunlit-progressive-blur" aria-hidden="true">
          <div />
          <div />
          <div />
          <div />
        </div>

        <svg class="sunlit-filters" aria-hidden="true" focusable="false">
          <defs>
            <filter id="sunlit-noise" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" numOctaves="2" seed="7"></feTurbulence>
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.25 0" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  )
}

SunlitBackground.css = styles

export default (() => SunlitBackground) satisfies QuartzComponentConstructor
