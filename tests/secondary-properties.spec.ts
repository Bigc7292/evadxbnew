import { test, expect } from '@playwright/test';

test.describe('Secondary Properties Page', () => {
  test('should display secondary properties', async ({ page }) => {
    await page.goto('/en/properties/secondary');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: 'Secondary Market Properties' });
    await expect(heading).toBeVisible();

    await page.locator('article').filter({ has: page.locator('h3') }).first().waitFor({ state: 'visible' });

    const propertyCards = page.locator('article').filter({ has: page.locator('h3') });
    const count = await propertyCards.count();
    console.log(`Property cards found: ${count}`);
    expect(count).toBeGreaterThan(50);
  });

  test('should filter properties by location', async ({ page }) => {
    await page.goto('/en/properties/secondary');
    await page.waitForLoadState('networkidle');

    const locationSelect = page.locator('select:has-text("Location")').first();
    await expect(locationSelect).toBeVisible();
    await locationSelect.selectOption('Dubai Marina');

    await page.waitForURL('**/properties/secondary?**location=Dubai+Marina**');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: 'Secondary Market Properties' });
    await expect(heading).toBeVisible();
  });

  test('should filter properties by bedrooms', async ({ page }) => {
    await page.goto('/en/properties/secondary');
    await page.waitForLoadState('networkidle');

    const bedroomsSelect = page.locator('select:has-text("Bedrooms")').first();
    await expect(bedroomsSelect).toBeVisible();
    await bedroomsSelect.selectOption('3');

    await page.waitForURL('**/properties/secondary?**bedrooms=3**');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: 'Secondary Market Properties' });
    await expect(heading).toBeVisible();
  });

  test('should expand More Filters accordion', async ({ page }) => {
    await page.goto('/en/properties/secondary');
    await page.waitForLoadState('networkidle');

    const moreFiltersButton = page.locator('button:has-text("More Filters")').first();
    await expect(moreFiltersButton).toBeVisible();
    await moreFiltersButton.click();

    const furnishingSelect = page.locator('select:has-text("Furnishing")').first();
    await expect(furnishingSelect).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto('/en/properties/secondary?location=Dubai+Marina&bedrooms=3');
    await page.waitForLoadState('networkidle');

    const clearButton = page.locator('button:has-text("Clear")').first();
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForURL('**/properties/secondary');
    }
  });
});
