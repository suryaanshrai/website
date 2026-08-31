import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
// @ts-ignore
import styles from "./styles/recentWriting.scss"

function formatRecentDate(d: Date): string {
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

// Descriptions come from the `description` plugin, which HTML-escapes the text
// it extracts. Rendering that through JSX escapes the ampersand a second time,
// so a source `->` reached the page as a literal `-&gt;`. Decode once and drop
// any markup that survived extraction.
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

// The kicker is a one-line supporting note, so it has to be short and it must
// not restate the title — the auto-extracted description frequently opens with
// the title verbatim, which read as a duplicated line.
function buildKicker(description: string | undefined, title: string): string {
  if (!description) return ""
  const text = decodeEntities(description)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (!text) return ""

  const normalizedTitle = normalize(title)
  const normalizedText = normalize(text)
  if (normalizedTitle && normalizedText.startsWith(normalizedTitle)) {
    const remainder = text
      .slice(title.length)
      .replace(/^[\s:—–-]+/, "")
      .trim()
    if (remainder.length < 24) return ""
    return remainder
  }
  return text
}

const RecentWriting: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null

  const posts = allFiles
    .filter((f) => (f.slug ?? "").startsWith("blogs/") && !(f.slug ?? "").endsWith("/index"))
    .sort(byDateAndAlphabetical())
    .slice(0, 4)

  return (
    <div class="recent-writing">
      {posts.map((post) => {
        const date = post.dates ? getDate(post) : undefined
        const title = post.frontmatter?.title ?? "Untitled"
        return (
          <a
            href={resolveRelative(fileData.slug!, post.slug!)}
            class="recent-writing-row"
            data-magnet
          >
            <span class="recent-writing-date">{date ? formatRecentDate(date) : ""}</span>
            <span class="recent-writing-title">{title}</span>
            <span class="recent-writing-kicker">{buildKicker(post.description, title)}</span>
          </a>
        )
      })}
    </div>
  )
}

RecentWriting.css = styles

export default (() => RecentWriting) satisfies QuartzComponentConstructor
