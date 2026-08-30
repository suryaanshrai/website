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
    .replace(/^content\//, "static/audios/") // Replace content/ with static/audios/
    .replace(/[?!]/g, "") // Remove special characters like ? and !
    .replace(/\.md$/, ".mp3") // Replace .md extension with .wav

  // Encode the path for URL usage while preserving directory structure
  const encodedPath =
    "/" +
    audioPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")

  return (
    <div
      class={classNames(displayClass, "audio-player-container")}
      data-audio-base-path={audioPath}
      aria-hidden="true"
    >
      <button type="button" class="audio-toggle" aria-label="Play audio narration" data-magnet>
        <svg class="audio-icon-play" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg class="audio-icon-pause" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
      </button>
      <div class="audio-track">
        <div class="audio-track-fill"></div>
      </div>
      <span class="audio-time">0:00 / 0:00</span>
      <span class="audio-label">LISTEN</span>
      <audio preload="metadata" class="audio-player" data-expected-src={encodedPath}>
        <source src={encodedPath} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

AudioPlayer.css = `
.audio-player-container {
  margin: 1rem 0;
  color: var(--darkgray);
  /* Hidden by default; revealed via JS by toggling .qz-audio-visible */
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  background: var(--qz-audio-panel);
  border: 1px solid var(--qz-border);
  border-radius: 999px;
  box-shadow: none;
  max-width: 560px;
  box-sizing: border-box;

  /* Smooth reveal without layout “pop” */
  opacity: 0;
  transform: translateY(4px);
  max-height: 0;
  overflow: clip;
  pointer-events: none;
  transition:
    opacity 220ms ease,
    transform 220ms ease,
    max-height 260ms ease,
    padding 260ms ease,
    margin 260ms ease;
  will-change: opacity, transform, max-height;
}

.audio-player-container.qz-audio-visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 80px;
  padding: 12px 18px;
  margin: 1rem 0;
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .audio-player-container {
    transition: none;
  }
}

.audio-player {
  display: none;
}

.audio-toggle {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: none;
  background: var(--dark);
  color: var(--light);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }

  .audio-icon-pause {
    display: none;
  }

  &.is-playing {
    .audio-icon-play {
      display: none;
    }
    .audio-icon-pause {
      display: block;
    }
  }
}

.audio-track {
  flex: 1;
  height: 3px;
  border-radius: 99px;
  background: var(--qz-audio-panel);
  position: relative;
  overflow: hidden;
}

.audio-track-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0%;
  background: linear-gradient(90deg, var(--secondary), var(--tertiary));
  border-radius: 99px;
}

.audio-time {
  font-family: var(--codeFont);
  font-size: 0.68rem;
  color: var(--gray);
  white-space: nowrap;
}

.audio-label {
  font-family: var(--codeFont);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: var(--gray);
}
`

AudioPlayer.afterDOMLoaded = audioplayerScript

export default (() => AudioPlayer) satisfies QuartzComponentConstructor
