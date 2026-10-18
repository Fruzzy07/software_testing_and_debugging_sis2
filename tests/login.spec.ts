import { unknownEmail } from '../data/user.factory';
import { expect, test } from '../fixtures/pages.fixture';

test.describe('TC-02 Log in', () => {
  test('valid credentials open the account page', async ({ registeredUser, loginPage, accountPage, page }) => {
    await loginPage.open();
    await loginPage.signIn(registeredUser);

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.userMenu).toHaveText(`${registeredUser.firstName} ${registeredUser.lastName}`);
  });

  test('invalid credentials show an error and stay on the login page', async ({ loginPage, page }) => {
    // An unregistered email rather than a wrong password for a seeded account:
    // failed attempts lock the shared seeded accounts for everyone.
    await loginPage.open();
    await loginPage.signIn({ email: unknownEmail(), password: 'Wrong!Password1' });

    await expect(loginPage.error).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.signInLink).toBeVisible();
    await expect(loginPage.userMenu).toBeHidden();
  });
});
