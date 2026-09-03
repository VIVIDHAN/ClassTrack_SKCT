export const DUMMY_USER = {
  id: 'F1001',
  name: 'Ms. S Saranya',
  department: 'Information Technology',
  email: 'saranya@skct.edu.in',
  phone: '+91 9876543210'
};

export const TODAY_CLASSES = [
  { id: '1', time: 'Period 1 (08:45 - 09:35)', subject: 'Distributed Computing', className: 'III IT G', code: 'DC', timetable_id: 1 },
  { id: '2', time: 'Period 2 (09:35 - 10:25)', subject: 'Applied Cryptography', className: 'III IT G', code: 'AC', timetable_id: 2 },
  { id: '3', time: 'Period 3 (10:45 - 11:35)', subject: 'Cyber Incident & Sec Mgmt', className: 'III IT G', code: 'CISM', timetable_id: 3 },
  { id: '4', time: 'Period 4 (11:35 - 12:25)', subject: 'Full Stack App Development', className: 'III IT G', code: 'AD', timetable_id: 4 },
  { id: '5', time: 'Period 5 (01:25 - 02:15)', subject: 'Technical Writing & Method', className: 'III IT G', code: 'TWM', timetable_id: 5 },
];

export const DIRECTORY_CLASSES = [
  { id: '4', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 4 },
];

export const getTeacherDirectoryFallback = (teacherId: number, teacherName: string = '') => {
  const name = teacherName ? teacherName.toLowerCase() : '';
  if (teacherId === 3 || name.includes('narmatha')) {
    return [
      { id: '4', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 4 },
    ];
  } else if (teacherId === 4 || name.includes('saranya')) {
    return [
      { id: '3', className: 'III IT G', subject: 'Distributed Computing', timetable_id: 3 },
    ];
  } else if (teacherId === 2 || name.includes('guranna')) {
    return [
      { id: '1', className: 'III IT G', subject: 'Software Testing', timetable_id: 1 },
      { id: '11', className: 'III IT G', subject: 'Cloud Infrastructure and Services Management', timetable_id: 11 },
    ];
  } else if (teacherId === 5 || name.includes('edwin')) {
    return [
      { id: '26', className: 'III IT E', subject: 'Applied Cryptography', timetable_id: 26 },
    ];
  } else if (teacherId === 6 || name.includes('ratheesh')) {
    return [
      { id: '30', className: 'III IT E', subject: 'Distributed Computing', timetable_id: 30 },
    ];
  } else if (teacherId === 7 || name.includes('mouneesh')) {
    return [
      { id: '31', className: 'III IT E', subject: 'Software Testing', timetable_id: 31 },
    ];
  } else if (teacherId === 8 || name.includes('crown')) {
    return [
      { id: '33', className: 'III IT E', subject: 'Cloud Infrastructure and Services Management', timetable_id: 33 },
    ];
  } else if (teacherId === 9 || name.includes('gayathri')) {
    return [
      { id: '27', className: 'III IT E', subject: 'Application Development', timetable_id: 27 },
    ];
  }

  // Default fallback for Narmatha or generic faculty
  return [
    { id: '4', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 4 },
  ];
};

export interface PeriodScheduleItem {
  period: number;
  label: string;
  startMinutes: number;
  endMinutes: number;
  startTimeStr: string;
  endTimeStr: string;
  timeRange: string;
}

export const PERIOD_SCHEDULE: Record<number, PeriodScheduleItem> = {
  1: { period: 1, label: 'Period 1', startMinutes: 8 * 60 + 45, endMinutes: 9 * 60 + 35, startTimeStr: '08:45 AM', endTimeStr: '09:35 AM', timeRange: '08:45 AM - 09:35 AM' },
  2: { period: 2, label: 'Period 2', startMinutes: 9 * 60 + 35, endMinutes: 10 * 60 + 25, startTimeStr: '09:35 AM', endTimeStr: '10:25 AM', timeRange: '09:35 AM - 10:25 AM' },
  3: { period: 3, label: 'Period 3', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 35, startTimeStr: '10:45 AM', endTimeStr: '11:35 AM', timeRange: '10:45 AM - 11:35 AM' },
  4: { period: 4, label: 'Period 4', startMinutes: 11 * 60 + 35, endMinutes: 12 * 60 + 25, startTimeStr: '11:35 AM', endTimeStr: '12:25 PM', timeRange: '11:35 AM - 12:25 PM' },
  5: { period: 5, label: 'Period 5', startMinutes: 13 * 60 + 25, endMinutes: 14 * 60 + 15, startTimeStr: '01:25 PM', endTimeStr: '02:15 PM', timeRange: '01:25 PM - 02:15 PM' },
  6: { period: 6, label: 'Period 6', startMinutes: 14 * 60 + 15, endMinutes: 15 * 60 + 5, startTimeStr: '02:15 PM', endTimeStr: '03:05 PM', timeRange: '02:15 PM - 03:05 PM' },
  7: { period: 7, label: 'Period 7', startMinutes: 15 * 60 + 5, endMinutes: 15 * 60 + 55, startTimeStr: '03:05 PM', endTimeStr: '03:55 PM', timeRange: '03:05 PM - 03:55 PM' },
  8: { period: 8, label: 'Period 8', startMinutes: 15 * 60 + 55, endMinutes: 16 * 60 + 45, startTimeStr: '03:55 PM', endTimeStr: '04:45 PM', timeRange: '03:55 PM - 04:45 PM' },
};

export const getTeacherFullTimetableFallback = (teacherId: number, teacherName: string = '') => {
  const name = teacherName ? teacherName.toLowerCase() : '';
  if (teacherId === 3 || name.includes('narmatha')) {
    return [
      { id: 4, day: 1, period: 4, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 5, day: 1, period: 5, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 8, day: 2, period: 3, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 9, day: 2, period: 4, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 16, day: 4, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 21, day: 5, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    ];
  } else if (teacherId === 4 || name.includes('saranya')) {
    return [
      { id: 3, day: 1, period: 3, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 15, day: 3, period: 5, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 17, day: 4, period: 2, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 22, day: 5, period: 2, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 25, day: 5, period: 5, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
    ];
  } else if (teacherId === 2 || name.includes('guranna')) {
    return [
      { id: 1, day: 1, period: 1, section: 'III IT G', Subject: { title: 'Software Testing' } },
      { id: 2, day: 1, period: 2, section: 'III IT G', Subject: { title: 'Software Testing' } },
      { id: 10, day: 2, period: 5, section: 'III IT G', Subject: { title: 'Software Testing' } },
      { id: 11, day: 3, period: 1, section: 'III IT G', Subject: { title: 'Cloud Infrastructure and Services Management' } },
      { id: 12, day: 3, period: 2, section: 'III IT G', Subject: { title: 'Cloud Infrastructure and Services Management' } },
      { id: 13, day: 3, period: 3, section: 'III IT G', Subject: { title: 'Software Testing' } },
      { id: 14, day: 3, period: 4, section: 'III IT G', Subject: { title: 'Software Testing' } },
      { id: 18, day: 4, period: 3, section: 'III IT G', Subject: { title: 'Cloud Infrastructure and Services Management' } },
      { id: 19, day: 4, period: 4, section: 'III IT G', Subject: { title: 'Cloud Infrastructure and Services Management' } },
    ];
  } else if (teacherId === 5 || name.includes('edwin')) {
    return [
      { id: 26, day: 1, period: 1, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 29, day: 1, period: 4, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 35, day: 2, period: 5, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 40, day: 4, period: 2, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 41, day: 4, period: 4, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 45, day: 5, period: 3, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
    ];
  }

  return [
    { id: 4, day: 1, period: 4, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    { id: 5, day: 1, period: 5, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    { id: 8, day: 2, period: 3, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    { id: 9, day: 2, period: 4, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    { id: 16, day: 4, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    { id: 21, day: 5, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
  ];
};

export const SKCT_STUDENTS_G = [
  { id: '727824TUIT201', db_id: 1, name: 'SAISATHYASHREE', phone: '9442211279', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT202', db_id: 2, name: 'SAKKTHI SRI S', phone: '9042059126', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT203', db_id: 3, name: 'SAKTHI SUNDARESAN S', phone: '9944153519', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT204', db_id: 4, name: 'SAKTHII SUNDHAR J', phone: '9786478493', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT205', db_id: 5, name: 'SAKTHIVEL B', phone: '9095056349', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT206', db_id: 6, name: 'SANJAY B', phone: '8903413308', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT207', db_id: 7, name: 'SANJEEVAN V G', phone: '9443745600', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT208', db_id: 8, name: 'SANJITH S', phone: '9382618660', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT209', db_id: 9, name: 'SATHYA E', phone: '9047889619', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT210', db_id: 10, name: 'SATHYAJIT R', phone: '8973820746', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT214', db_id: 14, name: 'SHAGUL HAMEED M', phone: '8695376080', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT221', db_id: 21, name: 'SIVAKUMAR B', phone: '9942227987', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT236', db_id: 36, name: 'SUDHAN B', phone: '9790411155', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT245', db_id: 45, name: 'THARSHINI L', phone: '9840071706', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT258', db_id: 58, name: 'VIVIDHAN L', phone: '9442211279', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT260', db_id: 60, name: 'YAZHINI M B', phone: '9791930590', isAbsent: false, isOnDuty: false },
];

export const DEFAULT_HISTORY = [
  { id: '101', date: 'Sep 2', className: 'III IT G', subject: 'Distributed Computing', absentCount: 2, smsSent: true },
  { id: '102', date: 'Sep 1', className: 'III IT G', subject: 'Applied Cryptography', absentCount: 0, smsSent: true },
  { id: '103', date: 'Aug 29', className: 'III IT G', subject: 'Cyber Incident & Sec Mgmt', absentCount: 3, smsSent: true },
];

export let ATTENDANCE_HISTORY: any[] = [...DEFAULT_HISTORY];

export const addAttendanceHistory = (record: any) => {
  ATTENDANCE_HISTORY = [record, ...ATTENDANCE_HISTORY];
};

export const generateFallbackReport = (section: string = 'III IT G', startStr?: string, endStr?: string) => {
  const students = SKCT_STUDENTS_G;
  const totalClasses = 24; // Representative number of sessions in range

  return students.map((s, idx) => {
    let hash = 0;
    for (let i = 0; i < s.id.length; i++) {
      hash += s.id.charCodeAt(i);
    }
    // Calculate realistic variance: most above 80%, a few critical (<75%)
    let attended = totalClasses - ((hash + idx) % 7);
    if (idx === 3 || idx === 8) {
      attended = totalClasses - 8; // Defaulters for testing alerts
    }
    const percentage = Math.round((attended / totalClasses) * 100);

    return {
      roll_no: s.id,
      name: s.name,
      className: section,
      totalClasses,
      attendedClasses: attended,
      percentage,
      phone: s.phone
    };
  });
};

