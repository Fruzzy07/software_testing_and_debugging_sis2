# SIS 2: Playwright suite for the Toolshop

[![Playwright Tests](https://github.com/Fruzzy07/software_testing_and_debugging_sis2/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/Fruzzy07/software_testing_and_debugging_sis2/actions/workflows/playwright.yml)

End-to-end tests for <https://practicesoftwaretesting.com>, written in Playwright and TypeScript.
They cover registration, login, buying a product, comparing products and password reset.

**Last run: 9/9 passed** (8 tests plus the login setup). The suite is also stable at 3 repeats in parallel with no retries (25/25).

| Document | Contents |
|---|---|
| [Description.md](Description.md) | Goal, scope, and the full list of test cases with steps and expected results |
| [Prompt.md](Prompt.md) | The exact prompt and AI tool used |
| [Review.md](Review.md) | What the AI produced, how it was reviewed, every correction and why, and the buggy-build experiment |
| [CI-AI.md](CI-AI.md) | AI use for the CI pipeline: model, prompts, what was checked by hand |
| [screenshots/](screenshots/) | Green run (HTML report and console log) and the defects caught on the buggy build |

## Run it

Requires Node.js 18 or later.

```bash
npm install
npx playwright install chromium
npx playwright test
```

| Command | What it does |
|---|---|
| `npm test` | Run everything, headless |
| `npm run test:headed` | Watch it in a browser |
| `npm run test:ui` | Playwright UI mode: time travel, locator picker |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | Strict TypeScript check |

A failed run keeps a trace, which you can open with `npx playwright show-trace test-results/<test>/trace.zip`.

### Against the deliberately buggy build

PowerShell:

```powershell
$env:BASE_URL='https://with-bugs.practicesoftwaretesting.com'; $env:API_URL='https://api-with-bugs.practicesoftwaretesting.com'; $env:ROUTE_PREFIX='/#'; npx playwright test --retries=0
```

bash:

```bash
BASE_URL=https://with-bugs.practicesoftwaretesting.com API_URL=https://api-with-bugs.practicesoftwaretesting.com ROUTE_PREFIX=/# npx playwright test --retries=0
```

This run is expected to go red; [Review.md §4](Review.md#4-proof-that-the-assertions-assert-something) explains each failure.

## What it covers

| ID | Spec | Proves |
|---|---|---|
| TC-01 | `tests/register.spec.ts` | A unique new customer can register, lands on login and can then sign in. A duplicate email is rejected. |
| TC-02 | `tests/login.spec.ts` | Valid credentials reach "My account" with the user's name. Invalid ones show "Invalid email or password" and stay on login. |
| TC-03 | `tests/buy-product.spec.ts` | Add 2 × Claw Hammer → the cart shows the right item, quantity and totals → checkout completes with an invoice number. |
| TC-04 | `tests/compare-products.spec.ts` | Claw Hammer is cheaper than Bolt Cutters, and the comparison page shows the same names and prices. |
| TC-05 | `tests/reset-password.spec.ts` | A known email gets a success confirmation. An unknown one gets "The selected email is invalid." |

## Structure

```
tests/          one spec per test case, plus auth.setup.ts (log in once)
pages/          one page object per screen; address.form.ts is shared by register and checkout
fixtures/       pages.fixture.ts: page objects plus newUser and registeredUser
data/           user.factory.ts (unique user each call), user.api.ts, products.ts, env.ts
screenshots/    run evidence
playwright.config.ts
```

## Key decisions (details in Review.md)

- **No seeded accounts.** They are shared and get locked (`423`). Each test registers its own customer through the API, except TC-01, where registration is the subject.
- **No product IDs.** The demo database is re-seeded and IDs change, so products are found by name through search.
- **No `waitForTimeout`.** Waits are web-first assertions or real events. One example is the `/postcode-lookup` response that fills the address form.
- **No locators in specs.** Page objects own every locator. Specs hold only the assertions.
- **Tests are order-independent and parallel** (`fullyParallel: true`), with unique data on every run.

## Known application defect found

On production, the confirmation after requesting a password reset is the raw translation
key `page.forgot-password.confirm` instead of a sentence. See Review.md, finding 6.

## CI

[![Playwright Tests](https://github.com/Fruzzy07/software_testing_and_debugging_sis2/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/Fruzzy07/software_testing_and_debugging_sis2/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. The repository already lives on GitHub, so Actions needs no server of its own and no webhooks or tunnels (unlike a local Jenkins). It is free for public repositories, and its job matrix gives sharding without extra tooling.

**Runners: self-hosted for the tests.** The first runs on GitHub-hosted `ubuntu` runners failed in every shard: the login form never appeared. A probe step on the runner showed why. `practicesoftwaretesting.com` sits behind Cloudflare, which answers datacenter IPs with HTTP 403 and a "Just a moment… Performing security verification" bot check instead of the app. The API (`api.practicesoftwaretesting.com`) still answered 200. The same probe from a home connection gets the real login page. Because the suite tests a third-party site whose bot protection is not ours to switch off, the `test` job runs on four [self-hosted runners](ci/setup-self-hosted-runners.ps1) (label `toolshop`) on my Windows machine, one per shard. The `Merge reports` job needs no access to the site and stays on a GitHub-hosted `ubuntu-24.04` runner.

Consequences:

- runs execute only while the runners on that machine are switched on; otherwise jobs wait in the queue;
- on Windows, `--with-deps` installs nothing (system packages are a Linux thing), and browsers stay installed between runs, so the install step is fast after the first run;
- for safety, the `test` job is skipped for pull requests from forks: a self-hosted runner on a public repository must not run strangers' code.

Starting the runners (PowerShell, from the repository root; the token comes from Settings → Actions → Runners → New self-hosted runner):

```powershell
.\ci\setup-self-hosted-runners.ps1 -Token <TOKEN>   # first time: register 4 runners and start them
.\ci\setup-self-hosted-runners.ps1                  # later: just start them
```

**Pipeline** ([.github/workflows/playwright.yml](.github/workflows/playwright.yml)):

- runs on every `push` and every `pull_request`, with no branch filter, plus `workflow_dispatch` for manual timing runs;
- `actions/setup-node` with `cache: npm`, then `npm ci`, then `npx playwright install --with-deps chromium`;
- the full suite with no `--grep` or `--project` filter, split into 4 shards (`--shard=i/4`) that run in parallel. `fail-fast: false` means one red shard does not cancel the others;
- the `Merge reports` job merges the shards' blob reports into one HTML report and one JUnit file ([merge.config.ts](merge.config.ts));
- artefacts, uploaded even when tests fail (`if: !cancelled()`), kept for 14 days:
  - `playwright-report`: the merged HTML report, with traces;
  - `test-results-1` … `test-results-4`: traces, screenshots, videos and `junit.xml` of each shard;
  - `junit-report`: the merged JUnit XML;
  - `blob-report-N`: intermediate files, kept for 1 day only;
- `concurrency` cancels an outdated run when a new push arrives on the same branch.

**CI settings** ([playwright.config.ts](playwright.config.ts), active when `CI` is set; GitHub Actions sets it automatically):

| Setting | Local | CI | Why |
|---|---|---|---|
| `forbidOnly` | `false` | `true` | A forgotten `test.only` fails the run instead of silently running one test. |
| `retries` | `1` | `2` | A test that passes on retry is reported as flaky, not as a plain pass. |
| `workers` | `4` | `2` | GitHub-hosted runners have 2 to 4 vCPUs. |
| `reporter` | `list`, `html` | `list`, `blob`, `junit` (`reports/junit.xml`) | Blob is needed to merge shards; JUnit is understood by every CI tool. |
| `trace` | `on-first-retry` | `on-first-retry` | The trace records exactly the attempt that failed. |
| `video` | `retain-on-failure` | `retain-on-failure` | Kept only for failed tests. |

`fullyParallel: true` lets shards split individual tests, not whole files. The `setup` project (sign in a fresh customer) is a project dependency, and Playwright does not shard dependencies, so every shard runs it once before its own tests.

The target URLs come from the optional repository variables `BASE_URL` and `API_URL` (Settings → Secrets and variables → Actions → Variables). Without them the production Toolshop is used. The suite needs no passwords: each run registers its own throw-away customer.

To open a trace, download `playwright-report` or `test-results-N` from the run page, then run `npx playwright show-trace <path>/trace.zip` or drop the file onto <https://trace.playwright.dev>.

### Runtime

"Before" is the same workflow with one shard, "after" is with four. Both are started from Actions → Playwright Tests → Run workflow, choosing `shards` = `1` or `4`, so no file has to be edited between the runs.

| Configuration | Total run time | Run tests step (slowest shard) | Run |
| --- | --- | --- | --- |
| 1 job, no sharding | TODO | TODO | [run](TODO) |
| 4 shards + merge | TODO | TODO | [run](TODO) |

Median of 3 runs via `workflow_dispatch`.

Conclusion: TODO (fill in after the runs). The suite has only 8 tests (about 20 s of test time). Each shard still pays for checkout, `npm ci` and the login setup, and the 4 shards share one machine's CPU and network. So sharding is expected to save little here; it pays off once the suite runs for several minutes.

### Running locally in CI mode

bash / Git Bash:

```bash
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test
```

PowerShell:

```powershell
$env:CI = "true"; npx playwright test; Remove-Item Env:CI
```

Shards and the report merge, as in CI (bash):

```bash
mkdir -p all-blob-reports
CI=true npx playwright test --shard=1/2 && cp blob-report/*.zip all-blob-reports/
CI=true npx playwright test --shard=2/2 && cp blob-report/*.zip all-blob-reports/
npx playwright merge-reports --config merge.config.ts ./all-blob-reports
npx playwright show-report
```

Checked locally before the first push: both shards green (5 + 5 tests, setup included in each), the merged `reports/junit-merged.xml` contains all 10, and changing one `test(` to `test.only(` makes the CI-mode run fail with "item focused with '.only' is not allowed due to the 'forbidOnly' option".
