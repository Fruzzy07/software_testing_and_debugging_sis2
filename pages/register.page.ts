import { Locator, Page } from '@playwright/test';
import { User } from '../data/user.factory';
import { AddressForm } from './address.form';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  readonly error: Locator;
  private readonly address: AddressForm;
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly dob: Locator;
  private readonly phone: Locator;
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;

  constructor(page: Page) {
    super(page);
    this.address = new AddressForm(page);
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.dob = page.getByTestId('dob');
    this.phone = page.getByTestId('phone');
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('register-submit');
    this.error = page.getByTestId('register-error');
  }

  async open() {
    await this.visit('/auth/register');
  }

  async register(user: User) {
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.dob.fill(user.dob);
    await this.address.fill(user.address);
    await this.phone.fill(user.phone);
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.submit.click();
  }
}
