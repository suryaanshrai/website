import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import styles from "./styles/landing.scss"

const Landing: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  // Only render this component on the index page
  if (fileData.slug !== "index") return null

  return (
    <div class="portal-wrapper notranslate">
      {/* 1. Interactive Custom Cursor (with Snapping Ring and Inertial Dot) */}
      <div class="portal-cursor" id="portal-cursor">
        <div class="portal-cursor-ring" id="portal-cursor-ring" />
        <div class="portal-cursor-dot" />
      </div>

      {/* 2. Main Layout Container */}
      <div class="portal-container">
        {/* Left column: Hero Title & Description */}
        <div class="portal-hero">
          <div class="hero-intro">WORKSPACE INDEX // V4.8</div>
          <h1 class="hero-brand" id="hero-brand">
            SURYAANSH RAI
          </h1>
          <p class="hero-tagline">
            A digital garden harboring software builds, curated thoughts, poetry, and technical notes, floating in a clean WebGL workspace.
          </p>
          <div class="hero-status">
            <span class="status-indicator"></span>
            SYSTEM STATUS: ONLINE
          </div>
        </div>

        {/* Right column: Typographic Navigation List */}
        <nav class="portal-nav">
          <ul class="nav-list">
            <li class="nav-item" data-preview-id="prev-projects">
              <a href="/Projects" class="nav-link">
                <span class="link-num">01</span>
                <span class="link-text">PROJECT ARCHIVE</span>
                <span class="link-arrow">↗</span>
              </a>
            </li>
            <li class="nav-item" data-preview-id="prev-poetry">
              <a href="/Poetry" class="nav-link">
                <span class="link-num">02</span>
                <span class="link-text">SELECTED POETRY</span>
                <span class="link-arrow">↗</span>
              </a>
            </li>
            <li class="nav-item" data-preview-id="prev-blogs">
              <a href="/Blogs" class="nav-link">
                <span class="link-num">03</span>
                <span class="link-text">WRITTEN THOUGHTS</span>
                <span class="link-arrow">↗</span>
              </a>
            </li>
            <li class="nav-item" data-preview-id="prev-entertainment">
              <a href="/Entertainment" class="nav-link">
                <span class="link-num">04</span>
                <span class="link-text">CHRONICLES & REVIEWS</span>
                <span class="link-arrow">↗</span>
              </a>
            </li>
            <li class="nav-item" data-preview-id="prev-about">
              <a href="/About-me" class="nav-link">
                <span class="link-num">05</span>
                <span class="link-text">METADATA (ABOUT)</span>
                <span class="link-arrow">↗</span>
              </a>
            </li>
            <li class="nav-item" data-preview-id="prev-contact">
              <a href="mailto:contact@suryaansh.dev" class="nav-link">
                <span class="link-num">06</span>
                <span class="link-text">SEND TRANSMISSION</span>
                <span class="link-arrow">✉</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* 3. Floating Preview Cards (Glassmorphic Terminal Panels) */}
      <div class="portal-previews" id="portal-previews">
        {/* Projects Preview */}
        <div class="preview-card" id="prev-projects">
          <div class="card-glow" />
          <div class="card-inner">
            <div class="card-header">
              <span class="win-btn win-close"></span>
              <span class="win-btn win-min"></span>
              <span class="win-btn win-max"></span>
              <span class="win-title">projects.dat</span>
            </div>
            <div class="card-body">
              <div class="preview-line">TYPE: ACTIVE SOFTWARE</div>
              <div class="preview-line">LANGS: TS, GO, RUST, VITE</div>
              <div class="preview-desc">A workshop of active software builds, scripts, and visual experiments.</div>
              <div class="preview-deco">░░░░░░░░░░ 78%</div>
            </div>
          </div>
        </div>

        {/* Poetry Preview */}
        <div class="preview-card" id="prev-poetry">
          <div class="card-glow" />
          <div class="card-inner">
            <div class="card-header">
              <span class="win-btn win-close"></span>
              <span class="win-btn win-min"></span>
              <span class="win-btn win-max"></span>
              <span class="win-title">poetry.txt</span>
            </div>
            <div class="card-body">
              <div class="preview-line">TYPE: EXPRESSIVE LITERATURE</div>
              <div class="preview-line">THEMES: BEAUTY, TRANSIENCE, SOUL</div>
              <div class="preview-desc">"For the beauty that can be expressed with words, the way emotions weave..."</div>
              <div class="preview-deco">🌹 OVERFLOW_ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Blogs Preview */}
        <div class="preview-card" id="prev-blogs">
          <div class="card-glow" />
          <div class="card-inner">
            <div class="card-header">
              <span class="win-btn win-close"></span>
              <span class="win-btn win-min"></span>
              <span class="win-btn win-max"></span>
              <span class="win-title">blogs.md</span>
            </div>
            <div class="card-body">
              <div class="preview-line">TYPE: ENGINEERING LOGS</div>
              <div class="preview-line">TOPICS: SYSTEMS, ARCHITECTURE, WEB</div>
              <div class="preview-desc">Deep-dives into systems engineering, developmental guidelines, and tech stacks.</div>
              <div class="preview-deco">⚡ READ_CYCLE_INIT</div>
            </div>
          </div>
        </div>

        {/* Entertainment Preview */}
        <div class="preview-card" id="prev-entertainment">
          <div class="card-glow" />
          <div class="card-inner">
            <div class="card-header">
              <span class="win-btn win-close"></span>
              <span class="win-btn win-min"></span>
              <span class="win-btn win-max"></span>
              <span class="win-title">chronicles.db</span>
            </div>
            <div class="card-body">
              <div class="preview-line">TYPE: MEDIA REVIEWS</div>
              <div class="preview-line">ITEMS: CINEMA, GAMING, BOOKS</div>
              <div class="preview-desc">A chronological catalog of video games, book highlights, and film reviews.</div>
              <div class="preview-deco">🎮 RATING_GRID</div>
            </div>
          </div>
        </div>

        {/* About Preview */}
        <div class="preview-card" id="prev-about">
          <div class="card-glow" />
          <div class="card-inner">
            <div class="card-header">
              <span class="win-btn win-close"></span>
              <span class="win-btn win-min"></span>
              <span class="win-btn win-max"></span>
              <span class="win-title">metadata.json</span>
            </div>
            <div class="card-body">
              <div class="preview-line">TYPE: CORE IDENTITY</div>
              <div class="preview-line">NAME: SURYAANSH RAI</div>
              <div class="preview-desc">Learn about my values, technical competence, history, and workspace setup.</div>
              <div class="preview-deco">🤖 HOST_VERIFIED</div>
            </div>
          </div>
        </div>

        {/* Contact Preview */}
        <div class="preview-card" id="prev-contact">
          <div class="card-glow" />
          <div class="card-inner">
            <div class="card-header">
              <span class="win-btn win-close"></span>
              <span class="win-btn win-min"></span>
              <span class="win-btn win-max"></span>
              <span class="win-title">inbox.dock</span>
            </div>
            <div class="card-body">
              <div class="preview-line">TYPE: TRANSMISSION CAPABLE</div>
              <div class="preview-line">STATUS: OPEN FOR WORK</div>
              <div class="preview-desc">Click to launch your system's mail agent and send a direct packet to my address.</div>
              <div class="preview-deco">✉ READY_TO_SEND</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Elegant Premium Status Footer */}
      <footer class="portal-footer">
        <div class="footer-col footer-col-status">
          <span class="footer-clock" id="footer-clock">00:00:00 GMT+0000</span>
          <span class="footer-metrics">FPS: 60 // PORTAL V4.8</span>
        </div>
        <div class="footer-col footer-col-quote">
          "THE QUIETER YOU BECOME, THE MORE YOU ARE ABLE TO HEAR." — RUMI
        </div>
        <div class="footer-col footer-col-copy">
          © 2026 SURYAANSH.DEV // DIGITAL GARDEN
        </div>
      </footer>
    </div>
  )
}

Landing.css = styles

// @ts-ignore
import script from "./scripts/landing.inline"
Landing.afterDOMLoaded = script

export default (() => Landing) satisfies QuartzComponentConstructor
