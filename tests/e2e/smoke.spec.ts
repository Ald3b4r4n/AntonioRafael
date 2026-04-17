import { test, expect } from '@playwright/test';

test.describe('Site smoke tests', () => {
  test('homepage loads and has a title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ant[oô]nio Rafael/i);
  });

  test('page has visible content above the fold', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toBeVisible();
    // At least one text element should be visible
    const visibleText = page.locator('body >> text=/./');
    await expect(visibleText.first()).toBeVisible();
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});
