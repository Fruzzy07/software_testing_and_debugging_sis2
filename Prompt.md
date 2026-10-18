# Prompt: the exact prompt I gave the AI tool

## Tool I used

| | |
|---|---|
| Tool | **Claude Code**, the VS Code extension. It works as an agent: it can read and write files and run commands in my project folder. |
| Model | **Claude Opus 5.5** (`claude-opus-5-5`) |
| Effort level | **TODO: effort setting** |
| Date | 2026-10-18 |

## My prompt (verbatim)

I sent one message made of two parts, with no other text.

**Part 1: an attached file.** `Week_6_Masters_ST (1).pdf`, the Week 6 lecture slides
"Web automation with Playwright". They cover the config, locators, codegen, page objects,
fixtures, logging in once, and the SIS 2 brief and grading rules.

**Part 2: pasted text.**

```text
SIS 2 
Test Automation with Playwright 
DEADLINE - Oct 23
LINK to Site to be tested 
https://practicesoftwaretesting.com/

At least 5 AT suits mentioned in the Pres - use any language you want with the Playwright framework. 
 Description.md - file: explain what you want to do 
List of TCs to be automated 
Prompt.md file save exactly the prompt you used for the AI tool; mark exactly which tool you gonna use, like Claude Opus 5 Max efforts, etc 
Review.md: explain what the AI results were about, how you reviewed and modified them, and justify your decisions 
Screenshots - AI response, Run results or whatever you think matters 
Link to public GitHub repository.
```

My follow-up message after the first result:

```text
you must write prompt.md and review.md from my side
```

## Why I wrote the prompt this way

- **I used the slides as the specification.** They already contain the five test cases, the folder structure, the four config settings and every grading rule: no `waitForTimeout`, no CSS classes or positional XPath, no locators in specs, at least one fixture, unique data per run, and tests that pass in any order and in parallel. Attaching the slides gave the AI the complete rule set. Retyping it, I would have lost details.
- **The assignment text lists the deliverables**: Description.md, Prompt.md, Review.md, screenshots and a public repository.
- **I deliberately gave no locators, element names or code.** The lecture warns that `data-test` names change between sprints and should not be copied from tutorials. I wanted to see whether the AI would discover the real names on the live site instead of inventing them from memory. It did, and I checked that (see [Review.md](Review.md)).
- **I chose an agent tool rather than a chat window.** An agent can run the tests against the real site. A chat model can only guess whether its code works. Since the first grading criterion is "it runs", I wanted every claim backed by an actual run.
