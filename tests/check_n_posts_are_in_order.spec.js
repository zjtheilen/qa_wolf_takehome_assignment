import { test, expect } from '@playwright/test';

test('parse all age spans on a page in order', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');

    const ageSpans = page.locator('span.age');
    const count = await ageSpans.count();

    const N = Math.min(100, count);

    const timestamps = [];

    for (let i = 0; i < N; i++) {
        const title = await ageSpans.nth(i).getAttribute('title');
        
        if (!title) throw new Error(`Span at index ${i} has no title`)

        const [, unixSecondsStr] = title.split(' ');
        const unixSeconds = Number(unixSecondsStr);
        timestamps.push(unixSeconds);

        console.log(`Item ${i}: ${new Date(unixSeconds * 1000).toISOString()}`);
    }

    for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i - 1]).toBeGreaterThanOrEqual(
            timestamps[i],
            `Item at index ${i - 1} should be newer than item at index ${i}`
        );
    }
});