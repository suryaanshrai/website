export interface ContactLink {
  label: string
  href: string
  src: string
  external?: boolean
  spinOnHover?: boolean
  size?: "normal" | "large"
}

export const contactLinks: ContactLink[] = [
  {
    label: "Topmate",
    href: "https://topmate.io/suryaanshrai/",
    src: "/static/topmate.png",
    external: true,
    spinOnHover: true,
  },
  {
    label: "Resume",
    href: "https://resume.suryaansh.dev/",
    src: "/static/resume.gif",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/suryaansh-rai/",
    src: "/static/Linkedin.gif",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:contact@suryaansh.dev",
    src: "/static/mail.gif",
    external: false,
    size: "large",
  },
  {
    label: "RSS",
    href: "/index.xml",
    src: "/static/rss.gif",
    external: false,
    size: "large",
  },
]
