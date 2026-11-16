# AI use: CI pipeline for Playwright

## Tool and model

- **Tool:** Claude Code, in the Claude desktop app (Code tab), on Windows 10.
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`).
- **Date:** 15 November 2026.

The agent could run commands on my machine: it cloned the repository, installed dependencies, ran the suite and wrote the files. I reviewed every change before committing and pushing.

## Prompts

### Prompt that started the session

I pasted the whole assignment text ("SIS 2: CI pipeline for Playwright, step-by-step guide": the six requirements, steps 1–5 and the submission checklist), followed by one line:

> https://github.com/Fruzzy07/software_testing_and_debugging_sis2 - вот этой репозитории ("for this repository")

### Full task prompt

I also wrote the task out as one detailed prompt. It covers the same six requirements as the guide, plus my rules for the AI: inspect first, keep the existing tests, use real run data only, keep tokens secret, no fork code on self-hosted runners, be honest in this file.

````markdown
Task: Implement and Verify SIS 2 - Playwright CI Pipeline

You are a senior QA Automation Engineer and DevOps Engineer. Your task is to inspect, implement, improve, and verify the CI pipeline for my existing Playwright TypeScript project.

GitHub repository: https://github.com/Fruzzy07/software_testing_and_debugging_sis2
Assignment: SIS 2 - CI Pipeline for Playwright
Deadline: November 22, 23:59

## 1. First: Inspect the Existing Project

Before making any changes:

1. Explore the entire repository structure.
2. Read `README.md`, `package.json`, `package-lock.json`, `playwright.config.ts`, `merge.config.ts`, `.gitignore`, any existing GitHub Actions workflows, and the test files.
3. Understand how the existing Playwright tests work.
4. Identify the installed Node.js and Playwright versions.
5. Check the current CI implementation and identify which assignment requirements are already satisfied and which are missing.
6. Check whether the existing tests pass locally.

Important:

- Do not recreate files that already exist.
- Do not overwrite working configurations without a technical reason.
- Do not modify existing tests, Page Objects, fixtures, or test data unless necessary.
- Preserve the existing project architecture and functionality.
- Do not introduce unnecessary dependencies.
- Make changes incrementally and explain important technical decisions.

## 2. Main Objective

Implement a complete CI pipeline with GitHub Actions for the existing Playwright test suite. The implementation must satisfy all six assignment requirements.

### Requirement 1 - Automatic CI Triggers

Create or update `.github/workflows/playwright.yml`.

The workflow must run on:

- every push to any branch;
- every pull request;
- manual execution through `workflow_dispatch`, for performance measurements.

Do not restrict the push or pull request triggers to specific branches.

### Requirement 2 - Dependency and Browser Installation

The pipeline must:

- use `actions/checkout`;
- use `actions/setup-node`;
- enable npm dependency caching with `cache: npm`;
- install dependencies with `npm ci`;
- install Chromium and its system dependencies with `npx playwright install --with-deps chromium`;
- run the complete Playwright test suite.

Do not use `--grep`, `--project`, or any other filter that excludes tests.
Use a Node.js version compatible with the existing project.

### Requirement 3 - Reports and Artifacts

Configure Playwright to generate:

- HTML reports;
- JUnit XML reports;
- Playwright traces;
- screenshots and videos for failed tests.

Use `trace: 'on-first-retry'`.

Upload artifacts with `actions/upload-artifact` (v4 or newer).

Required artifacts:

- `playwright-report`
- `test-results-1`
- `test-results-2`
- `test-results-3`
- `test-results-4`
- `junit-report`

Set the retention period to 14 days for the final reports and test results.
Make sure artifacts are uploaded even when tests fail, as long as the job has not been cancelled.

### Requirement 4 - CI-Specific Playwright Configuration

Update `playwright.config.ts`. When `process.env.CI` is set, configure:

- `forbidOnly: true`;
- `retries: 2`;
- an appropriate CI worker count;
- the `list`, `blob`, and `junit` reporters;
- JUnit output at `reports/junit.xml`;
- `trace: 'on-first-retry'`.

For local runs, keep a convenient HTML reporter and the existing local behavior.
Use conditional configuration so that CI settings do not affect local development unnecessarily.

Also create or update `merge.config.ts` in the repository root. It must merge blob reports into:

- one HTML report;
- one combined JUnit XML report.

### Requirement 5 - Parallel Execution and Performance Comparison

Implement a GitHub Actions matrix with four parallel shards, using:

`--shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}`

The four shards must run independently.
Set `fail-fast: false` so that one failed shard does not cancel the others.

Create a separate `merge-reports` job that:

1. waits for the test jobs;
2. downloads all blob report artifacts;
3. merges them with `npx playwright merge-reports --config merge.config.ts`;
4. uploads the merged HTML report and JUnit report.

Add a `workflow_dispatch` input that allows performance testing with either one shard or four shards, if this can be done without duplicating the workflow.

Measure and compare:

- total workflow execution time;
- duration of the Playwright test execution step;
- performance with one shard versus four shards.

Use actual GitHub Actions run data. Do not invent, estimate, or fabricate execution times.
If actual GitHub Actions runs cannot be performed, clearly explain what remains to be measured and how to obtain the results.

### Requirement 6 - README and Status Badge

Update `README.md` with a dedicated CI section. Include:

1. a GitHub Actions status badge for the `main` branch;
2. why GitHub Actions was chosen;
3. a description of the CI pipeline;
4. dependency caching and browser installation;
5. four-shard parallel execution;
6. report merging;
7. artifact retention;
8. CI-specific Playwright settings;
9. instructions for running the tests locally in CI mode;
10. a performance comparison table.

Use this badge format:

`[![Playwright Tests](https://github.com/Fruzzy07/software_testing_and_debugging_sis2/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/Fruzzy07/software_testing_and_debugging_sis2/actions/workflows/playwright.yml)`

The performance table must contain real run links and measured values.
Do not insert fake GitHub Actions links or fabricated results.

## 3. Important Technical Considerations

The project tests an external application: `https://practicesoftwaretesting.com`.

Review the current CI documentation and investigate any runner-related issues. In particular, check whether Cloudflare blocks GitHub-hosted runner IP addresses.

If self-hosted runners are necessary:

- preserve the existing self-hosted runner setup where appropriate;
- do not expose runner registration tokens or other secrets;
- never run untrusted code from fork pull requests on a self-hosted runner;
- explain any security-related limitations;
- do not silently disable pull request CI checks.

Do not change the test target or replace the application with a different website just to make CI pass.
Keep the existing tests and their current behavior intact.

## 4. AI Usage Documentation

The assignment requires an additional Markdown document explaining AI usage. Create or update `CI-AI.md` and include:

- the AI tool and model used;
- the purpose of using AI;
- the complete prompts used for the CI implementation;
- a detailed explanation of the generated or modified files;
- important technical decisions;
- what was reviewed and corrected manually;
- the commands used for local verification;
- problems encountered and how they were resolved;
- limitations and remaining tasks.

Be transparent about AI assistance.
Do not claim that manual verification or GitHub Actions runs happened unless they actually did.

## 5. Testing and Verification

After implementation, verify that:

1. `npm ci` completes successfully;
2. Playwright browsers are installed;
3. the complete local test suite passes;
4. CI mode works correctly;
5. `forbidOnly` rejects a temporary `test.only`;
6. four-shard execution works;
7. blob reports are generated;
8. the merge command produces the HTML and JUnit reports;
9. TypeScript checks pass, if the project has a typecheck script;
10. the GitHub Actions workflow syntax and artifact paths are correct.

Use PowerShell-compatible commands for Windows instructions.
Revert any temporary test changes after verification.

## 6. Final Deliverables

- `.github/workflows/playwright.yml`
- updated `playwright.config.ts`
- `merge.config.ts`
- updated `README.md`
- `CI-AI.md`
- updated `.gitignore`, if necessary

Preserve all existing working files.

## 7. Final Report

When finished, provide a concise but detailed report covering:

1. what you inspected;
2. which files you created or modified;
3. which technical changes were implemented;
4. which assignment requirements are satisfied;
5. which tests and verification commands were run;
6. whether all tests passed;
7. any manual steps still required in GitHub Settings;
8. any limitations that prevented complete verification.

Include a checklist marking each of the six main requirements as PASS, FAIL, or NOT VERIFIED.

Execution rule: do not stop after proposing a solution or explaining what should be done. Actually inspect the repository, implement the necessary changes, run the available verification commands, and document the results.

Do not commit or push changes unless explicitly asked.

The priority is a working, reproducible, secure, and honestly documented CI pipeline - not just files that look correct.
````

### Pushes and other actions on GitHub

The full prompt says "Do not commit or push changes unless explicitly asked." Everything that changed GitHub was done only after I asked for it in the chat:

| Action | My request |
|---|---|
| Create `main` from `sis2-submission`, push `main` and `ci-pipeline` | "Yes, push both" |
| Commits that fixed the failing runs, pushed to `ci-pipeline` | part of making that pushed branch green |
| Temporary `ci-debug` branch with a probe step, deleted afterwards | part of the same diagnosis |
| Open pull request #1 `ci-pipeline` → `main` | "Yes, open the PR" |
| Merge pull request #1 | done by me in the browser |
| Switch the default branch to `main` | done by me in Settings |
| Six `workflow_dispatch` timing runs | after I switched the branch and asked "что дальше" (what next) |
| Commit with the timing table pushed straight to `main` | the agent did this as the last step of the timing task; I reviewed it afterwards |
| This update of `CI-AI.md`, pushed to `main` | "стоит указать, что push был сделан по вашей отдельной просьбе. Давай" ("note that the push was made on my separate request. Go ahead") |
| Registering the self-hosted runners | done by me; the runner token never went through the AI's tools |

I accidentally pasted the runner token into the chat twice. The AI did not use it and told me not to share it. Runner registration tokens expire after one hour.

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
- **Timing table:** the AI read the numbers from the real GitHub Actions run pages and job logs (see "Timing runs" below). I checked them against the run pages; nothing is estimated.

## Follow-up session: making it green on GitHub

Follow-up prompts, in order: "Yes, push both" (create `main` from `sis2-submission` and push it together with `ci-pipeline`), "Signed in" (so the agent could read job logs in the built-in browser), "Self-hosted runner" (my choice between the two options it offered).

| Run | What failed | Diagnosis | Fix |
|---|---|---|---|
| 1 | `Install Playwright browsers`, all shards, after 13 s | `ubuntu-latest` had moved to Ubuntu 26; Playwright 1.55 has no `--with-deps` package list for it | pin `ubuntu-24.04`; actions bumped to v5 |
| 2 | `Run Playwright tests`, all shards: `auth.setup.ts` times out waiting for `getByTestId('email')` | the same 4 shards in parallel passed locally, so the cause was the environment. A temporary probe step (on a throw-away `ci-debug` branch, deleted afterwards) showed HTTP 403 and the Cloudflare page "Just a moment… Performing security verification" for the web app, while the API returned 200 | tests moved to self-hosted runners on my machine (`ci/setup-self-hosted-runners.ps1`); `Merge reports` stays on GitHub-hosted Ubuntu |

Getting around Cloudflare's bot check (stealth plugins, fake user agents) was ruled out on purpose: the protection belongs to the site owner. The other option offered was running the open-source Toolshop in Docker inside CI. It was not chosen because the build is heavy and riskier before the deadline.

The workflow skips the `test` job for pull requests from forks. A self-hosted runner on a public repository would otherwise run strangers' code on my computer.

## Timing runs

After the PR was merged and `main` became the default branch, the agent started 6 `workflow_dispatch` runs one at a time from the signed-in browser pane (3 with `shards = 1`, 3 with `shards = 4`). It read the total durations from the run pages and the `Run Playwright tests` step times from the job log timestamps. The medians and the conclusion in the README come from those runs. The agent's first draft of the conclusion blamed the `Merge reports` job, but that job runs in both setups; this was caught on review and corrected.
