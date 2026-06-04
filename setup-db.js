const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // default for local xampp/wamp
      multipleStatements: true
    });

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await connection.query(sql);
    console.log('Successfully created database and tables!');
    
    await connection.end();
  } catch (err) {
    console.error('Error executing SQL:', err);
  }
}

run();
