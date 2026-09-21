import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';
import {
  generateFallbackReport,
  getFacultyScope,
  FacultyScope,
  generateDetailedLogsForScope,
  SKCT_STUDENTS_G,
  SKCT_STUDENTS_E,
} from '../constants/DummyData';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type ViewMode = 'summary' | 'table';
type PctFilter = 'all' | 'lt75' | 'gt75';
type AdminExportFilter = 'absentees' | 'all' | 'gte75' | 'lt75';

export default function AttendanceReport() {
  const navigation = useNavigation<any>();

  const [selectedSection, setSelectedSection] = useState<string>('Both');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [pctFilter, setPctFilter] = useState<PctFilter>('all');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminExportFilter, setAdminExportFilter] = useState<AdminExportFilter>('absentees');
  const [generatedGoogleSheetUrl, setGeneratedGoogleSheetUrl] = useState<string | null>(null);
  const [generatedSpreadsheetId, setGeneratedSpreadsheetId] = useState<string | null>(null);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState<boolean>(false);
  const [facultyScope, setFacultyScope] = useState<FacultyScope>(() => getFacultyScope(null));

  // Date values
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Calendar Modal Picker state
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [dateTarget, setDateTarget] = useState<'start' | 'end'>('start');
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  // Dropdown Modals state
  const [sectionDropdownVisible, setSectionDropdownVisible] = useState(false);
  const [pctDropdownVisible, setPctDropdownVisible] = useState(false);
  const [adminFilterDropdownVisible, setAdminFilterDropdownVisible] = useState(false);
  const [googleSheetsModalVisible, setGoogleSheetsModalVisible] = useState(false);

  // Absentee Intimation Letter Email state
  const [absenteeModalVisible, setAbsenteeModalVisible] = useState(false);
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState<any>(null);
  const [recipientEmailInput, setRecipientEmailInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);
  const [detailedLogs, setDetailedLogs] = useState<any[]>([]);

  // Check Admin Status & Resolve Faculty Timetable Scope & Load Stored Google Sheets URL
  useEffect(() => {
    AsyncStorage.getItem('loggedInTeacher').then(stored => {
      if (stored) {
        try {
          const u = JSON.parse(stored);
          const scope = getFacultyScope(u);
          setFacultyScope(scope);

          if (u.isAdmin || u.id === 999 || u.role === 'admin' || (u.email && u.email.includes('admin'))) {
            setIsAdminUser(true);
          } else {
            // Lock non-admin teacher to their timetable assigned section
            setSelectedSection(scope.assignedSection);
          }
        } catch (e) {}
      }
    });
  }, []);

  // Fetch report data & raw table logs based on faculty timetable scope
  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const activeSection = !isAdminUser && facultyScope.assignedSection !== 'Both'
      ? facultyScope.assignedSection
      : selectedSection;

    const sectionParam = activeSection === 'Both' ? '' : activeSection;

    const fetchSummary = fetch(
      `${API_BASE_URL}/reports?startDate=${startDate}&endDate=${endDate}&section=${encodeURIComponent(sectionParam)}&teacherId=${facultyScope.teacherId}&subject=${encodeURIComponent(facultyScope.assignedSubject)}`,
      { signal: controller.signal }
    )
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.summary) && Array.isArray(data.logs)) {
          setReportData(data.summary);
          setDetailedLogs(data.logs);
        } else if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => ({
            roll_no: item.roll_no,
            name: item.name,
            className: item.section || item.className || activeSection,
            totalClasses: item.totalClasses || 25,
            attendedClasses: item.attendedClasses || 20,
            percentage: item.percentage || 80,
          }));
          setReportData(mapped);
          if (Array.isArray((data as any).logs)) {
            setDetailedLogs((data as any).logs);
          }
        } else {
          setReportData(generateFallbackReport(activeSection, startDate, endDate, facultyScope));
          setDetailedLogs(generateDetailedLogsForScope(facultyScope, sectionParam));
        }
      })
      .catch(() => {
        setReportData(generateFallbackReport(activeSection, startDate, endDate, facultyScope));
        setDetailedLogs(generateDetailedLogsForScope(facultyScope, sectionParam));
      });

    const fetchLogs = fetch(
      `${API_BASE_URL}/attendance?startDate=${startDate}&endDate=${endDate}&section=${encodeURIComponent(sectionParam)}&subject=${encodeURIComponent(facultyScope.assignedSubject)}`,
      { signal: controller.signal }
    )
      .then(res => res.json())
      .then(logs => {
        if (Array.isArray(logs) && logs.length > 0) {
          setDetailedLogs(logs);
        }
      })
      .catch(() => {});

    Promise.allSettled([fetchSummary, fetchLogs]).finally(() => {
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, selectedSection, facultyScope, isAdminUser]);

  // Filtered Students (Summary view)
  const filteredStudents = useMemo(() => {
    return reportData.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (pctFilter === 'lt75') return s.percentage < 75;
      if (pctFilter === 'gt75') return s.percentage >= 75;
      return true;
    });
  }, [reportData, searchQuery, pctFilter]);

  // Filtered Table Logs (Detailed DB table view)
  const filteredLogs = useMemo(() => {
    return detailedLogs.filter(
      l =>
        (l.student_name && l.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.roll_no && l.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.subject_name && l.subject_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [detailedLogs, searchQuery]);

  // Absentees Only Logs
  const absenteesOnlyLogs = useMemo(() => {
    return detailedLogs.filter(
      l => l.status === 'Absent' &&
        ((l.student_name && l.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.roll_no && l.roll_no.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [detailedLogs, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    if (reportData.length === 0) {
      return { avg: 0, good: 0, risk: 0, total: 0 };
    }
    const total = reportData.length;
    const sum = reportData.reduce((acc, curr) => acc + curr.percentage, 0);
    const avg = Math.round(sum / total);
    const good = reportData.filter(s => s.percentage >= 75).length;
    const risk = reportData.filter(s => s.percentage < 75).length;
    return { avg, good, risk, total };
  }, [reportData]);

  const openCalendarPicker = (target: 'start' | 'end') => {
    setDateTarget(target);
    const activeDateStr = target === 'start' ? startDate : endDate;
    const ref = activeDateStr ? new Date(activeDateStr) : new Date();
    if (!isNaN(ref.getTime())) {
      setCalYear(ref.getFullYear());
      setCalMonth(ref.getMonth());
    }
    setCalendarModalVisible(true);
  };

  // Helper: Copy text to clipboard across Web and Native
  const copyToClipboard = (text: string) => {
    try {
      const globalObj = globalThis as any;
      if (globalObj.navigator && globalObj.navigator.clipboard && globalObj.navigator.clipboard.writeText) {
        globalObj.navigator.clipboard.writeText(text);
      }
    } catch (e) {}
  };

  // Map roll numbers to parent phone numbers
  const studentPhoneMap = useMemo(() => {
    const map = new Map<string, string>();
    [...SKCT_STUDENTS_G, ...SKCT_STUDENTS_E].forEach(s => {
      if (s.id && s.phone) {
        map.set(s.id.toUpperCase(), s.phone);
      }
    });
    return map;
  }, []);

  // Helper: Extract clean, enriched absentee records
  const getAbsenteeRecords = useCallback(() => {
    let list: any[] = [];
    if (absenteesOnlyLogs && absenteesOnlyLogs.length > 0) {
      list = absenteesOnlyLogs.map((log, i) => {
        const roll = log.roll_no || (log.Student && log.Student.roll_no) || 'N/A';
        const phone =
          log.parent_phone ||
          (log.Student && (log.Student.original_parent_phone || log.Student.parent_phone)) ||
          studentPhoneMap.get(roll.toUpperCase()) ||
          '9442211279';
        return {
          sno: i + 1,
          date: log.date || endDate,
          period: log.period || 'Period 1',
          time: log.time || '08:15 - 09:15',
          roll_no: roll,
          name: log.student_name || (log.Student && log.Student.name) || 'Student',
          className: log.section || (selectedSection === 'Both' ? 'III IT G' : selectedSection),
          subject: log.subject_name || facultyScope.assignedSubject || 'Applied Cryptography',
          phone,
          status: 'Absent',
        };
      });
    }

    if (list.length === 0) {
      const defaulters = filteredStudents.filter(s => s.percentage < 75);
      const base = defaulters.length > 0 ? defaulters : filteredStudents.slice(0, 5);
      list = base.map((s, i) => {
        const roll = s.roll_no;
        const phone = studentPhoneMap.get(roll.toUpperCase()) || '9442211279';
        return {
          sno: i + 1,
          date: endDate,
          period: `Period ${(i % 4) + 1}`,
          time: `0${8 + (i % 4)}:15 - 0${9 + (i % 4)}:15`,
          roll_no: roll,
          name: s.name,
          className: s.className || (selectedSection === 'Both' ? 'III IT G' : selectedSection),
          subject: facultyScope.assignedSubject || 'Applied Cryptography',
          phone,
          status: 'Absent',
        };
      });
    }
    return list;
  }, [absenteesOnlyLogs, endDate, selectedSection, facultyScope, filteredStudents, studentPhoneMap]);

  // Helper: Extract complete, structured dataset for any of the 4 Admin Export Filters
  const getAdminExportDataset = useCallback((filter: AdminExportFilter) => {
    const sectionLabel = selectedSection === 'Both' ? 'III IT G + III IT E' : selectedSection;
    const safeSection = selectedSection.replace(/\s+/g, '_');

    if (filter === 'absentees') {
      const list = getAbsenteeRecords();
      const title = `SKCT_IT_Absentee_Report_${safeSection}_${startDate}_to_${endDate}`;
      const headers = ['S.No', 'Date', 'Period', 'Time', 'Roll No', 'Student Name', 'Section', 'Subject', 'Parent Mobile', 'Status'];
      const rows = list.map((a: any) => [
        a.sno,
        a.date,
        a.period,
        a.time,
        a.roll_no,
        a.name,
        a.className,
        a.subject,
        a.phone,
        'Absent',
      ]);
      return {
        filter,
        label: 'Absentees Alone',
        shortLabel: 'Absentees',
        color: '#DC2626',
        badgeBg: '#FEE2E2',
        title,
        docTitle: 'OFFICIAL STUDENT ABSENTEE REPORT (ADMIN EXCLUSIVE)',
        fileName: `${title}.csv`,
        headers,
        rows,
        count: list.length,
        list,
      };
    }

    if (filter === 'gte75') {
      const eligible = reportData.filter(s => s.percentage >= 75);
      const title = `SKCT_IT_Eligible_Students_GTE75_${safeSection}_${startDate}_to_${endDate}`;
      const headers = ['S.No', 'Roll No', 'Student Name', 'Section', 'Present Classes', 'Total Classes', 'Attendance %', 'Parent Mobile', 'Status'];
      const rows = eligible.map((s, idx) => {
        const roll = s.roll_no;
        const phone = studentPhoneMap.get(roll.toUpperCase()) || '9442211279';
        return [
          idx + 1,
          roll,
          s.name,
          s.className || sectionLabel,
          s.attendedClasses || 0,
          s.totalClasses || 25,
          `${s.percentage}%`,
          phone,
          'Eligible (≥75%)',
        ];
      });
      return {
        filter,
        label: 'Eligible Students (≥75%)',
        shortLabel: 'Eligible ≥75%',
        color: '#16A34A',
        badgeBg: '#DCFCE7',
        title,
        docTitle: 'STUDENT ATTENDANCE ELIGIBILITY REPORT (≥ 75%)',
        fileName: `${title}.csv`,
        headers,
        rows,
        count: eligible.length,
        list: eligible,
      };
    }

    if (filter === 'lt75') {
      const defaulters = reportData.filter(s => s.percentage < 75);
      const title = `SKCT_IT_Attendance_Defaulters_LT75_${safeSection}_${startDate}_to_${endDate}`;
      const headers = ['S.No', 'Roll No', 'Student Name', 'Section', 'Present Classes', 'Total Classes', 'Attendance %', 'Classes Needed for 75%', 'Parent Mobile', 'Status'];
      const rows = defaulters.map((s, idx) => {
        const roll = s.roll_no;
        const phone = studentPhoneMap.get(roll.toUpperCase()) || '9442211279';
        const total = s.totalClasses || 25;
        const attended = s.attendedClasses || 0;
        const shortfall = Math.max(1, Math.ceil((0.75 * total - attended) / 0.25));
        return [
          idx + 1,
          roll,
          s.name,
          s.className || sectionLabel,
          attended,
          total,
          `${s.percentage}%`,
          `${shortfall} class${shortfall > 1 ? 'es' : ''}`,
          phone,
          'Defaulter (<75%)',
        ];
      });
      return {
        filter,
        label: 'Attendance Defaulters (<75%)',
        shortLabel: 'Defaulters <75%',
        color: '#D97706',
        badgeBg: '#FEF3C7',
        title,
        docTitle: 'ATTENDANCE DEFAULTERS REPORT (< 75%)',
        fileName: `${title}.csv`,
        headers,
        rows,
        count: defaulters.length,
        list: defaulters,
      };
    }

    // Default 'all': All Students
    const title = `SKCT_IT_All_Students_Attendance_${safeSection}_${startDate}_to_${endDate}`;
    const headers = ['S.No', 'Roll No', 'Student Name', 'Section', 'Present Classes', 'Total Classes', 'Attendance %', 'Parent Mobile', 'Status'];
    const rows = reportData.map((s, idx) => {
      const roll = s.roll_no;
      const phone = studentPhoneMap.get(roll.toUpperCase()) || '9442211279';
      return [
        idx + 1,
        roll,
        s.name,
        s.className || sectionLabel,
        s.attendedClasses || 0,
        s.totalClasses || 25,
        `${s.percentage}%`,
        phone,
        s.percentage >= 75 ? 'Eligible (≥75%)' : 'Defaulter (<75%)',
      ];
    });
    return {
      filter,
      label: 'All Students Attendance',
      shortLabel: 'All Students',
      color: '#2563EB',
      badgeBg: '#EFF6FF',
      title,
      docTitle: 'CLASS ATTENDANCE REPORT (ALL STUDENTS)',
      fileName: `${title}.csv`,
      headers,
      rows,
      count: reportData.length,
      list: reportData,
    };
  }, [selectedSection, startDate, endDate, getAbsenteeRecords, reportData, studentPhoneMap]);

  // Active dataset according to the selected Admin Export Filter
  const currentDataset = useMemo(() => {
    return getAdminExportDataset(adminExportFilter);
  }, [getAdminExportDataset, adminExportFilter]);

  // Helper: Trigger direct local file download on Web / Mobile without dumping raw text to WhatsApp
  const downloadReportFile = async (
    fileName: string,
    content: string,
    format: 'csv' | 'xls',
    reportType: AdminExportFilter
  ) => {
    const globalObj = globalThis as any;
    const globalDoc = globalObj && globalObj.document ? globalObj.document : null;

    // 1. Direct Web Browser Blob Download
    if (globalDoc && globalDoc.createElement) {
      try {
        const mimeType = format === 'xls' ? 'application/vnd.ms-excel' : 'text/csv';
        const BlobCtor: any = globalObj.Blob || (globalThis as any).Blob;
        const blob = new BlobCtor(['\uFEFF' + content], { type: mimeType });
        const urlCtor: any = globalObj.URL || (globalThis as any).URL;
        const url = urlCtor.createObjectURL(blob);
        const link = globalDoc.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        link.style.display = 'none';
        globalDoc.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            globalDoc.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (e) {}
        }, 1500);
        return;
      } catch (e) {
        console.log('Web Blob download fallback:', e);
      }
    }

    // 2. Mobile App: Direct Browser Download via Backend API (Downloads real file into Downloads folder)
    try {
      const sectionParam = selectedSection === 'Both' ? 'Both' : selectedSection;
      const downloadUrl = `${API_BASE_URL}/reports/download-excel?reportType=${reportType}&format=${format}&section=${encodeURIComponent(sectionParam)}&startDate=${startDate}&endDate=${endDate}`;

      const canOpen = await Linking.canOpenURL(downloadUrl).catch(() => true);
      if (canOpen) {
        await Linking.openURL(downloadUrl);
        Alert.alert(
          'Download Started 📥',
          `File: ${fileName}\n\nDownloading to your device Downloads folder. You can open it directly in Google Sheets or Microsoft Excel!`
        );
        return;
      }
    } catch (err) {
      console.log('Linking download error, trying system share fallback:', err);
    }

    // 3. Fallback: Native Share Sheet
    try {
      await Share.share({
        message: content,
        title: fileName,
      });
    } catch (err: any) {
      Alert.alert('Download Error', err.message);
    }
  };

  // Admin Action: Download CSV Sheet for selected filter
  const handleDownloadCSVReport = async () => {
    if (!isAdminUser) {
      Alert.alert(
        'Admin Access Restricted 🔒',
        'Downloading detailed attendance and absentee reports is enabled exclusively for the Administrator account (admin@skct.edu.in).'
      );
      return;
    }

    try {
      const sectionLabel = selectedSection === 'Both' ? 'III IT G + III IT E' : selectedSection;
      const dataset = getAdminExportDataset(adminExportFilter);

      let csvContent = `\uFEFFSRI KRISHNA COLLEGE OF TECHNOLOGY\n`;
      csvContent += `DEPARTMENT OF INFORMATION TECHNOLOGY\n`;
      csvContent += `${dataset.docTitle}\n`;
      csvContent += `Class / Section: ${sectionLabel}\n`;
      csvContent += `Date Range: ${startDate} to ${endDate}\n`;
      csvContent += `Total Records: ${dataset.count}\n\n`;

      csvContent += dataset.headers.join(',') + '\n';

      dataset.rows.forEach(row => {
        const line = row.map((cell: any) => {
          const str = String(cell !== undefined && cell !== null ? cell : '');
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(',');
        csvContent += line + '\n';
      });

      await downloadReportFile(dataset.fileName, csvContent, 'csv', adminExportFilter);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Export Error', err.message);
    }
  };

  // Admin Action: Download Excel Sheet (Direct XLSX from Google Sheets or clean CSV)
  const handleDownloadExcelReport = async () => {
    if (!isAdminUser) {
      Alert.alert(
        'Admin Access Restricted 🔒',
        'Downloading detailed Excel reports is enabled exclusively for the Administrator account (admin@skct.edu.in).'
      );
      return;
    }

    try {
      // If a Google Sheet was generated, download the REAL binary .xlsx file directly from Google Drive!
      if (generatedSpreadsheetId) {
        const directXlsxUrl = `https://docs.google.com/spreadsheets/d/${generatedSpreadsheetId}/export?format=xlsx`;
        const canOpen = await Linking.canOpenURL(directXlsxUrl).catch(() => true);
        if (canOpen) {
          await Linking.openURL(directXlsxUrl);
          Alert.alert(
            'Downloading Excel (.xlsx) 📥',
            'Your genuine Excel workbook is downloading directly from Google Sheets to your device!'
          );
          return;
        }
      }

      // Otherwise download clean CSV (opens directly as tabular spreadsheet in Google Sheets & Excel)
      await handleDownloadCSVReport();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Export Error', err.message);
    }
  };

  // Admin Action: Export Report to Google Sheet (Permanently managed via backend/.env)
  const handleExportGoogleSheet = async () => {
    if (!isAdminUser) {
      Alert.alert(
        'Admin Access Restricted 🔒',
        'Google Sheet export is enabled exclusively for the Administrator account (admin@skct.edu.in).'
      );
      return;
    }

    setIsGeneratingSheet(true);

    try {
      const sectionLabel = selectedSection === 'Both' ? 'III IT G + III IT E' : selectedSection;
      const dataset = getAdminExportDataset(adminExportFilter);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

      const response = await fetch(`${API_BASE_URL}/reports/google-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title: dataset.title,
          reportType: adminExportFilter,
          department: `Dept: Information Technology (${sectionLabel})`,
          dateRange: `Date Range: ${startDate} to ${endDate}`,
          startDate,
          endDate,
          section: selectedSection,
          docTitle: dataset.docTitle,
          primaryColor: dataset.color,
          headers: dataset.headers,
          rows: dataset.rows,
        }),
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response) {
        const resData = await response.json().catch(() => null);
        if (resData && resData.success && (resData.sheetUrl || resData.url)) {
          const url = resData.sheetUrl || resData.url;
          setGeneratedGoogleSheetUrl(url);
          setGeneratedSpreadsheetId(resData.spreadsheetId || '');
          setIsGeneratingSheet(false);
          setGoogleSheetsModalVisible(false);
          Linking.openURL(url).catch(() => {});
          Alert.alert(
            'Google Sheet Created 🎉',
            `Your live ${dataset.shortLabel} Google Sheet has been generated in Google Drive and opened!`
          );
          return;
        } else if (resData && resData.error) {
          setIsGeneratingSheet(false);
          setGoogleSheetsModalVisible(true);
          Alert.alert('Google Sheets Export ⚠️', resData.error);
          return;
        }
      }

      setIsGeneratingSheet(false);
      setGoogleSheetsModalVisible(true);
      Alert.alert(
        'Could Not Create Google Sheet ⚠️',
        'Unable to connect to Google Sheets backend. Please verify that GOOGLE_SHEETS_WEBAPP_URL is correctly set in backend/.env.'
      );
    } catch (err: any) {
      console.error(err);
      setIsGeneratingSheet(false);
      setGoogleSheetsModalVisible(true);
      Alert.alert('Export Error', err.message || 'An unexpected error occurred while creating the Google Sheet.');
    }
  };

  // Admin Action: Share Absentee, All, >=75%, or <75% Report cleanly to WhatsApp
  const handleShareWhatsApp = async () => {
    if (!isAdminUser) {
      Alert.alert(
        'Admin Access Restricted 🔒',
        'Sharing attendance and absentee reports is enabled exclusively for the Administrator account (admin@skct.edu.in).'
      );
      return;
    }

    const sectionLabel = selectedSection === 'Both' ? 'III IT G + III IT E' : selectedSection;
    const dataset = getAdminExportDataset(adminExportFilter);

    let msg = '';

    if (adminExportFilter === 'absentees') {
      const absenteeList = dataset.list;
      if (absenteeList.length === 0) {
        Alert.alert('100% Attendance 🎉', `No absentees found for ${sectionLabel} in this date range!`);
        return;
      }

      msg = `🏛️ *SRI KRISHNA COLLEGE OF TECHNOLOGY*\n`;
      msg += `🎓 *DEPARTMENT OF INFORMATION TECHNOLOGY*\n`;
      msg += `🚨 *STUDENT ABSENTEE REPORT (ADMIN)*\n`;
      msg += `═══════════════════════════\n`;
      msg += `📅 *Date Range:* ${startDate} to ${endDate}\n`;
      msg += `🏫 *Class / Section:* ${sectionLabel}\n`;
      msg += `🔴 *Total Absent Records:* ${absenteeList.length} Record${absenteeList.length === 1 ? '' : 's'}\n`;
      msg += `═══════════════════════════\n`;
      msg += `📋 *ABSENTEE LIST:*\n\n`;

      absenteeList.forEach((a: any, idx: number) => {
        msg += `${idx + 1}️⃣ *${a.roll_no}* - ${a.name}\n`;
        msg += `   • Section: ${a.className} | ${a.period} (${a.time})\n`;
        msg += `   • Subject: ${a.subject}\n`;
        msg += `   • 📱 Parent Phone: +91 ${a.phone}\n\n`;
      });
    } else if (adminExportFilter === 'gte75') {
      const eligibleList = dataset.list;
      msg = `🏛️ *SRI KRISHNA COLLEGE OF TECHNOLOGY*\n`;
      msg += `🎓 *DEPARTMENT OF INFORMATION TECHNOLOGY*\n`;
      msg += `🌟 *ELIGIBLE STUDENTS REPORT (≥ 75%)*\n`;
      msg += `═══════════════════════════\n`;
      msg += `📅 *Date Range:* ${startDate} to ${endDate}\n`;
      msg += `🏫 *Class / Section:* ${sectionLabel}\n`;
      msg += `🌟 *Eligible Students Count:* ${eligibleList.length} Student${eligibleList.length === 1 ? '' : 's'}\n`;
      msg += `✅ *Eligibility Criteria:* Minimum 75% Attendance\n`;
      msg += `═══════════════════════════\n`;
      msg += `📋 *ELIGIBLE STUDENTS LIST:*\n\n`;

      eligibleList.slice(0, 20).forEach((s: any, idx: number) => {
        const roll = s.roll_no;
        const phone = studentPhoneMap.get(roll.toUpperCase()) || '9442211279';
        msg += `${idx + 1}️⃣ *${roll}* - ${s.name}\n`;
        msg += `   • Attendance: ${s.percentage}% (${s.attendedClasses || 0}/${s.totalClasses || 25} Classes)\n`;
        msg += `   • 📱 Parent Phone: +91 ${phone}\n\n`;
      });

      if (eligibleList.length > 20) {
        msg += `... and ${eligibleList.length - 20} more eligible students (see full Google Sheet below).\n\n`;
      }
    } else if (adminExportFilter === 'lt75') {
      const defaulterList = dataset.list;
      if (defaulterList.length === 0) {
        Alert.alert('Zero Defaulters 🎉', `No students have attendance below 75% for ${sectionLabel} in this date range!`);
        return;
      }

      msg = `🏛️ *SRI KRISHNA COLLEGE OF TECHNOLOGY*\n`;
      msg += `🎓 *DEPARTMENT OF INFORMATION TECHNOLOGY*\n`;
      msg += `🚨 *ATTENDANCE DEFAULTERS REPORT (< 75%)*\n`;
      msg += `═══════════════════════════\n`;
      msg += `📅 *Date Range:* ${startDate} to ${endDate}\n`;
      msg += `🏫 *Class / Section:* ${sectionLabel}\n`;
      msg += `🚨 *Total Defaulters:* ${defaulterList.length} Student${defaulterList.length === 1 ? '' : 's'}\n`;
      msg += `⚠️ *Action:* Parents must be intimated regarding shortfall.\n`;
      msg += `═══════════════════════════\n`;
      msg += `📋 *DEFAULTER STUDENTS LIST:*\n\n`;

      defaulterList.forEach((s: any, idx: number) => {
        const roll = s.roll_no;
        const phone = studentPhoneMap.get(roll.toUpperCase()) || '9442211279';
        const total = s.totalClasses || 25;
        const attended = s.attendedClasses || 0;
        const shortfall = Math.max(1, Math.ceil((0.75 * total - attended) / 0.25));
        msg += `${idx + 1}️⃣ *${roll}* - ${s.name}\n`;
        msg += `   • Attendance: ${s.percentage}% (${attended}/${total} Classes)\n`;
        msg += `   • ⚠️ Shortfall: ${shortfall} more class${shortfall > 1 ? 'es' : ''} needed for 75%\n`;
        msg += `   • 📱 Parent Phone: +91 ${phone}\n\n`;
      });
    } else {
      // 'all': Full Class Report
      msg = `🏛️ *SRI KRISHNA COLLEGE OF TECHNOLOGY*\n`;
      msg += `🎓 *DEPARTMENT OF INFORMATION TECHNOLOGY*\n`;
      msg += `📊 *ALL STUDENTS ATTENDANCE REPORT*\n`;
      msg += `═══════════════════════════\n`;
      msg += `🏫 *Class / Section:* ${sectionLabel}\n`;
      msg += `📅 *Date Range:* ${startDate} to ${endDate}\n`;
      msg += `👥 *Total Enrolled Students:* ${reportData.length}\n`;
      msg += `✅ *Class Average Attendance:* ${metrics.avg}%\n`;
      msg += `🌟 *Eligible Students (≥75%):* ${metrics.good}\n`;
      msg += `🚨 *Attendance Defaulters (<75%):* ${metrics.risk}\n`;
      msg += `═══════════════════════════\n`;
      msg += `📋 *STUDENT ATTENDANCE OVERVIEW (Sample):*\n\n`;

      reportData.slice(0, 15).forEach((s: any, idx: number) => {
        const status = s.percentage >= 75 ? '✅ Eligible' : '🚨 Defaulter';
        msg += `${idx + 1}️⃣ *${s.roll_no}* - ${s.name}: ${s.percentage}% (${s.attendedClasses || 0}/${s.totalClasses || 25}) [${status}]\n`;
      });

      if (reportData.length > 15) {
        msg += `\n... and ${reportData.length - 15} more records (see full Google Sheet below).\n`;
      }
    }

    if (generatedGoogleSheetUrl) {
      msg += `═══════════════════════════\n`;
      msg += `🌐 *Live Google Sheet:* ${generatedGoogleSheetUrl}\n`;
    }
    msg += `═══════════════════════════\n`;
    msg += `📊 *Report Generated via ClassTrack Admin Portal*\n`;
    msg += `⏰ ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    const waUrl = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    try {
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        await Linking.openURL(waUrl);
      } else {
        await Share.share({ message: msg, title: `SKCT ${dataset.shortLabel} Report` });
      }
    } catch (e) {
      await Share.share({ message: msg, title: `SKCT ${dataset.shortLabel} Report` });
    }
  };

  // Open Absentee Intimation Letter Modal for a defaulter student
  const handleOpenAbsenteeLetterModal = (student: any) => {
    setSelectedStudentForEmail(student);
    const defaultParentEmail = student.parent_email || student.email || (student.roll_no ? `${student.roll_no.toLowerCase().replace(/\s+/g, '')}@skct.edu.in` : '');
    setRecipientEmailInput(defaultParentEmail);
    setAbsenteeModalVisible(true);
  };

  // Send Single Absentee Intimation Email
  const handleSendAbsenteeEmail = async () => {
    if (!selectedStudentForEmail) return;
    setSendingEmail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/send-intimation-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudentForEmail.name,
          rollNo: selectedStudentForEmail.roll_no,
          section: selectedStudentForEmail.className || selectedSection,
          percentage: selectedStudentForEmail.percentage,
          startDate,
          endDate,
          parentEmail: recipientEmailInput,
          recipientEmail: recipientEmailInput,
          year: 'III Year',
          requiredPercentage: 75
        })
      });
      const data = await response.json();
      setSendingEmail(false);
      setAbsenteeModalVisible(false);
      const fromAddr = data?.senderEmail || 'itdept.classtrack@skct.edu.in';
      const toAddr = data?.targetEmail || recipientEmailInput;

      if (data && data.success) {
        Alert.alert(
          'Absentee Email Dispatched ✉️',
          `Official SKCT Absentee Intimation Letter for ${selectedStudentForEmail.name} (${selectedStudentForEmail.percentage}%)\n\n• From: ${fromAddr}\n• Delivered to: ${toAddr}\n• Date: ${new Date().toLocaleDateString('en-IN')}`
        );
      } else {
        Alert.alert('Email Delivery Notice ⚠️', data?.error || `Could not deliver email to ${toAddr}. Check backend/.env credentials.`);
      }
    } catch (e: any) {
      setSendingEmail(false);
      setAbsenteeModalVisible(false);
      Alert.alert('Email Notice', `Request error: ${e?.message || 'Could not connect to backend server'}`);
    }
  };

  // Bulk Send Absentee Intimation Emails to all defaulters (<75%)
  const handleBulkSendAbsenteeEmails = async () => {
    const defaulters = reportData.filter(s => s.percentage < 75);
    if (defaulters.length === 0) {
      Alert.alert('No Defaulters Found', 'There are no students with attendance less than 75%.');
      return;
    }

    Alert.alert(
      'Bulk Dispatch Intimation Emails 📨',
      `Are you sure you want to send official bilingual SKCT Absentee Intimation Letter emails to parents of all ${defaulters.length} defaulter students (<75%)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Send ${defaulters.length} Emails`,
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/reports/send-all-intimation-emails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  students: defaulters,
                  startDate,
                  endDate,
                  section: selectedSection
                })
              });
              const resData = await res.json().catch(() => null);
              const fromAddr = resData?.senderEmail || 'itdept.classtrack@skct.edu.in';
              if (resData && resData.success) {
                Alert.alert(
                  'Bulk Dispatched Successfully 📬',
                  `Dispatched ${resData.count || defaulters.length} Absentee Intimation Letter emails directly to recipient inboxes!\n\n• From: ${fromAddr}${resData.failedCount ? `\n• Failed: ${resData.failedCount}` : ''}`
                );
              } else {
                Alert.alert('Bulk Dispatch Notice ⚠️', resData?.error || 'Unable to dispatch bulk emails. Check backend/.env credentials.');
              }
            } catch (e: any) {
              Alert.alert('Bulk Dispatch Error', `Request error: ${e?.message || 'Could not reach server'}`);
            }
          }
        }
      ]
    );
  };

  const renderStudentItem = ({ item, index }: { item: any; index: number }) => {
    const isCritical = item.percentage < 75;
    const isGreat = item.percentage >= 85;

    // Only the percentage text highlights in red for defaulters (<75%)
    const pctTextColor = isCritical ? Colors.error : isGreat ? Colors.success : Colors.warning;
    const pctBadgeBg = isCritical ? Colors.errorSoft : isGreat ? Colors.successSoft : Colors.warningSoft;

    const presentCount = item.attendedClasses || 0;
    const totalCount = item.totalClasses || 20;
    const absentCount = Math.max(0, totalCount - presentCount);
    const lateCount = item.odClasses || 0;

    return (
      <View style={[styles.studentCardRow, index % 2 === 1 && { backgroundColor: '#F8FAFC' }]}>
        {/* Student Column */}
        <View style={styles.studentCol}>
          <TouchableOpacity
            style={styles.nameBlock}
            onPress={() => {
              if (isCritical) {
                handleOpenAbsenteeLetterModal(item);
              }
            }}
            activeOpacity={isCritical ? 0.7 : 1}
          >
            <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.rollNo}>{item.roll_no}</Text>
          </TouchableOpacity>
        </View>

        {/* Present Count */}
        <View style={styles.statCol}>
          <Text style={styles.statNumPresent}>{presentCount}</Text>
        </View>

        {/* Late / OD Count */}
        <View style={styles.statCol}>
          <Text style={styles.statNumMuted}>{lateCount}</Text>
        </View>

        {/* Absent Count */}
        <View style={styles.statCol}>
          <Text style={styles.statNumAbsent}>{absentCount}</Text>
        </View>

        {/* Att. % Badge + Intimation Email Button for Defaulters */}
        <View style={styles.pctCol}>
          <TouchableOpacity
            style={[styles.percentageBadge, { backgroundColor: pctBadgeBg }, isCritical && { flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => {
              if (isCritical) {
                handleOpenAbsenteeLetterModal(item);
              }
            }}
            activeOpacity={isCritical ? 0.7 : 1}
          >
            <Text style={[styles.percentageText, { color: pctTextColor }]}>{item.percentage}%</Text>
            {isCritical && (
              <Icon name="mark-email-unread" size={14} color={Colors.error} style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getSectionDropdownLabel = (key: string) => {
    if (key === 'Both') return 'Both Classes Together (G + E)';
    return key;
  };

  const getPctDropdownLabel = (key: PctFilter) => {
    if (key === 'all') return `All Students (${reportData.length})`;
    if (key === 'gt75') return `Eligible \u226575% (${metrics.good})`;
    return `Defaulters <75% (${metrics.risk})`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-back" size={26} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Attendance Reports</Text>
          <Text style={styles.headerSubtitle}>From / To Date Analytics & Export</Text>
        </View>

        {isAdminUser ? (
          <TouchableOpacity onPress={handleDownloadExcelReport} style={[styles.iconBtn, styles.shareIconBtn]}>
            <Icon name="file-download" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Date Filter Inputs & Dropdown Section Card */}
        <View style={styles.controlCard}>
          <Text style={styles.sectionHeading}>Date Range Selection</Text>

          {/* Side-by-side From Date & To Date Input Fields with Calendar Buttons */}
          <View style={styles.dateInputsRow}>
            {/* From Date Box */}
            <View style={styles.dateInputWrapper}>
              <Text style={styles.fieldLabel}>From Date</Text>
              <View style={styles.dateInputWithIcon}>
                <TextInput
                  style={styles.dateTextInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity
                  style={styles.calendarIconButton}
                  onPress={() => openCalendarPicker('start')}
                  activeOpacity={0.8}
                >
                  <Icon name="calendar-today" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* To Date Box */}
            <View style={styles.dateInputWrapper}>
              <Text style={styles.fieldLabel}>To Date</Text>
              <View style={styles.dateInputWithIcon}>
                <TextInput
                  style={styles.dateTextInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity
                  style={styles.calendarIconButton}
                  onPress={() => openCalendarPicker('end')}
                  activeOpacity={0.8}
                >
                  <Icon name="event" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Section Filter Dropdown Menu */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.fieldLabel}>Filter Class / Section</Text>
            <TouchableOpacity
              style={styles.dropdownSelectorBox}
              onPress={() => setSectionDropdownVisible(true)}
              activeOpacity={0.8}
            >
              <Icon name="class" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.dropdownSelectorText}>
                {getSectionDropdownLabel(selectedSection)}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ADMIN EXCEL & GOOGLE SHEET DOWNLOAD CONTROLS */}
        {isAdminUser && (
          <View style={styles.adminBanner}>
            <View style={styles.adminBannerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="verified-user" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.adminBannerTitle}>
                  Admin Export Portal ({selectedSection === 'Both' ? 'Both Classes G + E' : selectedSection})
                </Text>
              </View>
              <View style={styles.adminTagBadge}>
                <Text style={styles.adminTagText}>ADMIN ONLY</Text>
              </View>
            </View>

            {/* Filter Dropdown Selector */}
            <View style={styles.adminDropdownWrapper}>
              <Text style={styles.adminDropdownFieldLabel}>Report Filter Category</Text>
              <TouchableOpacity
                style={[
                  styles.adminDropdownSelectorBox,
                  { borderColor: currentDataset.color, backgroundColor: currentDataset.badgeBg }
                ]}
                onPress={() => setAdminFilterDropdownVisible(true)}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon
                    name={
                      adminExportFilter === 'absentees' ? 'person-off'
                      : adminExportFilter === 'gte75' ? 'verified'
                      : adminExportFilter === 'lt75' ? 'warning'
                      : 'groups'
                    }
                    size={18}
                    color={currentDataset.color}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.adminDropdownSelectorText, { color: currentDataset.color }]} numberOfLines={1}>
                    {currentDataset.label}
                  </Text>
                  <View style={[styles.adminFilterInlineBadge, { backgroundColor: currentDataset.color }]}>
                    <Text style={styles.adminFilterInlineBadgeText}>
                      {currentDataset.count}
                    </Text>
                  </View>
                </View>
                <Icon name="arrow-drop-down" size={24} color={currentDataset.color} />
              </TouchableOpacity>
            </View>

            {/* Active Filter Info Strip */}
            <View style={[styles.activeFilterSummaryBar, { borderColor: currentDataset.color }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.activeFilterDot, { backgroundColor: currentDataset.color }]} />
                <Text style={styles.activeFilterSummaryText} numberOfLines={1}>
                  Target: <Text style={{ fontWeight: '800', color: currentDataset.color }}>{currentDataset.label}</Text> ({currentDataset.count} records)
                </Text>
              </View>
              <Text style={styles.activeFilterDateText}>
                {startDate} to {endDate}
              </Text>
            </View>

            {/* Export Actions: CSV, Excel, Google Sheets */}
            <View style={styles.csvActionRow}>
              <TouchableOpacity
                style={[
                  styles.csvBtn,
                  { backgroundColor: currentDataset.color },
                ]}
                onPress={handleDownloadCSVReport}
                activeOpacity={0.8}
              >
                <Icon name="table-view" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.csvBtnText}>Download CSV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.csvBtn, { backgroundColor: '#1E3A8A' }]}
                onPress={handleDownloadExcelReport}
                activeOpacity={0.8}
              >
                <Icon name="description" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.csvBtnText}>Excel (.xls)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.csvBtn, { backgroundColor: Colors.success }]}
                onPress={() => handleExportGoogleSheet()}
                activeOpacity={0.8}
              >
                <Icon name="grid-on" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.csvBtnText}>Google Sheet</Text>
              </TouchableOpacity>
            </View>

            {/* Dedicated WhatsApp Share Button */}
            <TouchableOpacity
              style={styles.waShareBtn}
              onPress={handleShareWhatsApp}
              activeOpacity={0.85}
            >
              <Icon name="send" size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.waShareBtnText}>
                Share {currentDataset.shortLabel} in WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View Mode Switcher */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'summary' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('summary')}
          >
            <Icon name="bar-chart" size={18} color={viewMode === 'summary' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.viewToggleText, viewMode === 'summary' && styles.viewToggleTextActive]}>Summary Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'table' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('table')}
          >
            <Icon name="table-chart" size={18} color={viewMode === 'table' ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
            <Text style={[styles.viewToggleText, viewMode === 'table' && styles.viewToggleTextActive]}>Database Table Log</Text>
          </TouchableOpacity>
        </View>

        {/* CLASS ATTENDANCE PIE CHART CARD */}
        <View style={styles.pieCard}>
          <View style={styles.pieCardHeader}>
            <Icon name="pie-chart" size={24} color={Colors.primary} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pieCardTitle}>
                {isAdminUser ? 'Overall Class Attendance Pie Chart' : `${facultyScope.assignedSubject} Attendance Chart`}
              </Text>
              <Text style={styles.pieCardSub}>
                Subject: {facultyScope.assignedSubject} | Section: {selectedSection === 'Both' ? 'Both Classes (G + E)' : selectedSection} | {startDate} to {endDate}
              </Text>
            </View>
          </View>

          <View style={styles.pieContentRow}>
            {/* Donut / Pie Chart Ring */}
            <View style={styles.pieRingOuter}>
              <View
                style={[
                  styles.pieRingArc,
                  {
                    borderColor: metrics.avg >= 75 ? Colors.success : Colors.error,
                    borderRightColor: (metrics.good / (metrics.total || 1)) >= 0.5 ? Colors.success : '#E2E8F0',
                    borderBottomColor: (metrics.good / (metrics.total || 1)) >= 0.75 ? Colors.success : '#E2E8F0',
                    borderLeftColor: (metrics.good / (metrics.total || 1)) >= 0.25 ? Colors.success : '#E2E8F0',
                  },
                ]}
              />
              <View style={styles.pieRingInner}>
                <Text style={styles.pieCenterValue}>{metrics.avg}%</Text>
                <Text style={styles.pieCenterLabel}>Class Avg</Text>
              </View>
            </View>

            {/* Pie Chart Legend & Counts */}
            <View style={styles.pieLegendBlock}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.legendLabel}>Total Class Count:</Text>
                <Text style={styles.legendValue}>{metrics.total}</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.legendLabel}>Eligible (&ge;75%):</Text>
                <Text style={styles.legendValue}>{metrics.good}</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                <Text style={styles.legendLabel}>Defaulters (&lt;75%):</Text>
                <Text style={styles.legendValue}>{metrics.risk}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* STUDENT ATTENDANCE LIST CARD (Matching Mockup Design) */}
        {viewMode === 'summary' ? (
          <View style={styles.listSectionCard}>
            {/* Header Row: Title + Search Box + Sort Dropdown Button */}
            <View style={styles.listCardHeaderBlock}>
              <Text style={styles.listCardTitle}>
                {pctFilter === 'lt75' ? 'Low Attendance List' : pctFilter === 'gt75' ? 'Eligible Attendance List' : 'Student Attendance List'}
              </Text>

              <View style={styles.searchSortRow}>
                {/* Search Box */}
                <View style={styles.headerSearchBox}>
                  <Icon name="search" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
                  <TextInput
                    style={styles.headerSearchInput}
                    placeholder="Search student..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Icon name="close" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Sort Dropdown Button */}
                <TouchableOpacity
                  style={styles.sortDropdownBtn}
                  onPress={() => setPctDropdownVisible(true)}
                  activeOpacity={0.8}
                >
                  <Icon name="sort" size={18} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.sortDropdownText}>
                    {pctFilter === 'all' ? 'Sort' : pctFilter === 'gt75' ? '\u226575%' : '<75%'}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={18} color="#64748B" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Table Header Subbar: Student | Present | Late | Absent | Att. % */}
            <View style={styles.columnHeaderRow}>
              <Text style={[styles.colHeaderText, { flex: 2.2 }]}>Student</Text>
              <Text style={[styles.colHeaderText, { flex: 1, textAlign: 'center' }]}>Present</Text>
              <Text style={[styles.colHeaderText, { flex: 1, textAlign: 'center' }]}>Late</Text>
              <Text style={[styles.colHeaderText, { flex: 1, textAlign: 'center' }]}>Absent</Text>
              <Text style={[styles.colHeaderText, { flex: 1.2, textAlign: 'right' }]}>Att. %</Text>
            </View>

            {/* Student List Items */}
            {loading ? (
              <View style={{ paddingVertical: 30 }}>
                <BreatheLoader message="Loading student list..." />
              </View>
            ) : filteredStudents.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon name="sentiment-dissatisfied" size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Student Records Found</Text>
                <Text style={styles.emptySub}>Try adjusting search query or filter options.</Text>
              </View>
            ) : (
              filteredStudents.map((item, index) => (
                <View key={item.roll_no + index}>{renderStudentItem({ item, index })}</View>
              ))
            )}
          </View>
        ) : (
          /* DATABASE TABLE LOG VIEW */
          <View style={styles.tableCard}>
            <View style={styles.tableCardHeader}>
              <Icon name="table-chart" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.tableCardTitle}>
                Database Attendance Log ({filteredLogs.length} Records)
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { width: 50 }]}>S.No</Text>
                  <Text style={[styles.thCell, { width: 95 }]}>Date</Text>
                  <Text style={[styles.thCell, { width: 85 }]}>Day Order</Text>
                  <Text style={[styles.thCell, { width: 80 }]}>Period</Text>
                  <Text style={[styles.thCell, { width: 140 }]}>Time</Text>
                  <Text style={[styles.thCell, { width: 120 }]}>Roll No</Text>
                  <Text style={[styles.thCell, { width: 140 }]}>Student Name</Text>
                  <Text style={[styles.thCell, { width: 70 }]}>Class</Text>
                  <Text style={[styles.thCell, { width: 160 }]}>Subject Name</Text>
                  <Text style={[styles.thCell, { width: 85 }]}>Status</Text>
                </View>

                {/* Table Rows */}
                {filteredLogs.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: '#94A3B8' }}>No attendance log records in this date range.</Text>
                  </View>
                ) : (
                  filteredLogs.map((row, idx) => (
                    <View
                      key={row.id || idx}
                      style={[styles.tableDataRow, idx % 2 === 1 && { backgroundColor: '#F8FAFC' }]}
                    >
                      <Text style={[styles.tdCell, { width: 50, fontWeight: '700' }]}>{row.sno || idx + 1}</Text>
                      <Text style={[styles.tdCell, { width: 95 }]}>{row.date}</Text>
                      <Text style={[styles.tdCell, { width: 85 }]}>Day {row.day_order || 4}</Text>
                      <Text style={[styles.tdCell, { width: 80 }]}>{row.period}</Text>
                      <Text style={[styles.tdCell, { width: 140 }]}>{row.time}</Text>
                      <Text style={[styles.tdCell, { width: 120, fontWeight: '700', color: Colors.primary }]}>
                        {row.roll_no}
                      </Text>
                      <Text style={[styles.tdCell, { width: 140, fontWeight: '600' }]}>{row.student_name || 'N/A'}</Text>
                      <Text style={[styles.tdCell, { width: 70 }]}>{row.section || selectedSection}</Text>
                      <Text style={[styles.tdCell, { width: 160 }]}>{row.subject_name}</Text>
                      <View style={{ width: 85, justifyContent: 'center' }}>
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor:
                                row.status === 'Present'
                                  ? Colors.successSoft
                                  : row.status === 'Absent'
                                  ? Colors.errorSoft
                                  : Colors.warningSoft,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              {
                                color:
                                  row.status === 'Present'
                                    ? Colors.success
                                    : row.status === 'Absent'
                                    ? Colors.error
                                    : Colors.warning,
                              },
                            ]}
                          >
                            {row.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* DROPDOWN MODAL 1: Section / Class Filter */}
      <Modal visible={sectionDropdownVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSectionDropdownVisible(false)}
        >
          <View style={styles.dropdownModalCard}>
            <Text style={styles.dropdownModalTitle}>Select Class / Section</Text>
            {[
              { key: 'Both', label: 'Both Classes Together (G + E)' },
              { key: 'III IT G', label: 'III IT G' },
              { key: 'III IT E', label: 'III IT E' },
            ].map(item => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.dropdownOptionItem,
                  selectedSection === item.key && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  if (!isAdminUser && facultyScope.assignedSection !== 'Both' && item.key !== facultyScope.assignedSection) {
                    Alert.alert(
                      'Access Restricted 🔒',
                      `According to your timetable, you are assigned to ${facultyScope.assignedSection} (${facultyScope.assignedSubject}). You cannot view attendance reports for other sections.`
                    );
                    setSectionDropdownVisible(false);
                    return;
                  }
                  setSelectedSection(item.key);
                  setSectionDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedSection === item.key && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedSection === item.key && (
                  <Icon name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* DROPDOWN MODAL 2: Student Percentage / Status Filter */}
      <Modal visible={pctDropdownVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPctDropdownVisible(false)}
        >
          <View style={styles.dropdownModalCard}>
            <Text style={styles.dropdownModalTitle}>Select Attendance Filter</Text>
            {[
              { key: 'all', label: `All Students (${reportData.length})` },
              { key: 'gt75', label: `Eligible \u226575% (${metrics.good})` },
              { key: 'lt75', label: `Defaulters <75% (${metrics.risk})` },
            ].map(item => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.dropdownOptionItem,
                  pctFilter === item.key && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  setPctFilter(item.key as PctFilter);
                  setPctDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    pctFilter === item.key && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {pctFilter === item.key && (
                  <Icon name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* DROPDOWN MODAL: Admin Export Report Filter */}
      <Modal visible={adminFilterDropdownVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAdminFilterDropdownVisible(false)}
        >
          <View style={styles.dropdownModalCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Icon name="filter-list" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.dropdownModalTitle}>Select Report Filter</Text>
            </View>
            {[
              {
                key: 'absentees' as AdminExportFilter,
                label: 'Absentees Alone',
                sub: 'Only students marked absent in selected date range',
                icon: 'person-off',
                color: '#DC2626',
                count: getAbsenteeRecords().length,
              },
              {
                key: 'all' as AdminExportFilter,
                label: 'All Students',
                sub: 'Full attendance records for all enrolled students',
                icon: 'groups',
                color: '#2563EB',
                count: reportData.length,
              },
              {
                key: 'gte75' as AdminExportFilter,
                label: 'Eligible (≥ 75%)',
                sub: 'Students meeting minimum 75% threshold',
                icon: 'verified',
                color: '#16A34A',
                count: metrics.good,
              },
              {
                key: 'lt75' as AdminExportFilter,
                label: 'Defaulters (< 75%)',
                sub: 'Students below 75% attendance needing intimation',
                icon: 'warning',
                color: '#D97706',
                count: metrics.risk,
              },
            ].map(opt => {
              const isSelected = adminExportFilter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.adminFilterOptionItem,
                    isSelected && { backgroundColor: `${opt.color}15`, borderColor: opt.color },
                  ]}
                  onPress={() => {
                    setAdminExportFilter(opt.key);
                    setAdminFilterDropdownVisible(false);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.adminFilterOptionIconBox, { backgroundColor: `${opt.color}20` }]}>
                    <Icon name={opt.icon} size={20} color={opt.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.adminFilterOptionTitle, isSelected && { color: opt.color, fontWeight: '800' }]}>
                        {opt.label}
                      </Text>
                      <View style={[styles.adminFilterCountPill, { backgroundColor: opt.color }]}>
                        <Text style={styles.adminFilterCountPillText}>{opt.count}</Text>
                      </View>
                    </View>
                    <Text style={styles.adminFilterOptionSub}>{opt.sub}</Text>
                  </View>
                  {isSelected && (
                    <Icon name="check-circle" size={20} color={opt.color} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CALENDAR PICKER MODAL (For From Date & To Date) */}
      <Modal visible={calendarModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="calendar-month" size={24} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>
                  Select {dateTarget === 'start' ? 'From Date' : 'To Date'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCalendarModalVisible(false)} style={styles.modalCloseCircle}>
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Month & Year Navigation */}
            <View style={styles.calMonthNavRow}>
              <TouchableOpacity
                style={styles.calNavIconBtn}
                onPress={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear(prev => prev - 1);
                  } else {
                    setCalMonth(prev => prev - 1);
                  }
                }}
              >
                <Icon name="chevron-left" size={26} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.calMonthText}>
                {MONTH_NAMES[calMonth]} {calYear}
              </Text>
              <TouchableOpacity
                style={styles.calNavIconBtn}
                onPress={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear(prev => prev + 1);
                  } else {
                    setCalMonth(prev => prev + 1);
                  }
                }}
              >
                <Icon name="chevron-right" size={26} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Day of Week Headers */}
            <View style={styles.calWeekRow}>
              {WEEK_DAYS.map((wd, i) => (
                <Text
                  key={i}
                  style={[
                    styles.calWeekText,
                    (i === 0 || i === 6) && { color: '#EF4444' },
                  ]}
                >
                  {wd}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.calDaysGrid}>
              {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calDayBox} />
              ))}
              {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, i) => {
                const dayNum = i + 1;
                const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = (dateTarget === 'start' ? startDate : endDate) === iso;
                const todayIso = new Date().toISOString().split('T')[0];
                const isToday = iso === todayIso;

                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    style={[
                      styles.calDayBox,
                      isSelected && styles.calDayBoxSelected,
                      !isSelected && isToday && styles.calDayBoxToday,
                    ]}
                    onPress={() => {
                      if (dateTarget === 'start') {
                        setStartDate(iso);
                      } else {
                        setEndDate(iso);
                      }
                      setCalendarModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.calDayNumText,
                        isSelected && styles.calDayNumTextSelected,
                        !isSelected && isToday && styles.calDayNumTextToday,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* GOOGLE SHEETS EXPORT MODAL */}
      <Modal visible={googleSheetsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.googleModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="grid-on" size={24} color={Colors.success} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>
                  {currentDataset.shortLabel} • Google Sheets
                </Text>
              </View>
              <TouchableOpacity onPress={() => setGoogleSheetsModalVisible(false)} style={styles.modalCloseCircle}>
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.googleModalBody}>
              {/* Status Banner */}
              {generatedGoogleSheetUrl ? (
                <View style={{ backgroundColor: '#DCFCE7', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#86EFAC' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="check-circle" size={18} color="#16A34A" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#166534' }}>Google Sheet Created & Active!</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#15803D' }} numberOfLines={2}>
                    {generatedGoogleSheetUrl}
                  </Text>
                </View>
              ) : null}

              {/* Permanent Cloud Backend Status */}
              <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#BBF7D0' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon name="verified" size={18} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#166534' }}>Permanent Backend Cloud Sync ⚡</Text>
                </View>
                <Text style={{ fontSize: 11.5, color: '#14532D', lineHeight: 16 }}>
                  Google Sheets integration is permanently managed via the backend server. All reports are automatically created in your Google account with official SKCT headers and formatting.
                </Text>
              </View>

              {/* Action: Generate Live Google Sheet */}
              <TouchableOpacity
                style={{
                  backgroundColor: currentDataset.color,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleExportGoogleSheet()}
                disabled={isGeneratingSheet}
                activeOpacity={0.8}
              >
                {isGeneratingSheet ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="cloud-upload" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                  {isGeneratingSheet ? 'Generating Sheet in Drive...' : `Generate Live ${currentDataset.shortLabel} Sheet`}
                </Text>
              </TouchableOpacity>

              {/* Action 1: Open Google Sheets Web / App */}
              <TouchableOpacity
                style={styles.openGoogleSheetsBtn}
                onPress={() => {
                  setGoogleSheetsModalVisible(false);
                  Linking.openURL(generatedGoogleSheetUrl || 'https://sheets.new').catch(() => {});
                }}
                activeOpacity={0.8}
              >
                <Icon name="launch" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.openGoogleSheetsBtnText}>
                  {generatedGoogleSheetUrl ? 'Open Google Sheet in App' : 'Open Google Sheets (sheets.new)'}
                </Text>
              </TouchableOpacity>

              {/* Action 2: Share in WhatsApp */}
              <TouchableOpacity
                style={[styles.openGoogleSheetsBtn, { backgroundColor: '#25D366', marginTop: 8 }]}
                onPress={() => {
                  setGoogleSheetsModalVisible(false);
                  handleShareWhatsApp();
                }}
                activeOpacity={0.8}
              >
                <Icon name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.openGoogleSheetsBtnText}>
                  Share {currentDataset.shortLabel} in WhatsApp
                </Text>
              </TouchableOpacity>

              {/* Action 3: Download Real Excel (.xlsx) or CSV for Google Sheets */}
              <TouchableOpacity
                style={styles.downloadBackupExcelBtn}
                onPress={() => {
                  setGoogleSheetsModalVisible(false);
                  if (generatedSpreadsheetId) {
                    Linking.openURL(`https://docs.google.com/spreadsheets/d/${generatedSpreadsheetId}/export?format=xlsx`).catch(() => {});
                  } else {
                    handleDownloadCSVReport();
                  }
                }}
                activeOpacity={0.8}
              >
                <Icon name="file-download" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.downloadBackupExcelText}>
                  {generatedSpreadsheetId ? 'Download Real Excel (.xlsx) from Google' : 'Download CSV (Opens in Google Sheets App)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OFFICIAL BILINGUAL SKCT ABSENTEE INTIMATION LETTER MODAL */}
      <Modal visible={absenteeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.absenteeLetterModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="mark-email-unread" size={24} color={Colors.error} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Absentee Intimation Letter</Text>
              </View>
              <TouchableOpacity onPress={() => setAbsenteeModalVisible(false)} style={styles.modalCloseCircle}>
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={true}>
              {selectedStudentForEmail && (
                <View style={styles.letterPaperContainer}>
                  {/* College Official Letterhead Header */}
                  <View style={styles.letterheadHeader}>
                    <Text style={styles.letterCollegeTitle}>SRI KRISHNA COLLEGE OF TECHNOLOGY</Text>
                    <Text style={styles.letterCollegeSub}>(An Autonomous Institution, Affiliated to Anna University & Approved by AICTE)</Text>
                    <Text style={styles.letterCollegeSub}>KOVAIPUDUR, COIMBATORE – 641 042.</Text>
                    <View style={styles.letterDivider} />
                    <Text style={styles.letterDeptTitle}>DEPARTMENT OF INFORMATION TECHNOLOGY</Text>
                  </View>

                  <View style={styles.letterDateRow}>
                    <Text style={styles.letterDateText}>Date: {new Date().toLocaleDateString('en-IN')}</Text>
                  </View>

                  {/* To Address Section */}
                  <View style={styles.letterToBlock}>
                    <Text style={styles.letterToLabel}>To</Text>
                    <Text style={styles.letterToDetail}>Parent of <Text style={styles.letterHighlightRed}>{selectedStudentForEmail.name}</Text>,</Text>
                    <Text style={styles.letterToDetail}>Reg. No: <Text style={styles.letterHighlightRed}>{selectedStudentForEmail.roll_no}</Text>,</Text>
                    <Text style={styles.letterToDetail}>Class: III Year B.E. IT ({selectedStudentForEmail.className || selectedSection}),</Text>
                    <Text style={styles.letterToDetail}>Kovaipudur, Coimbatore.</Text>
                  </View>

                  <Text style={styles.letterSalutation}>Dear Parent,</Text>

                  {/* English Intimation Paragraph */}
                  <Text style={styles.letterParagraph}>
                    This is to inform you that your Son / Daughter, <Text style={styles.letterHighlightBold}>Mr/Ms. {selectedStudentForEmail.name}</Text> (Reg.No: <Text style={styles.letterHighlightBold}>{selectedStudentForEmail.roll_no}</Text>), III Year B.E. IT ({selectedStudentForEmail.className || selectedSection}), has secured only <Text style={styles.letterHighlightRed}>{selectedStudentForEmail.percentage}%</Text> attendance for the period <Text style={styles.letterHighlightBold}>{startDate} to {endDate}</Text>. As per academic regulations, your ward should secure a minimum attendance percentage of <Text style={styles.letterHighlightRed}>75%</Text> to appear for the End Semester Examinations.
                  </Text>

                  <Text style={styles.letterParagraph}>
                    Your ward is directed to attend classes regularly and maintain the prescribed minimum attendance requirement of <Text style={styles.letterHighlightRed}>75%</Text> to remain eligible to appear for the End Semester Examinations.
                  </Text>

                  {/* Tamil Intimation Paragraph Box */}
                  <View style={styles.tamilBoxContainer}>
                    <Text style={styles.tamilSalutation}>அன்புள்ள பெற்றோரே,</Text>
                    <Text style={styles.tamilParagraph}>
                      தங்கள் மகன்/மகள் திரு/செல்வி <Text style={styles.tamilHighlightBold}>{selectedStudentForEmail.name}</Text> (பதிவு எண்: <Text style={styles.tamilHighlightBold}>{selectedStudentForEmail.roll_no}</Text>), மூன்றாம் ஆண்டு B.E. IT ({selectedStudentForEmail.className || selectedSection}) வகுப்பு மாணவர்/மாணவி, <Text style={styles.tamilHighlightBold}>{startDate} முதல் {endDate}</Text> வரையிலான காலகட்டத்தில் <Text style={styles.tamilHighlightRed}>{selectedStudentForEmail.percentage}%</Text> வருகையை மட்டுமே பதிவு செய்துள்ளார் என்பதைத் தெரிவித்துக்கொள்கிறோம். கல்விசார் விதிமுறைகளின்படி, பருவ இறுதித் தேர்வுகளில் (End Semester Examinations) கலந்துகொள்ள மாணவர்கள் குறைந்தபட்சம் <Text style={styles.tamilHighlightRed}>75%</Text> வருகையைப் பெற்றிருக்க வேண்டும்.
                    </Text>
                    <Text style={styles.tamilParagraph}>
                      எனவே, பருவ இறுதித் தேர்வுகளில் கலந்துகொள்வதற்கான தகுதியைத் தக்கவைத்துக்கொள்ள, தங்கள் மகன்/மகள் வகுப்புகளுக்குத் தவறாமல் வருகை தந்து, நிர்ணயிக்கப்பட்ட குறைந்தபட்ச வருகை அளவான <Text style={styles.tamilHighlightRed}>75%</Text>-ஐப் பூர்த்தி செய்யுமாறு கேட்டுக்கொள்கிறோம்.
                    </Text>
                  </View>

                  {/* Official Signature Footer Table */}
                  <View style={styles.signatureGridRow}>
                    <View style={styles.sigColCell}>
                      <Text style={styles.sigTitleText}>TUTOR</Text>
                      <Text style={styles.sigNameText}>Ms. S Saranya</Text>
                      <Text style={styles.sigPhoneText}>+91 9876543210</Text>
                    </View>
                    <View style={styles.sigColCell}>
                      <Text style={styles.sigTitleText}>HOD</Text>
                      <Text style={styles.sigNameText}>Dr. N. Susila</Text>
                      <Text style={styles.sigPhoneText}>+91 9443304580</Text>
                    </View>
                    <View style={styles.sigColCell}>
                      <Text style={styles.sigTitleText}>DEAN</Text>
                      <Text style={styles.sigNameText}>Dr. M. Jayakumar</Text>
                      <Text style={styles.sigPhoneText}>+91 9787190902</Text>
                    </View>
                    <View style={styles.sigColCell}>
                      <Text style={styles.sigTitleText}>PRINCIPAL</Text>
                      <Text style={styles.sigNameText}>SKCT Office</Text>
                      <Text style={styles.sigPhoneText}>Principal Desk</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Email Dispatch Action Bar */}
            <View style={styles.emailDispatchCard}>
              <Text style={styles.emailDispatchLabel}>Parent Email Address (Fetched from DB):</Text>
              <View style={styles.emailInputWrapper}>
                <Icon name="email" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.emailTextInput}
                  value={recipientEmailInput}
                  onChangeText={setRecipientEmailInput}
                  placeholder="parent@skct.edu.in"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.sendEmailSubmitBtn, sendingEmail && { opacity: 0.6 }]}
                onPress={handleSendAbsenteeEmail}
                disabled={sendingEmail}
                activeOpacity={0.8}
              >
                <Icon name="send" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.sendEmailSubmitBtnText}>
                  {sendingEmail ? 'Sending Email...' : 'Send Absentee Email Now ✉️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F8FAFC' },
  shareIconBtn: { backgroundColor: Colors.primarySoft },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  controlCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeading: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 12 },

  dateInputsRow: { flexDirection: 'row', gap: 10 },
  dateInputWrapper: { flex: 1 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  dateInputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
  },
  dateTextInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#0F172A', fontWeight: '600' },
  calendarIconButton: { padding: 6, borderRadius: 8, backgroundColor: Colors.primarySoft },

  dropdownSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownSelectorText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A' },

  adminBanner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  adminBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  adminBannerTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  adminTagBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  adminTagText: { fontSize: 10, fontWeight: '900', color: '#DC2626' },
  adminDropdownWrapper: { marginBottom: 12 },
  adminDropdownFieldLabel: { fontSize: 11.5, fontWeight: '700', color: '#475569', marginBottom: 6 },
  adminDropdownSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  adminDropdownSelectorText: { fontSize: 13, fontWeight: '800', marginRight: 8 },
  adminFilterInlineBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminFilterInlineBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  adminFilterOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  adminFilterOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminFilterOptionTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  adminFilterOptionSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  adminFilterCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  adminFilterCountPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  activeFilterSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  activeFilterDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  activeFilterSummaryText: { fontSize: 11, color: '#334155' },
  activeFilterDateText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  csvActionRow: { flexDirection: 'row', gap: 8 },
  csvBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  csvBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  waShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 8,
  },
  waShareBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  viewToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  viewToggleBtnActive: { backgroundColor: Colors.primary },
  viewToggleText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  viewToggleTextActive: { color: '#FFFFFF' },

  pieCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  pieCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  pieCardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  pieCardSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  pieContentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  pieRingOuter: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  pieRingArc: { width: 110, height: 110, borderRadius: 55, borderWidth: 10, position: 'absolute' },
  pieRingInner: { alignItems: 'center' },
  pieCenterValue: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  pieCenterLabel: { fontSize: 10, color: '#64748B', fontWeight: '700' },
  pieLegendBlock: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginRight: 6 },
  legendValue: { fontSize: 13, fontWeight: '800', color: '#0F172A' },

  listSectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  listCardHeaderBlock: {
    marginBottom: 14,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  searchSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  sortDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  sortDropdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  columnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  colHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  studentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentCol: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  nameBlock: {
    flex: 1,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  rollNo: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumPresent: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.success,
  },
  statNumMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  statNumAbsent: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.error,
  },
  pctCol: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '900',
  },

  scopeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scopeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  scopeSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#64748B', marginTop: 4 },

  tableCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  tableCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tableCardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  thCell: { fontSize: 12, fontWeight: '800', color: '#475569', paddingHorizontal: 6 },
  tableDataRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  tdCell: { fontSize: 12, color: '#1E293B', paddingHorizontal: 6 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignItems: 'center' },
  statusPillText: { fontSize: 10, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dropdownModalCard: { width: '90%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 8 },
  dropdownModalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  dropdownOptionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6, backgroundColor: '#F8FAFC' },
  dropdownOptionSelected: { backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)' },
  dropdownOptionText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  dropdownOptionTextSelected: { color: Colors.primary, fontWeight: '800' },

  calendarModalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, width: '92%', maxWidth: 380, elevation: 8 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  modalCloseCircle: { padding: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },
  calMonthNavRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 8 },
  calNavIconBtn: { padding: 6, borderRadius: 12, backgroundColor: '#F8FAFC' },
  calMonthText: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  calWeekRow: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  calWeekText: { width: 38, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#64748B' },
  calDaysGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10 },
  calDayBox: { width: '14.28%', height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginVertical: 2 },
  calDayBoxSelected: { backgroundColor: Colors.primary },
  calDayBoxToday: { borderWidth: 1.5, borderColor: Colors.primary },
  calDayNumText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  calDayNumTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  calDayNumTextToday: { color: Colors.primary, fontWeight: '800' },

  googleModalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, width: '92%', maxWidth: 400, elevation: 10 },
  googleModalBody: { marginTop: 12 },
  stepBadgeRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  stepBadgeCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.successSoft, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  stepBadgeNum: { fontSize: 14, fontWeight: '900', color: Colors.success },
  stepBadgeTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  stepBadgeSub: { fontSize: 12, color: '#64748B', marginTop: 3, lineHeight: 16 },
  openGoogleSheetsBtn: { backgroundColor: Colors.success, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  openGoogleSheetsBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  downloadBackupExcelBtn: { backgroundColor: Colors.primarySoft, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  downloadBackupExcelText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },

  absenteeLetterModalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, width: '95%', maxWidth: 500, elevation: 10 },
  letterPaperContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 14, marginTop: 4 },
  letterheadHeader: { alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: Colors.primary, paddingBottom: 8 },
  letterCollegeTitle: { fontSize: 13, fontWeight: '900', color: '#003366', textAlign: 'center' },
  letterCollegeSub: { fontSize: 9, color: '#64748B', textAlign: 'center', marginTop: 1 },
  letterDivider: { height: 1, backgroundColor: '#E2E8F0', width: '100%', marginVertical: 5 },
  letterDeptTitle: { fontSize: 12, fontWeight: '900', color: Colors.primary, textAlign: 'center', letterSpacing: 0.5 },
  letterDateRow: { alignItems: 'flex-end', marginTop: 8 },
  letterDateText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  letterToBlock: { marginVertical: 8 },
  letterToLabel: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  letterToDetail: { fontSize: 11, color: '#334155', lineHeight: 16 },
  letterHighlightRed: { color: Colors.error, fontWeight: '800' },
  letterHighlightBold: { color: '#0F172A', fontWeight: '800' },
  letterSalutation: { fontSize: 12, fontWeight: '800', color: '#0F172A', marginTop: 6, marginBottom: 4 },
  letterParagraph: { fontSize: 11, color: '#1E293B', lineHeight: 16, marginBottom: 8, textAlign: 'justify' },
  tamilBoxContainer: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginVertical: 8, borderWidth: 1, borderColor: '#FCA5A5' },
  tamilSalutation: { fontSize: 11, fontWeight: '800', color: '#991B1B', marginBottom: 4 },
  tamilParagraph: { fontSize: 10.5, color: '#7F1D1D', lineHeight: 15, marginBottom: 6 },
  tamilHighlightBold: { fontWeight: '800', color: '#7F1D1D' },
  tamilHighlightRed: { fontWeight: '900', color: Colors.error },
  signatureGridRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  sigColCell: { width: '24%', alignItems: 'center' },
  sigTitleText: { fontSize: 9, fontWeight: '900', color: '#0F172A', marginBottom: 2 },
  sigNameText: { fontSize: 8.5, fontWeight: '700', color: Colors.error, textAlign: 'center' },
  sigPhoneText: { fontSize: 7.5, color: '#64748B', textAlign: 'center' },
  emailDispatchCard: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  emailDispatchLabel: { fontSize: 11, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  emailInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 10, height: 40 },
  emailTextInput: { flex: 1, fontSize: 12, color: '#0F172A', fontWeight: '600' },
  sendEmailSubmitBtn: { backgroundColor: Colors.error, borderRadius: 12, height: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  sendEmailSubmitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
