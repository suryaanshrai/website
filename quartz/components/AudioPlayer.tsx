import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import audioplayerScript from "./scripts/audioplayer.inline"


const AudioPlayer: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    // Only show audio player if the page has the generate-audio flag set to "true"
    const hasAudio = fileData.frontmatter?.["generate-audio"] === "true"

    if (!hasAudio) {
        return null
    }

    // Construct the audio file path based on the content file path
    // Convert: content/🌹Poetry/The Fallen Rose.md -> /static/audios/🌹Poetry/The Fallen Rose.wav
    const filePath = fileData.filePath || ""

    // Extract the relative path from the content folder and change extension
    // filePath typically looks like "content/folder/file.md"
    // Strip special characters that don't exist in audio filenames (?, !, etc.)
    const audioPath = filePath
        .replace(/^content\//, "static/audios/")  // Replace content/ with static/audios/
        .replace(/[?!]/g, "")                      // Remove special characters like ? and !
        .replace(/\.md$/, ".wav")                  // Replace .md extension with .wav

    // Encode the path for URL usage while preserving directory structure
    const encodedPath = "/" + audioPath
        .split("/")
        .map(segment => encodeURIComponent(segment))
        .join("/")

    return (
        <div class={classNames(displayClass, "audio-player-container")} data-audio-base-path={audioPath}>
            <audio
                controls
                preload="metadata"
                class="audio-player"
                data-expected-src={encodedPath}
            >
                <source src={encodedPath} type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
        </div>
    )
}

AudioPlayer.css = `
.audio-player-container {
  margin: 1rem 0;
  display: none; /* Initially hidden - script will show it if audio file exists */
  align-items: center;
}

.audio-player {
  width: 100%;
  max-width: 500px;
  height: 40px;
  outline: none;
}

.audio-player::-webkit-media-controls-panel {
  background-color: var(--lightgray);
}

.audio-player::-webkit-media-controls-play-button,
.audio-player::-webkit-media-controls-current-time-display,
.audio-player::-webkit-media-controls-time-remaining-display {
  color: var(--dark);
}

/* Dark mode support */
:root[saved-theme="dark"] .audio-player::-webkit-media-controls-panel {
  background-color: var(--darkgray);
}

:root[saved-theme="dark"] .audio-player::-webkit-media-controls-play-button,
:root[saved-theme="dark"] .audio-player::-webkit-media-controls-current-time-display,
:root[saved-theme="dark"] .audio-player::-webkit-media-controls-time-remaining-display {
  color: var(--light);
}

@media (max-width: 600px) {
  .audio-player {
    max-width: 100%;
  }
}
`

AudioPlayer.afterDOMLoaded = audioplayerScript

export default (() => AudioPlayer) satisfies QuartzComponentConstructor
