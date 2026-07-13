export const DUMMY_USER = {
  id: 'F1001',
  name: 'Mr. Sivakumar',
  department: 'Information Technology',
  email: 'sivakumar@college.edu',
  phone: '+91 9876543210'
};

export const TODAY_CLASSES = [
  { id: '1', time: '09:00 - 09:50', subject: 'Operating Systems', className: 'II IT - C', code: 'OS' },
  { id: '2', time: '10:00 - 10:50', subject: 'Database Management', className: 'II IT - B', code: 'DBMS' },
  { id: '3', time: '11:00 - 11:50', subject: 'Java Programming', className: 'III IT - A', code: 'Java' },
  { id: '4', time: '14:00 - 14:50', subject: 'Artificial Intelligence', className: 'IV IT - C', code: 'AI' },
];

export const DUMMY_STUDENTS = [
  { id: '23IT001', name: 'Vividhan', isAbsent: false, phone: '9442211279' },
  { id: '23IT002', name: 'Aditi Patel', isAbsent: false, phone: '1234567890' },
  { id: '23IT003', name: 'Arjun Singh', isAbsent: false, phone: '1234567890' },
  { id: '23IT004', name: 'Diya Reddy', isAbsent: false, phone: '1234567890' },
  { id: '23IT005', name: 'Ishaan Gupta', isAbsent: false, phone: '1234567890' },
  { id: '23IT006', name: 'Kavya Desai', isAbsent: false, phone: '1234567890' },
  { id: '23IT007', name: 'Meera Iyer', isAbsent: false, phone: '1234567890' },
  { id: '23IT008', name: 'Nikhil Verma', isAbsent: false, phone: '1234567890' },
  { id: '23IT009', name: 'Pooja Nair', isAbsent: false, phone: '1234567890' },
  { id: '23IT010', name: 'Rohan Menon', isAbsent: false, phone: '1234567890' },
];

export let ATTENDANCE_HISTORY: any[] = [];

export const addAttendanceHistory = (record: any) => {
  ATTENDANCE_HISTORY = [record, ...ATTENDANCE_HISTORY];
};
