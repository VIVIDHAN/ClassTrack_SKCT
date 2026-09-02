require('dotenv').config();
const { sequelize, Teacher } = require('./db');

async function updatePasswords() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB...');
    const result = await Teacher.update(
      { password: 'AdminSKCT@123' },
      { where: {} }
    );
    console.log(`Updated passwords for all faculty: ${result[0]} rows affected.`);
    const teachers = await Teacher.findAll({ attributes: ['id', 'name', 'email', 'password'] });
    console.table(teachers.map(t => t.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error('Error updating passwords:', err);
    process.exit(1);
  }
}

updatePasswords();
