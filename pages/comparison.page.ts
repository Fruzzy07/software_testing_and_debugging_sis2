import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** /comparison: one column per product, in the order they were added. */
export class ComparisonPage extends BasePage {
  readonly title: Locator;
  readonly productNames: Locator;
  readonly prices: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('comparison-title');
    this.productNames = page.getByTestId('comparison-table').getByTestId('product-name');
    this.prices = page.getByTestId('compare-price');
  }
}
