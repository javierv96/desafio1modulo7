// Importación de los módulos necesarios
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// Creación de la aplicación Express
const app = express();

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json())

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT, // Cambiar puerto según corresponda en archivo .env
});

// Nombre de la tabla en la base de datos
let tabla = 'estudiantes';

// Puerto donde escuchará el servidor
const PORT = process.env.SV_PORT || 3000;

// Inicio del servidor Express
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Ruta para obtener todos los estudiantes
app.get('/estudiantes', async (req, res) => {
    try {

        const { rows } = await pool.query('SELECT * FROM ' + tabla);

        res.json(
            {
                estudiantes: rows
            });

    } catch (error) {
        errores(error, res);
    }
});

// Ruta para obtener un estudiante por su rut
app.get('/estudiantes/:rut', async (req, res) => {
    const valorRut = req.params.rut;

    try {

        const { rows } = await pool.query('SELECT * FROM ' + tabla + ' WHERE rut = $1',
            [valorRut]
        );

        if (rows.length == 0) {
            console.log("El registro con rut: " + valorRut + " no existe.");
            return res.status(400).send("El registro con rut: " + valorRut + " no existe.");
        }

        res.json(
            {
                estudiantes: rows
            });

    } catch (error) {
        errores(error, res);
    }
});

// Ruta para agregar un nuevo estudiante
app.post('/estudiantes', async (req, res) => {
    try {

        const { nombre, rut, curso, nivel } = req.body;

        if (!nombre || !rut || !curso || !nivel) {
            return res.status(400).json({ error: 'Por favor, proporciona nombre, rut, curso y nivel.' });
        }

        const nuevoEstudiante = await pool.query(
            'INSERT INTO estudiantes (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, rut, curso, nivel]
        );

        res.status(201).json(
            {
                message: 'Usuario agregado correctamente.', usuario: nuevoEstudiante.rows[0]
            });

    } catch (error) {
        errores(error, res); // Manejo de errores
    }
});

// Ruta para actualizar los datos de un estudiante
app.put('/estudiantes/:rut', async (req, res) => {
    const valorRut = req.params.rut;
    const { nombre, curso, nivel } = req.body;

    try {

        const { rows } = await pool.query(
            'UPDATE estudiantes SET nombre = $1, curso = $2, nivel = $3 WHERE rut = $4 RETURNING *',
            [nombre, curso, nivel, valorRut]
        );

        if (rows.length == 0) {
            console.log("El registro con rut: " + valorRut + " no existe.");
            return res.status(400).send("El registro con rut: " + valorRut + " no existe.");
        }

        res.json(
            {
                estudiantes: rows
            });

    } catch (error) {
        errores(error, res);
    }
});

// Ruta para eliminar un estudiante por su rut
app.delete('/estudiantes/:rut', async (req, res) => {
    const valorRut = req.params.rut;
    try {

        const { rows } = await pool.query('DELETE FROM estudiantes WHERE rut = $1 RETURNING *',
            [valorRut]
        );

        if (rows.length == 0) {
            console.log("El registro con rut: " + valorRut + " no existe.");
            return res.status(400).send("El registro con rut: " + valorRut + " no existe.");
        }

        res.json(
            {
                message: `Estudiante con rut ${valorRut} eliminado correctamente`
            });

    } catch (error) {
        errores(error, res);
    }
});

// Función para manejar los errores de la base de datos
const errores = (error, res) => {
    let status;
    let errorMessage;

    // Manejo de diferentes tipos de errores
    switch (error.code) {
        case '28P01':
            status = 400;
            errorMessage = "La autenticación de la contraseña falló o no existe el usuario: " + pool.options.user;
            break;
        case '42P01':
            status = 400;
            errorMessage = "No existe la tabla [" + tabla + "] consultada";
            break;
        case '3D000':
            status = 400;
            errorMessage = "La base de datos [" + pool.options.database + "] no existe";
            break;
        case 'ENOTFOUND':
            status = 500;
            errorMessage = "Error en el valor usado como localhost: " + pool.options.host;
            break;
        case 'ECONNREFUSED':
            status = 500;
            errorMessage = "Error en el puerto de conexión a la base de datos, usando: " + pool.options.port;
            break;
        default:
            status = 500;
            errorMessage = "Error desconocido: " + error.message;
            break;
    }

    // Envío de la respuesta de error
    res.status(status).json(
        {
            error: errorMessage
        });
}