require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  dialectOptions: { ssl: { rejectUnauthorized: false } }
});

const CalendarDay = sequelize.define('CalendarDay', {
  date: { type: DataTypes.DATEONLY, primaryKey: true },
  day_order: { type: DataTypes.INTEGER, allowNull: true },
  is_holiday: { type: DataTypes.BOOLEAN, defaultValue: false },
  holiday_name: { type: DataTypes.STRING, allowNull: true }
});

const calendarData = [
  // JUNE 2026
  { d: '2026-06-04', order: 1, e: 'Reopening for II, III, IV Years' }, { d: '2026-06-05', order: 2 }, { d: '2026-06-06', order: 3 },
  { d: '2026-06-07', h: 'Holiday' },
  { d: '2026-06-08', order: 4 }, { d: '2026-06-09', order: 5 }, { d: '2026-06-10', order: 1 },
  { d: '2026-06-11', order: 2 }, { d: '2026-06-12', order: 3 }, { d: '2026-06-13', order: 4 },
  { d: '2026-06-14', h: 'Holiday' },
  { d: '2026-06-15', order: 5 }, { d: '2026-06-16', order: 1 }, { d: '2026-06-17', order: 2 },
  { d: '2026-06-18', order: 3 }, { d: '2026-06-19', order: 4 }, { d: '2026-06-20', order: 5 },
  { d: '2026-06-21', h: 'Holiday' },
  { d: '2026-06-22', order: 1 }, { d: '2026-06-23', order: 2 }, { d: '2026-06-24', order: 3 },
  { d: '2026-06-25', order: 4 },
  { d: '2026-06-26', h: 'Muharram' },
  { d: '2026-06-27', h: 'Holiday' }, { d: '2026-06-28', h: 'Holiday' },
  { d: '2026-06-29', order: 5 }, { d: '2026-06-30', order: 1 },
  
  // JULY 2026
  { d: '2026-07-01', order: 2 }, { d: '2026-07-02', order: 3 }, { d: '2026-07-03', order: 4 }, { d: '2026-07-04', order: 5 },
  { d: '2026-07-05', h: 'Holiday' },
  { d: '2026-07-06', order: 1 }, { d: '2026-07-07', order: 2 }, { d: '2026-07-08', order: 3 },
  { d: '2026-07-09', order: 4 }, { d: '2026-07-10', order: 5 }, { d: '2026-07-11', order: 1 },
  { d: '2026-07-12', h: 'Holiday' },
  { d: '2026-07-13', order: 2 }, { d: '2026-07-14', order: 3 }, { d: '2026-07-15', order: 4 },
  { d: '2026-07-16', order: 5 }, { d: '2026-07-17', order: 1 },
  { d: '2026-07-18', h: 'Holiday' }, { d: '2026-07-19', h: 'Holiday' },
  { d: '2026-07-20', order: 2 }, { d: '2026-07-21', order: 3 }, { d: '2026-07-22', order: 4 },
  { d: '2026-07-23', order: 5 }, { d: '2026-07-24', order: 1 }, { d: '2026-07-25', order: 2 },
  { d: '2026-07-26', h: 'Holiday' },
  { d: '2026-07-27', order: 3, e: 'CIA-I for II Year*' }, { d: '2026-07-28', order: 4 }, { d: '2026-07-29', order: 5 },
  { d: '2026-07-30', order: 1 }, { d: '2026-07-31', order: 2 },
  
  // AUGUST 2026
  { d: '2026-08-01', order: 3 },
  { d: '2026-08-02', h: 'Holiday' },
  { d: '2026-08-03', order: 4 }, { d: '2026-08-04', order: 5 }, { d: '2026-08-05', order: 1, e: 'CIA-I for III Year*' },
  { d: '2026-08-06', order: 2 }, { d: '2026-08-07', order: 3 }, { d: '2026-08-08', order: 4 },
  { d: '2026-08-09', h: 'Holiday' },
  { d: '2026-08-10', order: 5 }, { d: '2026-08-11', order: 1 }, { d: '2026-08-12', order: 2 },
  { d: '2026-08-13', order: 3 }, { d: '2026-08-14', order: 4 },
  { d: '2026-08-15', h: 'Independence Day' }, { d: '2026-08-16', h: 'Holiday' },
  { d: '2026-08-17', h: 'Classes Suspended' },
  { d: '2026-08-18', order: 5 }, { d: '2026-08-19', order: 1 }, { d: '2026-08-20', order: 2 },
  { d: '2026-08-21', order: 3 }, { d: '2026-08-22', order: 4 },
  { d: '2026-08-23', h: 'Holiday' },
  { d: '2026-08-24', order: 5 }, { d: '2026-08-25', order: 1 },
  { d: '2026-08-26', h: 'Milad-un-Nabi' },
  { d: '2026-08-27', order: 2 }, { d: '2026-08-28', order: 3 }, { d: '2026-08-29', order: 4 },
  { d: '2026-08-30', h: 'Holiday' },
  { d: '2026-08-31', order: 5 },
  
  // SEPTEMBER 2026
  { d: '2026-09-01', order: 1 }, { d: '2026-09-02', order: 2 }, { d: '2026-09-03', order: 3 },
  { d: '2026-09-04', h: 'Krishna Jayanthi' }, { d: '2026-09-05', h: 'Holiday' }, { d: '2026-09-06', h: 'Holiday' },
  { d: '2026-09-07', order: 4 }, { d: '2026-09-08', order: 5 }, { d: '2026-09-09', order: 1 },
  { d: '2026-09-10', order: 2 }, { d: '2026-09-11', order: 3 }, { d: '2026-09-12', order: 4 },
  { d: '2026-09-13', h: 'Holiday' },
  { d: '2026-09-14', h: 'Vinayakar Chathurthi' },
  { d: '2026-09-15', order: 5 }, { d: '2026-09-16', order: 1 }, { d: '2026-09-17', order: 2 },
  { d: '2026-09-18', order: 3, e: 'CIA-II for II & III Years*' }, { d: '2026-09-19', order: 4 },
  { d: '2026-09-20', h: 'Holiday' },
  { d: '2026-09-21', order: 5 }, { d: '2026-09-22', order: 1 }, { d: '2026-09-23', order: 2 },
  { d: '2026-09-24', order: 3 }, { d: '2026-09-25', order: 4, e: 'Last Instruction Day II, III, IV Years' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    await CalendarDay.sync({ force: true });
    
    const records = calendarData.map(c => ({
      date: c.d,
      day_order: c.order || null,
      is_holiday: !!c.h,
      holiday_name: c.h || null,
      event_name: c.e || null
    }));
    
    await CalendarDay.bulkCreate(records);
    console.log('Successfully seeded academic calendar day orders.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
