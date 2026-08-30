---
title:
description:
tags:
  - projects
date: 2025-10-24
generate-audio: "true"
---

This one takes me back. It was my first ever deployed application. I built it in 2022. I doubt anybody ever used it to solve their own cubes, but I enjoyed making it a lot.

Before I started [[CS50]]'s X, I had it in my mind that my final project would be a cube solver application. I saw that JS, Python, HTML, CSS, and C were all listed there in the course's curriculum, and I got excited thinking I would make this and that once I learn everything from this course (I realize now that why it was an introductory course). I was imagining a 3D viewer that would demonstrate the solution by moving an interactive cube using something like Three.js, taking input from a live camera stream, and so on.

But, in the end, this was what I came up with:

![Demo](https://www.youtube.com/watch?v=9vHTXn2J1tw)

Later, I did modify the UI to go from text to an interactive color-based interface. Although it was far from what I had initially envisioned, it was still a very enjoyable and rewarding experience for me, as I deployed this application on Render and was able to share it with family and friends.

The joy of making this project set me off on several other projects and a couple of other CS50 courses. I enjoyed their introductory one so much that I would be lying if I said I didn't gain more knowledge (both practical and theoretical) from them than I did from my college degree. I am very sure that had I not done these courses, the college courses themselves were so dead that they would have killed any passion in me before it could turn from interest to disciplined practice. But more on that some other time.

Coming back to this project, I used the Kociemba library to get the solution for the cube. It's quite efficient; it gives a ~20 move solution almost every time. For the frontend, it’s plain old HTML, CSS, and JS, mixed with a few fetch calls for dynamic rendering (something about doing these DOM manipulations creates a very good foundation for using JS on the frontend and understanding React later). The API itself is a simple Flask application. Nothing too out of the ordinary, but yeah, this was my first project and also my final submission for the CS50 course.

Full code here - https://github.com/suryaanshrai/cube_solver
