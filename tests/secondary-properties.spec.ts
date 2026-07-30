import { test, expect } from '@playwright/test';

test.describe('Secondary Properties Page', () => {
  test('should display secondary properties', async ({ page }) => {
    await page.goto('/en/properties/secondary');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h2').filter({ hasText: 'Secondary Market Properties' });
    await expect(heading).toBeVisible();

    await page.locator('h2').filter({ hasText: 'Best offers' }).waitFor({ state: 'visible' });

    const propertyCards = page.locator('article').filter({ has: page.locator('h3') });
    await expect(propertyCards).toHaveCount(9);
  });
});
