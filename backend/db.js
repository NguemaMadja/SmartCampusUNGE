// backend/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'smartcampusunge',
  process.env.DB_USER || 'piangel',
  process.env.DB_PASS || 'piangel',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
