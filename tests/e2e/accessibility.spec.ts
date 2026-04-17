/**
 * Accessibility tests (T023 baseline + T046 hard gate).
 *
 * Two test groups live in this file:
 *
 * 1. **Baseline (T023)** — informational scan of the home page. Persists
 *    full axe results to `test-results/a11y-baseline.json` so the
 *    human-readable report (`docs/a11y-baseline.md`) can be regenerated.
 *    Never fails on violation count.
 *
 * 2. **Hard gate (T046)** — scans every section (About, Projects,
 *    Contact) and **fails if any WCAG 2.1 AA violation is found**.
 *    This is the CI blocker: no PR merges with a non-zero violation
 *    count. Known axe "incomplete" items (e.g., color-contrast on
 *    glassmorphism surfaces) are logged but not asserted — they are
 *    manually verified in `docs/a11y-contrast-audit.md`.
 *
 * Both groups run against the production build served by `npm run
 * preview` (configured in `playwright.config.ts`).
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/* ──────────────────────────────────────────────────────────────────── *
 * Shared helpers                                                       *
 * ──────────────────────────────────────────────────────────────────── */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

/**
 * Run an axe-core scan filtered to WCAG 2.1 AA rules.
 * Returns the raw AxeResults for downstream assertions / serialization.
 */
async function scanPage(page: Page) {
  return new AxeBuilder({ page })
    .withTags([...WCAG_TAGS])
    .analyze();
}

/**
 * Format axe violations into a human-readable CI-friendly string.
 *
 * Example output:
 *   ❌ color-contrast (serious) — 3 nodes
 *      Elements must meet minimum color contrast ratio thresholds
 *      https://dequeuniversity.com/rules/axe/...
 *        → .card .title
 *        → .hero .subtitle
 *        → nav .tab
 */
function formatViolations(violations: Awaited<ReturnType<typeof scanPage>>['violations']): string {
  if (violations.length === 0) return '  ✅ No violations';
  return violations.map((v) => {
    const nodes = v.nodes
      .map((n) => `      → ${n.target.join(' ')}`)
      .join('\n');
    return [
      `  ❌ ${v.id} (${v.impact}) — ${v.nodes.length} node(s)`,
      `     ${v.help}`,
      `     ${v.helpUrl}`,
      nodes,
    ].join('\n');
  }).join('\n\n');
}

/* ──────────────────────────────────────────────────────────────────── *
 * T023 — Informational baseline (non-failing)                          *
 * ──────────────────────────────────────────────────────────────────── */

const OUTPUT_PATH = resolve(process.cwd(), 'test-results/a11y-baseline.json');

test.describe('Accessibility baseline (T023)', () => {
  test('axe-core scan runs against home page and captures violations', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await scanPage(page);

    // Persist full results so the human-readable report can be regenerated
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(
        {
          url: results.url,
          timestamp: results.timestamp,
          counts: {
            violations: results.violations.length,
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            inapplicable: results.inapplicable.length,
          },
          violations: results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            tags: v.tags,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              html: n.html,
              failureSummary: n.failureSummary,
            })),
          })),
          incomplete: results.incomplete.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.map((n) => ({ target: n.target, html: n.html })),
          })),
          passes: results.passes.map((p) => ({ id: p.id, description: p.description })),
        },
        null,
        2,
      ),
    );

    // Log summary so CI logs surface the counts
    console.log(
      `[a11y baseline] violations=${results.violations.length} ` +
        `passes=${results.passes.length} ` +
        `incomplete=${results.incomplete.length}`,
    );

    // Baseline is informational — assert the scan completed, not violation count
    expect(Array.isArray(results.violations)).toBe(true);
  });
});

/* ──────────────────────────────────────────────────────────────────── *
 * T046 — Hard accessibility gate (CI blocker)                          *
 * ──────────────────────────────────────────────────────────────────── */

test.describe('Accessibility hard gate (T046)', () => {
  /**
   * Navigate to a section by clicking the corresponding tab button in
   * the desktop nav bar. The `nav[aria-label="Seções"]` scopes the
   * selector so we never collide with the mobile-panel buttons (which
   * exist in the DOM but have `pointer-events: none` when closed).
   */
  async function navigateToSection(page: Page, label: string) {
    const tab = page.locator('nav[aria-label="Seções"] button', { hasText: label });
    await tab.click();
    // Wait for the React state swap + settle
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');
  }

  test('About section has zero WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await scanPage(page);

    // Log for CI visibility
    console.log(
      `[a11y gate: About] violations=${results.violations.length} ` +
        `passes=${results.passes.length} ` +
        `incomplete=${results.incomplete.length}`,
    );
    if (results.incomplete.length > 0) {
      console.log(
        `[a11y gate: About] incomplete (informational, not gated):\n` +
          results.incomplete.map((i) => `  ⚠ ${i.id} (${i.impact}) — ${i.nodes.length} node(s)`).join('\n'),
      );
    }

    expect(
      results.violations.length,
      `About section has ${results.violations.length} axe violations:\n${formatViolations(results.violations)}`,
    ).toBe(0);
  });

  test('Projects section has zero WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await navigateToSection(page, 'Projetos');

    const results = await scanPage(page);

    console.log(
      `[a11y gate: Projects] violations=${results.violations.length} ` +
        `passes=${results.passes.length} ` +
        `incomplete=${results.incomplete.length}`,
    );
    if (results.incomplete.length > 0) {
      console.log(
        `[a11y gate: Projects] incomplete (informational):\n` +
          results.incomplete.map((i) => `  ⚠ ${i.id} (${i.impact}) — ${i.nodes.length} node(s)`).join('\n'),
      );
    }

    expect(
      results.violations.length,
      `Projects section has ${results.violations.length} axe violations:\n${formatViolations(results.violations)}`,
    ).toBe(0);
  });

  test('Contact section has zero WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await navigateToSection(page, 'Entre em Contato');

    const results = await scanPage(page);

    console.log(
      `[a11y gate: Contact] violations=${results.violations.length} ` +
        `passes=${results.passes.length} ` +
        `incomplete=${results.incomplete.length}`,
    );
    if (results.incomplete.length > 0) {
      console.log(
        `[a11y gate: Contact] incomplete (informational):\n` +
          results.incomplete.map((i) => `  ⚠ ${i.id} (${i.impact}) — ${i.nodes.length} node(s)`).join('\n'),
      );
    }

    expect(
      results.violations.length,
      `Contact section has ${results.violations.length} axe violations:\n${formatViolations(results.violations)}`,
    ).toBe(0);
  });
});
