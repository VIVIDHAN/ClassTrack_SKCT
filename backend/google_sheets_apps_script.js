/**
 * Google Apps Script for ClassTrack SKCT Attendance & Absentee Report Automation
 * 
 * =========================================================================
 * ⚠️ DO YOU NEED A GOOGLE SHEET API KEY? NO! ABSOLUTELY NOT! ⚠️
 * Google Apps Script runs natively inside your Google Drive account.
 * It has direct built-in access to Google Sheets without ANY API keys or billing!
 * =========================================================================
 * 
 * 5-STEP DEPLOYMENT INSTRUCTIONS (Takes 60 Seconds):
 * 1. Go to https://script.google.com/
 * 2. Click "+ New project" (or open your existing project) and rename it "ClassTrack_SKCT_Sheets".
 * 3. Delete everything in Code.gs and PASTE THIS ENTIRE FILE.
 * 4. Click the blue "Deploy" button at top-right > choose "New deployment".
 * 5. In the modal:
 *    - Click the gear icon ⚙️ next to "Select type" and choose "Web app".
 *    - Description: "ClassTrack Report Exporter"
 *    - Execute as: "Me (your-email@...)"
 *    - Who has access: "Anyone"  <--- 🚨 MUST BE "Anyone"! (If you select "Only myself", it will fail!)
 * 6. Click "Deploy".
 *    - Google will show an "Authorize access" pop-up.
 *    - Click your Google account > click "Advanced" > click "Go to ClassTrack_SKCT_Sheets (unsafe)" > click "Allow".
 * 7. Copy the generated "Web app URL" (starts with https://script.google.com/macros/s/.../exec).
 * 8. Paste this URL in the ClassTrack app (or in backend/.env: GOOGLE_SHEETS_WEBAPP_URL=...).
 */

function doPost(e) {
  try {
    var rawData = "";
    if (e && e.postData && e.postData.contents) {
      rawData = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      rawData = e.parameter.data;
    }
    
    var payload = {};
    if (rawData) {
      try {
        payload = JSON.parse(rawData);
      } catch (parseErr) {
        payload = {};
      }
    }

    var rType = (payload.reportType || "").toLowerCase();
    var isAbsentee = rType === "absentees" || (payload.title && payload.title.indexOf("Absentee") !== -1);
    var isGte75 = rType === "gte75" || (payload.title && payload.title.indexOf("GTE75") !== -1) || (payload.title && payload.title.indexOf("Eligible") !== -1);
    var isLt75 = rType === "lt75" || (payload.title && payload.title.indexOf("LT75") !== -1) || (payload.title && payload.title.indexOf("Defaulter") !== -1);

    var defaultTitle = isAbsentee ? "SKCT_IT_Absentee_Report" 
      : isGte75 ? "SKCT_IT_Eligible_Students_GTE75" 
      : isLt75 ? "SKCT_IT_Attendance_Defaulters_LT75" 
      : "SKCT_Attendance_Report";

    var title = payload.title || (defaultTitle + "_" + Utilities.formatDate(new Date(), "GMT+5:30", "yyyyMMdd_HHmmss"));
    var headers = payload.headers || (isAbsentee 
      ? ["S.No", "Date", "Period", "Time", "Roll No", "Student Name", "Section", "Subject", "Parent Mobile", "Status"]
      : ["S.No", "Roll No", "Name", "Section", "Present", "Total", "Percentage", "Parent Mobile", "Status"]);
    var rows = payload.rows || [];
    var department = payload.department || "Sri Krishna College of Technology - Department of Information Technology";
    var dateRange = payload.dateRange || ("Date: " + Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd"));

    // Tab name & Theme Colors
    var tabName = isAbsentee ? "Absentee List" 
      : isGte75 ? "Eligible (≥75%)" 
      : isLt75 ? "Defaulters (<75%)" 
      : "All Students";

    var primaryColor = payload.primaryColor || (isAbsentee ? "#DC2626" 
      : isGte75 ? "#16A34A" 
      : isLt75 ? "#D97706" 
      : "#2563EB");

    var docTypeLabel = payload.docTitle || (isAbsentee ? "OFFICIAL STUDENT ABSENTEE REPORT (ADMIN EXCLUSIVE)" 
      : isGte75 ? "STUDENT ATTENDANCE ELIGIBILITY REPORT (≥ 75%)" 
      : isLt75 ? "ATTENDANCE DEFAULTERS REPORT (< 75%)" 
      : "CLASS ATTENDANCE SUMMARY REPORT (ALL STUDENTS)");

    // Create a new Google Spreadsheet directly in your Google Drive
    var ss = SpreadsheetApp.create(title);
    var sheet = ss.getActiveSheet();
    sheet.setName(tabName);

    // 1. Institution Title Row
    sheet.appendRow(["SRI KRISHNA COLLEGE OF TECHNOLOGY"]);
    sheet.getRange(1, 1).setFontSize(15).setFontWeight("bold").setFontColor(primaryColor);

    // 2. Department & Document Sub-title
    sheet.appendRow([department]);
    sheet.getRange(2, 1).setFontSize(11).setFontWeight("bold").setFontColor("#1E293B");

    sheet.appendRow([docTypeLabel]);
    sheet.getRange(3, 1).setFontSize(10).setFontWeight("bold").setFontColor(primaryColor);

    // 3. Metadata Row
    sheet.appendRow([dateRange + " | Total Records: " + (rows ? rows.length : 0)]);
    sheet.getRange(4, 1).setFontSize(9).setFontColor("#64748B");

    // Empty separator row (must contain at least one empty string, [] throws exception)
    sheet.appendRow([""]);

    // 4. Table Header Row
    var headerRowIndex = 6;
    sheet.appendRow(headers && headers.length > 0 ? headers : ["Record"]);
    var headerRange = sheet.getRange(headerRowIndex, 1, 1, headers.length);
    headerRange.setBackground(primaryColor);
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");

    // 5. Append Student / Absentee Data Rows
    var validRowsCount = 0;
    if (rows && rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row && Array.isArray(row) && row.length > 0) {
          sheet.appendRow(row);
          validRowsCount++;
        }
      }

      if (validRowsCount > 0) {
        var dataRange = sheet.getRange(headerRowIndex + 1, 1, validRowsCount, headers.length);
        dataRange.setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
        dataRange.setFontSize(10);
        dataRange.setVerticalAlignment("middle");

        // Alternate row backgrounds
        for (var r = 0; r < validRowsCount; r++) {
          var rowNum = headerRowIndex + 1 + r;
          if (r % 2 === 1) {
            sheet.getRange(rowNum, 1, 1, headers.length).setBackground("#F8FAFC");
          }
        }

        // Highlight Status Column if present
        var statusCol = headers.length;
        var statusRange = sheet.getRange(headerRowIndex + 1, statusCol, validRowsCount, 1);
        if (isAbsentee) {
          statusRange.setFontColor("#DC2626").setFontWeight("bold").setBackground("#FEE2E2").setHorizontalAlignment("center");
        } else if (isLt75) {
          statusRange.setFontColor("#B45309").setFontWeight("bold").setBackground("#FEF3C7").setHorizontalAlignment("center");
        } else if (isGte75) {
          statusRange.setFontColor("#15803D").setFontWeight("bold").setBackground("#DCFCE7").setHorizontalAlignment("center");
        }
      }
    }

    // Auto-fit column widths
    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }

    // Freeze Header rows
    sheet.setFrozenRows(headerRowIndex);

    // Make spreadsheet viewable to anyone with the link
    try {
      var file = DriveApp.getFileById(ss.getId());
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      // Ignored if domain policy restricts public sharing
    }

    var result = {
      success: true,
      sheetUrl: ss.getUrl(),
      spreadsheetId: ss.getId(),
      exportXlsxUrl: "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=xlsx",
      exportCsvUrl: "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=csv",
      title: title,
      message: "Google Sheet generated successfully in Google Drive!"
    };

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var html = "<div style='font-family:sans-serif;padding:30px;max-width:600px;margin:auto;text-align:center;'>"
    + "<h2 style='color:#FF6B00;'>✅ ClassTrack Google Apps Script is LIVE & ACTIVE!</h2>"
    + "<p style='color:#334155;font-size:15px;'>This Web App is ready to receive POST requests from the ClassTrack SKCT Admin Portal to automatically generate Google Sheets in your Google Drive.</p>"
    + "<div style='background:#F1F5F9;padding:15px;border-radius:10px;text-align:left;font-size:13px;color:#0F172A;'>"
    + "<b>Status:</b> Online &amp; Authenticated<br>"
    + "<b>Permissions:</b> Built-in Google Drive (Zero API Keys Needed!)<br>"
    + "<b>Access:</b> Public Web App"
    + "</div>"
    + "</div>";

  return HtmlService.createHtmlOutput(html);
}
