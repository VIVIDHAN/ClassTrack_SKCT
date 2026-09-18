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
  { roll_no: '727824TUIT001', name: 'ABDUL', parent_phone: '8072654818', section: 'III IT E' },
  { roll_no: '727824TUIT002', name: 'Abhinav', parent_phone: '9042059126', section: 'III IT E' },
  { roll_no: '727824TUIT003', name: 'ABISHA', parent_phone: '9944153519', section: 'III IT E' },
  { roll_no: '727824TUIT004', name: 'ABISHEK', parent_phone: '9786478493', section: 'III IT E' },
  { roll_no: '727824TUIT005', name: 'ABISHEK', parent_phone: '9095056349', section: 'III IT E' },
  { roll_no: '727824TUIT006', name: 'ADEEB', parent_phone: '8903413308', section: 'III IT E' },
  { roll_no: '727824TUIT007', name: 'ADHITYA', parent_phone: '9443745600', section: 'III IT E' },
  { roll_no: '727824TUIT008', name: 'AJAY', parent_phone: '9382618660', section: 'III IT E' },
  { roll_no: '727824TUIT009', name: 'Alagumaris', parent_phone: '9047889619', section: 'III IT E' },
  { roll_no: '727824TUIT010', name: 'Amrisha', parent_phone: '8973820746', section: 'III IT E' },
  { roll_no: '727824TUIT011', name: 'Amritha', parent_phone: '9965312843', section: 'III IT E' },
  { roll_no: '727824TUIT012', name: 'Anand', parent_phone: '7868086675', section: 'III IT E' },
  { roll_no: '727824TUIT013', name: 'Ananya', parent_phone: '9443715423', section: 'III IT E' },
  { roll_no: '727824TUIT014', name: 'ANBUSELVAN', parent_phone: '9442764007', section: 'III IT E' },
  { roll_no: '727824TUIT015', name: 'Anisha', parent_phone: '8695376080', section: 'III IT E' },
  { roll_no: '727824TUIT016', name: 'Arasan', parent_phone: '8925124068', section: 'III IT E' },
  { roll_no: '727824TUIT017', name: 'INIYABHARATHI', parent_phone: '9942227987', section: 'III IT E' },
  { roll_no: '727824TUIT018', name: 'Arun Prasath', parent_phone: '9843247303', section: 'III IT E' },
  { roll_no: '727824TUIT019', name: 'Ashwanth', parent_phone: '9942775720', section: 'III IT E' },
  { roll_no: '727824TUIT020', name: 'Janani', parent_phone: '6381683123', section: 'III IT E' },
  { roll_no: '727824TUIT021', name: 'Aswath', parent_phone: '9944684142', section: 'III IT E' },
  { roll_no: '727824TUIT022', name: 'Aswen', parent_phone: '9159170300', section: 'III IT E' },
  { roll_no: '727824TUIT023', name: 'Aswin', parent_phone: '9003385557', section: 'III IT E' },
  { roll_no: '727824TUIT024', name: 'Athesh', parent_phone: '6374681581', section: 'III IT E' },
  { roll_no: '727824TUIT025', name: 'Athish', parent_phone: '9486888654', section: 'III IT E' },
  { roll_no: '727824TUIT026', name: 'Balamanikandan', parent_phone: null, section: 'III IT E' },
  { roll_no: '727824TUIT027', name: 'Barath', parent_phone: '9842650825', section: 'III IT E' },
  { roll_no: '727824TUIT028', name: 'Bragadeesh', parent_phone: '9943715491', section: 'III IT E' },
  { roll_no: '727824TUIT029', name: 'Darshini', parent_phone: '9943137170', section: 'III IT E' },
  { roll_no: '727824TUIT030', name: 'Deepak', parent_phone: null, section: 'III IT E' },
  { roll_no: '727824TUIT031', name: 'Deepika', parent_phone: '9943508753', section: 'III IT E' },
  { roll_no: '727824TUIT032', name: 'Deepthasri', parent_phone: '7010639005', section: 'III IT E' },
  { roll_no: '727824TUIT033', name: 'Dhanusha', parent_phone: '9965124646', section: 'III IT E' },
  { roll_no: '727824TUIT034', name: 'Dhanyasri', parent_phone: '9843046578', section: 'III IT E' },
  { roll_no: '727824TUIT035', name: 'Dharrshinii', parent_phone: '9790411155', section: 'III IT E' },
  { roll_no: '727824TUIT036', name: 'Dharshini', parent_phone: '9942033344', section: 'III IT E' },
  { roll_no: '727824TUIT037', name: 'DHARUN', parent_phone: '9865528990', section: 'III IT E' },
  { roll_no: '727824TUIT038', name: 'Dharunika', parent_phone: '9965569512', section: 'III IT E' },
  { roll_no: '727824TUIT039', name: 'Dhisiharan', parent_phone: '6382346425', section: 'III IT E' },
  { roll_no: '727824TUIT040', name: 'DHIYANESHWAR', parent_phone: '9787240392', section: 'III IT E' },
  { roll_no: '727824TUIT041', name: 'Dineshkumar', parent_phone: '9944154843', section: 'III IT E' },
  { roll_no: '727824TUIT042', name: 'Dinesh', parent_phone: '8015691803', section: 'III IT E' },
  { roll_no: '727824TUIT043', name: 'Divya', parent_phone: '8525013270', section: 'III IT E' },
  { roll_no: '727824TUIT044', name: 'Divyadharshini', parent_phone: null, section: 'III IT E' },
  { roll_no: '727824TUIT045', name: 'Divyasagar', parent_phone: '9840071706', section: 'III IT E' },
  { roll_no: '727824TUIT046', name: 'Edwin', parent_phone: '9655280535', section: 'III IT E' },
  { roll_no: '727824TUIT047', name: 'Gokul', parent_phone: '9003119826', section: 'III IT E' },
  { roll_no: '727824TUIT048', name: 'Gopinath', parent_phone: '8547177517', section: 'III IT E' },
  { roll_no: '727824TUIT049', name: 'Gowsik', parent_phone: '9976628739', section: 'III IT E' },
  { roll_no: '727824TUIT050', name: 'Gowtham Peiyasamy', parent_phone: '9443124662', section: 'III IT E' },
  { roll_no: '727824TUIT051', name: 'GURU VISHAL', parent_phone: '6585915716', section: 'III IT E' },
  { roll_no: '727824TUIT052', name: 'Guruchandru', parent_phone: '8220014301', section: 'III IT E' },
  { roll_no: '727824TUIT053', name: 'Hari', parent_phone: '9976261189', section: 'III IT E' },
  { roll_no: '727824TUIT054', name: 'Hari', parent_phone: '9443201719', section: 'III IT E' },
  { roll_no: '727824TUIT055', name: 'Hariraj', parent_phone: '6383360382', section: 'III IT E' },
  { roll_no: '727824TUIT056', name: 'Harish', parent_phone: '9443524633', section: 'III IT E' },
  { roll_no: '727824TUIT057', name: 'Harish kumar', parent_phone: '8870621564', section: 'III IT E' },
  { roll_no: '727824TUIT058', name: 'Harsha', parent_phone: '9894651881', section: 'III IT E' },
  { roll_no: '727824TUIT059', name: 'Iniya', parent_phone: '9659840978', section: 'III IT E' },
  { roll_no: '727825TUIT602', name: 'karthik', parent_phone: '9791930590', section: 'III IT E' },
  { roll_no: '727825TUIT603', name: 'LOGESWARAN', parent_phone: '9788627430', section: 'III IT E' }
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
      await Student.findOrCreate({
        where: { roll_no: st.roll_no },
        defaults: st
      });
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
