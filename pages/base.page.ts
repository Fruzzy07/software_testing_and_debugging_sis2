import { Locator, Page } from '@playwright/test';
import { ROUTE_PREFIX } from '../data/env';

/** The header that every screen shares. */
export abstract class BasePage {
  readonly cartQuantity: Locator;
  readonly userMenu: Locator;
  readonly signInLink: Locator;
  private readonly cartLink: Locator;

  constructor(protected readonly page: Page) {
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.userMenu = page.getByTestId('nav-menu');
    this.signInLink = page.getByTestId('nav-sign-in');
    this.cartLink = page.getByTestId('nav-cart');
  }

  /** Navigates to an app route, relative to baseURL. */
  protected async visit(route: string) {
    await this.page.goto(`${ROUTE_PREFIX}${route}`);
  }

  async openCart() {
    await this.cartLink.click();
  }
}
