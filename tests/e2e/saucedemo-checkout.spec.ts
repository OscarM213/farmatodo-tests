import { test, expect } from '../../fixtures/index';
import type { ProductInfo } from '../../utils/types';

const PRODUCT_NAME = 'Sauce Labs Fleece Jacket';

test.describe('SauceDemo - E2E Checkout Flow', () => {
  test('complete purchase of Sauce Labs Fleece Jacket', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await test.step('Login with credentials from the page', async () => {
      await loginPage.goto();
      const { username, password } = await loginPage.readCredentials();
      expect(username).toBeTruthy();
      expect(password).toBeTruthy();
      await loginPage.login(username, password);
      await expect(page).toHaveURL(/inventory\.html/);
      await inventoryPage.waitForItems();
    });

    let capturedProduct: ProductInfo;

    await test.step('Locate and capture product info', async () => {
      capturedProduct = await inventoryPage.getProductInfo(PRODUCT_NAME);
      expect(capturedProduct.name).toBe(PRODUCT_NAME);
      expect(capturedProduct.price).toBe('$49.99');
    });

    await test.step('Add product to cart', async () => {
      await inventoryPage.addItemToCart(PRODUCT_NAME);
    });

    await test.step('Navigate to cart and validate', async () => {
      await cartPage.goto();
      await expect(page).toHaveURL(/cart\.html/);
      const cartProduct = await cartPage.getProductInfo(PRODUCT_NAME);
      expect(cartProduct).toEqual(capturedProduct);
    });

    await test.step('Proceed to checkout and fill info', async () => {
      await cartPage.goToCheckout();
      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await checkoutInfoPage.fillInfo('Oscar', 'Automation', '12345');
      await checkoutInfoPage.submit();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('Verify order summary and finish', async () => {
      const overviewProduct = await checkoutOverviewPage.getProductInfo(PRODUCT_NAME);
      expect(overviewProduct).toEqual(capturedProduct);
      await checkoutOverviewPage.finish();
    });

    await test.step('Verify order confirmation', async () => {
      await expect(page).toHaveURL(/checkout-complete\.html/);
      expect(await checkoutCompletePage.isOrderComplete()).toBe(true);
      expect(await checkoutCompletePage.getThankYouText()).toBe('Thank you for your order!');
    });
  });
});
