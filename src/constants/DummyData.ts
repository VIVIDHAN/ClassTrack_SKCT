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
  { id: '1', className: 'III IT G', subject: 'Distributed Computing', timetable_id: 1 },
  { id: '2', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 2 },
  { id: '3', className: 'III IT G', subject: 'Cyber Incident & Sec Mgmt', timetable_id: 3 },
  { id: '4', className: 'III IT E', subject: 'Software Testing', timetable_id: 10 },
  { id: '5', className: 'III IT E', subject: 'Applied Cryptography', timetable_id: 11 },
];

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

