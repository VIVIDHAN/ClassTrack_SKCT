require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Teacher, Student, Subject, Timetable, Attendance } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 0. Faculty Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email (support both narmatha and narmadha)
    let searchEmail = email.trim().toLowerCase();
    searchEmail = searchEmail.replace('narmadha@', 'narmatha@');

    // Find teacher
    const teacher = await Teacher.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        searchEmail
      )
    });

    if (!teacher) {
      return res.status(401).json({ error: 'Faculty account not found' });
    }

    // Verify password: allow AdminSKCT@123 for all or matching stored password
    const isMasterPass = (password === 'AdminSKCT@123');
    const isStoredPass = (teacher.password === password);

    if (!isMasterPass && !isStoredPass) {
      return res.status(401).json({ error: 'Incorrect password. Default is AdminSKCT@123' });
    }

    // Auto-sync password in database if needed
    if (isMasterPass && teacher.password !== 'AdminSKCT@123') {
      await teacher.update({ password: 'AdminSKCT@123' });
    }

    res.json({
      success: true,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department || 'Information Technology'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Get Timetable (supports teacher_id, day, section)
app.get('/api/timetable', async (req, res) => {
  try {
    const { day, section, teacher_id } = req.query;
    const where = {};
    if (day) where.day = day;
    if (section) where.section = section;
    if (teacher_id) where.teacher_id = teacher_id;

    const timetable = await Timetable.findAll({
      where,
      include: [Subject, Teacher],
      order: [['day', 'ASC'], ['period', 'ASC']]
    });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Students for a section
app.get('/api/students', async (req, res) => {
  try {
    const { section } = req.query;
    const students = await Student.findAll({ where: { section }, order: [['roll_no', 'ASC']] });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Submit Attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { date, timetable_id, records } = req.body;
    // records is an array: [{ student_id, status }]
    
    const attendanceData = records.map(r => ({
      date,
      timetable_id,
      student_id: r.student_id,
      status: r.status
    }));

    await Attendance.bulkCreate(attendanceData);
    res.json({ success: true, message: 'Attendance recorded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get History
app.get('/api/history', async (req, res) => {
  try {
    const history = await Attendance.findAll({
      attributes: [
        [sequelize.fn('MAX', sequelize.col('Attendance.id')), 'id'],
        'date',
        'timetable_id',
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN Attendance.status = 'Absent' THEN 1 ELSE 0 END")), 'absentCount']
      ],
      include: [
        { model: Timetable, include: [Subject] }
      ],
      group: ['date', 'timetable_id', 'Timetable.id', 'Timetable->Subject.id'],
      order: [['date', 'DESC']]
    });
    
    // Format response to ensure absentCount is a number
    const formatted = history.map(h => {
      const data = h.toJSON();
      data.absentCount = parseInt(data.absentCount, 10) || 0;
      return data;
    });
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Generate Attendance Report for date range
app.get('/api/reports', async (req, res) => {
  try {
    const { startDate, endDate, section } = req.query;
    const whereSection = section ? { section } : {};
    const students = await Student.findAll({ where: whereSection, order: [['roll_no', 'ASC']] });

    const attendanceWhere = {};
    if (startDate && endDate) {
      attendanceWhere.date = { [sequelize.Op.between]: [startDate, endDate] };
    } else if (startDate) {
      attendanceWhere.date = { [sequelize.Op.gte]: startDate };
    } else if (endDate) {
      attendanceWhere.date = { [sequelize.Op.lte]: endDate };
    }

    const report = [];
    for (const s of students) {
      const records = await Attendance.findAll({
        where: { student_id: s.id, ...attendanceWhere }
      });
      const totalClasses = records.length;
      const attendedClasses = records.filter(r => r.status === 'Present' || r.status === 'OD').length;
      const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

      report.push({
        roll_no: s.roll_no,
        name: s.name,
        section: s.section,
        totalClasses,
        attendedClasses,
        percentage
      });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate().then(() => {
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`ClassTrack API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
