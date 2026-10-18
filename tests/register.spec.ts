import { expect, test } from '../fixtures/pages.fixture';

test.describe('TC-01 Register a new customer', () => {
  test('a new customer registers with a unique email, lands on login and can sign in', async ({
    newUser,
    registerPage,
    loginPage,
    accountPage,
    page,
  }) => {
    await registerPage.open();
    await registerPage.register(newUser);

    await expect(page).toHaveURL(/\/auth\/login$/);

    // Landing on the login page is not proof the account exists; signing in is.
    await loginPage.signIn(newUser);
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.userMenu).toHaveText(`${newUser.firstName} ${newUser.lastName}`);
  });

  test('registering with an email that already exists is rejected', async ({
    registeredUser,
    registerPage,
    page,
  }) => {
    await registerPage.open();
    await registerPage.register(registeredUser);

    await expect(registerPage.error).toContainText(/already exists/i);
    await expect(page).toHaveURL(/\/auth\/register$/);
  });
});
