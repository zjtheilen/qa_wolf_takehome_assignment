import { test, expect } from '@playwright/test';
import { time } from 'console';

test('first N posts are newest -> oldest', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');

    const N = 100;
    const timestamps = [];

    while (timestamps.length < N) {
        const ageSpans = page.locator('span.age');
        const count = await ageSpans.count();

        for (let i = 0; i < count && timestamps.length < N; i++) {
            const title = await ageSpans.nth(i).getAttribute('title');
            if (!title) continue;
            const unixSeconds = Number(title.split(' ')[1]);
            timestamps.push(unixSeconds);
        }

        const moreLink = page.locator('a.morelink');
        if (timestamps.length < N && (await moreLink.count()) > 0) {
            await moreLink.first().click();
            await page.waitForLoadState('domcontentloaded');
        } else {
            break;
        }
    }

    console.log(`Collected ${timestamps.length} timestamps`);

    for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i - 1]).toBeGreaterThanOrEqual(
            timestamps[i],
            `Item at index ${i - 1} should be newer than item at index ${i}`
        );
    }
});