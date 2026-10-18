# SIS 2: Playwright suite for the Toolshop

End-to-end tests for <https://practicesoftwaretesting.com>, written in Playwright and TypeScript.
They cover registration, login, buying a product, comparing products and password reset.

**Last run: 9/9 passed** (8 tests plus the login setup). The suite is also stable at 3 repeats in parallel with no retries (25/25).

| Document | Contents |
|---|---|
| [Description.md](Description.md) | Goal, scope, and the full list of test cases with steps and expected results |
| [Prompt.md](Prompt.md) | The exact prompt and AI tool used |
| [Review.md](Review.md) | What the AI produced, how it was reviewed, every correction and why, and the buggy-build experiment |
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
