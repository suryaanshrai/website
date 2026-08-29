import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/spaceBg.inline"
// @ts-ignore
import styles from "./styles/spaceBg.scss"

const SpaceBackground: QuartzComponent = () => {
  return (
    <div class="animation-container" data-persist="" aria-hidden="true">
      <canvas id="space-canvas" class="space-canvas" />
      <div class="grid-overlay" />
    </div>
  )
}

SpaceBackground.beforeDOMLoaded = script
SpaceBackground.css = styles

export default (() => SpaceBackground) satisfies QuartzComponentConstructor
