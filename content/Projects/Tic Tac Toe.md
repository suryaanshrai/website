---
title: ❌ ⭕ ❌
description:
tags:
  - projects
  - tech
date: 2025-10-24
generate-audio: "true"
---
This was again a part of [[CS50]]'s AI course. I learned the minmax algorithm from this. This project also gave me a much deeper insight into recursion. Although it was also not that hard to implement since it was a direct implementation of the [minmax algorithm shared in the notes](https://cs50.harvard.edu/ai/notes/0/#minimax). But nonetheless, it was fun to do, so I thought it's worth mentioning it here, especially considering how fairly simple it is to make the AI for a tic-tact-toe game that either always wins or ends up in a draw. I think it would rather be more interesting to add some randomness to the minmax algorithm so that every once in a while it may not make the most optimal move, but mess it up just slightly. Something like the temperature factor of the [stimulated annealing algorithm](https://en.wikipedia.org/wiki/Simulated_annealing) but instead of optimizing it de-optimizes the AI to make it possible for the player to win (sometimes). Higher levels can have lesser randomness and vice versa for the lower levels. 

Regardless, here is the pseudocode for the minmax algorithm which I used for the AI at the time.

![[Pasted image 20260123184459.png]]

And a video demonstrating the application itself - 
![Video Link](https://youtu.be/h7uUl9YMY9k)
