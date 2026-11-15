# AI use: CI pipeline for Playwright

## Tool and model

- **Tool:** Claude Code, in the Claude desktop app (Code tab), on Windows 10.
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`).
- **Date:** 15 November 2026.

The agent could run commands on my machine: it cloned the repository, installed dependencies, ran the suite and wrote the files. I reviewed every change before committing and pushing.

## Prompt

I pasted the whole assignment text ("SIS 2: CI pipeline for Playwright, step-by-step guide": the six requirements, steps 1–5 and the submission checklist), followed by one line:

> https://github.com/Fruzzy07/software_testing_and_debugging_sis2 — вот этой репозитории ("for this repository")

## What the AI did

1. **Read the existing project first.** It found that `playwright.config.ts` already had `forbidOnly` and `retries: 2` under `CI`, a `setup` project that signs in a fresh customer, and target URLs read from `BASE_URL` / `API_URL` in `data/env.ts`.
2. **`playwright.config.ts`.** Added a single `isCI` flag, a CI reporter set (`list`, `blob`, `junit` → `reports/junit.xml`) and `video: 'retain-on-failure'`. The local reporter (`list` + `html`) and local retries (1) stayed as they were.
3. **`merge.config.ts`.** HTML + `reports/junit-merged.xml` for the merge job.
4. **`.github/workflows/playwright.yml`.** Based on the guide's workflow, with two changes:
   - `workflow_dispatch` has a `shards` input (`4` or `1`), and the matrix is computed with `fromJSON(...)`. The "before" (1 shard) and "after" (4 shards) runs come from the same file, without temporary edits. `push` and `pull_request` have no inputs, so they always get 4 shards.
   - `BASE_URL: ${{ vars.BASE_URL || '<default>' }}` instead of `${{ vars.BASE_URL }}`. Without a repository variable the guide's version passes an empty string, and `process.env.BASE_URL ?? ...` in `data/env.ts` does not replace an empty string, so every `goto()` would break. `API_URL` gets the same fallback.
5. **`.gitignore`.** Added `reports/`, `all-blob-reports/`, `.act-artifacts/`, `.secrets`.
6. **README.** Added the badge at the top and a `## CI` section: the CI system and why, the pipeline, the CI settings table, the timing table and the local commands.

## What was checked, and how

| Check | Result |
|---|---|
| `npx tsc --noEmit` | passes |
| `CI=true npx playwright test --shard=1/2` and `--shard=2/2` | 5 + 5 passed. The `setup` project runs in both shards: Playwright does not shard project dependencies. |
| `npx playwright merge-reports --config merge.config.ts ./all-blob-reports` | one HTML report; `reports/junit-merged.xml` has `tests="10" failures="0"` |
| One `test(` changed to `test.only(` in `login.spec.ts`, run with `CI=true` | fails: "item focused with '.only' is not allowed due to the 'forbidOnly' option". Change reverted. |

Not checkable locally, verified on GitHub: the npm cache restore on the second run, artefact retention, real runner timings and the badge.

## Decisions I made myself

- **Browser cache:** not added. The Playwright docs say restoring it takes about as long as downloading the browsers.
- **Projects:** only Chromium, as before.
- **Timing table:** the numbers are written in by hand from the GitHub Actions run pages, not by the AI.
