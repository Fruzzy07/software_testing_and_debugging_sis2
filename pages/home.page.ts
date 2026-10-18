import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  private readonly searchQuery: Locator;
  private readonly searchSubmit: Locator;
  private readonly searchTerm: Locator;
  private readonly productNames: Locator;

  constructor(page: Page) {
    super(page);
    this.searchQuery = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchTerm = page.getByTestId('search-term');
    this.productNames = page.getByTestId('product-name');
  }

  async open() {
    await this.visit('/');
  }

  async search(term: string) {
    await this.searchQuery.fill(term);
    await this.searchSubmit.click();
    // The result list re-renders; wait until it reflects this search.
    await this.searchTerm.filter({ hasText: term }).waitFor();
  }

  /** Searches for the product and opens the card whose name matches exactly. */
  async openProduct(name: string) {
    await this.search(name);
    // "Claw Hammer" must not match "Claw Hammer with Shock Reduction Grip".
    await this.productNames.filter({ hasText: exactly(name) }).click();
  }
}

function exactly(text: string): RegExp {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*${escaped}\\s*$`);
}
