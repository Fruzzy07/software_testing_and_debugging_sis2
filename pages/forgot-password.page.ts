import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  /** The confirmation or error box the form shows after submitting. */
  readonly message: Locator;
  private readonly email: Locator;
  private readonly submit: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.submit = page.getByTestId('forgot-password-submit');
    this.message = page.getByTestId('forgot-password-form').getByRole('alert');
  }

  async open() {
    await this.visit('/auth/forgot-password');
  }

  async requestReset(email: string) {
    await this.email.fill(email);
    await this.submit.click();
  }
}
