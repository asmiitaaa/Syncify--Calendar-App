const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "+05:30",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected!");
  db.query("SET time_zone = '+05:30'");
});

module.exports = db;
