import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import styles from "./styles/aboutHero.scss"

const TIMELINE = [
  {
    year: "NOW · GURUGRAM",
    head: "Backend Engineer, Wobot",
    body: "No-code video analytics pipelines. Drag, drop, ship.",
  },
  {
    year: "2024",
    head: "OmniPost",
    body: "Final year project — and still the one I'm proudest of, for how it was built.",
  },
  {
    year: "2020 — 2024",
    head: "Shri Mata Vaishno Devi University",
    body: "Where the CodeClub experience happened, and most of the habits stuck.",
  },
  {
    year: "2019",
    head: "The Drop Year",
    body: "One goal, one aim: NDA. It didn't go to plan, and that turned out fine.",
  },
  {
    year: "AMBIKAPUR",
    head: "Sainik School",
    body: "Father teaches geography there. Hence my abode, and most of my discipline.",
  },
]

const AboutHero: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "about-me") return null

  return (
    <div class="about-hero">
      <div class="about-hero-main">
        <div class="about-eyebrow">HOME / ABOUT ME</div>
        <h1 class="about-title">
          The <span class="about-italic">long</span> version
        </h1>
        <p class="about-lede">
          Currently, I am residing in Gurugram, Haryana. I work as a Backend Engineer at Wobot,
          where I mostly handle the backend of a no-code Video Analytics Pipeline builder tool.
        </p>
        <p class="about-body">
          You can drag and drop blocks to build a video analytics pipeline for any usecase you may
          have — without practically writing any code — and ship at lightning speed.
        </p>
        <h2>Background</h2>
        <p class="about-body">
          While I was not born there, for the most part I was raised in Ambikapur, Chhattisgarh. My
          father teaches geography at Sainik School Ambikapur, and hence my abode. My mother is also
          a teacher at Holy Cross Senior Secondary School Ambikapur; quite a long name but a good
          school.
        </p>
        <p class="about-body">
          My most dear and lovely parents also celebrated their 25th wedding anniversary together,
          which I was so glad to have attended.
        </p>
      </div>

      <div class="about-timeline">
        {TIMELINE.map((t) => (
          <div class="about-timeline-item">
            <span class="about-timeline-year">{t.year}</span>
            <span class="about-timeline-head">{t.head}</span>
            <span class="about-timeline-body">{t.body}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

AboutHero.css = styles

export default (() => AboutHero) satisfies QuartzComponentConstructor
