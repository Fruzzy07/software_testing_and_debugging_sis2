import { expect, Locator, Page } from '@playwright/test';
import { Address } from '../data/user.factory';
import { AddressForm } from './address.form';
import { BasePage } from './base.page';

export type PaymentMethod = 'Bank Transfer' | 'Cash on Delivery' | 'Credit Card' | 'Buy Now Pay Later' | 'Gift Card';

/** Steps 2–4 of /checkout: sign-in confirmation, billing address, payment. */
export class CheckoutPage extends BasePage {
  readonly signedInMessage: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;
  private readonly billingAddress: AddressForm;
  private readonly continueSignedIn: Locator;
  private readonly continueToPayment: Locator;
  private readonly paymentMethod: Locator;
  private readonly finish: Locator;

  constructor(page: Page) {
    super(page);
    this.billingAddress = new AddressForm(page);
    this.signedInMessage = page.getByText(/you are already logged in/i);
    this.continueSignedIn = page.getByTestId('proceed-2');
    this.continueToPayment = page.getByTestId('proceed-3');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finish = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.getByText(/Thanks for your order!/);
  }

  async continueAsSignedInCustomer() {
    await expect(this.signedInMessage).toBeVisible();
    await this.continueSignedIn.click();
  }

  async enterBillingAddress(address: Address) {
    await this.billingAddress.fill(address);
    await this.continueToPayment.click();
  }

  /** "Check payment" validates the method; the same button then becomes "Confirm". */
  async pay(method: PaymentMethod) {
    await this.paymentMethod.selectOption({ label: method });
    await this.finish.click();
  }

  async confirmOrder() {
    await expect(this.finish).toHaveText(/Confirm/);
    await this.finish.click();
  }
}
