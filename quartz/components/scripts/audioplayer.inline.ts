// Script to handle audio player updates and error handling during SPA navigation

// Function to strip special characters from filename (matching server-side logic)
function cleanFilename(str: string): string {
  return str.replace(/[?!]/g, "")
}

// Function to hide audio player container
function hideAudioPlayer() {
  const container = document.querySelector(".audio-player-container") as HTMLElement | null
  if (container) {
    container.classList.remove("qz-audio-visible")
    container.setAttribute("aria-hidden", "true")
  }
}

// Function to show audio player container
function showAudioPlayer() {
  const container = document.querySelector(".audio-player-container") as HTMLElement | null
  if (container) {
    container.classList.add("qz-audio-visible")
    container.removeAttribute("aria-hidden")
  }
}

// Function to check if audio file exists and update player
async function updateAudioPlayer() {
  // ALWAYS query fresh DOM elements - never use cached references
  const audioElement = document.querySelector(".audio-player") as HTMLAudioElement | null
  const container = document.querySelector(".audio-player-container") as HTMLElement | null

  if (!audioElement || !container) return

  // Read the audio path from the data attribute set by the server
  // After micromorph, this attribute is updated with the new page's path
  const audioBasePath = container.getAttribute("data-audio-base-path")

  if (!audioBasePath) {
    // No audio for this page
    hideAudioPlayer()
    return
  }

  // Encode the path properly for URL usage
  const audioPath =
    "/" +
    audioBasePath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")

  // Test if the audio file exists before setting it
  try {
    const response = await fetch(audioPath, { method: "HEAD" })

    if (response.ok) {
      // File exists, check if we need to update the source
      const sourceElement = audioElement.querySelector("source")
      if (sourceElement) {
        // Check what is CURRENTLY loaded in the player vs what should be there
        // We use currentSrc because the DOM src attribute might have been updated by micromorph already
        // but the player won't reload unless we explicitly call load()
        const currentPlayingSrc = audioElement.currentSrc
          ? new URL(audioElement.currentSrc, window.location.origin).pathname
          : ""
        const newSrc = new URL(audioPath, window.location.origin).pathname

        // Decode both for comparison to avoid mismatch due to encoding differences
        // e.g. "%20" vs " "
        const decodedCurrent = decodeURIComponent(currentPlayingSrc)
        const decodedNew = decodeURIComponent(newSrc)

        if (decodedCurrent !== decodedNew) {
          console.log("Audio mismatch detected, reloading player:", {
            current: decodedCurrent,
            new: decodedNew,
          })

          // Pause the current audio before changing source
          audioElement.pause()

          // Reset the audio element to clear any state
          audioElement.currentTime = 0

          // Update the source attribute (in case it wasn't updated)
          sourceElement.src = audioPath

          // FORCE reload the audio element to pick up the new source
          audioElement.load()
        } else {
          console.log("Audio already matches, skipping reload")
        }
      }
      showAudioPlayer()
    } else {
      // File doesn't exist (404), hide the player
      hideAudioPlayer()
    }
  } catch (error) {
    // Error fetching, hide the player
    console.error("Error checking audio file:", error)
    hideAudioPlayer()
  }
}

// Handle audio errors
function setupErrorHandlers() {
  const audioElement = document.querySelector(".audio-player") as HTMLAudioElement | null
  if (!audioElement) return

  audioElement.addEventListener("error", () => {
    hideAudioPlayer()
  })

  audioElement.addEventListener("loadedmetadata", () => {
    // Successfully loaded, ensure player is visible
    showAudioPlayer()
  })
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

// Wire the custom play/pause button + progress fill to the real <audio> element
function setupCustomControls() {
  const container = document.querySelector(".audio-player-container") as HTMLElement | null
  const audioElement = container?.querySelector(".audio-player") as HTMLAudioElement | null
  const toggle = container?.querySelector(".audio-toggle") as HTMLButtonElement | null
  const fill = container?.querySelector(".audio-track-fill") as HTMLElement | null
  const track = container?.querySelector(".audio-track") as HTMLElement | null
  const timeLabel = container?.querySelector(".audio-time") as HTMLElement | null
  if (!container || !audioElement || !toggle || !fill || !track || !timeLabel) return

  const updateProgress = () => {
    const pct = audioElement.duration ? (audioElement.currentTime / audioElement.duration) * 100 : 0
    fill.style.width = `${pct}%`
    timeLabel.textContent = `${formatTime(audioElement.currentTime)} / ${formatTime(audioElement.duration)}`
  }

  const handleToggleClick = () => {
    if (audioElement.paused) {
      audioElement.play()
    } else {
      audioElement.pause()
    }
  }
  const handlePlay = () => toggle.classList.add("is-playing")
  const handlePause = () => toggle.classList.remove("is-playing")
  const handleSeek = (e: MouseEvent) => {
    if (!audioElement.duration) return
    const rect = track.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    audioElement.currentTime = pct * audioElement.duration
  }

  toggle.addEventListener("click", handleToggleClick)
  track.addEventListener("click", handleSeek)
  audioElement.addEventListener("play", handlePlay)
  audioElement.addEventListener("pause", handlePause)
  audioElement.addEventListener("timeupdate", updateProgress)
  audioElement.addEventListener("loadedmetadata", updateProgress)

  updateProgress()

  window.addCleanup?.(() => {
    toggle.removeEventListener("click", handleToggleClick)
    track.removeEventListener("click", handleSeek)
    audioElement.removeEventListener("play", handlePlay)
    audioElement.removeEventListener("pause", handlePause)
    audioElement.removeEventListener("timeupdate", updateProgress)
    audioElement.removeEventListener("loadedmetadata", updateProgress)
  })
}

// Initialize on page load
setupErrorHandlers()
setupCustomControls()
updateAudioPlayer()

// Pause audio immediately when navigation starts (before DOM morphing)
document.addEventListener("prenav", () => {
  const audioElement = document.querySelector(".audio-player") as HTMLAudioElement | null
  if (audioElement) {
    audioElement.pause()
  }
})

// Handle SPA navigation - update audio after DOM has been morphed
document.addEventListener("nav", () => {
  // Use requestAnimationFrame to ensure DOM is fully settled after micromorph
  requestAnimationFrame(() => {
    setupErrorHandlers()
    setupCustomControls()
    updateAudioPlayer()
  })
})
