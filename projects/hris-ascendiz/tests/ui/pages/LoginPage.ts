import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator = this.page.getByRole('textbox', { name: 'Enter username or email' });
  private readonly passwordInput: Locator = this.page.getByRole('textbox', { name: 'Enter password' });
  private readonly signInButton: Locator = this.page.getByRole('button', { name: 'Sign In', exact: true });

  async login(email: string, password: string): Promise<void> {
    await this.goto('/login?next=%252F');
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
