# Review: what the AI gave me, how I checked it, and what I changed

## 1. What the AI produced

I gave Claude Code the prompt in [Prompt.md](Prompt.md). It produced the whole repository:

- `playwright.config.ts` with the four settings from the lecture (`baseURL`, `testIdAttribute: 'data-test'`, `trace: 'on-first-retry'`, retries) and a `setup` project.
- **Page objects** in `pages/`, one per screen, plus a shared `AddressForm` component.
- **A fixture layer**, `fixtures/pages.fixture.ts`. It gives every test its page objects and two data fixtures: `newUser` (not yet registered) and `registeredUser` (created through the REST API).
- **Test data** in `data/`: a user factory that makes a unique email on every call, an API helper and the environment settings.
- **Five spec files**, one per test case from the brief, with 8 tests in total, plus `auth.setup.ts` to log in once and reuse the session.
- First drafts of the documentation.

What I noticed first is that it did **not** write the suite from memory. Before writing any test it scripted a browser against the live site and listed every `data-test` attribute on each screen. It then walked through each flow (login, register, forgot password, cart, the four checkout steps, compare) to record the real messages and API responses. That matches the lecture's advice: find the real names yourself, don't copy them.

## 2. How I reviewed it

I didn't accept the result just because it said "passed". I checked each grading criterion separately:

| What I checked | How | Result |
|---|---|---|
| **It runs** | `npx playwright test`, and also a fresh `git clone` into an empty folder, then `npm ci` and a run, the way the teacher will run it | **9/9 passed** in both (`screenshots/green-run.txt`, `screenshots/green-run-html-report.png`) |
| **It isn't flaky** | `--repeat-each=3 --workers=6 --retries=0`: every test three times, in parallel, with no retries to hide anything | **25/25 passed** |
| **It compiles strictly** | `npm run typecheck` (`tsc` with `strict: true`) | No errors |
| **It follows the course rules** | Searched the repository for `waitForTimeout`, XPath, CSS-class selectors, and any `getBy…`, `locator(` or `page.goto` inside `tests/` | **No matches.** Spec files contain no locators. |
| **The assertions can actually fail** | Ran the same suite against the deliberately buggy build, with-bugs.practicesoftwaretesting.com | Tests went red on real defects (section 4) |
| **Each test proves its requirement** | Read every spec against the "What it must prove" column of the brief | Two tests needed to be strengthened (section 5) |

## 3. Problems found and how they were fixed

The first version wasn't right everywhere. Each of these was caught by **running** the code, not by reading it.

| # | Problem | Evidence | Fix and why I accepted it |
|---|---|---|---|
| 1 | **Hard-coded product IDs.** Early on, products were opened by URL, for example `/product/01M57ZA5RYPHG207ET8XCRWHT6`. An hour later that page was empty. | `GET /products/01M57ZA5…` → **404**. The demo database had been re-seeded and every product had a new ID. | Products are now found by **name**, through search (`HomePage.openProduct(name)`), and names live in `data/products.ts`. A test that breaks every time the database resets is worse than no test. |
| 2 | **The exact-name match failed.** `filter({ hasText: /^Bolt Cutters$/ })` found nothing. | Timeout. The card's text has whitespace around the name. | The regex now allows surrounding whitespace and escapes the name. Exact matching is still needed, because a plain "Claw Hammer" also matches "Claw Hammer with Shock Reduction Grip". |
| 3 | **The seeded accounts aren't reliable.** The plan was to log in as `customer2@…` / `welcome01`, as in the slides. | `POST /users/login` → **423 "Account locked, too many failed attempts"**. Another student had locked it. | Every test that needs an account now **registers a fresh one through the API** (the `registeredUser` fixture), and `auth.setup.ts` does the same. The invalid-login test uses an email that was never registered, so our suite can't lock a shared account either. This follows the slide's rule: "never write a test that assumes it is the only user". |
| 4 | **Checkout failed at the final Confirm button.** No order was created. | From the trace's network tab: `POST /invoices` → **422 "The billing_country does not match the entered address. The city does not belong to the selected country."** | Root cause: entering country, postcode and house number makes the app call `/postcode-lookup` **asynchronously**, and the response overwrites street, city and state. The test was typing into those fields at the same moment, so the submitted address was a random mix. The fix, `pages/address.form.ts`, waits for that **response** (a real event, not a timeout) and then asserts that the fields contain exactly what the lookup returned. This is how a real user uses the form ("We will fill in the rest automatically"), and it removes the race. Register and checkout share this component. |
| 5 | Browser scripts run outside the test runner found no elements. | `getByTestId('search-query')` timed out. | Outside `playwright test`, `getByTestId` looks for `data-testid` by default. That showed me in practice why config setting 2 (`testIdAttribute`) matters. |
| 6 | Reset password with a known email shows the text **`page.forgot-password.confirm`**. | DOM: `<div role="alert" class="alert alert-success">page.forgot-password.confirm</div>` | This is a **real bug in the production app**: a translation is missing and the raw i18n key is shown. I chose to assert what the requirement means (a success-styled alert that is not an error), not the broken text, so the suite stays green. The bug is recorded here and in a comment in the spec. |
| 7 | The buggy build couldn't be tested at first. | `/auth/login` → Apache 404; `/users/register` → 422 "address field must be a string" | It's an older release that uses hash routing and an older register payload. `ROUTE_PREFIX` was added to `data/env.ts`, and `registerViaApi` falls back to the old payload. Behaviour against the production site is unchanged. |

## 4. Proof that the assertions really assert something

The lecture suggested this experiment, so I ran it.

```powershell
$env:BASE_URL='https://with-bugs.practicesoftwaretesting.com'
$env:API_URL='https://api-with-bugs.practicesoftwaretesting.com'
$env:ROUTE_PREFIX='/#'
npx playwright test --retries=0
```

Result: **3 passed, 6 failed.** I looked at every failure screenshot to decide which failures are real bugs and which come from the older UI.

| Test | What happened on the buggy build | Real defect? |
|---|---|---|
| TC-02a valid login | The user menu says **"User Data not found"** instead of the user's name (`screenshots/buggy-build-login-user-data-not-found.png`) | **Yes.** Caught because the test checks the user's name, not just the URL. |
| TC-05b unknown email | The app says **"Your password is successfully updated!"** for an email that doesn't exist (`screenshots/buggy-build-reset-unknown-email-accepted.png`) | **Yes.** Caught by checking the exact error text. |
| TC-03 buy | No "Product added to shopping cart." confirmation appears (`screenshots/buggy-build-no-add-to-cart-toast.png`) | **Yes.** The user gets no feedback. The screenshot also shows a "Reltded products" typo. |
| TC-01a/b register | The older form has no postcode lookup, so the address step waits for a response that never comes | **No.** This is a UI version difference, not a caught bug. (That form also has the Country and State labels swapped, which my tests don't check.) |
| TC-04 compare | The compare feature doesn't exist in the older build | **No.** The feature is missing, so the failure tells us nothing. |

I'm only counting the three genuine catches. Calling all six failures "bugs found" would overstate what the suite proves.

## 5. My decisions and why

| Decision | Why I made it |
|---|---|
| **TypeScript** | It's the reference implementation of Playwright, and the runner, fixtures and documentation are first-class there (slide 5). |
| **Fresh accounts, not the seeded ones** | Shared accounts get locked by other people (problem 3). The brief also requires every test to create the data it needs. |
| **Accounts created through the API, except in TC-01** | Registration is the subject of TC-01 only, so only TC-01 uses the form. Elsewhere the API is faster and keeps one broken form from failing five tests. |
| **Log in once (`auth.setup.ts` + `storageState`)** | Slide 24. TC-03 starts already signed in. TC-02 still logs in through the UI, because login is its subject. The saved session is never committed (`.gitignore`). |
| **Locators live in page objects; every `expect` lives in the spec** | Page objects say *how* (locators, clicks); specs say *what must be true*. A reader can see from the spec alone what each test proves. |
| **Strengthening TC-01** | Landing on `/auth/login` doesn't prove an account was created. I wanted the test to sign in with the new credentials and check the user's name. |
| **Strengthening TC-02** | The URL alone isn't enough. Section 4 shows a URL-only check would have passed on the buggy build, where the user data is broken. |
| **Stating a concrete comparison in TC-04** | The brief says "assert the comparison you state". Mine is "the Claw Hammer is cheaper than the Bolt Cutters", checked with prices read from the product pages. The test also checks that `/comparison` shows the same names and prices. |
| **`retries: 1` locally, 2 in CI** | The site is a shared public demo that is sometimes slow. One retry absorbs a network hiccup, and a real bug still fails twice. `trace: on-first-retry` records whatever happened. I also confirmed the suite passes with `--retries=0`, so the retry isn't hiding flakiness. |
| **`workers: 4`** | Fast enough (about 20 s for the whole suite) without hammering a public website other students are using. |
| **Only `data-test`, roles and visible text in locators** | Course rule. In TC-05, `toHaveClass(/alert-success/)` is an assertion on how the message is styled, not a way of finding the element, so it doesn't break the "no CSS classes in locators" rule. |

## 6. What I took away from reviewing the AI's work

- **"It passed once" proves very little.** Only running each test three times in parallel, and then against the buggy build, told me the suite is both stable and meaningful.
- **The AI's first assumptions were the weak spots**: hard-coded IDs, seeded accounts, typing into fields that the app overwrites. None of these were syntax errors. They only showed up against the real, shared, changing application. That's why I chose a tool that runs the code, and why I'll keep running it before submitting.
- **A test can pass while proving nothing.** The URL-only login check would have stayed green on a broken build. I now ask of every test: "what would have to break for this to go red?"
- **Not every red test is a bug.** On the buggy build I separated real defects from version differences instead of counting every failure.
