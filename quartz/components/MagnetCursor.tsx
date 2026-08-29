import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/magnetCursor.inline"
// @ts-ignore
import styles from "./styles/magnetCursor.scss"

const MagnetCursor: QuartzComponent = () => {
  return <div class="magnet-cursor" id="magnet-cursor" aria-hidden="true" />
}

MagnetCursor.afterDOMLoaded = script
MagnetCursor.css = styles

export default (() => MagnetCursor) satisfies QuartzComponentConstructor
