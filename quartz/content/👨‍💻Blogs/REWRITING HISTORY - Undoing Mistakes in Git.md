---
title: "REWRITING HISTORY: Undoing Mistakes in Git"
description: A blog post on how to rewrite git history. Very useful when you accidentally commit your credentials into git
tags:
  - "#git"
  - "#tech"
date: 2025-06-14
generate-audio: "true"
---

[![](https://blogger.googleusercontent.com/img/a/AVvXsEiML-hIWtsZDEu6JCakMcBnaioozmao7mDK5QQOqGziz4L6d4nMohqx5j6r8T0C-c_CWuOUbnKxXMBAzYym7Xsac2fBh6bmp23SRMkaaNouxF56fXAo19yXAaKCbc9teZQCctht4xTny9qAqzjuWfjukgXd3y1ZzSkDAZyldfrO4g2nzkp4bLPDhB1-DOM=w603-h603)](https://www.blogger.com/blog/post/edit/3054563877724509654/2122836637356575609#)

Ever had that sinking feeling when you realize you've committed something you shouldn't have? Maybe it's your AWS credentials, a secret API key, or just a commit message that reads like a cryptic haiku. Fear not! Git provides powerful tools to rewrite history and make it seem like your mistakes never happened (almost like time travel, but for code).

In this guide, we'll explore the three primary Git commands for rewriting history: `git revert`, `git reset`, and `git rebase`. Along the way, I'll share a personal tale of how I accidentally committed sensitive information and lived to tell the tale.

---

## The Oops Moment: Committing Secrets

While working on a college project called **OmniPost**—a social media application that allows users to post across multiple platforms from a single interface—I made a rookie mistake. I accidentally committed my AWS credentials to the repository. When I tried to push the changes to GitHub, it rejected the push, citing the presence of sensitive information.

Panic ensued. But then I remembered: Git has tools to help undo such blunders. Enter the trio of commands that can help you rewrite history.

---

## 1. `git revert`: The Safe Undo

Imagine you added a feature five commits ago that you now want to remove. `git revert` is your friend here. It creates a new commit that undoes the changes made by a previous commit, preserving the history. So its on the lines of -> "If you added some lines, it would delete it" and "if you deleted some lines, it would add it", and after making these changes, it would commit it, essentially undoing your changes from a particular commit without altering the history.

**Usage:**

```bash
git revert <commit-hash>
```

This command is especially useful in collaborative environments where you want to maintain a clear history of changes. It's like saying, "I made a mistake, and here's how I fixed it."

**Pro Tip:** You can revert multiple commits by specifying a range as follows: 

```bash
git revert -n master~5..master~2
```

---

## 2. `git reset`: The Powerful (and Potentially Dangerous) Undo

`git reset` is a more forceful way to undo changes. It moves the HEAD to a specified commit and can alter the staging area and working directory, depending on the mode used. (Basically undoes your commits)

**Modes:**

- `--soft`: Moves HEAD to the specified commit but leaves changes in the staging area.
- `--mixed` (default): Moves HEAD and resets the staging area, but leaves the working directory unchanged.
- `--hard`: Moves HEAD, resets the staging area, and resets the working directory to match the specified commit.

**Usage:**

```bash
git reset --soft <commit-hash>
git reset --mixed <commit-hash>
git reset --hard <commit-hash>
```

**Warning:** Use `--hard` with caution. It can permanently delete changes from your working directory.

---

## 3. `git rebase`: The History Rewriter

`git rebase` allows you to rewrite commit history, making it appear as if certain commits never happened. It's particularly useful for cleaning up a messy commit history before merging branches.

**Interactive Rebase:**

To modify multiple commits, use interactive rebase:

```bash
git rebase -i <commit-hash>
```

This command opens an editor where you can choose actions for each commit:

- `pick`: Use the commit as is.
- `edit`: Modify the commit.
- `squash`: Combine this commit with the previous one.
- `drop`: Remove the commit.

**Example:**

Suppose you want to edit the last three commits:

```bash
git rebase -i HEAD~3
```

This opens an editor with the last three commits listed. You can then choose to edit, squash, or drop commits as needed.

**Note:** After making changes, if Git encounters conflicts, resolve them and continue the rebase with:

```bash
git rebase --continue
```

---

## Choosing the Right Tool

| Command  | Use Case                              | Alters History? | Safe for Shared Repos? |
| -------- | ------------------------------------- | --------------- | ---------------------- |
| `revert` | Undo a specific commit                | No              | Yes                    |
| `reset`  | Remove commits and optionally changes | Yes             | No                     |
| `rebase` | Rewrite commit history for clarity    | Yes             | No                     |

---

## Lessons Learned

Committing sensitive information is a common mistake, but it's one that can be rectified with the right tools. In my case, using `git rebase` allowed me to remove the offending commit before pushing to GitHub. Remember:

- Use `git revert` for safe, public undos.
- Use `git reset` for local changes you want to discard.
- Use `git rebase` to clean up your commit history before sharing.

Always double-check what you're committing, and consider using `.gitignore` to prevent sensitive files from being tracked.

---

## Final Thoughts

Git is a powerful tool, and with great power comes great responsibility. Understanding how to rewrite history can save you from embarrassing mistakes and keep your project's history clean and understandable. So, the next time you find yourself in a Git pickle, remember: there's likely a command to help you out.

Happy coding!
