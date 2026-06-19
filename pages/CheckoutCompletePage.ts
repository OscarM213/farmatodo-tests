import { type Locator, type Page } from '@playwright/test';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly thankYouHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.thankYouHeader = page.locator('.complete-header');
  }

  async isOrderComplete(): Promise<boolean> {
    return await this.thankYouHeader.isVisible();
  }

  async getThankYouText(): Promise<string> {
    return (await this.thankYouHeader.textContent()) ?? '';
  }
}
