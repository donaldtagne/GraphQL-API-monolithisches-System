const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost', /*Hostname deiner MariaDB-Instanz*/
  user: 'root', /*Benutzername deiner MariaDB-Datenbank*/
  password: 'hallochris', /*Passwort deiner MariaDB-Datenbank*/
  database: 'customer' /* Name der Datenbank*/
});

db.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log('Connected to MariaDB database.');
  }
  /*Customertabelle erstellen*/
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS customer (
    C_id INT  PRIMARY KEY,
    C_UNAME VARCHAR(255) NOT NULL,
    C_PASSWD VARCHAR(255) UNIQUE NOT NULL,
    C_FNAME VARCHAR(255),
    C_LNAME VARCHAR(255),
    C_ADDR_ID VARCHAR(255) UNIQUE NOT NULL,
    C_EMAIL VARCHAR(255) UNIQUE NOT NULL,
    C_SINCE FLOAT,
    C_LAST_LOGIN DATE NOT NULL,
    C_LOGIN VARCHAR(255) UNIQUE NOT NULL,
    C_EXPIRATION DATE NOT NULL,
    C_DISCOUNT DECIMAL(10, 2) NOT NULL,
    C_BALANCE DECIMAL(10, 2)  NOT NULL,
    C_YTD_PMT DECIMAL(10, 2)  NOT NULL,
    C_BIRTHDATE DATE NOT NULL
  )
`;

  /*Überprüfe, ob die Tabelle bereits vorhanden ist*/
  db.query('SHOW TABLES LIKE "customer"', (err, results) => {
    if (err) {
      throw err;
    }

    if (results.length === 0) {
      /* Table does not exist, create it */
      db.query(createTableQuery, (err) => {
        if (err) {
          throw err;
        }
        console.log('Customer table created.');
        insertData();
      });
    } else {
      console.log('Customer table exists.');
      
      const deleteQuery = `DELETE FROM customer`;
    
      db.query(deleteQuery, (err) => {
        if (err) {
          throw err;
        }
    
        console.log('Data deleted successfully.');
    
        insertData();
      });
    }
  });
  
  function generateCustomers(numCustomers) {
    const customers = [];
    for(let i = 1; i <= numCustomers; i++) {
      const user = `user${i}`;
      const password = `password${i}`;
      const firstName = `First${i}`;
      const lastName = `Last${i}`;
      const address = `address${i}`;
      const email = `${user}@example.com`;
      const c_since = 1 + (i * 0.1);
      const last_login = `2022-06-${String((i % 30) + 1).padStart(2, '0')}`;;
      const login = user;
      const expiration = `2023-06-${String((i % 30) + 1).padStart(2, '0')}`;
      const discount = (i * 0.1).toFixed(1);
      const balance = String(i * 100);
      const ytd_pmt = String(i * 1000);
      const birthdate = `1990-${String((i % 12) + 1).padStart(2, '0')}-10`;
      customers.push([i, user, password, firstName, lastName, address, email, c_since, last_login, login, expiration, discount, balance, ytd_pmt, birthdate]);
    }
    return customers;
  }

  function insertData() {
    const insertQuery = `
      INSERT INTO customer (C_id, C_UNAME, C_PASSWD, C_FNAME, C_LNAME, C_ADDR_ID, C_EMAIL,C_SINCE,C_LAST_LOGIN, C_LOGIN, C_EXPIRATION, C_DISCOUNT, C_BALANCE, C_YTD_PMT, C_BIRTHDATE)
      VALUES ?
    `;
  
    const customers = generateCustomers(70000); // Erstellt 5 Kunden
  
    db.query(insertQuery, [customers], (err) => {
      if (err) {
        throw err;
      }
  
      console.log('Data inserted successfully.');
    });
  }
  
});

module.exports = db;
