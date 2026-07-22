require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Teacher, Student, Subject, Timetable } = require('./db');

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



const PORT = process.env.PORT || 3000;

sequelize.authenticate().then(() => {
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`ClassTrack API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
