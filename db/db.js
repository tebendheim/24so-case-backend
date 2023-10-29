const postgres = require("pg-promise")();
require("dotenv").config();

const dbConfig = {
  host: process.env.HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASENAME,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = postgres(dbConfig);

module.exports = db;
