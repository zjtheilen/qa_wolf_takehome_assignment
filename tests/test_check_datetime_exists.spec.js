import { test, expect } from '@playwright/test';

test('check datetime exists', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  const ageSpan = page.locator('span.age').first();
  const title = await ageSpan.getAttribute('title');
  expect(title).not.toBeNull();
});
