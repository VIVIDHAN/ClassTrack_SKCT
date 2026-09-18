const { sequelize, Teacher } = require('./db');

async function ensureAdmin() {
  try {
    await sequelize.authenticate();
    const [admin, created] = await Teacher.findOrCreate({
      where: { email: 'admin@skct.edu.in' },
      defaults: {
        id: 999,
        name: 'Administrator (HOD / System Admin)',
        email: 'admin@skct.edu.in',
        password: 'AdminSKCT@123',
        department: 'Information Technology'
      }
    });

    if (!created) {
      await admin.update({
        name: 'Administrator (HOD / System Admin)',
        password: 'AdminSKCT@123'
      });
    }

    console.log(`Admin user ensured in DB with ID ${admin.id} (${admin.email})`);
    process.exit(0);
  } catch (err) {
    console.error('Error ensuring admin user:', err);
    process.exit(1);
  }
}

ensureAdmin();
