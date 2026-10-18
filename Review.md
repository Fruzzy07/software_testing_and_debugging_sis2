# Review: what the AI produced, how it was checked, what was changed

## 1. What the AI produced

From the prompt in [Prompt.md](Prompt.md), Claude Code produced the whole repository:

- `playwright.config.ts` with the four settings from the lecture (`baseURL`, `testIdAttribute: 'data-test'`, `trace: 'on-first-retry'`, retries) plus a `setup` project.
- **Page objects** in `pages/`, one per screen, plus a shared `AddressForm` component.
- **A fixture layer** in `fixtures/pages.fixture.ts`. It provides every page object and two data fixtures: `newUser` (not yet registered) and `registeredUser` (created through the REST API).
- **Data** in `data/`: a user factory that makes a unique email every call, an API helper and environment settings.
- **Five spec files**, one per test case, with 8 tests in total, plus `auth.setup.ts` (log in once, reuse the session).
- The documentation: Description, Prompt, this Review, README and screenshots.

It did **not** write the suite from memory in one pass. It first scripted a browser against the live site to list every `data-test` attribute on each screen. It then walked each flow by hand (login, register, forgot password, cart, the four checkout steps, compare) to record the real messages and API responses, and only then wrote the tests.

## 2. How the output was reviewed

| Check | How | Result |
|---|---|---|
| It runs | `npx playwright test` from a clean state | **9/9 passed** (`screenshots/green-run.txt`, `screenshots/green-run-html-report.png`) |
| It isn't flaky | `--repeat-each=3 --workers=6 --retries=0`: every test 3×, in parallel, no retries | **25/25 passed** |
| It compiles strictly | `npm run typecheck` (`tsc`, `strict: true`) | No errors |
| Course rules | Searched the repo for `waitForTimeout`, XPath, CSS-class selectors, and `getBy…`, `locator(` or `page.goto` inside `tests/` | **No matches.** Specs contain no locators. |
| Assertions can fail | Ran the same suite against **with-bugs.practicesoftwaretesting.com** | Tests went red on real defects; see section 4 |

## 3. Problems found during review, and how each was fixed

These are the places where the first version was wrong. Each was caught by running the code, not by reading it.

| # | What went wrong | Evidence | Fix and justification |
|---|---|---|---|
| 1 | **Hard-coded product IDs.** Early exploration navigated to `/product/01M57ZA5RYPHG207ET8XCRWHT6`. An hour later that page was empty. | `GET /products/01M57ZA5…` → **404**. The database had been re-seeded and every product had a new ID (`01M582…`). | Products are reached by **name**, through search (`HomePage.openProduct(name)`). Names live in `data/products.ts`. The ID is never used. |
| 2 | **Exact-name match failed.** `filter({ hasText: /^Bolt Cutters$/ })` found nothing. | Timeout: the card's text has whitespace around the name. | The regex allows surrounding whitespace and escapes the name. Exact matching is still needed: a plain "Claw Hammer" also matches "Claw Hammer with Shock Reduction Grip". |
| 3 | **The seeded accounts aren't reliable.** The plan was to log in as `customer2@…` / `welcome01`, as the slides suggest. | `POST /users/login` → **423 "Account locked, too many failed attempts"**. Another student had locked it. | Every test that needs an account **registers a fresh one through the API** (`registeredUser` fixture). `auth.setup.ts` does the same. The invalid-login test uses an *unregistered* email, so our suite never locks a shared account either. |
| 4 | **Checkout failed at the final Confirm.** The order wasn't placed. | From the trace's network log: `POST /invoices` → **422 "The billing_country does not match the entered address. The city does not belong to the selected country."** | Root cause: entering country, postcode and house number triggers an **async `/postcode-lookup`** that overwrites street, city and state. Our typing raced that response, so the submitted address was a random mix. The fix is `pages/address.form.ts`: wait for the lookup **response** (an event, not a timeout), then assert that the fields hold exactly what the lookup returned. This is how a real user experiences the form ("We will fill in the rest automatically"), and it removes the race. Register and checkout both use this component. |
| 5 | Exploration scripts outside the test runner found no elements. | `getByTestId('search-query')` timed out. | Outside `playwright test`, `getByTestId` defaults to `data-testid`. This confirms why setting 2 in the config matters. |
| 6 | Reset password, known email: the confirmation text is **`page.forgot-password.confirm`**. | Screenshot and DOM: `<div role="alert" class="alert alert-success">page.forgot-password.confirm</div>` | This is a **real defect in the production app**: a missing translation shows the raw i18n key. The test asserts what the requirement means (a success-styled alert that is not an error) and not the broken text, so the suite stays green. The defect is recorded here and in a comment in the spec. |
| 7 | The buggy build couldn't be tested at first. | `/auth/login` → Apache 404; `/users/register` → 422 "address field must be a string". | That build is an older release with hash routing and a flat address payload. Fixes: `ROUTE_PREFIX` in `data/env.ts`, and `registerViaApi` falls back to the legacy payload. Production behaviour is unchanged. |

## 4. Proof that the assertions assert something

Command (PowerShell):

```powershell
$env:BASE_URL='https://with-bugs.practicesoftwaretesting.com'
$env:API_URL='https://api-with-bugs.practicesoftwaretesting.com'
$env:ROUTE_PREFIX='/#'
npx playwright test --retries=0
```

Result: **3 passed, 6 failed.** The failures fall into two groups.

| Test | Failure on the buggy build | Genuine defect? |
|---|---|---|
| TC-02a valid login | User menu shows **"User Data not found"** instead of the user's name (`screenshots/buggy-build-login-user-data-not-found.png`) | **Yes.** Caught by asserting the user's name, not just the URL. |
| TC-05b unknown email | The app says **"Your password is successfully updated!"** for an email that doesn't exist (`screenshots/buggy-build-reset-unknown-email-accepted.png`) | **Yes.** Caught by asserting the exact error text. |
| TC-03 buy | No "Product added to shopping cart." confirmation after Add to cart (`screenshots/buggy-build-no-add-to-cart-toast.png`) | **Yes.** No user feedback. The screenshot also shows a "Reltded products" typo. |
| TC-01a/b register | The older form has no postcode lookup, so the address step waits for a response that never comes | No. A UI version difference. (It also has the Country and State labels swapped, which our test doesn't assert.) |
| TC-04 compare | The older build has no compare feature | No. The feature doesn't exist there. |

Without the name assertion, a "login works" test that only checked the URL would have **passed** on the buggy build. That is the point of TC-02a's extra assertion.

## 5. Design decisions and their justification

| Decision | Why |
|---|---|
| **TypeScript** | The reference implementation; the fixtures and docs are first-class there (lecture slide 5). |
| **Fresh accounts instead of seeded ones** | Shared accounts get locked by other users (finding 3). The brief requires every test to create the data it needs. |
| **Accounts made through the API, except in TC-01** | Registration is the *subject* of TC-01 only, so only TC-01 uses the form. Elsewhere the API is faster and keeps a broken register form from failing five tests. |
| **Login once (`auth.setup.ts` + `storageState`)** | Lecture slide 24. TC-03 starts signed in, while TC-02 still logs in through the UI because login is its subject. The session is saved per run and never committed (`.gitignore`). |
| **Assertions as page-object locators, expectations in specs** | Page objects say *how* (locators, clicks). Specs say *what must be true*, so every `expect` is visible in the spec and a reviewer can see what each test proves. |
| **A strengthened TC-01** | Landing on `/auth/login` doesn't prove an account exists, so the test signs in with the new credentials and checks the user's name. |
| **TC-04 states a comparison** | "Claw Hammer is cheaper than Bolt Cutters", checked with numbers captured from the product pages, plus a check that `/comparison` shows the same names and prices in order. |
| **`retries: 1` locally, 2 in CI** | The target is a shared public demo with occasional slow responses. One retry absorbs a network hiccup, while a real defect fails twice and stays red. `trace: on-first-retry` records any retry. The suite also passed with `--retries=0` (section 2), so the retry isn't hiding anything. |
| **`workers: 4`** | Parallel enough to be fast (about 20 s) without hammering a public site. |
| **Only `data-test`, roles and text in locators** | Course rule: no CSS classes and no positional XPath. `toHaveClass(/alert-success/)` in TC-05 is an *assertion* on the styling, not a way to find an element. |

## 6. My own review notes

> **TODO for the student:** add your own observations in your own words. For example: which
> parts you read line by line, anything you changed after reading, anything you still
> don't understand, and what you would do differently. The brief says this section
> "carries real marks".
