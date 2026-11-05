import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
  test.describe(`Application sidebar at ${viewport.width}px`, () => {
    test.use({ viewport });

    test('starts hidden and opens from the top-left menu', async ({ page }) => {
      await page.goto('/activity-preview');
      const trigger = page.getByRole('button', { name: 'Open sidebar' });
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      const bounds = await trigger.boundingBox();
      if (!bounds) throw new Error('Sidebar trigger has no visible bounds');
      expect(bounds.x).toBeLessThan(100);
      expect(bounds.y).toBeLessThan(50);

      await trigger.click();
      const sidebar = page.getByRole('dialog', { name: 'Navigation', exact: true });
      await expect(sidebar).toBeVisible();
      await expect(page.getByRole('button', { name: 'Open sidebar', includeHidden: true }))
        .toHaveAttribute('aria-expanded', 'true');
      await expect(sidebar.getByRole('link', { name: 'Sign in' })).toBeVisible();
      await expect.poll(async () => (await sidebar.boundingBox())?.x).toBe(0);
      const sidebarBounds = await sidebar.boundingBox();
      if (!sidebarBounds) throw new Error('Sidebar has no visible bounds');
      expect(sidebarBounds.width).toBeLessThanOrEqual(viewport.width);

      await sidebar.getByRole('button', { name: 'Close sidebar' }).click();
      await expect(sidebar).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test('supports keyboard dismissal, outside clicks, and navigation', async ({ page }) => {
      await page.goto('/activity-preview');
      const trigger = page.getByRole('button', { name: 'Open sidebar' });
      const sidebar = page.getByRole('dialog', { name: 'Navigation', exact: true });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(sidebar).toBeVisible();
      await expect(sidebar).toContainText('Sign in');
      for (let index = 0; index < 4; index++) {
        await page.keyboard.press('Tab');
        await expect.poll(() => sidebar.evaluate((element) => element.contains(element.ownerDocument.activeElement)))
          .toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(sidebar).toBeHidden();
      await expect(trigger).toBeFocused();

      await trigger.click();
      await expect(sidebar).toBeVisible();
      await page.mouse.click(viewport.width - 10, viewport.height / 2);
      await expect(sidebar).toBeHidden();

      await trigger.click();
      await sidebar.getByRole('link', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/sign-in$/);
      await expect(sidebar).toBeHidden();
      await expect(page.getByRole('button', { name: 'Open sidebar' })).toBeVisible();
      await page.getByRole('button', { name: 'Open sidebar' }).click();
      const signInLink = sidebar.getByRole('link', { name: 'Sign in' });
      await expect(signInLink).toHaveAttribute('aria-current', 'page');
      await signInLink.click();
      await expect(sidebar).toBeHidden();
      await expect(page).toHaveURL(/\/sign-in$/);
      await page.reload();
      await expect(sidebar).toBeHidden();
    });
  });
}
