import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { contactLinks } from "../contactLinks"
// @ts-ignore
import styles from "./styles/contactCards.scss"

const ContactCards: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "contact") return null

  return (
    <div class="contact-cards-page">
      <div class="contact-eyebrow">HOME / CONTACT</div>
      <h1 class="contact-title">
        Say something <span class="contact-italic">worth</span> replying to
      </h1>
      <p class="contact-lede">
        Responding to a view, a regular chit-chat on anything you found interesting here, or a
        suggestion of your own — all welcome. I read everything.
      </p>

      <div class="contact-card-grid">
        {contactLinks.map((link) => {
          const rel = link.external ? "noopener noreferrer" : undefined
          const target = link.external ? "_blank" : undefined
          return (
            <a href={link.href} class="contact-card" rel={rel} target={target} data-magnet>
              <img
                class="contact-card-icon"
                src={link.src}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                decoding="async"
              />
              <span class="contact-card-label">{link.label}</span>
              <span class="contact-card-value">{link.href.replace(/^mailto:/, "")}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

ContactCards.css = styles

export default (() => ContactCards) satisfies QuartzComponentConstructor
