const fs = require('fs');
const csv = require('csv-parser');
const { Student } = require('./db');

const filePath = '/Users/vividhan/Desktop/ClassTrack/IT C Parents NO - Sheet1.csv';
const results = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    try {
      console.log(`Parsed ${results.length} rows from CSV. Updating database...`);
      for (const row of results) {
        const rollNo = row['Roll no'];
        const phoneNo = row['Parent / Guardian Mobile Number'];
        
        if (rollNo && phoneNo) {
          await Student.update(
            { phone: phoneNo },
            { where: { roll_no: rollNo } }
          );
        }
      }
      console.log('Database successfully updated with student phone numbers!');
      process.exit(0);
    } catch (err) {
      console.error('Error updating DB:', err);
      process.exit(1);
    }
  });
