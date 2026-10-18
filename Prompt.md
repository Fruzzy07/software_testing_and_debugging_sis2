# Prompt

## AI tool

| | |
|---|---|
| Tool | **Claude Code**, the VS Code extension (agent mode: it reads and writes files and runs commands in the project) |
| Model | **Claude Opus 5.5** (`claude-opus-5-5`) |
| Effort level | **TODO: effort setting** |
| Date | 2026-10-18 |

## Prompt 1: the task

I used the official SIS 2 assignment as the prompt, together with the Week 6 lecture
material that defines the requirements and grading rules (`Week_6_Masters_ST.pdf`).
The assignment text, exactly as sent:

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

## Prompting strategy

- **The original requirements as the prompt.** Paraphrasing the assignment risks losing or
  distorting a requirement. The lecture material already defines the five test cases, the
  project structure, the config settings and every grading rule: no `waitForTimeout`, no
  CSS classes or positional XPath, no locators in specs, at least one fixture, unique data
  per run, and tests independent and parallel-safe. Giving the model the original material
  means it works against the same rules the suite is graded on.
- **No locators or code in the prompt.** The lecture warns that `data-test` names change
  between sprints. Leaving them out made the model discover the real names on the live
  site, which I then checked (see [Review.md](Review.md)).
- **An agent, not a chat.** The first grading criterion is "it runs". An agent can execute
  the tests against the real site; a chat model can only guess whether its code works.
- **Review is where the work happens.** The prompt is short on purpose. The effort went into
  checking, re-running and correcting the result, all documented in Review.md.
