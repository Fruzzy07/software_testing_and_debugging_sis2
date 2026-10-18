import { PRODUCTS } from '../data/products';
import { expect, test } from '../fixtures/pages.fixture';

test.describe('TC-04 Compare two products', () => {
  // The comparison we state: a Claw Hammer is cheaper than Bolt Cutters,
  // and the comparison page shows exactly what each product page showed.
  test('the claw hammer is cheaper than the bolt cutters, and the comparison table agrees', async ({
    homePage,
    productPage,
    comparisonPage,
  }) => {
    await homePage.open();
    await homePage.openProduct(PRODUCTS.boltCutters);
    const cutters = await productPage.summary();
    await productPage.addToCompare();

    await homePage.open();
    await homePage.openProduct(PRODUCTS.clawHammer);
    const hammer = await productPage.summary();
    await productPage.addToCompare();

    expect(cutters.name).toBe(PRODUCTS.boltCutters);
    expect(hammer.name).toBe(PRODUCTS.clawHammer);
    expect(hammer.price).toBeLessThan(cutters.price);

    await productPage.openComparison();
    await expect(comparisonPage.title).toHaveText('Product Comparison');
    await expect(comparisonPage.productNames).toHaveText([cutters.name, hammer.name]);
    await expect(comparisonPage.prices).toHaveText([money(cutters.price), money(hammer.price)]);
  });
});

function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
