require('dotenv').config();
const { sequelize, Student } = require('./db');

const studentPhoneMapping = [
  { roll_no: '727824TUIT201', parent_phone: '9790582650' },
  { roll_no: '727824TUIT202', parent_phone: '9944900010' },
  { roll_no: '727824TUIT203', parent_phone: '6369770535' },
  { roll_no: '727824TUIT204', parent_phone: '9865577282' },
  { roll_no: '727824TUIT205', parent_phone: '7418683535' },
  { roll_no: '727824TUIT206', parent_phone: '9360447541' },
  { roll_no: '727824TUIT207', parent_phone: '9786177899' },
  { roll_no: '727824TUIT208', parent_phone: '9787105714' },
  { roll_no: '727824TUIT209', parent_phone: '9865976429' },
  { roll_no: '727824TUIT210', parent_phone: '9443962404' },
  { roll_no: '727824TUIT211', parent_phone: '9486682831' },
  { roll_no: '727824TUIT212', parent_phone: '9715127046' },
  { roll_no: '727824TUIT213', parent_phone: '7358893717' },
  { roll_no: '727824TUIT214', parent_phone: '8056403186' },
  { roll_no: '727824TUIT215', parent_phone: '6383590449' },
  { roll_no: '727824TUIT216', parent_phone: '7708817965' },
  { roll_no: '727824TUIT217', parent_phone: '9443823330' },
  { roll_no: '727824TUIT218', parent_phone: '9443304580' },
  { roll_no: '727824TUIT219', parent_phone: '9952537522' },
  { roll_no: '727824TUIT220', parent_phone: '9344999880' },
  { roll_no: '727824TUIT221', parent_phone: '9788553155' },
  { roll_no: '727824TUIT222', parent_phone: '9994131400' },
  { roll_no: '727824TUIT223', parent_phone: '9994630020' },
  { roll_no: '727824TUIT224', parent_phone: '9486508093' },
  { roll_no: '727824TUIT225', parent_phone: '8754071402' },
  { roll_no: '727824TUIT226', parent_phone: '9025334635' },
  { roll_no: '727824TUIT227', parent_phone: '7200068716' },
  { roll_no: '727824TUIT228', parent_phone: '9751616383' },
  { roll_no: '727824TUIT229', parent_phone: '8098215359' },
  { roll_no: '727824TUIT230', parent_phone: '9787701167' },
  { roll_no: '727824TUIT231', parent_phone: '9361949209' },
  { roll_no: '727824TUIT232', parent_phone: '9363912772' },
  { roll_no: '727824TUIT233', parent_phone: '6382631776' },
  { roll_no: '727824TUIT234', parent_phone: '9443135524' },
  { roll_no: '727824TUIT235', parent_phone: '9994818528' },
  { roll_no: '727824TUIT236', parent_phone: '6382643475' },
  { roll_no: '727824TUIT237', parent_phone: '9095302399' },
  { roll_no: '727824TUIT238', parent_phone: '9150433756' },
  { roll_no: '727824TUIT239', parent_phone: '9486547775' },
  { roll_no: '727824TUIT240', parent_phone: '9677722038' },
  { roll_no: '727824TUIT241', parent_phone: '9787190902' },
  { roll_no: '727824TUIT242', parent_phone: '8760395643' },
  { roll_no: '727824TUIT243', parent_phone: '9916647912' },
  { roll_no: '727824TUIT244', parent_phone: '9442580008' },
  { roll_no: '727824TUIT245', parent_phone: '9003931825' },
  { roll_no: '727824TUIT246', parent_phone: '9894662066' },
  { roll_no: '727824TUIT247', parent_phone: '9943509373' },
  { roll_no: '727824TUIT248', parent_phone: '9994463724' },
  { roll_no: '727824TUIT249', parent_phone: '7373489528' },
  { roll_no: '727824TUIT250', parent_phone: '8667581673' },
  { roll_no: '727824TUIT251', parent_phone: '9095581559' },
  { roll_no: '727824TUIT252', parent_phone: '9994406380' },
  { roll_no: '727824TUIT253', parent_phone: '9943161933' },
  { roll_no: '727824TUIT254', parent_phone: '8508335266' },
  { roll_no: '727824TUIT255', parent_phone: '8973634300' },
  { roll_no: '727824TUIT256', parent_phone: '9443627908' },
  { roll_no: '727824TUIT257', parent_phone: '8072021307' },
  { roll_no: '727824TUIT258', parent_phone: '8608549489' },
  { roll_no: '727824TUIT259', parent_phone: '9543601004' },
  { roll_no: '727824TUIT260', parent_phone: '7708248075' },
  { roll_no: '727824TUIT261', parent_phone: '9994957328' },
  { roll_no: '727824TUIT262', parent_phone: '8056340346' },
  { roll_no: '727824TUIT263', parent_phone: '9994896667' },
];

async function updatePhones() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL DB successfully.');

    let updatedCount = 0;
    for (const item of studentPhoneMapping) {
      const [affected] = await Student.update(
        { parent_phone: item.parent_phone },
        { where: { roll_no: item.roll_no } }
      );
      if (affected > 0) updatedCount++;
    }

    console.log(`Successfully updated parent phone numbers for ${updatedCount} students!`);

    const students = await Student.findAll({
      where: { section: 'III IT G' },
      attributes: ['roll_no', 'name', 'parent_phone'],
      order: [['roll_no', 'ASC']]
    });

    console.table(students.map(s => s.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error('Failed to update student parent phones:', err);
    process.exit(1);
  }
}

updatePhones();
