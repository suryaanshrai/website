import { Application, Graphics } from "pixi.js"

let app: Application | null = null
let waveGraphics: Graphics | null = null

interface WaveRibbon {
  yBaseRatio: number  // Vertical center ratio (e.g. 0.3, 0.5, 0.7)
  amplitude: number
  frequency: number
  speed: number
  color: number
  targetColor: number
  currentColor: number
  alpha: number
  phaseOffset: number
  direction: number // 1 or -1
}

let ribbons: WaveRibbon[] = []
let mouseX = window.innerWidth / 2
let mouseY = window.innerHeight / 2
let targetMouseX = mouseX
let targetMouseY = mouseY

let targetScrollY = window.scrollY
let currentScrollY = window.scrollY

let time = 0
let currentTheme = document.documentElement.getAttribute("saved-theme") || "dark"

function getThemePalette(theme: string) {
  if (theme === "light") {
    return {
      ribbons: [
        { color: 0x4f46e5, alpha: 0.12 }, // Indigo
        { color: 0x0ea5e9, alpha: 0.15 }, // Sky Blue
        { color: 0xdb2777, alpha: 0.10 }, // Deep Pink
        { color: 0x9333ea, alpha: 0.12 }, // Purple
      ]
    }
  } else {
    return {
      ribbons: [
        { color: 0x00f2fe, alpha: 0.28 }, // Electric Cyan
        { color: 0x7c3aed, alpha: 0.20 }, // Cosmic Purple
        { color: 0xec4899, alpha: 0.16 }, // Hot Pink
        { color: 0x38bdf8, alpha: 0.24 }, // Sky Glow
      ]
    }
  }
}

async function initKineticWaveBg() {
  cleanupWaveBg()

  const canvas = document.getElementById("space-canvas") as HTMLCanvasElement
  if (!canvas) return

  app = new Application()
  try {
    await app.init({
      canvas: canvas,
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      hello: false,
    })
  } catch (err) {
    console.error("Failed to initialize PixiJS kinetic wave background:", err)
    return
  }

  waveGraphics = new Graphics()
  if (currentTheme === "dark") {
    waveGraphics.blendMode = "screen"
  } else {
    waveGraphics.blendMode = "normal"
  }

  app.stage.addChild(waveGraphics)

  const palette = getThemePalette(currentTheme)

  // Initialize 4 ribbons
  ribbons = [
    {
      yBaseRatio: 0.35,
      amplitude: 65,
      frequency: 0.002,
      speed: 0.012,
      color: palette.ribbons[0].color,
      targetColor: palette.ribbons[0].color,
      currentColor: palette.ribbons[0].color,
      alpha: palette.ribbons[0].alpha,
      phaseOffset: 0,
      direction: 1
    },
    {
      yBaseRatio: 0.50,
      amplitude: 85,
      frequency: 0.0015,
      speed: -0.008,
      color: palette.ribbons[1].color,
      targetColor: palette.ribbons[1].color,
      currentColor: palette.ribbons[1].color,
      alpha: palette.ribbons[1].alpha,
      phaseOffset: Math.PI * 0.4,
      direction: -1
    },
    {
      yBaseRatio: 0.65,
      amplitude: 75,
      frequency: 0.0025,
      speed: 0.015,
      color: palette.ribbons[2].color,
      targetColor: palette.ribbons[2].color,
      currentColor: palette.ribbons[2].color,
      alpha: palette.ribbons[2].alpha,
      phaseOffset: Math.PI * 0.85,
      direction: 1
    },
    {
      yBaseRatio: 0.80,
      amplitude: 55,
      frequency: 0.0018,
      speed: -0.01,
      color: palette.ribbons[3].color,
      targetColor: palette.ribbons[3].color,
      currentColor: palette.ribbons[3].color,
      alpha: palette.ribbons[3].alpha,
      phaseOffset: Math.PI * 1.3,
      direction: -1
    }
  ]

  // Listeners
  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("scroll", handleScroll, { passive: true })

  app.ticker.add(updateScene)
}

function handleMouseMove(e: MouseEvent) {
  targetMouseX = e.clientX
  targetMouseY = e.clientY
}

function handleScroll() {
  targetScrollY = window.scrollY
}

function updateScene() {
  if (!app || !waveGraphics) return

  // Smooth lerps
  mouseX += (targetMouseX - mouseX) * 0.06
  mouseY += (targetMouseY - mouseY) * 0.06
  currentScrollY += (targetScrollY - currentScrollY) * 0.08
  time += 0.8

  // Theme Sync
  const newTheme = document.documentElement.getAttribute("saved-theme") || "dark"
  if (newTheme !== currentTheme) {
    currentTheme = newTheme
    const palette = getThemePalette(currentTheme)
    waveGraphics.blendMode = currentTheme === "dark" ? "screen" : "normal"
    ribbons.forEach((r, idx) => {
      r.targetColor = palette.ribbons[idx].color
      r.alpha = palette.ribbons[idx].alpha
    })
  }

  waveGraphics.clear()

  const width = window.innerWidth
  const height = window.innerHeight
  const segments = 90
  const step = width / segments

  ribbons.forEach((r) => {
    // Smooth color morphing
    if (r.currentColor !== r.targetColor) {
      const cr = (r.currentColor >> 16) & 0xff
      const cg = (r.currentColor >> 8) & 0xff
      const cb = r.currentColor & 0xff

      const tr = (r.targetColor >> 16) & 0xff
      const tg = (r.targetColor >> 8) & 0xff
      const tb = r.targetColor & 0xff

      const nr = Math.round(cr + (tr - cr) * 0.05)
      const ng = Math.round(cg + (tg - cg) * 0.05)
      const nb = Math.round(cb + (tb - cb) * 0.05)

      r.currentColor = (nr << 16) | (ng << 8) | nb
    }

    const baseHeight = height * r.yBaseRatio - currentScrollY * 0.15

    // To make it look extremely premium, draw 4 adjacent strands for a ribbon effect
    const numStrands = 4
    for (let s = 0; s < numStrands; s++) {
      const strandOffset = s * 6
      const strandAlpha = r.alpha * (1.0 - s / numStrands)
      const strandAmp = r.amplitude * (1.0 - s * 0.08)

      // Start drawing path
      waveGraphics.moveTo(0, baseHeight)

      for (let i = 0; i <= segments; i++) {
        const px = i * step
        
        // Multi-frequency wave calculation
        const tVal = time * r.speed
        const angle1 = px * r.frequency + tVal + r.phaseOffset + s * 0.1
        const angle2 = px * (r.frequency * 2.3) - tVal * 0.5 + s * 0.05
        
        let py = baseHeight + Math.sin(angle1) * strandAmp + Math.cos(angle2) * (strandAmp * 0.45)

        // Mouse displacement repulsion (organic ripple push)
        const dx = mouseX - px
        const dy = mouseY - py
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repelRadius = 250
        
        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius
          // Push vertically away from cursor with custom sigmoid drop-off
          const pushVal = Math.sin(force * Math.PI * 0.5) * 55
          py -= (dy / dist) * pushVal
        }

        if (i === 0) {
          waveGraphics.moveTo(px, py)
        } else {
          waveGraphics.lineTo(px, py)
        }
      }

      if (typeof (waveGraphics as any).stroke === "function") {
        waveGraphics.stroke({ width: 1.5, color: r.currentColor, alpha: strandAlpha })
      } else {
        ;(waveGraphics as any).lineStyle(1.5, r.currentColor, strandAlpha)
        ;(waveGraphics as any).stroke()
      }
    }
  })
}

function cleanupWaveBg() {
  window.removeEventListener("mousemove", handleMouseMove)
  window.removeEventListener("scroll", handleScroll)

  if (app) {
    app.destroy(true, { children: true, texture: true })
    app = null
    waveGraphics = null
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initKineticWaveBg)
} else {
  initKineticWaveBg()
}

if (typeof (window as any).addCleanup === "function") {
  ;(window as any).addCleanup(cleanupWaveBg)
}

document.addEventListener("nav", () => {
  initKineticWaveBg()
})
