const mysql2 = require("mysql2");

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_HOST:", process.env.DB_HOST || "localhost");

const dbConnection = mysql2.createPool({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST || "localhost",
  password: process.env.DB_PASSWORD,
  connectionLimit: 10,
});

module.exports = dbConnection.promise();

// const mysql2 = require("mysql2");

// const dbConection = mysql2.createPool({
//   user: process.env.USER,
//   database: process.env.DATABASE,
//   host: "localhost",
//   password: process.env.PASSWORD,
//   connectionLimit: 10,
// });

// module.exports = dbConection.promise();
