//require('dotenv').config(); // Завантажуємо змінні середовища з .env файлу
const { Pool } = require('pg'); // Імпорт бібліотеки pg для роботи з PostgreSQL

// Підключення до бази даних
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

module.exports = pool; // Експортуємо пул для використання в інших файлах
