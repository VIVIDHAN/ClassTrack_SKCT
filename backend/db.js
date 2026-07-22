require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  }
});

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING }
});

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roll_no: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  parent_phone: { type: DataTypes.STRING },
  test_parent_phone_number: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING }
});

const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  acronym: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false }
});

const Timetable = sequelize.define('Timetable', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  day: { type: DataTypes.INTEGER, allowNull: false },
  period: { type: DataTypes.INTEGER, allowNull: false },
  section: { type: DataTypes.STRING, allowNull: false }
});

const Quote = sequelize.define('Quote', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  text: { type: DataTypes.STRING, allowNull: false }
});

const CalendarDay = sequelize.define('CalendarDay', {
  date: { type: DataTypes.DATEONLY, primaryKey: true },
  day_order: { type: DataTypes.INTEGER, allowNull: true },
  is_holiday: { type: DataTypes.BOOLEAN, defaultValue: false },
  holiday_name: { type: DataTypes.STRING, allowNull: true },
  event_name: { type: DataTypes.STRING, allowNull: true }
});

// Relationships
Timetable.belongsTo(Subject, { foreignKey: 'subject_id' });
Timetable.belongsTo(Teacher, { foreignKey: 'teacher_id' });

module.exports = { sequelize, Teacher, Student, Subject, Timetable, Quote, CalendarDay };
