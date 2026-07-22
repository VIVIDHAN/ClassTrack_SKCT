require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Teacher, Student, Subject, Timetable, Quote, CalendarDay } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 0. Login Teacher
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ where: { email } });
    
    if (!teacher || teacher.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({
      success: true,
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Get Timetable for a specific day and teacher
app.get('/api/timetable', async (req, res) => {
  try {
    const { day, teacher_id } = req.query;
    const timetable = await Timetable.findAll({
      where: { day, teacher_id },
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

// 3. Get Daily Quote
app.get('/api/quote/daily', async (req, res) => {
  try {
    const quote = await Quote.findOne({
      order: sequelize.random()
    });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Academic Calendar Day Order
app.get('/api/calendar/today', async (req, res) => {
  try {
    // Optional date override, else use today's date formatted as YYYY-MM-DD
    let dateStr = req.query.date;
    if (!dateStr) {
      const now = new Date();
      // Adjusting for Indian Standard Time (IST) +5:30 just in case
      now.setMinutes(now.getMinutes() + 330);
      dateStr = now.toISOString().split('T')[0];
    }
    
    const dayData = await CalendarDay.findOne({ where: { date: dateStr } });
    
    if (dayData) {
      res.json(dayData);
    } else {
      // Fallback: If no calendar data exists for this date, assume it's a holiday
      res.json({ date: dateStr, day_order: null, is_holiday: true, holiday_name: 'Not Scheduled' });
    }
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
