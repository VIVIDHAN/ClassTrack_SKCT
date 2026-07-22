const XLSX = require('xlsx');
const { sequelize, Teacher, Student, Subject, Timetable } = require('./db');
const path = require('path');

const importExcel = async () => {
  try {
    const filePath = '/Users/vividhan/Desktop/ClassTrack/ClassTrack_Master_Data (1).xlsx';
    console.log(`Reading Excel file from ${filePath}...`);
    const workbook = XLSX.readFile(filePath);

    // Parse Sheets
    const studentsData = XLSX.utils.sheet_to_json(workbook.Sheets['Students']);
    const facultyData = XLSX.utils.sheet_to_json(workbook.Sheets['Faculty']);
    const subjectsData = XLSX.utils.sheet_to_json(workbook.Sheets['Subjects']);
    const timetableData = XLSX.utils.sheet_to_json(workbook.Sheets['Timetable']);

    // Sync DB (this drops and recreates tables in AWS RDS)
    console.log('Syncing database (force=true)...');
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    // 1. Insert Faculty
    console.log('Inserting Faculty...');
    const mappedFaculty = facultyData.map(f => ({
      name: f.Name,
      email: f.Email,
      password: f.Password,
      department: f.Department
    }));
    await Teacher.bulkCreate(mappedFaculty);

    // 2. Insert Students
    console.log('Inserting Students...');
    const mappedStudents = studentsData.map(s => ({
      roll_no: s['Roll No'],
      name: s.Name,
      phone: s.Phone || null,
      parent_phone: s['Parent Phone'] || null,
      section: s.Section
    }));
    await Student.bulkCreate(mappedStudents);

    // 3. Insert Subjects
    console.log('Inserting Subjects...');
    const mappedSubjects = subjectsData.map(s => ({
      code: s.Code,
      acronym: s.Acronym,
      title: s.Title
    }));
    await Subject.bulkCreate(mappedSubjects);

    // 4. Map and Insert Timetable
    console.log('Mapping Timetable foreign keys...');
    const allTeachers = await Teacher.findAll();
    const allSubjects = await Subject.findAll();

    const mappedTimetable = [];
    for (const row of timetableData) {
      const teacher = allTeachers.find(t => t.email === row['Faculty Email']);
      const subject = allSubjects.find(s => s.acronym === row['Subject Acronym']);

      if (!teacher || !subject) {
        console.warn(`Skipping timetable row: missing teacher (${row['Faculty Email']}) or subject (${row['Subject Acronym']})`);
        continue;
      }

      mappedTimetable.push({
        day: row.Day,
        period: row.Period,
        section: row.Section,
        subject_id: subject.id,
        teacher_id: teacher.id
      });
    }

    console.log('Inserting Timetable...');
    await Timetable.bulkCreate(mappedTimetable);

    console.log('Data successfully imported to AWS RDS from Excel!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importExcel();
