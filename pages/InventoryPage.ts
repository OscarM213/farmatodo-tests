import { type Locator, type Page } from '@playwright/test';
import type { ProductInfo } from '../utils/types';

export class InventoryPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForItems() {
    await this.page.waitForSelector('.inventory_item');
  }

  private itemContainer(name: string): Locator {
    return this.page.locator('.inventory_item').filter({ hasText: name });
  }

  private itemName(name: string): Locator {
    return this.itemContainer(name).locator('.inventory_item_name');
  }

  private itemPrice(name: string): Locator {
    return this.itemContainer(name).locator('.inventory_item_price');
  }

  private addToCartButton(name: string): Locator {
    return this.itemContainer(name).locator('.btn_inventory');
  }

  async getProductInfo(name: string): Promise<ProductInfo> {
    const productName = (await this.itemName(name).textContent()) ?? '';
    const productPrice = (await this.itemPrice(name).textContent()) ?? '';
    return { name: productName, price: productPrice };
  }

  async addItemToCart(name: string) {
    const btn = this.addToCartButton(name);
    await btn.click();
  }

  async assertItemAdded(name: string) {
    await this.expectAddToCartButtonToBeRemove(name);
  }

  private async expectAddToCartButtonToBeRemove(name: string) {
    const btn = this.addToCartButton(name);
    await btn.waitFor({ state: 'visible' });
  }
}
