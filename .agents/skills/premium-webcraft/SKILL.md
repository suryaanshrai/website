---
name: premium-webcraft
description: Upgrades web design and development flow to an "Awwwards-tier" premium level. Focuses on storytelling, advanced scrolling, WebGL/Three.js integration, minimal but highly polished interfaces, and avoiding AI-generated visual tropes.
---

# Premium Webcraft Skill

This skill is designed to guide agents and developers in creating websites that rival top-tier digital agencies (like Active Theory, Lusion, and Resn). It forces a shift away from standard, generic frameworks and towards crafted, cinematic, and interactive experiences.

## 1. Mindset & The Anti-Slop Policy

Top-tier websites are intentional. Treat the browser as a blank canvas, not a document viewer.

- **Ban the "AI Template"**: Reject default 3-column feature grids, pure `#000000` backgrounds, arbitrary flexbox math, perfectly even 45-degree linear gradients, and generic purple/blue palettes.
- **Distinctive Identity**: Every site needs a visual signature. This could be a unique WebGL background (e.g., Lusion), an interactive scroll mechanic (e.g., Getty Persepolis), or a gamified element (e.g., Bruno Simon). 
- **Restraint & Polish**: Maximalist concepts require elaborate execution; minimalist concepts require absolute precision in spacing, typography, and detail.

## 2. Advanced Typography & Layout

Typography in premium sites serves as the architectural foundation.
- **Editorial Typography**: Pair characterful display faces with neutral body faces. Increase letter-spacing (tracking) on small caps and labels; tightly kerning massive display headers.
- **The Off-Grid Layout**: Break symmetry. Use asymmetric grids, overlapping elements, or horizontal scrolling sections. Ensure `max-width` constraints so the design doesn't stretch awkwardly on massive monitors, but break out of the container for impactful media.
- **Cinematic Pacing**: Double your whitespace. Treat the user's scroll like a camera moving through a scene. Provide breathing room before revealing the next element.

## 3. The Interaction Layer

Interactivity is what separates a document from an experience.
- **Custom Cursors & Hover States**: Cursor tracking and magnetic hover effects (where the button lightly pulls towards the cursor) give weight and physics to the DOM.
- **Micro-interactions**: No instantaneous state changes. Use subtle `scale`, `translate`, and `opacity` shifts on hover, active, and focus states. Easing functions should feel physical (e.g., custom cubic-beziers like `[0.76, 0, 0.24, 1]` rather than default `ease-in-out`).

## 4. Scroll & Storytelling

Scroll is the primary user input. Use it to drive a narrative.
- **Smooth Scrolling is Mandatory**: Use Lenis or similar virtual scroll libraries. Native browser scroll is too harsh for cinematic reveals.
- **Scroll-Triggered Animations**: Elements shouldn't just "appear". They should translate up, unmask, or fade in as they enter the viewport. Use intersection observers or GSAP ScrollTrigger.
- **Scroll Jacking (Done Right)**: Pin sections to the screen while internal content animates (e.g., video playing on scroll, 3D models rotating based on scroll progress).

## 5. 3D & WebGL (The "Active Theory" Tier)

To reach the absolute peak of modern web design, incorporate the canvas.
- **When to use**: Use WebGL/Three.js for hero section interactive backgrounds, distorted image transitions, particle systems, or fully gamified environments.
- **Integration**: Mix HTML UI overlaid on top of a full-screen WebGL canvas. Keep the UI minimal (off-black or cream) to let the 3D art shine.
- **Performance**: Always limit pixel ratios, implement frustum culling, and reduce geometry on mobile to maintain 60fps.

## 6. Operational Modes & Execution Workflow

When utilizing this skill, operate in one of two modes depending on the context. In both modes, **protect the vision**. Do not let the user "downscale" the ambition or settle for generic design. Push for "above god-tier" delivery by heavily leaning on the reference sites for inspiration. 

### Mode 1: Create (From Scratch)
Used when building a new project.
1. **Interrogate the Vision**: Ask the user a few high-level questions about the brand's core story, attitude, and the emotion they want to evoke. Do *not* ask about UI specifics (colors, layouts, button styles)—take control of the creative direction yourself to ensure premium quality.
2. **Execute the Workflow**: Proceed to the 5-step execution workflow below.

### Mode 2: Revamp (Existing Site)
Used when upgrading an existing project.
1. **Audit & Diagnose**: Deeply scan the current codebase. Extract the core story it's *trying* to tell, then ruthlessly identify every area where it falls short of the "Awwwards-tier" standard (e.g., generic templates, flat backgrounds, lack of physics).
2. **The Overhaul Decision**: Make an executive decision on whether to rewrite from scratch (if the current code is too generic/rigid) or surgically refactor (if the foundation is strong).
3. **Execute the Workflow**: Proceed to the 5-step execution workflow below to apply the upgrades.

### The 5-Step Execution Workflow
Once the mode is established, build the experience following these steps:
1. **Define the Story**: What is the core narrative that drives the scroll?
2. **Establish the Visual Anchor**: What is the one memorable element? (A 3D object, a massive typography lockup, an interactive fluid simulation).
3. **Draft the Grid & Type**: Build the static layout with extreme precision.
4. **Layer the Motion**: Add GSAP for entry animations and Lenis for scrolling.
5. **Add the Magic**: Integrate custom WebGL/shaders or advanced interactions.

*Review the Developer Workflow Guide in `references/workflow.md` for detailed technical steps.*

## 7. Inspirational References

When designing, aim for the quality, storytelling, and interactivity of these sites:

**The Absolute Peak (Cinematic & Interactive):**
- [Igloo Inc](https://www.igloo.inc/) - In a league of its own.
- [Active Theory](https://activetheory.net/) - Absolute cinema. Peak landing page with incredible scroll/hover animations and WebGL interactivity.
- [Lusion](https://lusion.co/) - God-tier hover/cursor interactions and on-scroll animations.
- [Resn](https://www.resn.co.nz/) & [Corn Revolution](https://cornrevolution.resn.global/) - Crazy interactions, holding clicks for random animations, amazing storytelling.
- [Vertex3D](https://www.vertex3d.asia/)

**Storytelling & Narrative Focus:**
- [Getty Persepolis](https://persepolis.getty.edu/) & [Orano Innovation](https://www.orano.group/experience/innovation/en/slider) - Great storytelling and portrayal.
- [Scale](https://scale.com/) - Crazy overlay animations on media during scroll.
- [DogStudio](https://dogstudio.co/) - Great personality and mascot integration.
- [Mana Yerba Mate](https://en.manayerbamate.com/) - Product selling through scroll animations and gamification.
- [Okapa](https://okapa.com/meet/fetische-noir/), [Drink Zoi](https://www.drinkzoi.co/), [Drip MDX](https://drip.mdxpreview.xyz/), [ICG Gallery](https://icggallery.irisceramicagroup.com/en/floors/first-floor).

**Hero Sections & Minimalist Execution:**
- [Lando Norris](https://landonorris.com/) & [Alkemy](https://alkemymarket.com/) - Incredible hero sections and interactive colors.
- [Peachweb](https://www.peachweb.io/) - Themed scroll animations (fish moving from start to end) that add personality.
- [Noomo Agency](https://noomoagency.com/), [Immersive G](https://immersive-g.com/), [Unseen](https://unseen.co/) - The definition of a premium minimal site. 3D backgrounds with hover/cursor animations.
- [Monogrid](https://www.monogrid.com/en/) - Single color storytelling, programmatic feel, nice scroll/hover.

**Gamified Web:**
- [Bruno Simon](https://bruno-simon.com) & [Messenger Abeto](https://messenger.abeto.co/) - Pushing front-end to its limits with interactive game mechanics.
