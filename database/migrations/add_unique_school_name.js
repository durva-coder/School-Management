const mysql = require('mysql2/promise');
require('dotenv').config();

const addUniqueConstraint = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    // Check if the unique constraint already exists
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'schools' 
        AND CONSTRAINT_NAME = 'unique_school_name'
    `, [process.env.DB_NAME]);

    if (constraints.length > 0) {
      console.log('Unique constraint \'unique_school_name\' already exists.');
      return;
    }

    // Add unique constraint to the name column
    await connection.query(`
      ALTER TABLE schools 
      ADD CONSTRAINT unique_school_name UNIQUE (name)
    `);

    console.log('Unique constraint added to school name successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Cannot add unique constraint: Duplicate school names exist in the database.');
      console.error('Please remove duplicate school names first.');
    } else {
      console.error('Error adding unique constraint:', error.message);
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  addUniqueConstraint()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addUniqueConstraint };
