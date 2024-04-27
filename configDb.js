const { Pool } = require("pg");
require('dotenv').config();

// Configuración de la conexión a la base de datos PostgreSQL
const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT, // Cambiar puerto según corresponda en archivo .env
};

const pool = new Pool(config);

module.exports = pool;