---
title:
description:
tags:
  - projects
  - tech
date: 2026-01-29
generate-audio: "true"
---

There is nothing quite like the feeling of a pet project actually making it out of the "abandoned" folder and into daily use. This one turned out to be one of those rare cases where a simple app genuinely fixed a headache at home.
# Problem: The "He-Said, She-Said" of Payday
The issue was pretty classic: we had a situation where one of our house helpers wasn't showing up daily but was still asking for a full month’s pay. Since the house is usually empty when she’s supposed to be there, we had no real way to verify anything.

It wasn't about being strict; it was just about having a source of truth. If we have logs, she can demand her fair pay with confidence, and we can pay her without feeling like we’re being played. A simple attendance app with a selfie check seemed like the easiest way to bridge that gap. Keka's cost was too much and I did got quite curious to create this application so went with it. Moreover, I wanted to try out Antigravity and mobile apps as well so this felt like too good of an idea to not implement instantly 😜
# Backend: Lean and Mean
I wanted the backend to be as lightweight as possible. Here’s what I went with:
- FastAPI for the API (standard choice, hard to beat).
- InsightFace for the facial recognition (I started with DeepFace, but InsightFace felt a bit more relevant for this).
- SQLite for the logs—no need for a heavy DB here.
- Oracle Free Tier for the deployment.
## A note on "Vibe Coding":
I tried to just "vibe code" the whole thing by telling Copilot what I wanted, but it honestly started over-engineering the hell out of it. Since this was a simple home project, I decided to take the wheel for the first mile. I manually coded the skeleton—the core endpoints, the params, the DB CRUD logic, and some basic service files. Once the structure was there, I handed it back to the LLM to fill in the rest, and it worked perfectly.
# Frontend: Just chatting with Antigravity
This is where I wanted to experiment. Google’s Antigravity has been getting a lot of hype, so I decided to see if I could build the entire UI without actually touching the codebase.
I set up Android Studio, grabbed a dummy phone, and started "vibing." I fed the openapi.json from my backend into the chat and described exactly how I wanted the flow to look. After a few iterations, I had a fully functional app—including a salary calculator and a log viewer—all without writing a single line of frontend code manually.

![[IMG_20260209_022030.jpg]]
![[IMG_20260209_022054.jpg]]
![[IMG_20260209_022039.jpg]]
# end notes
The app is now part of the daily routine. Seeing the house helpers click a selfie and mark their attendance every morning (or occasionally asking me to add a missed log) makes the project feel worth it. It’s just a small pet project, but seeing it getting used every single day is a pretty great feeling.