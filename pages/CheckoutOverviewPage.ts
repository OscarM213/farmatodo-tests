import { type Locator, type Page } from '@playwright/test';
import type { ProductInfo } from '../utils/types';

export class CheckoutOverviewPage {
  readonly page: Page;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.finishButton = page.locator('#finish');
  }

  private itemContainer(name: string): Locator {
    return this.page.locator('.cart_item').filter({ hasText: name });
  }

  async getProductInfo(name: string): Promise<ProductInfo> {
    const productName = (await this.itemContainer(name)
      .locator('.inventory_item_name')
      .textContent()) ?? '';
    const productPrice = (await this.itemContainer(name)
      .locator('.inventory_item_price')
      .textContent()) ?? '';
    return { name: productName, price: productPrice };
  }

  async finish() {
    await this.finishButton.click();
  }
}
