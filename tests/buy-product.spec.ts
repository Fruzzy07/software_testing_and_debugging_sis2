import { STORAGE_STATE } from '../data/env';
import { PRODUCTS } from '../data/products';
import { createUser } from '../data/user.factory';
import { expect, test } from '../fixtures/pages.fixture';

// Starts already signed in: the session saved by tests/auth.setup.ts.
test.use({ storageState: STORAGE_STATE });

test.describe('TC-03 Buy a product', () => {
  test('a signed-in customer buys two claw hammers and gets an invoice', async ({
    homePage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    const quantity = 2;
    const billing = createUser().address;

    await homePage.open();
    await homePage.openProduct(PRODUCTS.clawHammer);
    const product = await productPage.summary();
    expect(product.name).toBe(PRODUCTS.clawHammer);

    await productPage.addToCart(quantity);
    await expect(productPage.addedToCartToast).toBeVisible();
    await expect(productPage.cartQuantity).toHaveText(String(quantity));

    // Cart shows the right item, quantity and arithmetic.
    await productPage.openCart();
    const line = cartPage.line(product.name);
    await expect(line.row).toHaveCount(1);
    await expect(line.quantity).toHaveValue(String(quantity));
    await expect(line.unitPrice).toHaveText(money(product.price));
    await expect(line.linePrice).toHaveText(money(product.price * quantity));
    await expect(cartPage.total).toHaveText(money(product.price * quantity));

    // Checkout completes.
    await cartPage.proceedToCheckout();
    await checkoutPage.continueAsSignedInCustomer();
    await checkoutPage.enterBillingAddress(billing);
    await checkoutPage.pay('Cash on Delivery');
    await expect(checkoutPage.paymentSuccess).toHaveText('Payment was successful');

    await checkoutPage.confirmOrder();
    await expect(checkoutPage.orderConfirmation).toBeVisible();
    await expect(checkoutPage.orderConfirmation).toContainText(/INV-\d+/);
    await expect(checkoutPage.cartQuantity).toBeHidden();
  });
});

function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
