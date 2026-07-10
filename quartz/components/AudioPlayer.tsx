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
      <audio controls preload="metadata" class="audio-player" data-expected-src={encodedPath}>
        <source src={encodedPath} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

AudioPlayer.css = `
.audio-player-container {
  margin: 1rem 0;
  color: var(--qz-text);
  /* Hidden by default; revealed via JS by toggling .qz-audio-visible */
  display: flex;
  align-items: center;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;

  /* Smooth reveal without layout “pop” */
  opacity: 0;
  transform: translateY(4px);
  max-height: 0;
  margin: 0;
  overflow: clip;
  pointer-events: none;
  transition:
    opacity 220ms ease,
    transform 220ms ease,
    max-height 260ms ease,
    margin 260ms ease;
  will-change: opacity, transform, max-height;
}

.audio-player-container.qz-audio-visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 80px;
  margin: 1rem 0;
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .audio-player-container {
    transition: none;
  }
}

.audio-player {
  width: 100%;
  max-width: 720px;
  height: 42px;
  outline: none;
  border-radius: 999px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--qz-border) 55%, transparent);
  box-shadow: none;
  /* Ensure native controls match Quartz theme (otherwise icons/time can become unreadable) */
  color-scheme: light;
  accent-color: var(--secondary);
  transition: border-color 160ms ease, background-color 160ms ease;
}

:root[saved-theme="dark"] .audio-player {
  color-scheme: dark;
}

.audio-player:hover {
  border-color: color-mix(in srgb, var(--secondary) 35%, var(--qz-border));
}

.audio-player:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--secondary) 55%, transparent);
  outline-offset: 3px;
}

/* Chrome/Edge/Safari: style the native control surface */
.audio-player::-webkit-media-controls-enclosure {
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--qz-audio-panel) 65%, transparent);
}

.audio-player::-webkit-media-controls-panel {
  background-color: transparent;
}

.audio-player::-webkit-media-controls-play-button,
.audio-player::-webkit-media-controls-current-time-display,
.audio-player::-webkit-media-controls-time-remaining-display {
  color: var(--qz-audio-fg);
  -webkit-text-fill-color: var(--qz-audio-fg);
}

:root:not([saved-theme="dark"]) .audio-player::-webkit-media-controls-current-time-display,
:root:not([saved-theme="dark"]) .audio-player::-webkit-media-controls-time-remaining-display {
  color: var(--dark) !important;
  -webkit-text-fill-color: var(--dark) !important;
}

:root[saved-theme="dark"] .audio-player::-webkit-media-controls-current-time-display,
:root[saved-theme="dark"] .audio-player::-webkit-media-controls-time-remaining-display {
  color: var(--light) !important;
  -webkit-text-fill-color: var(--light) !important;
}

/* Dark mode support */
/* Themed via CSS variables; no separate dark-mode overrides needed */

@media (max-width: 600px) {
  .audio-player {
    max-width: 100%;
  }
}
`

AudioPlayer.afterDOMLoaded = audioplayerScript

export default (() => AudioPlayer) satisfies QuartzComponentConstructor
