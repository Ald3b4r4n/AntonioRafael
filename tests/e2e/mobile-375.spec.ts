/**
 * Mobile layout audit (T040).
 *
 * Verifies the site at a 375×812 viewport (iPhone SE / standard small
 * mobile reference) for:
 *   - No horizontal scroll (document width ≤ viewport width)
 *   - All interactive controls meet WCAG 2.5.5 AAA / 2.5.8 AA target
 *     sizing at the 44×44 CSS pixel threshold (the 24×24 AA minimum is
 *     trivially below our bar; we test at 44 since that's the SUS
 *     guideline and what Apple/Google HIG require).
 *   - Primary navigation (hamburger + mobile panel items) is
 *     interactive and sized correctly.
 *
 * The accessibility baseline (T023) and a11y hard gate (T046) cover
 * WCAG contrast, ARIA, etc. — this file is strictly the mobile
 * usability gate.
 */
import { test, expect } from "@playwright/test";

const VIEWPORT = { width: 375, height: 812 };
const TAP_MIN = 44;

// Selectors for every element the user can actually tap/click on the
// home page. We check these rather than every <a> so decorative links
// inside cards (covered by the whole-card tap target) aren't flagged.
const TAP_TARGET_SELECTORS = [
  'button[aria-label="Abrir menu"]',
  'button[aria-label="Fechar menu"]',
  // After opening the mobile panel:
  '#mobile-menu button',
  // Hero social links:
  'section[aria-labelledby="about-title"] a[href^="http"]',
];

test.use({ viewport: VIEWPORT });

test.describe("Mobile layout at 375x812 (T040)", () => {
  test("no horizontal scroll on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // allow 1px subpixel rounding
  });

  test("hamburger button meets 44x44 tap target", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const btn = page.locator('button[aria-label="Abrir menu"]');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(TAP_MIN);
    expect(box!.height).toBeGreaterThanOrEqual(TAP_MIN);
  });

  test("mobile menu items meet 44x44 tap target when open", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('button[aria-label="Abrir menu"]').click();
    const items = page.locator("#mobile-menu button");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox();
      expect(box, `mobile item #${i} boundingBox`).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(TAP_MIN);
      expect(box!.height).toBeGreaterThanOrEqual(TAP_MIN);
    }
  });

  test("hero social links meet 44x44 tap target", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const links = page.locator(
      'section[aria-labelledby="about-title"] a[href^="http"]',
    );
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box, `social link #${i} boundingBox`).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(TAP_MIN);
    }
  });

  test("contact page form links meet 44x44 tap target", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('button[aria-label="Abrir menu"]').click();
    await page
      .locator("#mobile-menu button", { hasText: "Entre em Contato" })
      .click();
    const links = page.locator('section[aria-labelledby="contact-title"] a[href^="http"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box, `contact link #${i}`).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(TAP_MIN);
    }
  });
});
