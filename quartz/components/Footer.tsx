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
                  <img
                    class={link.spinOnHover ? "footerIcon footerIconSpin" : "footerIcon"}
                    src={link.src}
                    alt=""
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
