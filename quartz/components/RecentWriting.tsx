import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
// @ts-ignore
import styles from "./styles/recentWriting.scss"

function formatRecentDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
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
        return (
          <a
            href={resolveRelative(fileData.slug!, post.slug!)}
            class="recent-writing-row"
            data-magnet
          >
            <span class="recent-writing-date">{date ? formatRecentDate(date) : ""}</span>
            <span class="recent-writing-title">{post.frontmatter?.title ?? "Untitled"}</span>
            <span class="recent-writing-kicker">{post.description ?? ""}</span>
          </a>
        )
      })}
    </div>
  )
}

RecentWriting.css = styles

export default (() => RecentWriting) satisfies QuartzComponentConstructor
