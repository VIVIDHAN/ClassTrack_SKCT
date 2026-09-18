const { sequelize, Teacher, Student, Subject, Timetable, Attendance } = require('./db');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('=== CLASSTRACK AWS RDS MYSQL DB SUMMARY ===\n');

    // 1. Student Count by Section
    const studentsG = await Student.count({ where: { section: 'III IT G' } });
    const studentsE = await Student.count({ where: { section: 'III IT E' } });
    const totalStudents = await Student.count();

    console.log(`[STUDENTS]`);
    console.log(`- Section III IT G: ${studentsG} students`);
    console.log(`- Section III IT E: ${studentsE} students`);
    console.log(`- Total Students: ${totalStudents}\n`);

    // 2. Teachers List
    const teachers = await Teacher.findAll({ order: [['id', 'ASC']] });
    console.log(`[TEACHERS (${teachers.length})]`);
    teachers.forEach(t => {
      console.log(`  ID ${t.id}: ${t.name} (${t.email}) - Dept: ${t.department || 'IT'}`);
    });
    console.log('');

    // 3. Timetable Summary for III IT E
    const ttE = await Timetable.findAll({
      where: { section: 'III IT E' },
      include: [Subject, Teacher],
      order: [['day', 'ASC'], ['period', 'ASC']]
    });
    console.log(`[TIMETABLE - III IT E (${ttE.length} slots)]`);
    ttE.forEach(s => {
      console.log(`  Day ${s.day} | Period ${s.period} | ${s.Subject?.acronym} (${s.Subject?.title}) -> Faculty: ${s.Teacher?.name}`);
    });
    console.log('');

    // 4. Attendance Records Count
    const totalAttendance = await Attendance.count();
    console.log(`[ATTENDANCE LOGS RECORDED]`);
    console.log(`- Total DB Rows: ${totalAttendance}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error checking DB:', error);
    process.exit(1);
  }
}

checkDatabase();
