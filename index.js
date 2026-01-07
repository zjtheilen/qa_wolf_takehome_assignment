// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const { generateHtmlReport, saveReport } = require("./reporter");

async function sortHackerNewsArticles() {
  // launch browser -> leave headless false for demo
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // number of posts to check
  const N = 100;
  const timestamps = [];

  // collect N amount of post times
  while (timestamps.length < N) {
    const ageSpans = await page.$$("span.age");
    for (let i = 0; i < ageSpans.length && timestamps.length < N; i++) {
      const title = await ageSpans[i].getAttribute("title");
      if (!title) continue;
      const unixSeconds = Number(title.split(" ")[1]);
      timestamps.push(unixSeconds);
    }

    // force a failure for testing purposes
    // timestamps[25] = timestamps[90];

    // check if there is a "more" link 
    const moreLink = await page.$("a.morelink");
    if (timestamps.length < N && moreLink) {
      await moreLink.click();
      await page.waitForLoadState("domcontentloaded");
    } else {
      break;
    }
  }

  console.log(`Collected ${timestamps.length} timestamps`);

  // check to see if posts are truly sorted by datetime
  let allOrdered = true;
  const violations = [];

  console.log(`Item 0: ${new Date(timestamps[0] * 1000).toISOString()}`);
  for (let i = 1; i < timestamps.length; i++) {
    console.log(`Item ${i}: ${new Date(timestamps[i] * 1000).toISOString()}`);
    if (timestamps[i - 1] < timestamps[i]) {
      console.log(
        `❌ Order violation at index ${i - 1} (${new Date(
          timestamps[i - 1] * 1000
        ).toISOString()}) vs index ${i} (${new Date(
          timestamps[i] * 1000
        ).toISOString()})`
      );

      // push both indices so both rows show ❌
      violations.push({
        index: i - 1,
        relatedIndex: i
      });
      violations.push({
        index: i,
        relatedIndex: i - 1
      });

      allOrdered = false;
    }
  }

  // generate report before closing browser
  const htmlReport = generateHtmlReport({
    passed: allOrdered,
    totalChecked: timestamps.length,
    timestamps,
    violations
  });

  const reportPath = saveReport(htmlReport);
  console.log(`📄 HTML report generated: ${reportPath}`);

  if (allOrdered) {
    console.log("✅ All posts are sorted from newest -> oldest in order");
  } else {
    console.log("❌ Some posts are out of order");
  }

  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();
