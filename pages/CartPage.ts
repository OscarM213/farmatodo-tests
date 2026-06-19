import { type Locator, type Page } from '@playwright/test';
import type { ProductInfo } from '../utils/types';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('#checkout');
    this.cartLink = page.locator('.shopping_cart_link');
  }

  async goto() {
    await this.cartLink.click();
  }

  private itemContainer(name: string): Locator {
    return this.page.locator('.cart_item').filter({ hasText: name });
  }

  private itemName(name: string): Locator {
    return this.itemContainer(name).locator('.inventory_item_name');
  }

  private itemPrice(name: string): Locator {
    return this.itemContainer(name).locator('.inventory_item_price');
  }

  async getProductInfo(name: string): Promise<ProductInfo> {
    const productName = (await this.itemName(name).textContent()) ?? '';
    const productPrice = (await this.itemPrice(name).textContent()) ?? '';
    return { name: productName, price: productPrice };
  }

  async goToCheckout() {
    await this.checkoutButton.click();
  }
}
