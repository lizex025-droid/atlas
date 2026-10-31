import { test, expect } from '@playwright/test';

test.describe('mobile anatomy layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the 3D viewer gets the full width and its information sheet can open and close', async ({ page }) => {
    await page.goto('/#workspace');
    const viewer = page.locator('.anatomy-viewport');
    await expect(viewer).toBeVisible();
    await expect(page.getByRole('button', { name: 'Information', exact: true })).toBeVisible();

    const width = await viewer.evaluate(el => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(388);
    const sheet = page.getByRole('complementary', { name: 'Anatomical information' });
    await expect(sheet).toBeHidden();

    await page.getByRole('button', { name: 'Information', exact: true }).click();
    await expect(sheet).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close information panel' })).toBeVisible();
    await page.getByRole('button', { name: 'Close information panel' }).click();
    await expect(sheet).toBeHidden();

    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Search', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Close Search' }).click();
    await expect(page.getByRole('button', { name: 'Layer Skeletal' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('home page navigation is at the bottom and cards remain usable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.entry-tile')).toHaveCount(4);
    expect(await page.locator('.entry-rail').evaluate(el => getComputedStyle(el).flexDirection)).toBe('row');
    await page.locator('.tile-0').click();
    await expect(page.locator('.atlas-card').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('identification practice remains visible when the regular information sheet defaults closed', async ({ page }) => {
    await page.goto('/');
    await page.locator('.tile-1').click();
    await expect(page.getByRole('complementary', { name: 'Identification practice' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eleventh thoracic vertebra', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Return to exploration' }).click();
    await expect(page.getByRole('button', { name: 'Information', exact: true })).toBeVisible();
  });
});
