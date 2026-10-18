# Description: what this project automates and why

## Goal

An end-to-end regression suite for the **Toolshop** demo application
(<https://practicesoftwaretesting.com>), written with **Playwright + TypeScript**.
It covers the five business flows from the SIS 2 brief. It is built to be:

- **Runnable anywhere.** A clean clone, `npm install`, `npx playwright install chromium`, then `npx playwright test` should go green on any machine.
- **Independent.** Every test creates its own data, so tests pass in any order and in parallel.
- **Honest.** Every test ends in assertions that fail if the behaviour breaks. This was demonstrated by running the suite against the deliberately buggy build (see [Review.md](Review.md)).

## Application under test

| Item | Value |
|---|---|
| Front end | Angular SPA, v2.5 (build 2026-10-11) |
| API | REST, `https://api.practicesoftwaretesting.com` |
| Test hooks | `data-test="…"` attributes, mapped with `testIdAttribute: 'data-test'` |
| Browser | Chromium (Desktop Chrome profile) |

## Test cases to be automated

| ID | Test case | Spec file | Preconditions / data | Steps | Expected result |
|---|---|---|---|---|---|
| **TC-01a** | Register a new customer | `tests/register.spec.ts` | Unique email generated per run (`createUser()`) | 1. Open `/auth/register` 2. Fill the personal fields 3. Choose country, postcode and house number, and let the app look up the street, city and state 4. Submit 5. Sign in with the new credentials | Redirected to `/auth/login`; signing in reaches `/account` showing "My account" and the user's own name in the menu |
| TC-01b | Duplicate email is rejected | `tests/register.spec.ts` | A customer already registered through the API | Register again with the same email | Error "…already exists"; user stays on `/auth/register` |
| **TC-02a** | Log in with valid credentials | `tests/login.spec.ts` | Fresh customer registered through the API | 1. Open `/auth/login` 2. Enter email and password 3. Submit | URL `/account`, heading "My account", menu shows the user's full name |
| TC-02b | Log in with invalid credentials | `tests/login.spec.ts` | An email that has never been registered | Same steps with an unknown email | Error "Invalid email or password"; still on `/auth/login`; "Sign in" link visible, user menu absent |
| **TC-03** | Buy a product | `tests/buy-product.spec.ts` | Signed-in session from `auth.setup.ts` | 1. Search "Claw Hammer" 2. Open the exact match 3. Add quantity 2 to the cart 4. Open the cart 5. Proceed: signed in → billing address → payment (Cash on Delivery) → Confirm | Toast "Product added to shopping cart."; cart badge shows 2; the cart row has quantity 2, unit price = product price, line total and cart total = 2 × price; "Payment was successful"; "Thanks for your order!" with an `INV-…` number; cart badge cleared |
| **TC-04** | Compare two products | `tests/compare-products.spec.ts` | None (guest) | 1. Open "Bolt Cutters", capture its name and price, add it to compare 2. Same for "Claw Hammer" 3. Click "Compare Now" | **Stated comparison:** the Claw Hammer is cheaper than the Bolt Cutters. The `/comparison` table lists exactly those two products in that order, with the same prices the product pages showed |
| **TC-05a** | Reset password with a known email | `tests/reset-password.spec.ts` | Fresh customer registered through the API | 1. Open `/auth/forgot-password` 2. Enter the email 3. Submit | A success alert (`alert-success`) that does not mention "invalid" |
| TC-05b | Reset password with an unknown email | `tests/reset-password.spec.ts` | An email that has never been registered | Same steps | Error alert "The selected email is invalid.", not styled as success |

## Out of scope (deliberately not automated)

| Not automated | Why |
|---|---|
| Real e-mail delivery for the password reset | The demo sends no inspectable mail; we assert the UI and API outcome only. |
| Credit-card, bank-transfer and gift-card payments | Each needs extra fields. One payment method is enough to prove checkout completes. |
| Other browsers (Firefox, WebKit) | The brief grades a green run. One more `projects` entry in the config enables them. |
| Seeded accounts (`customer@…`, `customer2@…`) | Shared by every student and locked after failed logins. While developing, `customer2@` returned **423 Account locked**. Tests use fresh accounts instead. |
| Visual layout, accessibility, performance | Separate kinds of testing, outside SIS 2. |
