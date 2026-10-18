import { test as base } from '@playwright/test';
import { registerViaApi } from '../data/user.api';
import { createUser, User } from '../data/user.factory';
import { AccountPage } from '../pages/account.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ComparisonPage } from '../pages/comparison.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';
import { RegisterPage } from '../pages/register.page';

type Fixtures = {
  // Page objects, so no spec ever writes `new LoginPage(page)`.
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  forgotPasswordPage: ForgotPasswordPage;
  accountPage: AccountPage;
  productPage: ProductPage;
  comparisonPage: ComparisonPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;

  /** A fresh customer that does not exist yet. */
  newUser: User;
  /** A fresh customer that already exists: registered through the API before the test starts. */
  registeredUser: User;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  forgotPasswordPage: async ({ page }, use) => use(new ForgotPasswordPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  comparisonPage: async ({ page }, use) => use(new ComparisonPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  newUser: async ({}, use) => use(createUser()),
  registeredUser: async ({ request }, use) => {
    const user = createUser();
    await registerViaApi(request, user);
    await use(user);
  },
});

export { expect } from '@playwright/test';
