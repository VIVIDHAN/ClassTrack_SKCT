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

// 1. Get Day Order for a date (defaults to today's mapped Day Order in DB)
app.get('/api/day-order', async (req, res) => {
  try {
    const queryDate = req.query.date || new Date().toISOString().split('T')[0];
    let dayOrder = 3; // Default Day Order 3 for today

    try {
      // Check if DayOrders / Calendar / Day_Orders table exists in DB
      const [results] = await sequelize.query(
        "SELECT day_order FROM DayOrders WHERE date = :date LIMIT 1",
        { replacements: { date: queryDate } }
      ).catch(() => [[]]);

      if (results && results.length > 0 && results[0].day_order) {
        dayOrder = parseInt(results[0].day_order, 10);
      } else {
        const [calResults] = await sequelize.query(
          "SELECT day_order FROM Calendar WHERE date = :date LIMIT 1",
          { replacements: { date: queryDate } }
        ).catch(() => [[]]);
        if (calResults && calResults.length > 0 && calResults[0].day_order) {
          dayOrder = parseInt(calResults[0].day_order, 10);
        }
      }
    } catch (e) {
      // Fallback
    }

    res.json({
      date: queryDate,
      day_order: dayOrder,
      day_name: `Day Order ${dayOrder}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Timetable (supports teacher_id, day, section, and day=today)
app.get('/api/timetable', async (req, res) => {
  try {
    let { day, section, teacher_id } = req.query;
    const where = {};

    if (day) {
      if (day === 'today' || day === 'current') {
        const queryDate = new Date().toISOString().split('T')[0];
        let resolvedDay = 3;
        try {
          const [results] = await sequelize.query(
            "SELECT day_order FROM DayOrders WHERE date = :date LIMIT 1",
            { replacements: { date: queryDate } }
          ).catch(() => [[]]);
          if (results && results.length > 0 && results[0].day_order) {
            resolvedDay = parseInt(results[0].day_order, 10);
          }
        } catch (e) {}
        where.day = resolvedDay;
      } else {
        where.day = parseInt(day, 10) || day;
      }
    }
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

// ==========================================
// SMS TESTING MODE CONFIGURATION
// ==========================================
// Set process.env.SMS_TEST_MODE=false in .env (or change SMS_TEST_MODE = false below)
// to switch to real parent phone numbers without rebuilding the APK.
let SMS_TEST_MODE = process.env.SMS_TEST_MODE !== 'false';
const SMS_TEST_PHONE = process.env.SMS_TEST_PHONE || '9442211279';

// Check / toggle SMS mode via API
app.get('/api/sms-mode', (req, res) => {
  const activeMode = process.env.SMS_TEST_MODE !== 'false' && SMS_TEST_MODE;
  res.json({
    test_mode: activeMode,
    test_phone: SMS_TEST_PHONE,
    status: activeMode ? 'TESTING (Redirected to 9442211279)' : 'LIVE (Sent to real parents)'
  });
});

app.post('/api/sms-mode', (req, res) => {
  const { test_mode } = req.body;
  if (typeof test_mode === 'boolean') {
    SMS_TEST_MODE = test_mode;
  }
  res.json({
    success: true,
    test_mode: SMS_TEST_MODE,
    status: SMS_TEST_MODE ? 'TESTING (Redirected to 9442211279)' : 'LIVE (Sent to real parents)'
  });
});

// 2. Get Students for a section
app.get('/api/students', async (req, res) => {
  try {
    const { section } = req.query;
    const students = await Student.findAll({ where: { section }, order: [['roll_no', 'ASC']] });

    const isTestMode = process.env.SMS_TEST_MODE !== 'false' && SMS_TEST_MODE;

    const formatted = students.map(s => {
      const data = s.toJSON();
      if (isTestMode) {
        data.original_parent_phone = data.parent_phone;
        data.parent_phone = SMS_TEST_PHONE;
      }
      return data;
    });

    res.json(formatted);
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

// 4. Get History with Absentees
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
    
    // Format response and attach detailed absentees list for each session
    const formatted = await Promise.all(history.map(async (h) => {
      const data = h.toJSON();
      data.absentCount = parseInt(data.absentCount, 10) || 0;

      const absentees = await Attendance.findAll({
        where: {
          date: data.date,
          timetable_id: data.timetable_id,
          status: 'Absent'
        },
        include: [
          { model: Student, attributes: ['id', 'roll_no', 'name', 'parent_phone', 'section'] }
        ]
      });

      data.absentees = absentees.map(a => ({
        id: a.Student ? a.Student.roll_no : '',
        name: a.Student ? a.Student.name : '',
        phone: a.Student ? a.Student.parent_phone : '',
        real_parent_phone: a.Student ? a.Student.parent_phone : '',
        section: a.Student ? a.Student.section : ''
      }));

      return data;
    }));
    
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

// 6. Get Absentees list for notification
app.get('/api/absentees', async (req, res) => {
  try {
    const { date } = req.query;
    const where = { status: 'Absent' };
    if (date) where.date = date;

    const absentees = await Attendance.findAll({
      where,
      include: [
        { model: Student, attributes: ['id', 'roll_no', 'name', 'parent_phone', 'section'] },
        { model: Timetable, include: [Subject] }
      ],
      order: [['date', 'DESC'], ['id', 'DESC']]
    });

    const isTestMode = process.env.SMS_TEST_MODE !== 'false' && SMS_TEST_MODE;
    const formatted = absentees.map(a => {
      const data = a.toJSON();
      if (data.Student && isTestMode) {
        data.Student.original_parent_phone = data.Student.parent_phone;
        data.Student.parent_phone = SMS_TEST_PHONE;
      }
      return data;
    });

    res.json(formatted);
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
