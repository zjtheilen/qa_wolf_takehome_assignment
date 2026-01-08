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
  const items = [];

  while (items.length < N) {
    const ageSpans = await page.$$("span.age");

    for (let i = 0; i < ageSpans.length && items.length < N; i++) {
      const ageSpan = ageSpans[i];

      const titleAttr = await ageSpan.getAttribute("title");
      if (!titleAttr) continue;

      const unixSeconds = Number(titleAttr.split(" ")[1]);

      // get the title text
      const title = await ageSpan.evaluate(span => {
        const subtextRow = span.closest("tr");
        const titleRow = subtextRow?.previousElementSibling;
        const link = titleRow?.querySelector(".titleline a");
        return link ? link.textContent : "Unknown title";
      });

      items.push({
        index: items.length,
        timestamp: unixSeconds,
        title
      });
    }

    const moreLink = await page.$("a.morelink");
    if (items.length < N && moreLink) {
      await moreLink.click();
      await page.waitForLoadState("domcontentloaded");
    } else {
      break;
    }
  }

  // force failure for testing purposes
  items[50] = items[20];

  // console.log(`Collected ${timestamps.length} timestamps`);
  console.log(`Collected ${items.length} items`);

  // check to see if posts are truly sorted by datetime
  let allOrdered = true;
  const violations = [];
  console.log(`Item 0: ${new Date(items[0].timestamp * 1000).toISOString()} - ${items[0].title}`);
  // console.log(`Item 0: ${new Date(timestamps[0] * 1000).toISOString()}`);
  for (let i = 1; i < items.length; i++) {
    console.log(`Item ${i}: ${new Date(items[i].timestamp * 1000).toISOString()} - ${items[i].title}`);
    if (items[i - 1].timestamp < items[i].timestamp) {
      console.log(
        `❌ Order violation at index ${i - 1} (${new Date(
          items[i - 1].timestamp * 1000
        ).toISOString()}) vs index ${i} (${new Date(
          items[i].timestamp * 1000
        ).toISOString()})`
      );

      violations.push({ index: i - 1, relatedIndex: i });
      violations.push({ index: i, relatedIndex: i - 1 });

      allOrdered = false;
    }
  }

  // generate report before closing browser
  const htmlReport = generateHtmlReport({
    passed: allOrdered,
    totalChecked: items.length,
    timestamps: items.map(item => item.timestamp),
    titles: items.map(item => item.title),
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
