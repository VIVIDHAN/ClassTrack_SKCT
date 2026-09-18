require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
const { sequelize, Teacher, Student, Subject, Timetable, Attendance, syncDatabaseSchema } = require('./db');

const PERIOD_SCHEDULE = {
  1: { period: 1, label: 'Period 1', timeRange: '08:15 AM - 09:15 AM' },
  2: { period: 2, label: 'Period 2', timeRange: '09:15 AM - 10:15 AM' },
  3: { period: 3, label: 'Period 3', timeRange: '10:45 AM - 11:45 AM' },
  4: { period: 4, label: 'Period 4', timeRange: '11:45 AM - 12:45 PM' },
  5: { period: 5, label: 'Period 5', timeRange: '01:45 PM - 02:45 PM' },
  6: { period: 6, label: 'Period 6', timeRange: '02:45 PM - 03:45 PM' },
  7: { period: 7, label: 'Period 7', timeRange: '03:45 PM - 04:45 PM' },
  8: { period: 8, label: 'Period 8', timeRange: '04:45 PM - 05:30 PM' },
};

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
    let queryDate = req.query.date;
    if (!queryDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      queryDate = `${year}-${month}-${day}`;
    }
    let dayOrder = 4; // Default Day Order 4 for today (2026-09-07)

    try {
      // Check if CalendarDays / DayOrders table exists in DB
      const tables = ['CalendarDays', 'calendardays', 'DayOrders', 'day_orders', 'dayorders', 'Calendar', 'calendars'];
      for (const tbl of tables) {
        const [results] = await sequelize.query(
          `SELECT day_order FROM ${tbl} WHERE date LIKE :date OR date = :exactDate LIMIT 1`,
          { replacements: { date: `${queryDate}%`, exactDate: queryDate } }
        ).catch(() => [[]]);

        if (results && results.length > 0 && results[0].day_order) {
          dayOrder = parseInt(results[0].day_order, 10);
          break;
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

// 1.5 Get Calendar Days / Academic Calendar records
app.get('/api/calendar-days', async (req, res) => {
  try {
    const tables = ['CalendarDays', 'calendardays', 'DayOrders', 'day_orders', 'Calendar', 'calendars'];
    let rows = [];
    for (const tbl of tables) {
      const [results] = await sequelize.query(
        `SELECT date, day_order, is_holiday, holiday_name, event_name FROM ${tbl} ORDER BY date ASC`
      ).catch(() => [[]]);

      if (results && results.length > 0) {
        rows = results;
        break;
      }
    }
    res.json(rows);
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
        let resolvedDay = 4;
        try {
          const tables = ['CalendarDays', 'calendardays', 'DayOrders', 'day_orders', 'dayorders', 'Calendar', 'calendars'];
          for (const tbl of tables) {
            const [results] = await sequelize.query(
              `SELECT day_order FROM ${tbl} WHERE date LIKE :date OR date = :exactDate LIMIT 1`,
              { replacements: { date: `${queryDate}%`, exactDate: queryDate } }
            ).catch(() => [[]]);
            if (results && results.length > 0 && results[0].day_order) {
              resolvedDay = parseInt(results[0].day_order, 10);
              break;
            }
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

// Send / Track SMS Endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { phone, message, student_name } = req.body;
    console.log(`[SMS DISPATCH] To: ${phone} | Student: ${student_name || 'N/A'}`);
    console.log(`[SMS CONTENT]\n${message}\n`);
    res.json({
      success: true,
      phone,
      status: 'DISPATCHED',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// 3. Submit Attendance (Stores sno, date, day_order, period, time, roll_no, subject_name, status)
app.post('/api/attendance', async (req, res) => {
  try {
    const { date, day_order, period, time, subject_name, subject, timetable_id, section, records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'No attendance records provided' });
    }

    // 1. Resolve date
    const resolvedDate = date || new Date().toISOString().split('T')[0];

    // 2. Fetch Day Order correctly from Academic Calendar (CalendarDays table in MySQL RDS)
    let resolvedDayOrder = day_order ? parseInt(day_order, 10) : null;
    if (!resolvedDayOrder || isNaN(resolvedDayOrder)) {
      try {
        const tables = ['CalendarDays', 'calendardays', 'DayOrders', 'day_orders', 'Calendar', 'calendars'];
        for (const tbl of tables) {
          const [results] = await sequelize.query(
            `SELECT day_order FROM ${tbl} WHERE date = :exactDate OR date LIKE :date LIMIT 1`,
            { replacements: { exactDate: resolvedDate, date: `${resolvedDate}%` } }
          ).catch(() => [[]]);

          if (results && results.length > 0 && results[0].day_order) {
            resolvedDayOrder = parseInt(results[0].day_order, 10);
            break;
          }
        }
      } catch (e) {}
    }
    if (!resolvedDayOrder || isNaN(resolvedDayOrder)) {
      resolvedDayOrder = 4; // Default Day Order for working calendar
    }

    // 3. Resolve valid timetable_id (foreign-key safe)
    let resolvedTimetableId = parseInt(timetable_id, 10);
    if (isNaN(resolvedTimetableId) || resolvedTimetableId <= 0) {
      resolvedTimetableId = 1;
    }

    // Fetch Timetable slot and joined Subject to get exact period, time, and subject name
    const timetableRecord = await Timetable.findByPk(resolvedTimetableId, { include: [Subject] });

    // 4. Fetch period, time, subject_name correctly from Timetable & schedule mapping
    let resolvedPeriod = period ? String(period) : null;
    let resolvedTime = time ? String(time) : null;
    let resolvedSubjectName = subject_name || subject ? String(subject_name || subject) : null;

    if (timetableRecord) {
      if (!resolvedPeriod && timetableRecord.period) {
        resolvedPeriod = `Period ${timetableRecord.period}`;
      }
      if (!resolvedTime && timetableRecord.period && PERIOD_SCHEDULE[timetableRecord.period]) {
        resolvedTime = PERIOD_SCHEDULE[timetableRecord.period].timeRange;
      }
      if (!resolvedSubjectName && timetableRecord.Subject && timetableRecord.Subject.title) {
        resolvedSubjectName = timetableRecord.Subject.title;
      }
    }

    if (!resolvedPeriod) resolvedPeriod = 'Period 1';
    if (!resolvedTime) resolvedTime = '08:15 AM - 09:15 AM';
    if (!resolvedSubjectName) resolvedSubjectName = 'Applied Cryptography';

    // 5. Student Resolution: Map roll numbers to numeric Student IDs & Roll numbers
    const sectionName = section || 'III IT G';
    const existingStudents = await Student.findAll({ where: { section: sectionName } });
    const studentMap = new Map();
    existingStudents.forEach(s => {
      studentMap.set(s.id, s);
      studentMap.set(String(s.roll_no).trim().toUpperCase(), s);
    });

    const attendanceData = [];

    for (const r of records) {
      const rollKey = String(r.roll_no || r.id || '').trim().toUpperCase();
      let studentObj = studentMap.get(r.student_id) || studentMap.get(rollKey);
      let sId = studentObj ? studentObj.id : null;

      // Auto-create student record if missing to ensure data integrity
      if (!sId && rollKey) {
        try {
          const [newStudent] = await Student.findOrCreate({
            where: { roll_no: rollKey },
            defaults: {
              name: r.name || rollKey,
              section: sectionName,
              parent_phone: r.phone || r.real_parent_phone || '9442211279',
              phone: r.phone || '9442211279'
            }
          });
          studentObj = newStudent;
          sId = newStudent.id;
          studentMap.set(rollKey, newStudent);
        } catch (createErr) {
          console.warn('Could not auto-create student:', rollKey, createErr.message);
        }
      }

      if (sId || rollKey) {
        let normalizedStatus = 'Present';
        const rawStatus = String(r.status || '').toLowerCase();
        if (rawStatus === 'absent') normalizedStatus = 'Absent';
        else if (rawStatus === 'od' || rawStatus === 'onduty') normalizedStatus = 'OD';

        const finalRollNo = studentObj ? studentObj.roll_no : rollKey;

        attendanceData.push({
          date: resolvedDate,
          day_order: resolvedDayOrder,
          period: resolvedPeriod,
          time: resolvedTime,
          roll_no: finalRollNo,
          subject_name: resolvedSubjectName,
          status: normalizedStatus,
          student_id: sId,
          timetable_id: resolvedTimetableId
        });
      }
    }

    if (attendanceData.length === 0) {
      return res.status(400).json({ error: 'Could not resolve any student records for attendance' });
    }

    // 6. Remove previous attendance records for this date and timetable to maintain idempotency
    await Attendance.destroy({
      where: {
        date: resolvedDate,
        timetable_id: resolvedTimetableId
      }
    });

    // 7. Bulk insert resolved attendance records (populating all 8 columns: id/sno, date, day_order, period, time, roll_no, subject_name, status)
    const inserted = await Attendance.bulkCreate(attendanceData);

    console.log(`[ATTENDANCE STORED] Date: ${resolvedDate} | Day Order: ${resolvedDayOrder} | Period: ${resolvedPeriod} | Subject: ${resolvedSubjectName} | Count: ${inserted.length}`);

    res.json({
      success: true,
      count: inserted.length,
      date: resolvedDate,
      day_order: resolvedDayOrder,
      period: resolvedPeriod,
      time: resolvedTime,
      subject_name: resolvedSubjectName,
      timetable_id: resolvedTimetableId,
      message: `Successfully recorded attendance for ${inserted.length} students!`
    });
  } catch (err) {
    console.error('Error submitting attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3.5 Get Attendance Logs Table (sno, date, day_order, period, time, roll_no, subject_name, status)
app.get('/api/attendance', async (req, res) => {
  try {
    const { startDate, endDate, date, section, roll_no, subject_name, status } = req.query;
    const where = {};

    if (date) {
      where.date = date;
    } else if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    if (roll_no) where.roll_no = roll_no;
    if (subject_name) where.subject_name = { [Op.like]: `%${subject_name}%` };
    if (status) where.status = status;

    const include = [{ model: Student, attributes: ['id', 'name', 'section', 'roll_no'] }];
    if (section) {
      include[0].where = { section };
    }

    const records = await Attendance.findAll({
      where,
      include,
      order: [['date', 'DESC'], ['id', 'ASC']]
    });

    const formatted = records.map(r => ({
      sno: r.id,
      id: r.id,
      date: r.date,
      day_order: r.day_order || 4,
      period: r.period || 'Period 1',
      time: r.time || '08:15 AM - 09:15 AM',
      roll_no: r.roll_no || (r.Student ? r.Student.roll_no : ''),
      student_name: r.Student ? r.Student.name : '',
      subject_name: r.subject_name || 'Class',
      status: r.status,
      section: r.Student ? r.Student.section : (section || 'III IT G')
    }));

    res.json(formatted);
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
        'day_order',
        'period',
        'time',
        'subject_name',
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN Attendance.status = 'Absent' THEN 1 ELSE 0 END")), 'absentCount']
      ],
      include: [
        { model: Timetable, include: [Subject] }
      ],
      group: ['date', 'timetable_id', 'Timetable.id', 'Timetable->Subject.id', 'day_order', 'period', 'time', 'subject_name'],
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
        id: a.Student ? a.Student.roll_no : a.roll_no || '',
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

// 5. Generate Attendance Report for date range (Includes student metrics + detailed attendance table logs)
app.get('/api/reports', async (req, res) => {
  try {
    const { startDate, endDate, section, roll_no, subject_name } = req.query;
    const whereSection = section ? { section } : {};
    if (roll_no) whereSection.roll_no = roll_no;

    const students = await Student.findAll({ where: whereSection, order: [['roll_no', 'ASC']] });

    const attendanceWhere = {};
    if (startDate && endDate) {
      attendanceWhere.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      attendanceWhere.date = { [Op.gte]: startDate };
    } else if (endDate) {
      attendanceWhere.date = { [Op.lte]: endDate };
    }
    if (subject_name) {
      attendanceWhere.subject_name = { [Op.like]: `%${subject_name}%` };
    }

    // Also fetch raw attendance logs for detailed table report
    const rawLogs = await Attendance.findAll({
      where: attendanceWhere,
      include: [{ model: Student, attributes: ['id', 'name', 'section', 'roll_no'] }],
      order: [['date', 'DESC'], ['id', 'ASC']]
    });

    const logs = rawLogs.map(r => ({
      sno: r.id,
      date: r.date,
      day_order: r.day_order || 4,
      period: r.period || 'Period 1',
      time: r.time || '08:15 AM - 09:15 AM',
      roll_no: r.roll_no || (r.Student ? r.Student.roll_no : ''),
      student_name: r.Student ? r.Student.name : '',
      subject_name: r.subject_name || 'Course',
      status: r.status,
      section: r.Student ? r.Student.section : (section || 'III IT G')
    }));

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
        percentage,
        logs: records.map(r => ({
          sno: r.id,
          date: r.date,
          day_order: r.day_order || 4,
          period: r.period || 'Period 1',
          time: r.time || '08:15 AM - 09:15 AM',
          roll_no: r.roll_no || s.roll_no,
          subject_name: r.subject_name || 'Course',
          status: r.status
        }))
      });
    }

    // Attach full detailed logs array to the response
    if (req.query.format === 'detailed') {
      return res.json({ summary: report, logs });
    }

    // Attach logs property to the report array for backward compatibility
    report.logs = logs;

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

sequelize.authenticate().then(async () => {
  console.log('Database connected.');
  await syncDatabaseSchema();
  app.listen(PORT, () => {
    console.log(`ClassTrack API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

