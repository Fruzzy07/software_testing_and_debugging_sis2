# Prompt: exactly what was given to the AI tool

## Tool

| | |
|---|---|
| Tool | **Claude Code**, VS Code extension (agentic mode: it can read and write files and run commands in the project folder) |
| Model | **Claude Opus 5.5** (`claude-opus-5-5`) |
| Effort level | **TODO: fill in the effort setting you used** |
| Date | 2026-10-18 |

## The prompt (verbatim)

The prompt was one message with two parts and no other text.

**Part 1: attached file.** `Week_6_Masters_ST (1).pdf`, the Week 6 lecture slides
"Web automation with Playwright" (config, locators, codegen, page objects,
fixtures, login once, the SIS 2 brief and grading rules).

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

## Why the prompt looks like this

- **The slides are the specification.** They contain the five test cases, the required folder structure, the config settings and the grading rules. They state "no `waitForTimeout`", "no CSS classes / positional XPath", "no locator in a spec", "at least one fixture", "unique data per run" and "any order, in parallel". Attaching them gave the model the full rule set with no paraphrasing.
- **The assignment text defines the deliverables**: Description.md, Prompt.md, Review.md, screenshots and a repository.
- **No locators, element names or code were given.** The slides warn that `data-test` names change between sprints. The model was expected to discover the real names from the live site, and it did (see Review.md).
