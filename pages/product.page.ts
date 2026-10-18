import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductSummary {
  name: string;
  price: number;
}

export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly addedToCartToast: Locator;
  private readonly quantity: Locator;
  private readonly addToCartButton: Locator;
  private readonly addToCompareButton: Locator;
  private readonly compareNowLink: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addToCompareButton = page.getByTestId('add-to-compare');
    this.compareNowLink = page.getByTestId('compare-link');
    this.addedToCartToast = page.getByRole('alert', { name: 'Product added to shopping cart.' });
  }

  async addToCart(quantity = 1) {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
  }

  async addToCompare() {
    await this.addToCompareButton.click();
  }

  async openComparison() {
    await this.compareNowLink.click();
  }

  /** Reads the name and price of the product currently shown. */
  async summary(): Promise<ProductSummary> {
    await expect(this.unitPrice).toHaveText(/\d+\.\d{2}/);
    return {
      name: (await this.name.innerText()).trim(),
      price: Number(await this.unitPrice.innerText()),
    };
  }
}
