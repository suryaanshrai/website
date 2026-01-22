---
title: "AI in Software Development: A Technical Perspective"
description: Will AI replace you? Or is this hype a common pattern for powerful, influential and revolutionary tools in tech
tags:
  - views
  - tech
  - thoughts
  - blog
date: 2025-04-30
generate-audio: "true"
---
 [![](https://blogger.googleusercontent.com/img/a/AVvXsEjnLFTOa8RgpyS9t9qYTuaVBjKzgdaqd_xUyJdqTmAQYpk3nbBvRvpnWDU5252A-CfWmBXNg4LRbOhS9YcdmvZZXWpbNuxpDjyzveiUjK5hhtVb2nqIS8gw366P57fxKaekiDinxCWoS-7xQ0FCneiy7ei2jEF2WfAxWa5NksvJUf4tVjda3xu80YvbMLc=w664-h441)](https://www.blogger.com/blog/post/edit/3054563877724509654/4495270415793920767#)

  
  

In this blog, I aim to share my experiences and insights on integrating Artificial Intelligence (AI) into software development workflows. Contrary to the common fear that AI might replace developers, I believe that AI serves as a powerful collaborator, enhancing our capabilities and efficiency. 

_Think of AI like a very very smart butler and very very knowledgeable butler. It knows a lot, but it doesn't know what to do with what it knows._ 

The apprehension that AI will render human developers obsolete is widespread. However, in my experience, AI acts more as an assistant than a replacement. It automates repetitive tasks, offers suggestions, and helps in exploring new solutions, thereby allowing developers to focus on more complex and creative aspects of development.

---

## 1. Learning: Navigating the Unknown Unknowns

_There are things that we know. There are things that we know that we don't know. And then there are things that we don't even know that we don't know!_

One of the most significant advantages of using AI in development is its ability to help identify and understand the "unknown unknowns." These are aspects or problems we are unaware of and, therefore, cannot address directly. AI can surface these hidden issues by analysing patterns and suggesting areas that might need attention. Exploring such unknown unknowns is where the real learning happens.

For example, while working on a project, I might not realize the importance of implementing caching mechanisms or job scheduling if I don't know it already or haven't worked with it before. AI can prompt me to consider these aspects, aiding my learning and growth as a fresher and helping to make more efficient and robust applications.

## 2. Code Generation: From Bookstore App to Portfolio Website

To illustrate the practical use of AI in development, let's consider two projects:

- **A Django-based full-stack app**: An online bookstore application where I used AI to generate a lot of boilerplate code, such as views and serializers. This helped focus my time and energy on creating good and robust models.
    
- **Portfolio Website**: For this project, I utilized Vercel's [v0.dev](https://www.blogger.com/blog/post/edit/3054563877724509654/4495270415793920767#) , which is fine-tuned for frontend development. It helped me create the entire website with just one prompt.
    

I'll add links to both the projects and the prompts used in it as soon as I publish their blogs.

---

## 3. Writing the right prompts and using AI wisely

The effectiveness of AI tools largely depends on how well we interact with them. Crafting precise prompts is crucial to obtaining useful and relevant outputs. It's an iterative process—refining prompts based on the responses received to align with the desired outcome.

You can refer to this booklet by Lee Boonstra. It is really cool and help you right much better prompts (even if you think that you are writing great prompts) [https://www.gptaiflow.tech/assets/files/2025-01-18-pdf-1-TechAI-Goolge-whitepaper_Prompt%20Engineering_v4-af36dcc7a49bb7269a58b1c9b89a8ae1.pdf](https://www.blogger.com/blog/post/edit/3054563877724509654/4495270415793920767#) 

In my experience, the quality of the prompt directly influences the quality of the AI-generated output. Therefore, investing time in learning prompt engineering can significantly enhance the benefits derived from AI tools.

Moreover, selecting the right AI model for a specific task is essential. For instance, using models fine-tuned for frontend development can yield better results for UI-related tasks.

However, there are things for which you'd better not use AI. For example, there is a project that I am working on, which is going to be used to create posts on multiple social media platforms at once. The models for it are a bit complicated because the goal is to make a platform-agnostic software so that we don't have to write more code when adding a new platform. Just its configuration should be enough. So, say you want to add a new social media platform to this software, all you'll have to do is add the sequence of HTTP requests needed to make to the web API of the social media app, and you should be good to go.

Now, naturally, the model for this is slightly complicated. So I did what I do, asked LLMs to tell me what to do. And they were no good. Not even mildly. Even the autocomplete just spoiled more than it made. I ended up making everything by myself, just to not getting annoyed by the speedy yet inaccurate completions of it. 

---

## Conclusion

Integrating AI into software development is not about replacing human developers but enhancing our capabilities. By assisting in identifying unknown challenges, automating repetitive tasks, and providing intelligent suggestions, AI serves as a powerful ally in the development process.

As we continue to explore and understand the potential of AI, it's clear that its role in software development is to augment human creativity and problem-solving, not to supplant it. Embracing AI as a collaborative partner can lead to more efficient, innovative, and robust software solutions.

I'll be publishing in-depth blogs on how AI has helped me in my projects and speed up my development and productivity.