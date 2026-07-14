const { sequelize, Teacher, Student, Subject, Timetable, Attendance } = require('./db');

const studentsData = [
  { roll_no: '727824TUIT201', name: 'SAISATHYASHREE' },
  { roll_no: '727824TUIT202', name: 'SAKKTHI SRI S' },
  { roll_no: '727824TUIT203', name: 'SAKTHI SUNDARESAN S' },
  { roll_no: '727824TUIT204', name: 'SAKTHII SUNDHAR J' },
  { roll_no: '727824TUIT205', name: 'SAKTHIVEL B' },
  { roll_no: '727824TUIT206', name: 'SANJAY B' },
  { roll_no: '727824TUIT207', name: 'SANJEEVAN V G' },
  { roll_no: '727824TUIT208', name: 'SANJITH S' },
  { roll_no: '727824TUIT209', name: 'SATHYA E' },
  { roll_no: '727824TUIT210', name: 'SATHYAJIT R' },
  { roll_no: '727824TUIT211', name: 'SELVAPRIYA K' },
  { roll_no: '727824TUIT212', name: 'SELVASURYA GANESH' },
  { roll_no: '727824TUIT213', name: 'SHAGIN DHARSHANTH M' },
  { roll_no: '727824TUIT214', name: 'SHAGUL HAMEED M' },
  { roll_no: '727824TUIT215', name: 'SHARAN V' },
  { roll_no: '727824TUIT216', name: 'SHARIF AHAMED S' },
  { roll_no: '727824TUIT217', name: 'SHIVA SHARMA V M' },
  { roll_no: '727824TUIT218', name: 'SHRIYA R' },
  { roll_no: '727824TUIT219', name: 'SIDHARTH D' },
  { roll_no: '727824TUIT220', name: 'SINESHANA S J' },
  { roll_no: '727824TUIT221', name: 'SIVAKUMAR B' },
  { roll_no: '727824TUIT222', name: 'SNEKITHAA SG' },
  { roll_no: '727824TUIT223', name: 'SOWMIYA SREE K K' },
  { roll_no: '727824TUIT224', name: 'SREE MEENA M' },
  { roll_no: '727824TUIT225', name: 'SREE VISHAL M' },
  { roll_no: '727824TUIT226', name: 'SREENITHI A' },
  { roll_no: '727824TUIT227', name: 'SRI HARI K' },
  { roll_no: '727824TUIT228', name: 'SRINIDHI R' },
  { roll_no: '727824TUIT229', name: 'SRINITHI S' },
  { roll_no: '727824TUIT230', name: 'SRISANJAYKUMAR S' },
  { roll_no: '727824TUIT231', name: 'SRIVARSHINI S' },
  { roll_no: '727824TUIT232', name: 'SRUTHI R' },
  { roll_no: '727824TUIT233', name: 'SUBASH S' },
  { roll_no: '727824TUIT234', name: 'SUBBU VASANTH T' },
  { roll_no: '727824TUIT235', name: 'SUBHIKSHA M' },
  { roll_no: '727824TUIT236', name: 'SUDHAN B' },
  { roll_no: '727824TUIT237', name: 'SUJAN S' },
  { roll_no: '727824TUIT238', name: 'SURESH KUMAR C' },
  { roll_no: '727824TUIT239', name: 'SURYA M' },
  { roll_no: '727824TUIT240', name: 'SUSMITHA SHREE P' },
  { roll_no: '727824TUIT241', name: 'TARUNIKA K' },
  { roll_no: '727824TUIT242', name: 'THAMARAISELVAN E' },
  { roll_no: '727824TUIT243', name: 'THARANEESH D R' },
  { roll_no: '727824TUIT244', name: 'THARIKASINI M S' },
  { roll_no: '727824TUIT245', name: 'THARSHINI L' },
  { roll_no: '727824TUIT246', name: 'THILAGAVATHI R' },
  { roll_no: '727824TUIT247', name: 'THIRUVASAGAN T' },
  { roll_no: '727824TUIT248', name: 'VIJAYAMBIGAI D' },
  { roll_no: '727824TUIT249', name: 'VIJAYAPRADHA R' },
  { roll_no: '727824TUIT250', name: 'VIJEYENDHARAN V M' },
  { roll_no: '727824TUIT251', name: 'VIKRAM M' },
  { roll_no: '727824TUIT252', name: 'VISHAL E' },
  { roll_no: '727824TUIT253', name: 'VISHAL S' },
  { roll_no: '727824TUIT254', name: 'VISHNU KUMAR M' },
  { roll_no: '727824TUIT255', name: 'VISHNUKUMAR S' },
  { roll_no: '727824TUIT256', name: 'VISHVARUBAN S' },
  { roll_no: '727824TUIT257', name: 'VISHWA B' },
  { roll_no: '727824TUIT258', name: 'VIVIDHAN L', parent_phone: '9442211279' },
  { roll_no: '727824TUIT259', name: 'YADHAVASIVA V' },
  { roll_no: '727824TUIT260', name: 'YAZHINI M B' },
  { roll_no: '727824TUIT261', name: 'YUVAN M' },
  { roll_no: '727824TUIT262', name: 'YUVANSRI V' },
  { roll_no: '727824TUIT263', name: 'VARSHA R' },
].map(s => ({ ...s, section: 'III IT G' }));

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced successfully!');

    // 1. Create Teachers
    const defaultTeacher = await Teacher.create({
      name: 'Default Faculty',
      email: 'name@skct.edu.in',
      password: 'SKCT@123admin', // Stored plainly for prototype
      department: 'IT'
    });

    const guranna = await Teacher.create({ name: 'Mr. Guranna', email: 'guranna@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });
    const narmatha = await Teacher.create({ name: 'Ms. B Narmatha', email: 'narmatha@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });
    const saranya = await Teacher.create({ name: 'Ms. S Saranya', email: 'saranya@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });
    const edwin = await Teacher.create({ name: 'Dr G Edwin Prem Kumar', email: 'edwin@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });
    const ratheesh = await Teacher.create({ name: 'Mr A M Ratheeshkumar', email: 'ratheesh@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });
    const mouneesh = await Teacher.create({ name: 'Mr Mouneesh', email: 'mouneesh@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });
    const crown = await Teacher.create({ name: 'Mr Crown', email: 'crown@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });
    const gayathri = await Teacher.create({ name: 'Ms Gayathri', email: 'gayathri@skct.edu.in', password: 'SKCT@123admin', department: 'IT' });

    // 2. Create Students
    await Student.bulkCreate(studentsData);

    // 3. Create Subjects
    const subST = await Subject.create({ code: '23CS502', acronym: 'ST', title: 'Software Testing' });
    const subCISM = await Subject.create({ code: '23CS504', acronym: 'CISM', title: 'Cloud Infrastructure and Services Management' });
    const subAC = await Subject.create({ code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' });
    const subDC = await Subject.create({ code: '23ITC03', acronym: 'DC', title: 'Distributed Computing' });
    const subAD = await Subject.create({ code: '23IT50X', acronym: 'AD', title: 'Application Development' });
    const subTWM = await Subject.create({ code: '23IT50Y', acronym: 'TWM', title: 'Technical Web M' });

    // 4. Create Timetable (III IT G)
    const timetableData = [
      // DAY 1
      { day: 1, period: 1, section: 'III IT G', subject_id: subST.id, teacher_id: guranna.id },
      { day: 1, period: 2, section: 'III IT G', subject_id: subST.id, teacher_id: guranna.id },
      { day: 1, period: 3, section: 'III IT G', subject_id: subDC.id, teacher_id: saranya.id },
      { day: 1, period: 4, section: 'III IT G', subject_id: subAC.id, teacher_id: narmatha.id },
      { day: 1, period: 5, section: 'III IT G', subject_id: subAC.id, teacher_id: narmatha.id },
      // DAY 2
      { day: 2, period: 1, section: 'III IT G', subject_id: subAD.id, teacher_id: defaultTeacher.id },
      { day: 2, period: 2, section: 'III IT G', subject_id: subAD.id, teacher_id: defaultTeacher.id },
      { day: 2, period: 3, section: 'III IT G', subject_id: subAC.id, teacher_id: narmatha.id },
      { day: 2, period: 4, section: 'III IT G', subject_id: subAC.id, teacher_id: narmatha.id },
      { day: 2, period: 5, section: 'III IT G', subject_id: subST.id, teacher_id: guranna.id },
      // DAY 3
      { day: 3, period: 1, section: 'III IT G', subject_id: subCISM.id, teacher_id: guranna.id },
      { day: 3, period: 2, section: 'III IT G', subject_id: subCISM.id, teacher_id: guranna.id },
      { day: 3, period: 3, section: 'III IT G', subject_id: subST.id, teacher_id: guranna.id },
      { day: 3, period: 4, section: 'III IT G', subject_id: subST.id, teacher_id: guranna.id },
      { day: 3, period: 5, section: 'III IT G', subject_id: subDC.id, teacher_id: saranya.id },
      // DAY 4
      { day: 4, period: 1, section: 'III IT G', subject_id: subAC.id, teacher_id: narmatha.id },
      { day: 4, period: 2, section: 'III IT G', subject_id: subDC.id, teacher_id: saranya.id },
      { day: 4, period: 3, section: 'III IT G', subject_id: subCISM.id, teacher_id: guranna.id },
      { day: 4, period: 4, section: 'III IT G', subject_id: subCISM.id, teacher_id: guranna.id },
      { day: 4, period: 5, section: 'III IT G', subject_id: subTWM.id, teacher_id: defaultTeacher.id },
      // DAY 5
      { day: 5, period: 1, section: 'III IT G', subject_id: subAC.id, teacher_id: narmatha.id },
      { day: 5, period: 2, section: 'III IT G', subject_id: subDC.id, teacher_id: saranya.id },
      { day: 5, period: 3, section: 'III IT G', subject_id: subAD.id, teacher_id: defaultTeacher.id },
      { day: 5, period: 4, section: 'III IT G', subject_id: subAD.id, teacher_id: defaultTeacher.id },
      { day: 5, period: 5, section: 'III IT G', subject_id: subDC.id, teacher_id: saranya.id },
    ];
    await Timetable.bulkCreate(timetableData);

    // 5. Create Timetable (III IT E)
    const timetableDataE = [
      // DAY 1
      { day: 1, period: 1, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      { day: 1, period: 2, section: 'III IT E', subject_id: subAD.id, teacher_id: gayathri.id },
      { day: 1, period: 3, section: 'III IT E', subject_id: subAD.id, teacher_id: gayathri.id },
      { day: 1, period: 4, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      { day: 1, period: 5, section: 'III IT E', subject_id: subDC.id, teacher_id: ratheesh.id },
      // DAY 2
      { day: 2, period: 1, section: 'III IT E', subject_id: subST.id, teacher_id: mouneesh.id },
      { day: 2, period: 2, section: 'III IT E', subject_id: subST.id, teacher_id: mouneesh.id },
      { day: 2, period: 3, section: 'III IT E', subject_id: subCISM.id, teacher_id: crown.id },
      { day: 2, period: 4, section: 'III IT E', subject_id: subCISM.id, teacher_id: crown.id },
      { day: 2, period: 5, section: 'III IT E', subject_id: subAC.id, teacher_id: edwin.id },
      // DAY 3
      { day: 3, period: 1, section: 'III IT E', subject_id: subAD.id, teacher_id: gayathri.id },
      { day: 3, period: 2, section: 'III IT E', subject_id: subAD.id, teacher_id: gayathri.id },
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
    await Timetable.bulkCreate(timetableDataE);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
