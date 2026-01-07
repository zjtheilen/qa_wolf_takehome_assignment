const { time } = require("console");
const fs = require("fs");
const path = require("path");

function generateHtmlReport(results) {
    const {
        passed,
        totalChecked,
        timestamps,
        violations
    } = results;

    const newest = new Date(timestamps[0] * 1000).toISOString();
    const oldest = new Date(timestamps[timestamps.length - 1] * 1000).toISOString();

    const violationRows = violations.length
        ? violations
            .map(
                v => `
                <li>
                    Index ${v.index}:<br />
                    Previous: ${new Date(v.previous * 1000).toISOString()}<br />
                    Current: ${new Date(v.current * 1000).toISOString()}
                </li>`
            )
            .join("")
        : "<li>None</li>";
    
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <title>Hacker News Sorting Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; }
                    .pass { color: green; }
                    .fail { color: red; }
                </style>
            </head>
            <body>
                <h1>Hacker News Sorting Validation</h1>

                <h2 class="${passed ? "pass" : "fail"}">
                    Staus: ${passed ? "PASS" : "FAIL"}
                </h2>
                <p><strong>Articles checked:</strong> ${totalChecked}</p>
                <p><strong>Newest timestamp:</strong> ${newest}</p>
                <p><strong>Oldest timestamp:</strong> ${oldest}</p>
                <p><strong>Run at:</strong> ${new Date().toISOString()}</p>

                <h3>Order Violations</h3>
                <ul>
                    ${violationRows}
                </ul>
            </body>
        </html>
    `;

    const outputPath = path.join(__dirname, "report.html");
    fs.writeFileSync(outputPath, html);

    console.log(`📄 HTML report generated at: ${outputPath}`);
}

module.exports = { generateHtmlReport };