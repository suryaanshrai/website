import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
// @ts-ignore
import styles from "./styles/landing.scss"
// @ts-ignore
import script from "./scripts/landing.inline"

interface IndexRow {
  num: string
  title: string
  note: string
  slug: FullSlug
  kicker: string
  body: string
  countOverride?: string
}

const INDEX_ROWS: IndexRow[] = [
  {
    num: "01",
    title: "Projects",
    note: "Side quests done with interest and enthusiasm",
    slug: "Projects" as FullSlug,
    kicker: "PROJECTS",
    body: "Cube solvers, a Minesweeper AI, a Nim player, OmniPost, Scibot, a data visualizer — and this website.",
  },
  {
    num: "02",
    title: "Blogs",
    note: "Engineering write-ups, travel, books, rants",
    slug: "Blogs" as FullSlug,
    kicker: "BLOGS",
    body: "From router registration tradeoffs to an evening in Bangalore. Systems thinking and living, kept side by side.",
  },
  {
    num: "03",
    title: "Poetry",
    note: "For what only rhythm can carry",
    slug: "Poetry" as FullSlug,
    kicker: "POETRY · EN / HI",
    body: "The Fallen Rose, Whispering Screams, ज़िन्दगी का दीवाना, दिनचर्या.",
  },
  {
    num: "04",
    title: "Entertainment",
    note: "Books, games, and everything watched",
    slug: "Entertainment" as FullSlug,
    kicker: "BOOKS / GAMES / WATCHED",
    body: "Highlights, ratings, and the reasons a thing stayed with me.",
    countOverride: "3 shelves",
  },
  {
    num: "05",
    title: "Education",
    note: "Sainik School, the drop year, SMVDU, CS50",
    slug: "Education" as FullSlug,
    kicker: "EDUCATION",
    body: "One Goal, One Aim — NDA. The Drop Year. Shri Mata Vaishno Devi University. CS50.",
  },
  {
    num: "06",
    title: "About me",
    note: "The person behind all of it",
    slug: "About-me" as FullSlug,
    kicker: "ABOUT · BACKEND ENGINEER @ WOBOT",
    body: "Gurugram by address, Ambikapur by upbringing. Currently building a no-code video analytics pipeline builder.",
    countOverride: "—",
  },
]

const NOW_CARDS = [
  {
    label: "WORK",
    head: "Wobot, Gurugram",
    body: "Backend for a no-code video analytics pipeline builder. Drag blocks, ship pipelines.",
  },
  {
    label: "READING",
    head: "Dostoevsky, slowly",
    body: "Plus a running list of self-help books that actually help, kept honest.",
  },
  {
    label: "BUILDING",
    head: "This garden",
    body: "Quartz, tuned by hand. Audio narrations of notes, a live graph, and comments that work.",
  },
]

function countInFolder(allFiles: QuartzComponentProps["allFiles"], folder: string): number {
  return allFiles.filter((f) => {
    const slug = f.slug ?? ""
    if (slug === folder || slug === `${folder}/index`) return false
    if (!slug.startsWith(`${folder}/`)) return false
    if (slug.endsWith("/index")) return false
    return true
  }).length
}

const Landing: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  // Only render this component on the index page
  if (fileData.slug !== "index") return null

  const blogsHref = resolveRelative(fileData.slug, "Blogs" as FullSlug)
  const contactHref = resolveRelative(fileData.slug, "Contact" as FullSlug)
  const blogsCount = countInFolder(allFiles, "Blogs")
  const monthYear = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div class="landing-page notranslate">
      <section class="landing-hero-row">
        <div class="landing-hero">
          <div class="landing-kicker">
            <span class="landing-pulse" />
            BACKEND ENGINEER · GURUGRAM, IN · OPEN TO CONVERSATION
          </div>
          <h1 class="landing-name">
            Suryaansh
            <br />
            <span class="landing-name-italic">Rai</span>
          </h1>
          <p class="landing-tagline">
            A digital garden, kept in the open. Software I build, thoughts I keep returning to,
            poetry, and notes from a life still being figured out.
          </p>
          <div class="landing-cta-row">
            <a href={blogsHref} class="landing-cta landing-cta-primary" data-magnet>
              Enter the garden <span class="landing-cta-arrow">→</span>
            </a>
            <a href={contactHref} class="landing-cta" data-magnet>
              Get in touch
            </a>
          </div>
        </div>

        <nav class="landing-index">
          {INDEX_ROWS.map((row) => {
            const count = row.countOverride ?? String(countInFolder(allFiles, row.slug))
            return (
              <a
                href={resolveRelative(fileData.slug!, row.slug)}
                class="landing-index-row"
                data-magnet
                data-kicker={row.kicker}
                data-body={row.body}
              >
                <span class="landing-index-num">{row.num}</span>
                <span class="landing-index-copy">
                  <span class="landing-index-title">{row.title}</span>
                  <span class="landing-index-note">{row.note}</span>
                </span>
                <span class="landing-index-count">{count}</span>
              </a>
            )
          })}
          <div class="landing-index-preview">
            <div class="landing-preview-kicker" id="landing-preview-kicker">
              STATUS · IDLE
            </div>
            <div class="landing-preview-body" id="landing-preview-body">
              Hover an entry to preview what lives inside it.
            </div>
          </div>
        </nav>
      </section>

      <section class="landing-section">
        <div class="landing-section-head">
          <h2>CURRENTLY</h2>
          <span>{monthYear.toUpperCase()}</span>
        </div>
        <div class="landing-currently-grid">
          {NOW_CARDS.map((card) => (
            <div class="landing-currently-card">
              <span class="landing-currently-label">{card.label}</span>
              <span class="landing-currently-head">{card.head}</span>
              <span class="landing-currently-body">{card.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section class="landing-section" id="landing-recent-writing">
        <div class="landing-section-head">
          <h2>RECENT WRITING</h2>
          <a href={blogsHref} class="landing-section-link" data-magnet>
            ALL {blogsCount} NOTES →
          </a>
        </div>
      </section>
    </div>
  )
}

Landing.css = styles
Landing.afterDOMLoaded = script

export default (() => Landing) satisfies QuartzComponentConstructor
