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
      password: 'AdminSKCT@123',
      department: 'IT'
    });

    const guranna = await Teacher.create({ name: 'Mr. Guranna', email: 'guranna@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });
    const narmatha = await Teacher.create({ name: 'Ms. B Narmatha', email: 'narmatha@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });
    const saranya = await Teacher.create({ name: 'Ms. S Saranya', email: 'saranya@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });
    const edwin = await Teacher.create({ name: 'Dr G Edwin Prem Kumar', email: 'edwin@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });
    const ratheesh = await Teacher.create({ name: 'Mr A M Ratheeshkumar', email: 'ratheesh@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });
    const mouneesh = await Teacher.create({ name: 'Mr Mouneesh', email: 'mouneesh@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });
    const crown = await Teacher.create({ name: 'Mr Crown', email: 'crown@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });
    const gayathri = await Teacher.create({ name: 'Ms Gayathri', email: 'gayathri@skct.edu.in', password: 'AdminSKCT@123', department: 'IT' });

    // 2. Create Students
    const studentsDataE = [
  {
    "roll_no": "727824TUIT001",
    "name": "ABDUL",
    "parent_phone": "8072654818"
  },
  {
    "roll_no": "727824TUIT002",
    "name": "Abhinav",
    "parent_phone": "9042059126"
  },
  {
    "roll_no": "727824TUIT003",
    "name": "ABISHA",
    "parent_phone": "9944153519"
  },
  {
    "roll_no": "727824TUIT004",
    "name": "ABISHEK",
    "parent_phone": "9786478493"
  },
  {
    "roll_no": "727824TUIT005",
    "name": "ABISHEK",
    "parent_phone": "9095056349"
  },
  {
    "roll_no": "727824TUIT006",
    "name": "ADEEB",
    "parent_phone": "8903413308"
  },
  {
    "roll_no": "727824TUIT007",
    "name": "ADHITYA",
    "parent_phone": "9443745600"
  },
  {
    "roll_no": "727824TUIT008",
    "name": "AJAY",
    "parent_phone": "9382618660"
  },
  {
    "roll_no": "727824TUIT009",
    "name": "Alagumaris",
    "parent_phone": "9047889619"
  },
  {
    "roll_no": "727824TUIT010",
    "name": "Amrisha",
    "parent_phone": "8973820746"
  },
  {
    "roll_no": "727824TUIT011",
    "name": "Amritha",
    "parent_phone": "9965312843"
  },
  {
    "roll_no": "727824TUIT012",
    "name": "Anand",
    "parent_phone": "7868086675"
  },
  {
    "roll_no": "727824TUIT013",
    "name": "Ananya",
    "parent_phone": "9443715423"
  },
  {
    "roll_no": "727824TUIT014",
    "name": "ANBUSELVAN",
    "parent_phone": "9442764007"
  },
  {
    "roll_no": "727824TUIT015",
    "name": "Anisha",
    "parent_phone": "8695376080"
  },
  {
    "roll_no": "727824TUIT016",
    "name": "Arasan",
    "parent_phone": "8925124068"
  },
  {
    "roll_no": "727824TUIT017",
    "name": "INIYABHARATHI",
    "parent_phone": "9942227987"
  },
  {
    "roll_no": "727824TUIT018",
    "name": "Arun Prasath",
    "parent_phone": "9843247303"
  },
  {
    "roll_no": "727824TUIT019",
    "name": "Ashwanth",
    "parent_phone": "9942775720"
  },
  {
    "roll_no": "727824TUIT020",
    "name": "Janani",
    "parent_phone": "6381683123"
  },
  {
    "roll_no": "727824TUIT021",
    "name": "Aswath",
    "parent_phone": "9944684142"
  },
  {
    "roll_no": "727824TUIT022",
    "name": "Aswen",
    "parent_phone": "9159170300"
  },
  {
    "roll_no": "727824TUIT023",
    "name": "Aswin",
    "parent_phone": "9003385557"
  },
  {
    "roll_no": "727824TUIT024",
    "name": "Athesh",
    "parent_phone": "6374681581"
  },
  {
    "roll_no": "727824TUIT025",
    "name": "Athish",
    "parent_phone": "9486888654"
  },
  {
    "roll_no": "727824TUIT026",
    "name": "Balamanikandan",
    "parent_phone": null
  },
  {
    "roll_no": "727824TUIT027",
    "name": "Barath",
    "parent_phone": "9842650825"
  },
  {
    "roll_no": "727824TUIT028",
    "name": "Bragadeesh",
    "parent_phone": "9943715491"
  },
  {
    "roll_no": "727824TUIT029",
    "name": "Darshini",
    "parent_phone": "9943137170"
  },
  {
    "roll_no": "727824TUIT030",
    "name": "Deepak",
    "parent_phone": null
  },
  {
    "roll_no": "727824TUIT031",
    "name": "Deepika",
    "parent_phone": "9943508753"
  },
  {
    "roll_no": "727824TUIT032",
    "name": "Deepthasri",
    "parent_phone": "7010639005"
  },
  {
    "roll_no": "727824TUIT033",
    "name": "Dhanusha",
    "parent_phone": "9965124646"
  },
  {
    "roll_no": "727824TUIT034",
    "name": "Dhanyasri",
    "parent_phone": "9843046578"
  },
  {
    "roll_no": "727824TUIT035",
    "name": "Dharrshinii",
    "parent_phone": "9790411155"
  },
  {
    "roll_no": "727824TUIT036",
    "name": "Dharshini",
    "parent_phone": "9942033344"
  },
  {
    "roll_no": "727824TUIT037",
    "name": "DHARUN",
    "parent_phone": "9865528990"
  },
  {
    "roll_no": "727824TUIT038",
    "name": "Dharunika",
    "parent_phone": "9965569512"
  },
  {
    "roll_no": "727824TUIT039",
    "name": "Dhisiharan",
    "parent_phone": "6382346425"
  },
  {
    "roll_no": "727824TUIT040",
    "name": "DHIYANESHWAR",
    "parent_phone": "9787240392"
  },
  {
    "roll_no": "727824TUIT041",
    "name": "Dineshkumar",
    "parent_phone": "9944154843"
  },
  {
    "roll_no": "727824TUIT042",
    "name": "Dinesh",
    "parent_phone": "8015691803"
  },
  {
    "roll_no": "727824TUIT043",
    "name": "Divya",
    "parent_phone": "8525013270"
  },
  {
    "roll_no": "727824TUIT044",
    "name": "Divyadharshini",
    "parent_phone": null
  },
  {
    "roll_no": "727824TUIT045",
    "name": "Divyasagar",
    "parent_phone": "9840071706"
  },
  {
    "roll_no": "727824TUIT046",
    "name": "Edwin",
    "parent_phone": "9655280535"
  },
  {
    "roll_no": "727824TUIT047",
    "name": "Gokul",
    "parent_phone": "9003119826"
  },
  {
    "roll_no": "727824TUIT048",
    "name": "Gopinath",
    "parent_phone": "8547177517"
  },
  {
    "roll_no": "727824TUIT049",
    "name": "Gowsik",
    "parent_phone": "9976628739"
  },
  {
    "roll_no": "727824TUIT050",
    "name": "Gowtham Peiyasamy",
    "parent_phone": "9443124662"
  },
  {
    "roll_no": "727824TUIT051",
    "name": "GURU VISHAL",
    "parent_phone": "6585915716"
  },
  {
    "roll_no": "727824TUIT052",
    "name": "Guruchandru",
    "parent_phone": "8220014301"
  },
  {
    "roll_no": "727824TUIT053",
    "name": "Hari",
    "parent_phone": "9976261189"
  },
  {
    "roll_no": "727824TUIT054",
    "name": "Hari",
    "parent_phone": "9443201719"
  },
  {
    "roll_no": "727824TUIT055",
    "name": "Hariraj",
    "parent_phone": "6383360382"
  },
  {
    "roll_no": "727824TUIT056",
    "name": "Harish",
    "parent_phone": "9443524633"
  },
  {
    "roll_no": "727824TUIT057",
    "name": "Harish kumar",
    "parent_phone": "8870621564"
  },
  {
    "roll_no": "727824TUIT058",
    "name": "Harsha",
    "parent_phone": "9894651881"
  },
  {
    "roll_no": "727824TUIT059",
    "name": "Iniya",
    "parent_phone": "9659840978"
  },
  {
    "roll_no": "727825TUIT602",
    "name": "karthik",
    "parent_phone": "9791930590"
  },
  {
    "roll_no": "727825TUIT603",
    "name": "LOGESWARAN",
    "parent_phone": "9788627430"
  }
].map(s => ({ ...s, section: 'III IT E' }));

    await Student.bulkCreate(studentsData);
    await Student.bulkCreate(studentsDataE);

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
