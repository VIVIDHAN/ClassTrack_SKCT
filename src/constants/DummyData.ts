export const DUMMY_USER = {
  id: 'F1001',
  name: 'Ms. S Saranya',
  department: 'Information Technology',
  email: 'saranya@skct.edu.in',
  phone: '+91 9876543210'
};

export const TODAY_CLASSES = [
  { id: '1', time: 'Period 1 (08:15 - 09:15)', subject: 'Distributed Computing', className: 'III IT G', code: 'DC', timetable_id: 1 },
  { id: '2', time: 'Period 2 (09:15 - 10:15)', subject: 'Applied Cryptography', className: 'III IT G', code: 'AC', timetable_id: 2 },
  { id: '3', time: 'Period 3 (10:45 - 11:45)', subject: 'Cyber Incident & Sec Mgmt', className: 'III IT G', code: 'CISM', timetable_id: 3 },
  { id: '4', time: 'Period 4 (11:45 - 12:45)', subject: 'Full Stack App Development', className: 'III IT G', code: 'AD', timetable_id: 4 },
  { id: '5', time: 'Period 5 (01:45 - 02:45)', subject: 'Technical Writing & Method', className: 'III IT G', code: 'TWM', timetable_id: 5 },
];

export const DIRECTORY_CLASSES = [
  { id: '4', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 4 },
];

export const getTeacherDirectoryFallback = (teacherId: number, teacherName: string = '') => {
  const name = teacherName ? teacherName.toLowerCase() : '';
  if (teacherId === 999 || name.includes('admin') || name.includes('hod')) {
    return [
      { id: '4', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 4 },
      { id: '3', className: 'III IT G', subject: 'Distributed Computing', timetable_id: 3 },
      { id: '1', className: 'III IT G', subject: 'Software Testing', timetable_id: 1 },
      { id: '26', className: 'III IT E', subject: 'Applied Cryptography', timetable_id: 26 },
      { id: '30', className: 'III IT E', subject: 'Distributed Computing', timetable_id: 30 },
      { id: '31', className: 'III IT E', subject: 'Software Testing', timetable_id: 31 },
      { id: '33', className: 'III IT E', subject: 'Cloud Infrastructure and Services Management', timetable_id: 33 },
      { id: '27', className: 'III IT E', subject: 'Application Development', timetable_id: 27 },
    ];
  }
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
  } else if (teacherId === 9 || teacherId === 12 || name.includes('gayathri') || name.includes('vaishnavi')) {
    return [
      { id: '27', className: 'III IT E', subject: 'Application Development', timetable_id: 27 },
    ];
  }

  // Default fallback for Narmatha or generic faculty
  return [
    { id: '4', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 4 },
  ];
};

export const getTeacherAttendanceFallback = (teacherId: number, teacherName: string = '', day: number = 4) => {
  const name = teacherName ? teacherName.toLowerCase() : '';
  if (teacherId === 999 || name.includes('admin') || name.includes('hod')) {
    return [
      { id: '16', time: 'Period 1 (08:15 - 09:15)', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 16 },
      { id: '17', time: 'Period 2 (09:15 - 10:15)', className: 'III IT G', subject: 'Distributed Computing', timetable_id: 17 },
      { id: '18', time: 'Period 3 (10:45 - 11:45)', className: 'III IT G', subject: 'Cloud Infrastructure and Services Management', timetable_id: 18 },
      { id: '40', time: 'Period 2 (09:15 - 10:15)', className: 'III IT E', subject: 'Applied Cryptography', timetable_id: 40 },
      { id: '27', time: 'Period 4 (11:45 - 12:45)', className: 'III IT E', subject: 'Application Development', timetable_id: 27 },
    ];
  }
  if (teacherId === 4 || name.includes('saranya')) {
    return [
      { id: '17', time: 'Period 2 (09:15 - 10:15)', className: 'III IT G', subject: 'Distributed Computing', timetable_id: 17 },
    ];
  } else if (teacherId === 3 || name.includes('narmatha')) {
    return [
      { id: '16', time: 'Period 1 (08:15 - 09:15)', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 16 },
    ];
  } else if (teacherId === 2 || name.includes('guranna')) {
    return [
      { id: '18', time: 'Period 3 (10:45 - 11:45)', className: 'III IT G', subject: 'Cloud Infrastructure and Services Management', timetable_id: 18 },
    ];
  } else if (teacherId === 5 || name.includes('edwin')) {
    return [
      { id: '40', time: 'Period 2 (09:15 - 10:15)', className: 'III IT E', subject: 'Applied Cryptography', timetable_id: 40 },
    ];
  } else if (teacherId === 6 || name.includes('ratheesh')) {
    return [
      { id: '30', time: 'Period 1 (08:15 - 09:15)', className: 'III IT E', subject: 'Distributed Computing', timetable_id: 30 },
    ];
  } else if (teacherId === 7 || name.includes('mouneesh')) {
    return [
      { id: '31', time: 'Period 2 (09:15 - 10:15)', className: 'III IT E', subject: 'Software Testing', timetable_id: 31 },
    ];
  } else if (teacherId === 8 || name.includes('crown')) {
    return [
      { id: '33', time: 'Period 3 (10:45 - 11:45)', className: 'III IT E', subject: 'Cloud Infrastructure and Services Management', timetable_id: 33 },
    ];
  } else if (teacherId === 9 || teacherId === 12 || name.includes('gayathri') || name.includes('vaishnavi')) {
    return [
      { id: '27', time: 'Period 4 (11:45 - 12:45)', className: 'III IT E', subject: 'Application Development', timetable_id: 27 },
    ];
  }

  return [
    { id: '17', time: 'Period 2 (09:15 - 10:15)', className: 'III IT G', subject: 'Distributed Computing', timetable_id: 17 },
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
  1: { period: 1, label: 'Period 1', startMinutes: 8 * 60 + 15, endMinutes: 9 * 60 + 15, startTimeStr: '08:15 AM', endTimeStr: '09:15 AM', timeRange: '08:15 AM - 09:15 AM' },
  2: { period: 2, label: 'Period 2', startMinutes: 9 * 60 + 15, endMinutes: 10 * 60 + 15, startTimeStr: '09:15 AM', endTimeStr: '10:15 AM', timeRange: '09:15 AM - 10:15 AM' },
  3: { period: 3, label: 'Period 3', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 45, startTimeStr: '10:45 AM', endTimeStr: '11:45 AM', timeRange: '10:45 AM - 11:45 AM' },
  4: { period: 4, label: 'Period 4', startMinutes: 11 * 60 + 45, endMinutes: 12 * 60 + 45, startTimeStr: '11:45 AM', endTimeStr: '12:45 PM', timeRange: '11:45 AM - 12:45 PM' },
  5: { period: 5, label: 'Period 5', startMinutes: 13 * 60 + 45, endMinutes: 14 * 60 + 45, startTimeStr: '01:45 PM', endTimeStr: '02:45 PM', timeRange: '01:45 PM - 02:45 PM' },
  6: { period: 6, label: 'Period 6', startMinutes: 14 * 60 + 45, endMinutes: 15 * 60 + 45, startTimeStr: '02:45 PM', endTimeStr: '03:45 PM', timeRange: '02:45 PM - 03:45 PM' },
  7: { period: 7, label: 'Period 7', startMinutes: 15 * 60 + 45, endMinutes: 16 * 60 + 45, startTimeStr: '03:45 PM', endTimeStr: '04:45 PM', timeRange: '03:45 PM - 04:45 PM' },
  8: { period: 8, label: 'Period 8', startMinutes: 16 * 60 + 45, endMinutes: 17 * 60 + 30, startTimeStr: '04:45 PM', endTimeStr: '05:30 PM', timeRange: '04:45 PM - 05:30 PM' },
};

export const getTeacherFullTimetableFallback = (teacherId: number, teacherName: string = '') => {
  const name = teacherName ? teacherName.toLowerCase() : '';
  const numId = Number(teacherId) || 3;

  if (numId === 3 || name.includes('narmatha') || name.includes('narmadha')) {
    return [
      { id: 4, day: 1, period: 4, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 5, day: 1, period: 5, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 8, day: 2, period: 3, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 9, day: 2, period: 4, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 14, day: 3, period: 3, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 16, day: 4, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
      { id: 21, day: 5, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    ];
  } else if (numId === 4 || name.includes('saranya')) {
    return [
      { id: 3, day: 1, period: 3, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 7, day: 2, period: 2, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 15, day: 3, period: 5, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 17, day: 4, period: 2, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 22, day: 5, period: 2, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
      { id: 25, day: 5, period: 5, section: 'III IT G', Subject: { title: 'Distributed Computing' } },
    ];
  } else if (numId === 2 || name.includes('guranna')) {
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
  } else if (numId === 5 || name.includes('edwin')) {
    return [
      { id: 26, day: 1, period: 1, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 29, day: 1, period: 4, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 35, day: 2, period: 5, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
      { id: 38, day: 3, period: 3, section: 'III IT E', Subject: { title: 'Applied Cryptography' } },
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
    { id: 14, day: 3, period: 3, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    { id: 16, day: 4, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
    { id: 21, day: 5, period: 1, section: 'III IT G', Subject: { title: 'Applied Cryptography' } },
  ];
};

export const SKCT_STUDENTS_G = [
  { id: '727824TUIT201', db_id: 1, name: 'SAISATHYASHREE', phone: '9790582650', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT202', db_id: 2, name: 'SAKKTHI SRI S', phone: '9944900010', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT203', db_id: 3, name: 'SAKTHI SUNDARESAN S', phone: '6369770535', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT204', db_id: 4, name: 'SAKTHII SUNDHAR J', phone: '9865577282', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT205', db_id: 5, name: 'SAKTHIVEL B', phone: '7418683535', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT206', db_id: 6, name: 'SANJAY B', phone: '9360447541', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT207', db_id: 7, name: 'SANJEEVAN V G', phone: '9786177899', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT208', db_id: 8, name: 'SANJITH S', phone: '9787105714', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT209', db_id: 9, name: 'SATHYA E', phone: '9865976429', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT210', db_id: 10, name: 'SATHYAJIT R', phone: '9443962404', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT211', db_id: 11, name: 'SELVAPRIYA K', phone: '9486682831', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT212', db_id: 12, name: 'SELVASURYA GANESH', phone: '9715127046', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT213', db_id: 13, name: 'SHAGIN DHARSHANTH M', phone: '7358893717', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT214', db_id: 14, name: 'SHAGUL HAMEED M', phone: '8056403186', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT215', db_id: 15, name: 'SHARAN V', phone: '6383590449', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT216', db_id: 16, name: 'SHARIF AHAMED S', phone: '7708817965', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT217', db_id: 17, name: 'SHIVA SHARMA V M', phone: '9443823330', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT218', db_id: 18, name: 'SHRIYA R', phone: '9443304580', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT219', db_id: 19, name: 'SIDHARTH D', phone: '9952537522', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT220', db_id: 20, name: 'SINESHANA S J', phone: '9344999880', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT221', db_id: 21, name: 'SIVAKUMAR B', phone: '9788553155', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT222', db_id: 22, name: 'SNEKITHAA SG', phone: '9994131400', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT223', db_id: 23, name: 'SOWMIYA SREE K K', phone: '9994630020', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT224', db_id: 24, name: 'SREE MEENA M', phone: '9486508093', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT225', db_id: 25, name: 'SREE VISHAL M', phone: '8754071402', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT226', db_id: 26, name: 'SREENITHI A', phone: '9025334635', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT227', db_id: 27, name: 'SRI HARI K', phone: '7200068716', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT228', db_id: 28, name: 'SRINIDHI R', phone: '9751616383', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT229', db_id: 29, name: 'SRINITHI S', phone: '8098215359', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT230', db_id: 30, name: 'SRISANJAYKUMAR S', phone: '9787701167', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT231', db_id: 31, name: 'SRIVARSHINI S', phone: '9361949209', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT232', db_id: 32, name: 'SRUTHI R', phone: '9363912772', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT233', db_id: 33, name: 'SUBASH S', phone: '6382631776', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT234', db_id: 34, name: 'SUBBU VASANTH T', phone: '9443135524', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT235', db_id: 35, name: 'SUBHIKSHA M', phone: '9994818528', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT236', db_id: 36, name: 'SUDHAN B', phone: '6382643475', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT237', db_id: 37, name: 'SUJAN S', phone: '9095302399', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT238', db_id: 38, name: 'SURESH KUMAR C', phone: '9150433756', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT239', db_id: 39, name: 'SURYA M', phone: '9486547775', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT240', db_id: 40, name: 'SUSMITHA SHREE P', phone: '9677722038', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT241', db_id: 41, name: 'TARUNIKA K', phone: '9787190902', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT242', db_id: 42, name: 'THAMARAISELVAN E', phone: '8760395643', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT243', db_id: 43, name: 'THARANEESH D R', phone: '9916647912', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT244', db_id: 44, name: 'THARIKASINI M S', phone: '9442580008', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT245', db_id: 45, name: 'THARSHINI L', phone: '9003931825', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT246', db_id: 46, name: 'THILAGAVATHI R', phone: '9894662066', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT247', db_id: 47, name: 'THIRUVASAGAN T', phone: '9943509373', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT248', db_id: 48, name: 'VIJAYAMBIGAI D', phone: '9994463724', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT249', db_id: 49, name: 'VIJAYAPRADHA R', phone: '7373489528', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT250', db_id: 50, name: 'VIJEYENDHARAN V M', phone: '8667581673', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT251', db_id: 51, name: 'VIKRAM M', phone: '9095581559', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT252', db_id: 52, name: 'VISHAL E', phone: '9994406380', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT253', db_id: 53, name: 'VISHAL S', phone: '9943161933', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT254', db_id: 54, name: 'VISHNU KUMAR M', phone: '8508335266', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT255', db_id: 55, name: 'VISHNUKUMAR S', phone: '8973634300', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT256', db_id: 56, name: 'VISHVARUBAN S', phone: '9443627908', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT257', db_id: 57, name: 'VISHWA B', phone: '8072021307', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT258', db_id: 58, name: 'VIVIDHAN L', phone: '8608549489', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT259', db_id: 59, name: 'YADHAVASIVA V', phone: '9543601004', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT260', db_id: 60, name: 'YAZHINI M B', phone: '7708248075', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT261', db_id: 61, name: 'YUVAN M', phone: '9994957328', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT262', db_id: 62, name: 'YUVANSRI V', phone: '8056340346', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT263', db_id: 63, name: 'VARSHA R', phone: '9994896667', isAbsent: false, isOnDuty: false },
];

export const SKCT_STUDENTS_E = [
  { id: '727824TUIT001', db_id: 101, name: 'ABDUL SHIYAM A', phone: '7010435581', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT002', db_id: 102, name: 'Abhinav barath SS', phone: '9698765289', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT003', db_id: 103, name: 'ABISHA CS', phone: '8300144602', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT004', db_id: 104, name: 'ABISHEK B', phone: '9025840034', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT005', db_id: 105, name: 'ABISHEK R', phone: '9080746357', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT006', db_id: 106, name: 'ADEEB AHAMED M', phone: '6369921659', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT007', db_id: 107, name: 'ADHITYA N', phone: '6369625570', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT008', db_id: 108, name: 'AJAY K', phone: '9382618660', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT009', db_id: 109, name: 'Alagumaris G', phone: '9087429619', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT010', db_id: 110, name: 'Amrisha J', phone: '8973820746', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT011', db_id: 111, name: 'Amritha S', phone: '6381551588', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT012', db_id: 112, name: 'Anand Sanjay M', phone: '8667796585', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT013', db_id: 113, name: 'Ananya R', phone: '9345309909', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT014', db_id: 114, name: 'ANBUSELVAN.B', phone: '9442764007', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT015', db_id: 115, name: 'Anisha S', phone: '8838069464', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT016', db_id: 116, name: 'ARASAN R', phone: '9345147319', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT017', db_id: 117, name: 'INIYABHARATHI M', phone: '7708107987', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT018', db_id: 118, name: 'Arun Prasath M', phone: '8870813504', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT019', db_id: 119, name: 'Ashwanth S', phone: '9363306234', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT020', db_id: 120, name: 'JANANI A', phone: '9843755667', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT021', db_id: 121, name: 'Aswath S', phone: '9363646370', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT022', db_id: 122, name: 'Aswen S', phone: '8637486991', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT023', db_id: 123, name: 'Aswin S', phone: '6374197025', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT024', db_id: 124, name: 'Athesh S', phone: '7200073947', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT025', db_id: 125, name: 'Athish D', phone: '6385322412', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT026', db_id: 126, name: 'Balakmanikandan S S', phone: '9025743086', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT027', db_id: 127, name: 'Barath S', phone: '9626090283', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT028', db_id: 128, name: 'Bragadeesh P', phone: '7598489646', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT029', db_id: 129, name: 'DARSHINI B', phone: '8838489102', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT030', db_id: 130, name: 'DEEPAK S', phone: '9489890489', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT031', db_id: 131, name: 'DEEPIKA S S', phone: '9629890868', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT032', db_id: 132, name: 'DEEPTHASRI S D', phone: '8610579655', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT033', db_id: 133, name: 'DHANUSHA P', phone: '9488217675', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT034', db_id: 134, name: 'DHANYASRI J', phone: '7824931456', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT035', db_id: 135, name: 'DHARRSHINII S U', phone: '9042246578', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT036', db_id: 136, name: 'DHARSHINI S', phone: '9597663333', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT037', db_id: 137, name: 'DHARUN PRASATH B', phone: '8754026893', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT038', db_id: 138, name: 'Dharunika T', phone: '9585581765', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT039', db_id: 139, name: 'DHISIHARAN P', phone: '8248461485', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT040', db_id: 140, name: 'DHIYANESHWAR K', phone: '9342520816', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT041', db_id: 141, name: 'DINESHKUMAR G', phone: '9345522895', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT042', db_id: 142, name: 'DINESH R S', phone: '6385824106', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT043', db_id: 143, name: 'DIVYA DHARSHINI M', phone: '7092278183', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT044', db_id: 144, name: 'DIVYADHARSHINI S', phone: '6385860566', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT045', db_id: 145, name: 'DIVYASAGAR P', phone: '8015443374', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT046', db_id: 146, name: 'D EDWIN JOSHUA', phone: '9600874706', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT047', db_id: 147, name: 'GOKUL S', phone: '7871340535', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT048', db_id: 148, name: 'GOPINATH K', phone: '9025647041', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT049', db_id: 149, name: 'GOWSIK B', phone: '9345776981', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT050', db_id: 150, name: 'GOWTHAM PERIYASAMY S', phone: '9943201106', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT051', db_id: 151, name: 'GURU VISHAL V S', phone: '8525053670', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT052', db_id: 152, name: 'GURUCHANDRU S', phone: '7339178515', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT053', db_id: 153, name: 'HARI DARSHINI K', phone: '8098420723', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT054', db_id: 154, name: 'Hari Prasath M', phone: '9344751241', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT055', db_id: 155, name: 'Hariraj V', phone: '6382191216', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT056', db_id: 156, name: 'HARISH ADITHYA C.K', phone: '7200751388', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT057', db_id: 157, name: 'HARISH KUMAR S V', phone: '8870621564', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT058', db_id: 158, name: 'HARSHA S', phone: '7397027851', isAbsent: false, isOnDuty: false },
  { id: '727824TUIT059', db_id: 159, name: 'INIYA K', phone: '6380025923', isAbsent: false, isOnDuty: false },
  { id: '727825TUIT601', db_id: 160, name: 'KARTHIK SS', phone: '9976684726', isAbsent: false, isOnDuty: false },
  { id: '727825TUIT602', db_id: 161, name: 'KIRAN M', phone: '9442211279', isAbsent: false, isOnDuty: false },
  { id: '727825TUIT603', db_id: 162, name: 'LOGESWARAN R', phone: '9788627430', isAbsent: false, isOnDuty: false },
];

export const DEFAULT_HISTORY = [
  {
    id: '101',
    date: 'Sep 2',
    period: 'Period 3 (10:45 - 11:45)',
    className: 'III IT G',
    subject: 'Distributed Computing',
    absentCount: 2,
    smsSent: true,
    absentees: [
      { id: '727824TUIT209', name: 'SATHYA E', phone: '9047889619', real_parent_phone: '9047889619' },
      { id: '727824TUIT245', name: 'THARSHINI L', phone: '9840071706', real_parent_phone: '9840071706' },
    ]
  },
  {
    id: '102',
    date: 'Sep 1',
    period: 'Period 4 (11:45 - 12:45)',
    className: 'III IT G',
    subject: 'Applied Cryptography',
    absentCount: 0,
    smsSent: true,
    absentees: []
  },
  {
    id: '103',
    date: 'Aug 29',
    period: 'Period 1 (08:15 - 09:15)',
    className: 'III IT G',
    subject: 'Applied Cryptography',
    absentCount: 1,
    smsSent: true,
    absentees: [
      { id: '727824TUIT204', name: 'SAKTHII SUNDHAR J', phone: '9786478493', real_parent_phone: '9786478493' }
    ]
  },
];

export let ATTENDANCE_HISTORY: any[] = [...DEFAULT_HISTORY];

export const addAttendanceHistory = (record: any) => {
  ATTENDANCE_HISTORY = [record, ...ATTENDANCE_HISTORY];
};

export const generateFallbackReport = (section: string = 'Both', startStr?: string, endStr?: string) => {
  let students: any[] = [];
  if (section === 'Both' || section === 'ALL' || section === 'Both Classes Together') {
    students = [
      ...SKCT_STUDENTS_G.map(s => ({ ...s, className: 'III IT G' })),
      ...SKCT_STUDENTS_E.map(s => ({ ...s, className: 'III IT E' }))
    ];
  } else if (section.includes('E')) {
    students = SKCT_STUDENTS_E.map(s => ({ ...s, className: 'III IT E' }));
  } else {
    students = SKCT_STUDENTS_G.map(s => ({ ...s, className: 'III IT G' }));
  }

  const totalClasses = 24; // Representative number of sessions in range

  return students.map((s: any, idx: number) => {
    let hash = 0;
    const studentId = s.id || s.roll_no || '';
    for (let i = 0; i < studentId.length; i++) {
      hash += studentId.charCodeAt(i);
    }
    let attended = totalClasses - ((hash + idx) % 7);
    if (idx === 3 || idx === 8 || idx === 15) {
      attended = totalClasses - 8; // Representative defaulters for alerts
    }
    const percentage = Math.round((attended / totalClasses) * 100);

    return {
      roll_no: studentId,
      name: s.name,
      className: s.className || section,
      totalClasses,
      attendedClasses: attended,
      percentage,
      phone: s.phone
    };
  });
};

export const DEFAULT_ABSENTEES: any[] = [];

