import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

interface Options {
  links?: Record<string, string>
  iconLinks?: Array<{
    label: string
    href: string
    src: string
    external?: boolean
    spinOnHover?: boolean
    size?: "normal" | "large"
  }>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? {}
    const iconLinks = opts?.iconLinks ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <ul>
          {iconLinks.map((link) => {
            const rel = link.external ? "noopener noreferrer" : undefined
            const target = link.external ? "_blank" : undefined

            const sizeClass = link.size === "large" ? "footerIconLarge" : ""
            const spinClass = link.spinOnHover ? "footerIconSpin" : ""
            const imgClass = ["footerIcon", sizeClass, spinClass].filter(Boolean).join(" ")
            return (
              <li>
                <a
                  class="footerIconLink"
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  rel={rel}
                  target={target}
                >
                  {/* The icons are square and CSS-sized; the attributes exist to
                      give the box an intrinsic aspect ratio so the footer row
                      doesn't reflow as they decode. */}
                  <img
                    class={imgClass}
                    src={link.src}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </li>
            )
          })}
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
