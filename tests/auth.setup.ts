import { STORAGE_STATE } from '../data/env';
import { expect, test as setup } from '../fixtures/pages.fixture';

// Runs once before the suite. A fresh customer is used instead of the seeded
// accounts: those are shared by every student and get locked after failed
// logins ("423 Account locked"), which would turn our suite red for no reason.
setup('sign in a fresh customer and save the session', async ({ registeredUser, loginPage, accountPage, page }) => {
  await loginPage.open();
  await loginPage.signIn(registeredUser);
  await expect(accountPage.title).toHaveText('My account');

  await page.context().storageState({ path: STORAGE_STATE });
});
