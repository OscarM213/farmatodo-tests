import { type Locator, type Page } from '@playwright/test';

export interface Credentials {
  username: string;
  password: string;
}

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly credentialsBox: Locator;
  readonly passwordBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.credentialsBox = page.locator('[data-test="login-credentials"]');
    this.passwordBox = page.locator('[data-test="login-password"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async readCredentials(): Promise<Credentials> {
    const result = await this.page.evaluate(() => {
      const credsDiv = document.querySelector('[data-test="login-credentials"]');
      const pwdDiv = document.querySelector('[data-test="login-password"]');
      return {
        credsLines: credsDiv ? (credsDiv as HTMLElement).innerText.split('\n') : [],
        pwdLines: pwdDiv ? (pwdDiv as HTMLElement).innerText.split('\n') : [],
      };
    });

    const username = result.credsLines[1] ?? '';
    const password = result.pwdLines[1] ?? '';

    return { username, password };
  }
}
