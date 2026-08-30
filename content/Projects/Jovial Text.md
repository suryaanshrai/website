---
title:
description:
tags:
  - django
  - projects
date: 2025-10-24
generate-audio: "true"
---

# Introduction

> https://github.com/suryaanshrai/jovialText

What is Jovial Text?

[[Why almost every developer makes a social media app|What is that one application which every developer makes?]]

OBVIOUSLY! A social media application!

But jovial text has been special for me. It has been that one project which allowed me to learn quite a lot of basics in enough details that I could move on to other frameworks (such as fastAPI) without almost any worries. Mostly because:

1. I knew what I was looking for: standard API practices, security requirements, implementation techniques, DB requirements, keeping concerns limited to their scope, etc.
2. I version this application so many times and the nuances of each implementation gave me a much better perspective of how and why the production software of Instagram is so different (in terms of technical implementation and engineering efforts) compared to my own implementations of social media apps.

## Version 1: Back to CS50

Yes. This project too was part of the [[CS50]] course (sometimes even I start doubting my creativity when I look at my list of projects, but then I open my local storage of incomplete projects and feel OK. On the other hand, the CS50 projects have been quite efficient in teaching me fundamentals that I have carried throughout most of my projects and now my profession as well).

This was project 4 of the [CS50 web](https://cs50.harvard.edu/web/) course. Here's a look at the version of what I created at the time -
![network](https://youtu.be/4OZ9lo4J8-c)

Too simple, and too.... Non-social able application.

## Version 2: Let us **React**

And here is version 2 of it:

![Jovial Text Demo](https://youtu.be/cF_m377ISAg)

This from sometime after I had finished the CS50 web course and had learnt the basics of react. Making this UI gave me much more insights into how and why react was made. And also how states and there management can also be applied to other scenarios than user interfaces as well.

The above interface was obviously not built from scratch by me, I used [shadcn](https://ui.shadcn.com/docs/components/radix/sidebar) for all the components and focused myself on adding all the functionalities and integrating the API with it. Focusing more on the concepts and how to leverage them to achieve the results that I wanted instead of spending too much time rebuilding wheels because that was my primary focus at the time. And building social media applications is definitely one of the best ways to learn so. You don't have to do everything from scratch. But doing very good implementations and implementing as many features as you can think of gives you that confidence that only comes from knowing that you can build what you promise.

Obviously there was also the API of it, which I built using DRF, and this was also my first time using DRF as far as I remember.

# End Notes

To be honest, I think this was my first time creating a **multiservice** application, with a decoupled API, UI and database. I thought of adding a worker service in it as well, but got occupied with [[OmniPost|another project]] that I had to submit as a part of graduation, so focus shifted there.

But nonetheless, this project does have quite a level of importance in my journey to making good applications. However, my highest value take from this project was the react fundamentals I learned and realizing how important it is to make good UI, not just what looks like the v1. Obviously DRF was also a high take, but not something I'd say that pushed my much farther than where I stood.
