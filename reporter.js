const fs = require("fs");
const path = require("path");

/* 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~ 1. DIR/FILE MNGMT ~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
*/
// check to see if a /reports directory exists, and creates one if not, returns directory
function ensureReportsDir() {
    const reportsDir = path.join(__dirname, "reports");
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }
    return reportsDir;
}

// create descriptive filename for report
function getTimeStampedFilename() {
    const now = new Date();
    const safeTimestamp = now.toISOString().replace(/[:.]/g, "-");
    return `hn_sort_report_${safeTimestamp}.html`;
}

// build report
function generateHtmlReport({ passed, totalChecked, timestamps, titles, violations }) {
    const violationSet = new Set(violations.map(v => v.index));

    
    /* 
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ~~~~~~~ 2. Generate Table ~~~~~~~~~
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
    */
    // build template for passing / failing rows in report
    const rows = timestamps.map((ts, i) => {
        const iso = new Date(ts * 1000).toISOString();
        const title = titles[i];

        // if there is a violation, style the row as such, otherwise build unstyled rows
        if (violationSet.has(i)) {
            const relatedIndex = violations.find(v => v.index === i)?.relatedIndex ?? "?";
            return `<tr>
                        <td style="background: pink;">${i}</td>
                        <td style="background: pink;">${iso}</td>
                        <td style="background: pink; text-align: center;" title="Out of order with index ${relatedIndex}">❌</td>
                        <td style="background: pink;">${title}</td>
                    </tr>`;
        } else {
            return `<tr>
                        <td>${i}</td>
                        <td>${iso}</td>
                        <td style="text-align: center;">✅</td>
                        <td>${title}</td>
                    </tr>`;
        }
    }).join("");

    // Build and return the entire report, including title, summary, 
    // and results for each article using the above template for each row
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
                <th>Title</th>
            </tr>
            ${rows}
            </table>
        </body>
        </html>
    `;
}

/* 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~ 3. Saving Report ~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
*/
// save report to disk and return path
function saveReport(html) {
    const reportsDir = ensureReportsDir();
    const filename = getTimeStampedFilename();
    const reportPath = path.join(reportsDir, filename);

    fs.writeFileSync(reportPath, html, "utf-8");
    return reportPath;
}

// export helper functions
module.exports = {
    generateHtmlReport,
    saveReport
};