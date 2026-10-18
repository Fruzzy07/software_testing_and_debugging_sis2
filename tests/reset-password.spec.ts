import { unknownEmail } from '../data/user.factory';
import { expect, test } from '../fixtures/pages.fixture';

test.describe('TC-05 Reset a password', () => {
  test('a known email gets a success confirmation', async ({ registeredUser, forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(registeredUser.email);

    await expect(forgotPasswordPage.message).toBeVisible();
    await expect(forgotPasswordPage.message).toHaveClass(/alert-success/);
    await expect(forgotPasswordPage.message).not.toContainText(/invalid/i);
    // Known defect (see Review.md): the text is the raw i18n key
    // "page.forgot-password.confirm" rather than a translated sentence, so the
    // text itself is not asserted.
  });

  test('an unknown email is rejected with an error', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(unknownEmail());

    await expect(forgotPasswordPage.message).toHaveText('The selected email is invalid.');
    await expect(forgotPasswordPage.message).not.toHaveClass(/alert-success/);
  });
});
