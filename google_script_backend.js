/**
 * ClassTrack SKCT - Official Google Apps Script Backend Code
 * -----------------------------------------------------------
 * INSTRUCTIONS TO DEPLOY ON GOOGLE DRIVE / APPS SCRIPT:
 * 1. Open https://script.google.com and click "New Project".
 * 2. Delete existing code in Code.gs and PASTE THIS ENTIRE FILE.
 * 3. Click "Save" 💾 (disk icon).
 * 4. Click "Deploy" ➔ "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "ClassTrack Google Sheets Export Service".
 * 7. Set "Execute as": "Me (your-email@gmail.com)".
 * 8. Set "Who has access": "Anyone" ⚠️ (CRITICAL: Must select "Anyone", NOT "Only myself").
 * 9. Click "Deploy".
 * 10. Copy the Web App URL (ends with /exec) and set it in backend/.env as:
 *     GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 */

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var title = data.title || "ClassTrack_Attendance_Report";
    var docTitle = data.docTitle || "ATTENDANCE REPORT";
    var department = data.department || "Dept: Information Technology";
    var dateRange = data.dateRange || "";
    var primaryColor = data.primaryColor || "#FF6B00";
    var headers = data.headers || ['S.No', 'Roll No', 'Name', 'Section', 'Total Classes', 'Attended Classes', 'Percentage %', 'Status'];
    var rows = data.rows || [];

    // 1. Create a new Google Spreadsheet in Google Drive
    var ss = SpreadsheetApp.create(title);
    var sheet = ss.getActiveSheet();
    sheet.setName("Attendance Data");

    // 2. Add Title Header Banner
    sheet.getRange(1, 1, 1, headers.length).merge();
    var titleCell = sheet.getRange(1, 1);
    titleCell.setValue("SKCT - " + docTitle.toUpperCase());
    titleCell.setFontSize(16);
    titleCell.setFontWeight("bold");
    titleCell.setFontColor("#FFFFFF");
    titleCell.setBackground(primaryColor);
    titleCell.setHorizontalAlignment("center");
    titleCell.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 40);

    // 3. Add Subtitle (Department & Date Range)
    sheet.getRange(2, 1, 1, headers.length).merge();
    var subCell = sheet.getRange(2, 1);
    subCell.setValue(department + "  |  " + dateRange);
    subCell.setFontSize(11);
    subCell.setFontColor("#475569");
    subCell.setBackground("#F8FAFC");
    subCell.setHorizontalAlignment("center");
    sheet.setRowHeight(2, 25);

    // 4. Blank Spacing Row
    sheet.setRowHeight(3, 12);

    // 5. Column Headers
    var headerRowIndex = 4;
    var headerRange = sheet.getRange(headerRowIndex, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight("bold");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setBackground("#0F172A"); // Dark Slate Header
    headerRange.setHorizontalAlignment("center");
    sheet.setRowHeight(headerRowIndex, 30);

    // 6. Data Rows
    if (rows && rows.length > 0) {
      var dataStartRow = 5;
      var dataRange = sheet.getRange(dataStartRow, 1, rows.length, headers.length);
      dataRange.setValues(rows);

      // Zebra striping and borders
      for (var i = 0; i < rows.length; i++) {
        var rowIndex = dataStartRow + i;
        var rowRange = sheet.getRange(rowIndex, 1, 1, headers.length);
        if (i % 2 === 1) {
          rowRange.setBackground("#F8FAFC");
        }
        rowRange.setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
      }
    }

    // 7. Auto-fit all columns
    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
      // Give extra padding for readability
      var currentWidth = sheet.getColumnWidth(col);
      sheet.setColumnWidth(col, Math.max(currentWidth + 20, 110));
    }

    // 8. Set Sharing Permission: Anyone with link can view
    var file = DriveApp.getFileById(ss.getId());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var sheetUrl = ss.getUrl();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      sheetUrl: sheetUrl,
      spreadsheetId: ss.getId(),
      message: "Google Sheet generated successfully!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "ClassTrack Google Sheets Web App is running live!"
  })).setMimeType(ContentService.MimeType.JSON);
}
