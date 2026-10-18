import { expect, Locator, Page } from '@playwright/test';
import { Address } from '../data/user.factory';

/**
 * The address block shared by the register form and the checkout billing step.
 *
 * You enter country, postal code and house number; the app then calls
 * /postcode-lookup and fills street, city and state itself. That response
 * arrives asynchronously and overwrites anything typed into those fields, so
 * we wait for it and keep what the app filled in. Typing over it raced the
 * lookup and produced addresses the invoice API rejected (see Review.md).
 */
export class AddressForm {
  private readonly country: Locator;
  private readonly postalCode: Locator;
  private readonly houseNumber: Locator;
  private readonly street: Locator;
  private readonly city: Locator;
  private readonly state: Locator;

  constructor(private readonly page: Page) {
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
  }

  async fill(address: Address) {
    const lookup = this.page.waitForResponse(
      (response) => response.url().includes('/postcode-lookup') && response.ok(),
    );
    await this.country.selectOption(address.country);
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);

    const found = await (await lookup).json();
    await expect(this.street).toHaveValue(found.street);
    await expect(this.city).toHaveValue(found.city);
    await expect(this.state).toHaveValue(found.state);
  }
}
