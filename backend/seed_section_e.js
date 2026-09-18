const { sequelize, Teacher, Student, Subject, Timetable } = require('./db');

const teachersData = [
  { name: 'Default Faculty', email: 'name@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Mr. Guranna', email: 'guranna@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Ms. B Narmatha', email: 'narmatha@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Ms. S Saranya', email: 'saranya@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Dr G Edwin Prem Kumar', email: 'edwin@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Mr A M Ratheeshkumar', email: 'ratheesh@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Mr Mouneesh', email: 'mouneesh@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Mr Crown', email: 'crown@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
  { name: 'Ms. Vaishnavi', email: 'vaishnavi@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' },
];

const studentsDataE = [
  { roll_no: '727824TUIT001', name: 'ABDUL SHIYAM A', parent_phone: '7010435581', section: 'III IT E' },
  { roll_no: '727824TUIT002', name: 'Abhinav barath SS', parent_phone: '9698765289', section: 'III IT E' },
  { roll_no: '727824TUIT003', name: 'ABISHA CS', parent_phone: '8300144602', section: 'III IT E' },
  { roll_no: '727824TUIT004', name: 'ABISHEK B', parent_phone: '9025840034', section: 'III IT E' },
  { roll_no: '727824TUIT005', name: 'ABISHEK R', parent_phone: '9080746357', section: 'III IT E' },
  { roll_no: '727824TUIT006', name: 'ADEEB AHAMED M', parent_phone: '6369921659', section: 'III IT E' },
  { roll_no: '727824TUIT007', name: 'ADHITYA N', parent_phone: '6369625570', section: 'III IT E' },
  { roll_no: '727824TUIT008', name: 'AJAY K', parent_phone: '9382618660', section: 'III IT E' },
  { roll_no: '727824TUIT009', name: 'Alagumaris G', parent_phone: '9087429619', section: 'III IT E' },
  { roll_no: '727824TUIT010', name: 'Amrisha J', parent_phone: '8973820746', section: 'III IT E' },
  { roll_no: '727824TUIT011', name: 'Amritha S', parent_phone: '6381551588', section: 'III IT E' },
  { roll_no: '727824TUIT012', name: 'Anand Sanjay M', parent_phone: '8667796585', section: 'III IT E' },
  { roll_no: '727824TUIT013', name: 'Ananya R', parent_phone: '9345309909', section: 'III IT E' },
  { roll_no: '727824TUIT014', name: 'ANBUSELVAN.B', parent_phone: '9442764007', section: 'III IT E' },
  { roll_no: '727824TUIT015', name: 'Anisha S', parent_phone: '8838069464', section: 'III IT E' },
  { roll_no: '727824TUIT016', name: 'ARASAN R', parent_phone: '9345147319', section: 'III IT E' },
  { roll_no: '727824TUIT017', name: 'INIYABHARATHI M', parent_phone: '7708107987', section: 'III IT E' },
  { roll_no: '727824TUIT018', name: 'Arun Prasath M', parent_phone: '8870813504', section: 'III IT E' },
  { roll_no: '727824TUIT019', name: 'Ashwanth S', parent_phone: '9363306234', section: 'III IT E' },
  { roll_no: '727824TUIT020', name: 'JANANI A', parent_phone: '9843755667', section: 'III IT E' },
  { roll_no: '727824TUIT021', name: 'Aswath S', parent_phone: '9363646370', section: 'III IT E' },
  { roll_no: '727824TUIT022', name: 'Aswen S', parent_phone: '8637486991', section: 'III IT E' },
  { roll_no: '727824TUIT023', name: 'Aswin S', parent_phone: '6374197025', section: 'III IT E' },
  { roll_no: '727824TUIT024', name: 'Athesh S', parent_phone: '7200073947', section: 'III IT E' },
  { roll_no: '727824TUIT025', name: 'Athish D', parent_phone: '6385322412', section: 'III IT E' },
  { roll_no: '727824TUIT026', name: 'Balakmanikandan S S', parent_phone: '9025743086', section: 'III IT E' },
  { roll_no: '727824TUIT027', name: 'Barath S', parent_phone: '9626090283', section: 'III IT E' },
  { roll_no: '727824TUIT028', name: 'Bragadeesh P', parent_phone: '7598489646', section: 'III IT E' },
  { roll_no: '727824TUIT029', name: 'DARSHINI B', parent_phone: '8838489102', section: 'III IT E' },
  { roll_no: '727824TUIT030', name: 'DEEPAK S', parent_phone: '9489890489', section: 'III IT E' },
  { roll_no: '727824TUIT031', name: 'DEEPIKA S S', parent_phone: '9629890868', section: 'III IT E' },
  { roll_no: '727824TUIT032', name: 'DEEPTHASRI S D', parent_phone: '8610579655', section: 'III IT E' },
  { roll_no: '727824TUIT033', name: 'DHANUSHA P', parent_phone: '9488217675', section: 'III IT E' },
  { roll_no: '727824TUIT034', name: 'DHANYASRI J', parent_phone: '7824931456', section: 'III IT E' },
  { roll_no: '727824TUIT035', name: 'DHARRSHINII S U', parent_phone: '9042246578', section: 'III IT E' },
  { roll_no: '727824TUIT036', name: 'DHARSHINI S', parent_phone: '9597663333', section: 'III IT E' },
  { roll_no: '727824TUIT037', name: 'DHARUN PRASATH B', parent_phone: '8754026893', section: 'III IT E' },
  { roll_no: '727824TUIT038', name: 'Dharunika T', parent_phone: '9585581765', section: 'III IT E' },
  { roll_no: '727824TUIT039', name: 'DHISIHARAN P', parent_phone: '8248461485', section: 'III IT E' },
  { roll_no: '727824TUIT040', name: 'DHIYANESHWAR K', parent_phone: '9342520816', section: 'III IT E' },
  { roll_no: '727824TUIT041', name: 'DINESHKUMAR G', parent_phone: '9345522895', section: 'III IT E' },
  { roll_no: '727824TUIT042', name: 'DINESH R S', parent_phone: '6385824106', section: 'III IT E' },
  { roll_no: '727824TUIT043', name: 'DIVYA DHARSHINI M', parent_phone: '7092278183', section: 'III IT E' },
  { roll_no: '727824TUIT044', name: 'DIVYADHARSHINI S', parent_phone: '6385860566', section: 'III IT E' },
  { roll_no: '727824TUIT045', name: 'DIVYASAGAR P', parent_phone: '8015443374', section: 'III IT E' },
  { roll_no: '727824TUIT046', name: 'D EDWIN JOSHUA', parent_phone: '9600874706', section: 'III IT E' },
  { roll_no: '727824TUIT047', name: 'GOKUL S', parent_phone: '7871340535', section: 'III IT E' },
  { roll_no: '727824TUIT048', name: 'GOPINATH K', parent_phone: '9025647041', section: 'III IT E' },
  { roll_no: '727824TUIT049', name: 'GOWSIK B', parent_phone: '9345776981', section: 'III IT E' },
  { roll_no: '727824TUIT050', name: 'GOWTHAM PERIYASAMY S', parent_phone: '9943201106', section: 'III IT E' },
  { roll_no: '727824TUIT051', name: 'GURU VISHAL V S', parent_phone: '8525053670', section: 'III IT E' },
  { roll_no: '727824TUIT052', name: 'GURUCHANDRU S', parent_phone: '7339178515', section: 'III IT E' },
  { roll_no: '727824TUIT053', name: 'HARI DARSHINI K', parent_phone: '8098420723', section: 'III IT E' },
  { roll_no: '727824TUIT054', name: 'Hari Prasath M', parent_phone: '9344751241', section: 'III IT E' },
  { roll_no: '727824TUIT055', name: 'Hariraj V', parent_phone: '6382191216', section: 'III IT E' },
  { roll_no: '727824TUIT056', name: 'HARISH ADITHYA C.K', parent_phone: '7200751388', section: 'III IT E' },
  { roll_no: '727824TUIT057', name: 'HARISH KUMAR S V', parent_phone: '8870621564', section: 'III IT E' },
  { roll_no: '727824TUIT058', name: 'HARSHA S', parent_phone: '7397027851', section: 'III IT E' },
  { roll_no: '727824TUIT059', name: 'INIYA K', parent_phone: '6380025923', section: 'III IT E' },
  { roll_no: '727825TUIT601', name: 'KARTHIK SS', parent_phone: '9976684726', section: 'III IT E' },
  { roll_no: '727825TUIT602', name: 'KIRAN M', parent_phone: '9442211279', section: 'III IT E' },
  { roll_no: '727825TUIT603', name: 'LOGESWARAN R', parent_phone: '9788627430', section: 'III IT E' }
];

const subjectsData = [
  { code: '23CS502', acronym: 'ST', title: 'Software Testing' },
  { code: '23CS504', acronym: 'CISM', title: 'Cloud Infrastructure and Services Management' },
  { code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' },
  { code: '23ITC03', acronym: 'DC', title: 'Distributed Computing' },
  { code: '23IT50X', acronym: 'AD', title: 'Application Development' },
  { code: '23IT50Y', acronym: 'TWM', title: 'Technical Web M' },
];

async function seedSectionE() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');
    await sequelize.sync();
    console.log('Database synced.');

    // 1. Ensure Teachers exist
    const teacherMap = {};
    for (const t of teachersData) {
      const [teacher] = await Teacher.findOrCreate({
        where: { email: t.email },
        defaults: t
      });
      teacherMap[t.email] = teacher;
      teacherMap[t.name] = teacher;
    }

    // 2. Ensure Subjects exist
    const subjectMap = {};
    for (const s of subjectsData) {
      const [subject] = await Subject.findOrCreate({
        where: { code: s.code },
        defaults: s
      });
      subjectMap[s.acronym] = subject;
    }

    // 3. Insert Students of III IT E
    console.log(`Seeding ${studentsDataE.length} students for III IT E...`);
    for (const st of studentsDataE) {
      const [student, created] = await Student.findOrCreate({
        where: { roll_no: st.roll_no },
        defaults: st
      });
      if (!created) {
        await student.update({ name: st.name, section: st.section, parent_phone: st.parent_phone });
      }
    }

    const edwin = teacherMap['edwin@skct.edu.in'];
    const ratheesh = teacherMap['ratheesh@skct.edu.in'];
    const mouneesh = teacherMap['mouneesh@skct.edu.in'];
    const crown = teacherMap['crown@skct.edu.in'];
    const vaishnavi = teacherMap['vaishnavi@skct.edu.in'];
    const defaultTeacher = teacherMap['name@skct.edu.in'];

    const subST = subjectMap['ST'];
    const subCISM = subjectMap['CISM'];
    const subAC = subjectMap['AC'];
    const subDC = subjectMap['DC'];
    const subAD = subjectMap['AD'];
    const subTWM = subjectMap['TWM'];

    // 4. Timetable for III IT E
    const timetableDataE = [
      // DAY 1
      { day: 1, period: 1, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      { day: 1, period: 2, section: 'III IT E', subject_id: subAD.id, teacher_id: vaishnavi.id },
      { day: 1, period: 3, section: 'III IT E', subject_id: subAD.id, teacher_id: vaishnavi.id },
      { day: 1, period: 4, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      { day: 1, period: 5, section: 'III IT E', subject_id: subDC.id, teacher_id: ratheesh.id },
      // DAY 2
      { day: 2, period: 1, section: 'III IT E', subject_id: subST.id, teacher_id: mouneesh.id },
      { day: 2, period: 2, section: 'III IT E', subject_id: subST.id, teacher_id: mouneesh.id },
      { day: 2, period: 3, section: 'III IT E', subject_id: subCISM.id, teacher_id: crown.id },
      { day: 2, period: 4, section: 'III IT E', subject_id: subCISM.id, teacher_id: crown.id },
      { day: 2, period: 5, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      // DAY 3
      { day: 3, period: 1, section: 'III IT E', subject_id: subAD.id, teacher_id: vaishnavi.id },
      { day: 3, period: 2, section: 'III IT E', subject_id: subAD.id, teacher_id: vaishnavi.id },
      { day: 3, period: 3, section: 'III IT E', subject_id: subST.id, teacher_id: mouneesh.id },
      { day: 3, period: 4, section: 'III IT E', subject_id: subST.id, teacher_id: mouneesh.id },
      { day: 3, period: 5, section: 'III IT E', subject_id: subDC.id, teacher_id: ratheesh.id },
      // DAY 4
      { day: 4, period: 1, section: 'III IT E', subject_id: subDC.id, teacher_id: ratheesh.id },
      { day: 4, period: 2, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      { day: 4, period: 3, section: 'III IT E', subject_id: subDC.id, teacher_id: ratheesh.id },
      { day: 4, period: 4, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      { day: 4, period: 5, section: 'III IT E', subject_id: subTWM.id, teacher_id: defaultTeacher.id },
      // DAY 5
      { day: 5, period: 1, section: 'III IT E', subject_id: subCISM.id, teacher_id: crown.id },
      { day: 5, period: 2, section: 'III IT E', subject_id: subCISM.id, teacher_id: crown.id },
      { day: 5, period: 3, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      { day: 5, period: 4, section: 'III IT E', subject_id: subDC.id, teacher_id: ratheesh.id },
      { day: 5, period: 5, section: 'III IT E', subject_id: subST.id, teacher_id: mouneesh.id },
    ];

    console.log('Seeding timetable for III IT E...');
    for (const tt of timetableDataE) {
      await Timetable.findOrCreate({
        where: { day: tt.day, period: tt.period, section: tt.section },
        defaults: tt
      });
    }

    const studentCount = await Student.count({ where: { section: 'III IT E' } });
    const ttCount = await Timetable.count({ where: { section: 'III IT E' } });

    console.log(`III IT E seeding complete! Total Students in III IT E: ${studentCount}, Total Timetable slots in III IT E: ${ttCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding section E:', error);
    process.exit(1);
  }
}

seedSectionE();
