const { sequelize, Teacher, Timetable, Subject } = require('./db');

async function updateFaculty() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    // Find or create Ms. Vaishnavi
    let [vaishnavi] = await Teacher.findOrCreate({
      where: { email: 'vaishnavi@skct.edu.in' },
      defaults: {
        name: 'Ms. Vaishnavi',
        email: 'vaishnavi@skct.edu.in',
        password: 'AdminSKCT@123',
        department: 'IT'
      }
    });

    console.log(`Teacher Ms. Vaishnavi ready with ID ${vaishnavi.id}`);

    // Update timetable for AD
    const adSubject = await Subject.findOne({ where: { acronym: 'AD' } });

    if (adSubject) {
      const [updatedCount] = await Timetable.update(
        { teacher_id: vaishnavi.id },
        {
          where: {
            section: 'III IT E',
            subject_id: adSubject.id
          }
        }
      );
      console.log(`Updated ${updatedCount} timetable slots for III IT E - Application Development to Ms. Vaishnavi (ID: ${vaishnavi.id}).`);
    }

    // Verify timetable mapping for III IT E
    const slots = await Timetable.findAll({
      where: { section: 'III IT E' },
      include: [Subject, Teacher]
    });

    console.log('\n--- III IT E Timetable Summary ---');
    slots.forEach(s => {
      console.log(`Day ${s.day} | Period ${s.period} | ${s.Subject?.acronym} (${s.Subject?.title}) | Teacher: ${s.Teacher?.name} (${s.Teacher?.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating faculty:', error);
    process.exit(1);
  }
}

updateFaculty();
