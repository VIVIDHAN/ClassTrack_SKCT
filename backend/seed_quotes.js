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

const Quote = sequelize.define('Quote', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  text: { type: DataTypes.STRING, allowNull: false }
});

const quotes = [
  "Every student is one lesson away from success.",
  "Great teachers inspire, not just instruct.",
  "Education is the foundation of every future.",
  "A teacher's kindness lasts a lifetime.",
  "Small lessons create big dreams.",
  "Teaching changes lives every single day.",
  "Every classroom is a place of possibilities.",
  "Learning begins with curiosity.",
  "Patience is the greatest teaching tool.",
  "Inspire today, shape tomorrow.",
  "Success starts with a great teacher.",
  "Every question is the beginning of knowledge.",
  "Teaching is planting seeds for the future.",
  "Knowledge grows when it is shared.",
  "A positive teacher creates positive learners.",
  "Every child deserves encouragement.",
  "Education unlocks endless opportunities.",
  "Great classrooms build great leaders.",
  "Believe in every student's potential.",
  "Every lesson matters.",
  "Teach with passion and purpose.",
  "Knowledge is the greatest gift.",
  "Learning never stops.",
  "Every student has unique brilliance.",
  "Encourage progress, not perfection.",
  "Inspire confidence through education.",
  "Good teachers create better futures.",
  "Education lights the path to success.",
  "Every challenge is a learning opportunity.",
  "Make today a meaningful lesson.",
  "Teachers create tomorrow's leaders.",
  "Every day is a chance to inspire.",
  "Wisdom begins with learning.",
  "Your words can change a life.",
  "Excellence starts in the classroom.",
  "Curiosity fuels education.",
  "A smile makes learning easier.",
  "Teaching is leadership in action.",
  "Every lesson leaves an impact.",
  "Education empowers generations.",
  "Teach hearts, not just minds.",
  "Great teaching creates great futures.",
  "Every student can succeed.",
  "Learning is a lifelong journey.",
  "Inspire confidence every day.",
  "Education transforms communities.",
  "Lead with knowledge and compassion.",
  "Every classroom tells a success story.",
  "Great teachers never stop learning.",
  "Make learning memorable.",
  "Every child deserves inspiration.",
  "Build confidence through education.",
  "Today's lesson shapes tomorrow.",
  "Teach with patience and purpose.",
  "Every achievement begins with effort.",
  "Inspire dreams through learning.",
  "Education creates opportunities.",
  "A teacher's influence never ends.",
  "Learning opens every door.",
  "Every lesson is a new beginning.",
  "Knowledge grows through sharing.",
  "Believe in the power of education.",
  "Great teachers make learning exciting.",
  "Every student matters.",
  "Encourage curiosity every day.",
  "Learning builds stronger communities.",
  "Teach with dedication and care.",
  "Success begins in the classroom.",
  "Every lesson creates possibilities.",
  "Education is the key to progress.",
  "Inspire confidence through kindness.",
  "Great teachers build great minds.",
  "Every classroom shapes the future.",
  "Learning is the path to growth.",
  "Education changes everything.",
  "Every student has unlimited potential.",
  "Teach with enthusiasm.",
  "Knowledge inspires innovation.",
  "Every day is a learning opportunity.",
  "Build futures with education.",
  "Inspire minds, touch hearts.",
  "Teaching creates lasting impact.",
  "Every lesson counts.",
  "Learning creates leaders.",
  "Knowledge is a lifelong treasure.",
  "Great teachers inspire greatness.",
  "Every classroom is a place of hope.",
  "Encourage learning with positivity.",
  "Success begins with education.",
  "Every child can achieve greatness.",
  "Teaching is making a difference.",
  "Inspire, educate, empower.",
  "Every lesson builds confidence.",
  "Learning creates opportunities.",
  "Teach with passion every day.",
  "Education shapes the world.",
  "Every student is capable of success.",
  "Great teachers leave lasting memories.",
  "Learning is the greatest adventure.",
  "Together, we inspire brighter futures."
];

async function seedQuotes() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    
    // Create the table
    await Quote.sync({ force: true }); // force: true drops it if it exists and creates fresh
    console.log('Quote table created.');

    const quoteObjects = quotes.map(text => ({ text }));
    await Quote.bulkCreate(quoteObjects);
    
    console.log('Successfully seeded 100 quotes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quotes:', error);
    process.exit(1);
  }
}

seedQuotes();
