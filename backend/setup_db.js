const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      ssl: { rejectUnauthorized: false }
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log("Database 'classtrack' created successfully in AWS RDS!");
    await connection.end();
  } catch (error) {
    console.error("Failed to create database:", error);
    process.exit(1);
  }
}

createDatabase();
