const fs = require("fs");
const path = require("path");

function ensureReportsDir() {
    const reportsDir = path.join(__dirname, "reports");
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }
    return reportsDir;
}

function getTimeStampedFilename() {
    const now = new Date();
    const safeTimestamp = now.toISOString().replace(/[:.]/g, "-");
    return `hn_sort_report_${safeTimestamp}.html`;
}

function generateHtmlReport({ passed, totalChecked, timestamps, violations }) {
  const violationSet = new Set(violations.map(v => v.index)); // only indices

  const rows = timestamps.map((ts, i) => {
    const iso = new Date(ts * 1000).toISOString();
    if (violationSet.has(i)) {
      // find related index for tooltip
      const violationObj = violations.find(v => v.index === i);
      const relatedIndex = violationObj ? violationObj.relatedIndex : null;

      return `<tr>
        <td style="background: pink;">${i}</td>
        <td style="background: pink;">${iso}</td>
        <td style="background: pink;" title="Out of order (check related post index: ${relatedIndex})">${'❌'}</td>
      </tr>`;
    } else {
      return `<tr>
        <td>${i}</td>
        <td>${iso}</td>
        <td>${'✅'}</td>
      </tr>`;
    }
  }).join("");

  return `
    <html>
      <head>
        <title>Hacker News Sort Validation</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 5px; text-align: left; }
          th { background-color: #f2f2f2; }
          td { cursor: default; }
        </style>
      </head>
      <body>
        <h1>Hacker News Sort Validation</h1>
        <p>Checked: ${totalChecked} articles</p>
        <p>Status: ${passed ? "PASS ✅" : "FAIL ❌"}</p>
        <table>
          <tr>
            <th>Index</th>
            <th>Published At</th>
            <th>Order OK</th>
          </tr>
          ${rows}
        </table>
      </body>
    </html>
  `;
}


function saveReport(html) {
    const reportsDir = ensureReportsDir();
    const filename = getTimeStampedFilename();
    const reportPath = path.join(reportsDir, filename);

    fs.writeFileSync(reportPath, html, "utf-8");
    return reportPath;
}

module.exports = { 
    generateHtmlReport,
    saveReport
};