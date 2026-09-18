const { sequelize, Teacher, Student, Subject, Timetable } = require('./db');

const studentsDataG = [
  { roll_no: '727824TUIT201', name: 'SAISATHYASHREE', parent_phone: '9790582650' },
  { roll_no: '727824TUIT202', name: 'SAKKTHI SRI S', parent_phone: '9944900010' },
  { roll_no: '727824TUIT203', name: 'SAKTHI SUNDARESAN S', parent_phone: '6369770535' },
  { roll_no: '727824TUIT204', name: 'SAKTHII SUNDHAR J', parent_phone: '9865577282' },
  { roll_no: '727824TUIT205', name: 'SAKTHIVEL B', parent_phone: '7418683535' },
  { roll_no: '727824TUIT206', name: 'SANJAY B', parent_phone: '9360447541' },
  { roll_no: '727824TUIT207', name: 'SANJEEVAN V G', parent_phone: '9786177899' },
  { roll_no: '727824TUIT208', name: 'SANJITH S', parent_phone: '9787105714' },
  { roll_no: '727824TUIT209', name: 'SATHYA E', parent_phone: '9865976429' },
  { roll_no: '727824TUIT210', name: 'SATHYAJIT R', parent_phone: '9443962404' },
  { roll_no: '727824TUIT211', name: 'SELVAPRIYA K', parent_phone: '9486682831' },
  { roll_no: '727824TUIT212', name: 'SELVASURYA GANESH', parent_phone: '9715127046' },
  { roll_no: '727824TUIT213', name: 'SHAGIN DHARSHANTH M', parent_phone: '7358893717' },
  { roll_no: '727824TUIT214', name: 'SHAGUL HAMEED M', parent_phone: '8056403186' },
  { roll_no: '727824TUIT215', name: 'SHARAN V', parent_phone: '6383590449' },
  { roll_no: '727824TUIT216', name: 'SHARIF AHAMED S', parent_phone: '7708817965' },
  { roll_no: '727824TUIT217', name: 'SHIVA SHARMA V M', parent_phone: '9443823330' },
  { roll_no: '727824TUIT218', name: 'SHRIYA R', parent_phone: '9443304580' },
  { roll_no: '727824TUIT219', name: 'SIDHARTH D', parent_phone: '9952537522' },
  { roll_no: '727824TUIT220', name: 'SINESHANA S J', parent_phone: '9344999880' },
  { roll_no: '727824TUIT221', name: 'SIVAKUMAR B', parent_phone: '9788553155' },
  { roll_no: '727824TUIT222', name: 'SNEKITHAA SG', parent_phone: '9994131400' },
  { roll_no: '727824TUIT223', name: 'SOWMIYA SREE K K', parent_phone: '9994630020' },
  { roll_no: '727824TUIT224', name: 'SREE MEENA M', parent_phone: '9486508093' },
  { roll_no: '727824TUIT225', name: 'SREE VISHAL M', parent_phone: '8754071402' },
  { roll_no: '727824TUIT226', name: 'SREENITHI A', parent_phone: '9025334635' },
  { roll_no: '727824TUIT227', name: 'SRI HARI K', parent_phone: '7200068716' },
  { roll_no: '727824TUIT228', name: 'SRINIDHI R', parent_phone: '9751616383' },
  { roll_no: '727824TUIT229', name: 'SRINITHI S', parent_phone: '8098215359' },
  { roll_no: '727824TUIT230', name: 'SRISANJAYKUMAR S', parent_phone: '9787701167' },
  { roll_no: '727824TUIT231', name: 'SRIVARSHINI S', parent_phone: '9361949209' },
  { roll_no: '727824TUIT232', name: 'SRUTHI R', parent_phone: '9363912772' },
  { roll_no: '727824TUIT233', name: 'SUBASH S', parent_phone: '6382631776' },
  { roll_no: '727824TUIT234', name: 'SUBBU VASANTH T', parent_phone: '9443135524' },
  { roll_no: '727824TUIT235', name: 'SUBHIKSHA M', parent_phone: '9994818528' },
  { roll_no: '727824TUIT236', name: 'SUDHAN B', parent_phone: '6382643475' },
  { roll_no: '727824TUIT237', name: 'SUJAN S', parent_phone: '9095302399' },
  { roll_no: '727824TUIT238', name: 'SURESH KUMAR C', parent_phone: '9150433756' },
  { roll_no: '727824TUIT239', name: 'SURYA M', parent_phone: '9486547775' },
  { roll_no: '727824TUIT240', name: 'SUSMITHA SHREE P', parent_phone: '9677722038' },
  { roll_no: '727824TUIT241', name: 'TARUNIKA K', parent_phone: '9787190902' },
  { roll_no: '727824TUIT242', name: 'THAMARAISELVAN E', parent_phone: '8760395643' },
  { roll_no: '727824TUIT243', name: 'THARANEESH D R', parent_phone: '9916647912' },
  { roll_no: '727824TUIT244', name: 'THARIKASINI M S', parent_phone: '9442580008' },
  { roll_no: '727824TUIT245', name: 'THARSHINI L', parent_phone: '9003931825' },
  { roll_no: '727824TUIT246', name: 'THILAGAVATHI R', parent_phone: '9894662066' },
  { roll_no: '727824TUIT247', name: 'THIRUVASAGAN T', parent_phone: '9943509373' },
  { roll_no: '727824TUIT248', name: 'VIJAYAMBIGAI D', parent_phone: '9994463724' },
  { roll_no: '727824TUIT249', name: 'VIJAYAPRADHA R', parent_phone: '7373489528' },
  { roll_no: '727824TUIT250', name: 'VIJEYENDHARAN V M', parent_phone: '8667581673' },
  { roll_no: '727824TUIT251', name: 'VIKRAM M', parent_phone: '9095581559' },
  { roll_no: '727824TUIT252', name: 'VISHAL E', parent_phone: '9994406380' },
  { roll_no: '727824TUIT253', name: 'VISHAL S', parent_phone: '9943161933' },
  { roll_no: '727824TUIT254', name: 'VISHNU KUMAR M', parent_phone: '8508335266' },
  { roll_no: '727824TUIT255', name: 'VISHNUKUMAR S', parent_phone: '8973634300' },
  { roll_no: '727824TUIT256', name: 'VISHVARUBAN S', parent_phone: '9443627908' },
  { roll_no: '727824TUIT257', name: 'VISHWA B', parent_phone: '8072021307' },
  { roll_no: '727824TUIT258', name: 'VIVIDHAN L', parent_phone: '8608549489' },
  { roll_no: '727824TUIT259', name: 'YADHAVASIVA V', parent_phone: '9543601004' },
  { roll_no: '727824TUIT260', name: 'YAZHINI M B', parent_phone: '7708248075' },
  { roll_no: '727824TUIT261', name: 'YUVAN M', parent_phone: '9994957328' },
  { roll_no: '727824TUIT262', name: 'YUVANSRI V', parent_phone: '8056340346' },
  { roll_no: '727824TUIT263', name: 'VARSHA R', parent_phone: '9994896667' },
].map(s => ({ ...s, section: 'III IT G' }));

async function seedSectionG() {
  try {
    await sequelize.authenticate();
    console.log(`Seeding ${studentsDataG.length} students for III IT G...`);
    for (const st of studentsDataG) {
      await Student.findOrCreate({
        where: { roll_no: st.roll_no },
        defaults: st
      });
    }
    const countG = await Student.count({ where: { section: 'III IT G' } });
    console.log(`III IT G seeding complete! Total Students in III IT G: ${countG}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding section G:', err);
    process.exit(1);
  }
}

seedSectionG();
