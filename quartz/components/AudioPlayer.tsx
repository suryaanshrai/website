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
  // Convert: content/🌹Poetry/The Fallen Rose.md -> /static/audios/🌹Poetry/The Fallen Rose.mp3
  const filePath = fileData.filePath || ""

  // Extract the relative path from the content folder and change extension
  // filePath typically looks like "content/folder/file.md"
  // Strip "?", which Windows filenames can't hold, so the TTS output drops it.
  // "!" is kept: the generated files keep it ("...Actually Help!!!!!.mp3").
  const audioPath = filePath
    .replace(/^content\//, "static/audios/") // Replace content/ with static/audios/
    .replace(/\?/g, "")
    .replace(/\.md$/, ".mp3") // Replace .md extension with .mp3

  // Encode the path for URL usage while preserving directory structure
  const encodedPath =
    "/" +
    audioPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")

  return (
    // `inert` (not aria-hidden) while collapsed: it also keeps the play button
    // and seek bar out of the tab order. The script lifts it once the file exists.
    <div
      class={classNames(displayClass, "audio-player-container")}
      data-audio-base-path={audioPath}
      inert
    >
      <button type="button" class="audio-toggle" aria-label="Play audio narration" data-magnet>
        <svg class="audio-icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg class="audio-icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
      </button>
      <input
        type="range"
        class="audio-track"
        min="0"
        max="100"
        step="0.1"
        value="0"
        aria-label="Seek narration"
        aria-valuetext="0:00 of 0:00"
      />
      <span class="audio-time" aria-hidden="true">
        0:00 / 0:00
      </span>
      <span class="audio-label" aria-hidden="true">
        LISTEN
      </span>
      <audio preload="metadata" class="audio-player" data-expected-src={encodedPath}>
        <source src={encodedPath} type="audio/mpeg" />
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

/* A native range input drawn as the design's 3px bar: the played part is a
   gradient sized by --pct, and the thumb only shows on hover or keyboard focus. */
.audio-track {
  --pct: 0%;
  flex: 1;
  min-width: 0;
  /* Taller hit area than the 3px it draws. */
  height: 16px;
  margin: 0;
  appearance: none;
  cursor: pointer;
  background:
    linear-gradient(90deg, var(--secondary), var(--tertiary)) 0 50% / var(--pct) 3px no-repeat,
    linear-gradient(var(--qz-audio-panel), var(--qz-audio-panel)) 0 50% / 100% 3px no-repeat;
}
.audio-track::-webkit-slider-thumb {
  appearance: none;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--secondary);
  opacity: 0;
}
.audio-track::-moz-range-thumb {
  width: 11px;
  height: 11px;
  border: 0;
  border-radius: 50%;
  background: var(--secondary);
  opacity: 0;
}
.audio-track:is(:hover, :focus-visible)::-webkit-slider-thumb {
  opacity: 1;
}
.audio-track:is(:hover, :focus-visible)::-moz-range-thumb {
  opacity: 1;
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
