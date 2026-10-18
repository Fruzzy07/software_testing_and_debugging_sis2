import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Step 1 of /checkout: the cart contents. */
export class CartPage extends BasePage {
  readonly total: Locator;
  private readonly proceedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.total = page.getByTestId('cart-total');
    this.proceedButton = page.getByTestId('proceed-1');
  }

  /** The cart row for one product, with the parts a test may assert on. */
  line(productName: string) {
    const row = this.page
      .getByRole('row')
      .filter({ has: this.page.getByTestId('product-title').filter({ hasText: productName }) });
    return {
      row,
      title: row.getByTestId('product-title'),
      quantity: row.getByTestId('product-quantity'),
      unitPrice: row.getByTestId('product-price'),
      linePrice: row.getByTestId('line-price'),
    };
  }

  async proceedToCheckout() {
    await this.proceedButton.click();
  }
}
