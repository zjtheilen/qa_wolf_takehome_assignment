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

function generateHtmlReport({ timestamps, violations }) {
    const rows = timestamps.map((ts, i) => {
        const date = new Date(ts * 1000).toISOString();
        const violation = violations.includes(i)
        ? `<span style="color:red">❌</span>`
        : `<span style="color:green">✅</span>`;

        return `<tr>
        <td>${i}</td>
        <td>${date}</td>
        <td style="text-align:center">${violation}</td>
        </tr>`;
    }).join("");

    return `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8" />
        <title>Hacker News Sort Validation</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f4f4f4; }
        </style>
        </head>
        <body>
        <h1>Hacker News Sort Validation</h1>
        <p><strong>Checked:</strong> ${timestamps.length} articles</p>
        <p><strong>Status:</strong> ${
            violations.length === 0
            ? '<span style="color:green">PASS</span>'
            : '<span style="color:red">FAIL</span>'
        }</p>

        <table>
            <thead>
            <tr>
                <th>Index</th>
                <th>Published At</th>
                <th>Order OK</th>
            </tr>
            </thead>
            <tbody>
            ${rows}
            </tbody>
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