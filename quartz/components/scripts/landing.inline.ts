import gsap from "gsap"

let animationFrameId: number | null = null

// Mouse Pointer Tracking
let realX = window.innerWidth / 2
let realY = window.innerHeight / 2
let lastRealX = realX
let lastRealY = realY

// Spring coordinates for dot
let dotX = realX
let dotY = realY

// Spring coordinates for ring
let ringX = realX
let ringY = realY
let ringW = 24
let ringH = 24
let ringRadius = "50%"

// Floating Card Coordinate Tracking
let cardX = realX
let cardY = realY
let targetCardX = realX
let targetCardY = realY
let activeCard: HTMLElement | null = null

// Snapped Element Ref
let hoveredTarget: HTMLElement | null = null

function animatePortal() {
  const isIndex = document.body.dataset.slug === "index"
  if (!isIndex) return

  // 1. Hide normal page elements if they slip through
  const centerEl = document.querySelector(".center") as HTMLElement | null
  if (centerEl) {
    centerEl.classList.add("portal-active")
  }

  // 2. Letter splitting for Hero title
  const brandTitle = document.getElementById("hero-brand") as HTMLElement | null
  if (brandTitle && !brandTitle.querySelector(".brand-reveal-wrapper")) {
    const rawText = brandTitle.textContent || ""
    brandTitle.innerHTML = ""

    const wrapper = document.createElement("span")
    wrapper.className = "brand-reveal-wrapper"
    wrapper.style.display = "inline-flex"
    wrapper.style.overflow = "hidden"
    wrapper.style.verticalAlign = "bottom"

    for (let char of rawText) {
      const charSpan = document.createElement("span")
      charSpan.className = "brand-char"
      charSpan.style.display = "inline-block"
      charSpan.style.transform = "translateY(115%)"
      charSpan.style.willChange = "transform"
      if (char === " ") {
        charSpan.innerHTML = "&nbsp;"
      } else {
        charSpan.textContent = char
      }
      wrapper.appendChild(charSpan)
    }
    brandTitle.appendChild(wrapper)
  }

  // 3. GSAP Entry Animation Timeline
  const tl = gsap.timeline({ defaults: { ease: "power4.out" } })

  // Initialize entry states to prevent flashes
  gsap.set(".brand-char", { translateY: "115%" })
  gsap.set(".hero-intro, .hero-tagline, .hero-status, .portal-footer", { opacity: 0, y: 20 })
  gsap.set(".nav-item", { opacity: 0, x: 40 })

  tl.to(".brand-char", {
    y: "0%",
    duration: 1.1,
    stagger: 0.04,
  })
  .to(".hero-intro, .hero-tagline, .hero-status", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.15,
  }, "-=0.7")
  .to(".nav-item", {
    opacity: 1,
    x: 0,
    duration: 1.0,
    stagger: 0.08,
  }, "-=0.85")
  .to(".portal-footer", {
    opacity: 1,
    y: 0,
    duration: 0.8,
  }, "-=0.5")

  // 4. Bind Custom Cursor & Interactive Physics
  initCursorAndInteractions()
}

function initCursorAndInteractions() {
  const cursorWrapper = document.getElementById("portal-cursor") as HTMLElement | null
  const cursorDot = cursorWrapper?.querySelector(".portal-cursor-dot") as HTMLElement | null
  const cursorRing = document.getElementById("portal-cursor-ring") as HTMLElement | null
  const navItems = document.querySelectorAll(".nav-item") as NodeListOf<HTMLElement>
  const navLinks = document.querySelectorAll(".nav-link") as NodeListOf<HTMLElement>
  const clockEl = document.getElementById("footer-clock") as HTMLElement | null

  if (!cursorWrapper || !cursorDot || !cursorRing) return

  // Show cursor
  cursorWrapper.style.opacity = "1"

  const handleMouseMoveGlobal = (e: MouseEvent) => {
    realX = e.clientX
    realY = e.clientY
  }

  window.addEventListener("mousemove", handleMouseMoveGlobal)

  // Spring physics loop for cursor and floating cards
  const tick = () => {
    // 1. Cursor Dot Physics
    dotX += (realX - dotX) * 0.16
    dotY += (realY - dotY) * 0.16

    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`

    // 2. Cursor Ring Elastic Snapping Physics
    let targetRingX = realX
    let targetRingY = realY
    let targetW = 24
    let targetH = 24
    let targetRadius = "50%"

    if (hoveredTarget) {
      const rect = hoveredTarget.getBoundingClientRect()
      targetRingX = rect.left + rect.width / 2
      targetRingY = rect.top + rect.height / 2
      targetW = rect.width + 24
      targetH = rect.height + 12
      targetRadius = "8px"
    }

    ringX += (targetRingX - ringX) * 0.18
    ringY += (targetRingY - ringY) * 0.18
    ringW += (targetW - ringW) * 0.18
    ringH += (targetH - ringH) * 0.18

    cursorRing.style.left = `${ringX}px`
    cursorRing.style.top = `${ringY}px`
    cursorRing.style.width = `${ringW}px`
    cursorRing.style.height = `${ringH}px`
    cursorRing.style.borderRadius = hoveredTarget ? "8px" : "50%"

    // Mouse velocity for stretch animation (only when not snapped)
    const vx = realX - lastRealX
    const vy = realY - lastRealY
    lastRealX = realX
    lastRealY = realY

    if (!hoveredTarget) {
      const speed = Math.min(Math.sqrt(vx * vx + vy * vy), 80)
      const stretch = 1 + (speed / 80) * 0.28
      const angle = Math.atan2(vy, vx) * (180 / Math.PI)
      cursorRing.style.transform = `translate3d(-50%, -50%, 0) rotate(${angle}deg) scale(${stretch}, ${2 - stretch})`
    } else {
      cursorRing.style.transform = `translate3d(-50%, -50%, 0)`
    }

    // 3. Floating Card Lag & Swing Physics
    if (activeCard) {
      targetCardX = realX + 32
      targetCardY = realY + 22

      // Check right boundary collision to keep card inside viewport
      const cardRect = activeCard.getBoundingClientRect()
      if (targetCardX + cardRect.width > window.innerWidth - 20) {
        targetCardX = realX - cardRect.width - 32
      }
      // Check bottom boundary collision
      if (targetCardY + cardRect.height > window.innerHeight - 20) {
        targetCardY = realY - cardRect.height - 22
      }

      cardX += (targetCardX - cardX) * 0.08
      cardY += (targetCardY - cardY) * 0.08

      const rotateSwing = Math.max(Math.min(vx * 0.12, 6), -6)
      activeCard.style.transform = `translate3d(${cardX}px, ${cardY}px, 0) rotate(${rotateSwing.toFixed(1)}deg)`
    }

    // 4. Magnetic Hover Text Pulls
    navLinks.forEach((link) => {
      const rect = link.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = realX - centerX
      const dy = realY - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 75) {
        const pull = (75 - dist) / 75
        link.style.transform = `translate3d(${dx * pull * 0.22}px, ${dy * pull * 0.22}px, 0)`
        link.style.color = "var(--tertiary)"
      } else {
        link.style.transform = ""
        link.style.color = ""
      }
    })

    // 5. Update Local System Clock
    if (clockEl) {
      const now = new Date()
      const timezoneMatch = now.toString().match(/\(([^)]+)\)$/) || now.toString().match(/([A-Z]{3,4})/)
      const zoneStr = timezoneMatch ? timezoneMatch[1] : "GMT"
      clockEl.textContent = `${now.toLocaleTimeString()} ${zoneStr}`
    }

    animationFrameId = requestAnimationFrame(tick)
  }

  animationFrameId = requestAnimationFrame(tick)

  // Floating Previews & Elastic Snapping Bindings
  navItems.forEach((item) => {
    const link = item.querySelector(".nav-link") as HTMLElement | null
    const previewId = item.getAttribute("data-preview-id")
    const card = document.getElementById(previewId || "") as HTMLElement | null

    const handleMouseEnter = () => {
      if (card) {
        activeCard = card
        card.style.opacity = "1"
        card.style.visibility = "visible"
        card.style.scale = "1"

        targetCardX = realX + 32
        targetCardY = realY + 22
        cardX = targetCardX
        cardY = targetCardY
      }
      if (link) {
        hoveredTarget = link
        cursorDot.style.opacity = "0" // Hide dot while snapping
      }
    }

    const handleMouseLeave = () => {
      if (card) {
        card.style.opacity = "0"
        card.style.visibility = "hidden"
        card.style.scale = "0.95"
      }
      activeCard = null
      hoveredTarget = null
      cursorDot.style.opacity = "1" // Show dot again
    }

    item.addEventListener("mouseenter", handleMouseEnter)
    item.addEventListener("mouseleave", handleMouseLeave)
  })
}

function cleanupPortal() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  const cursorWrapper = document.getElementById("portal-cursor") as HTMLElement | null
  if (cursorWrapper) {
    cursorWrapper.style.opacity = "0"
  }
  activeCard = null
  hoveredTarget = null
}

// Bind to lifecycle
animatePortal()

document.addEventListener("nav", () => {
  animatePortal()
})

if (typeof (window as any).addCleanup === "function") {
  ;(window as any).addCleanup(cleanupPortal)
}
