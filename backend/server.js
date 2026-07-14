require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Teacher, Student, Subject, Timetable, Attendance } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Get Timetable for a specific day and section
app.get('/api/timetable', async (req, res) => {
  try {
    const { day, section } = req.query;
    const timetable = await Timetable.findAll({
      where: { day, section },
      include: [Subject, Teacher],
      order: [['period', 'ASC']]
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

const PORT = process.env.PORT || 3000;

sequelize.authenticate().then(() => {
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`ClassTrack API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
