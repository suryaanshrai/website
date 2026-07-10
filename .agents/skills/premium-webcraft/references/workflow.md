# Premium Webcraft Developer Workflow

To achieve the level of design seen in top-tier Awwwards sites (Active Theory, Lusion, Resn), you must change your development process. You are no longer just dropping components into a grid; you are choreographing a digital experience.

## The Recommended Stack

While framework-agnostic, the industry standard for this tier is:
- **Framework**: Next.js, Nuxt, or Vite + React/Vue
- **Styling**: Tailwind CSS (used minimally for layout, not for hacky design) or SCSS Modules
- **Animation**: **GSAP** (GreenSock) for timelines and ScrollTrigger
- **Smooth Scroll**: **Lenis** (Studio Freight) or Locomotive Scroll
- **3D/WebGL**: **Three.js** (and React Three Fiber `R3F` for React)
- **Shaders**: GLSL for custom materials and post-processing

## Phase 1: The Core Grid & Typography (Skeleton)

Before touching animations or 3D, the static design must look incredible.

1. **Setup the Typography**: Define your CSS variables for fluid typography (`clamp()`). Ensure headers use tight letter-spacing and body text has generous line-height (1.6+).
2. **The Off-Black/Off-White Rule**: Never use pure `#000000` or `#ffffff`. Use `#0a0a0a` or `#f8f9fa`. Add subtle CSS noise if the background feels too flat.
3. **Build the Layout**: Use CSS Grid to build asymmetric layouts. Don't center everything. Allow text blocks to sit off-center, balanced by negative space.

## Phase 2: The Narrative Arc (Storyboarding)

Plan the user's journey down the page.

1. **The Hero**: Needs immediate impact. Usually features a 3D canvas, a video loop, or massive kinetic typography.
2. **The Hook (Scroll 1)**: As the user scrolls, the Hero should transition smoothly (scale down, fade out, or warp via shaders).
3. **The Pacing**: Alternate between high-density information sections and "breathing" sections (massive imagery, sparse text).

## Phase 3: The Interaction Layer (Motion)

Introduce physics to the DOM.

1. **Install Lenis**: Wrap your app in a Lenis provider. This ensures scroll events fire smoothly and at 60fps, giving a premium "weight" to the scroll.
2. **Custom Cursor**: Hide the default cursor (`cursor: none`). Track mouse coordinates and render a custom DOM element or WebGL object. Add magnetic logic when hovering over links.
3. **GSAP ScrollTrigger**: 
   - Never let elements just sit there. As sections enter the viewport, stagger their appearance (e.g., lines of text translating up with a clip-path mask).
   - Use Scrub (`scrub: true`) for parallax elements or horizontal scroll sections.

## Phase 4: The 3D/WebGL Layer (The Magic)

This is what separates a good site from an "Active Theory" site.

1. **The Canvas**: Overlay your DOM on top of a fixed WebGL canvas, or place the canvas behind the DOM. Use pointer events (`pointer-events: none` on DOM wrappers where necessary) to allow interaction with the 3D space.
2. **Shaders**: Use GLSL shaders for image distortion on scroll, fluid simulations, or noise-driven vertex displacement.
3. **Integration**: Sync your Three.js camera or object rotations with your Lenis scroll position. When the user scrolls, the 3D world should react.

## Phase 5: Polish & Performance

A premium site must run smoothly. A 30fps stuttering animation ruins the illusion.

1. **Asset Optimization**: Compress textures (WEBP, Basis/KTX2 for WebGL). Use DRACO compression for GLTF/GLB 3D models.
2. **Preloading**: Create a custom loading screen. Ensure fonts, textures, and massive videos are loaded before revealing the site.
3. **Culling**: Only render what is in the viewport. Pause Three.js render loops or video playbacks when they are out of sight.
4. **Mobile Fallbacks**: Advanced shaders often tank mobile batteries. Serve simplified animations or static fallbacks for mobile devices while keeping the typography pristine.
