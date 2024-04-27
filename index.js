// Importacion de modulos necesarios
const pool = require('./configDb.js');
const errors = require('./handleErrors.js');

// Variables globales de index.js
let status = "";
let message = "";
let tabla = 'estudiantes';

// Expresiones regulares para validar datos
const letras = /^[a-zA-Z]+$/;
const numeros = /^[0-9]+$/;
const rutificador = /^[0-9.,-K]+$/;

// Manejo de argumentos de línea de comandos
const argumentos = process.argv.slice(2);
const funcion = argumentos[0]; // Comando
const rut = argumentos[1]; // RUT
const nombre = argumentos[2]; // Nombre
const curso = argumentos[3]; // Curso
const nivel = argumentos[4]; // Nivel

// Impresión de los argumentos recibidos
console.log("****************************");
console.log("Funcion: " + funcion);
console.log("Nombre: " + nombre);
console.log("Rut: " + rut);
console.log("Curso: " + curso);
console.log("Nivel: " + nivel);
console.log("****************************");

// Función para obtener todos los estudiantes
const getEstudiantes = async () => {
    try {

        const queryJson = {
            rowMode: "array",
            text: `SELECT * FROM ${tabla}`
        };

        const res = await pool.query(queryJson);

        if (res.rows.length === 0) {
            console.log("Aun no existen registros en la tabla");
            return;
        }

        console.log("Registro actual: ", res.rows);

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
    }
};

// Función para consultar un estudiante por su RUT
const consultaRut = async ({ rut }) => {
    try {

        if (!rut) {
            return console.log("Por favor, proporcione el rut");
        }

        if (rutificador.test(rut) && rut.length >= 9 && rut.length <= 12) {
            const queryJson = {
                text: `SELECT * FROM ${tabla} WHERE rut = $1`,
                values: [rut]
            };

            const res = await pool.query(queryJson);

            if (res.rows.length === 0) {
                console.log(`El registro con rut: ${rut} no existe`);
                return;
            }

            console.log(res.rows[0]);

        } else {
            return console.log("Ingrese un rut valido");
        }

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
    }
}

// Función para agregar un nuevo estudiante
const nuevoEstudiante = async ({ nombre, rut, curso, nivel }) => {
    try {

        if (!nombre || !rut || !curso || !nivel) {
            return console.log("Por favor, proporcione nombre, rut, curso y nivel. Si su rut termina en K escribala en mayusculas");
        }

        if (letras.test(nombre) && rutificador.test(rut) && letras.test(curso) && numeros.test(nivel)) {
            const queryJson = {
                text: `INSERT INTO ${tabla} (rut, nombre, curso, nivel) VALUES ($1, $2, $3, $4) RETURNING *`,
                values: [rut, nombre, curso, nivel]
            }

            const res = await pool.query(queryJson);

            console.log(`Estudiante ${nombre} agregado con exito`);
            console.log("Estudiante agregado: ", res.rows[0]);

        } else {
            return console.log("Debe ingresar datos validos. Si su rut termina en K escribala en mayusculas");
        }

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
    }
}

// Función para actualizar los datos de un estudiante
const actualizarEstudiante = async ({ rut, nombre, curso, nivel }) => {
    try {

        if (!nombre || !rut || !curso || !nivel) {
            return console.log("Por favor, proporcione nombre, rut, curso y nivel.");
        }

        if (letras.test(nombre) && rutificador.test(rut) && letras.test(curso) && numeros.test(nivel)) {
            const queryJsonSelect = {
                text: `SELECT * FROM ${tabla} WHERE rut = $1`,
                values: [rut]
            }

            // Consultar si el estudiante existe
            const consultaExistencia = await pool.query(queryJsonSelect);
            if (consultaExistencia.rows.length === 0) {
                console.log(`El registro con rut: ${rut} no existe`);
                return;
            }

            const queryJson = {
                text: `UPDATE ${tabla} SET nombre = $2, curso = $3, nivel = $4 WHERE rut = $1 RETURNING *`,
                values: [rut, nombre, curso, nivel]
            }

            // Actualizar el estudiante
            const res = await pool.query(queryJson);
            console.log(`Estudiante ${nombre} editado con éxito`);
            console.log("Estudiante actualizado: ", res.rows[0]);

        } else {
            return console.log("Debe ingresar datos validos");
        }

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
    }
}

// Función para eliminar un estudiante por su RUT
const eliminarEstudiante = async ({ rut }) => {
    try {

        if (!rut) {
            return console.log("Por favor, proporcione el rut");
        }

        if (rutificador.test(rut) && rut.length >= 9 && rut.length <= 12) {
            const queryJsonSelect = {
                text: `SELECT * FROM ${tabla} WHERE rut = $1`,
                values: [rut]
            }

            // Consultar si el estudiante existe
            const consultaExistencia = await pool.query(queryJsonSelect);
            if (consultaExistencia.rows.length === 0) {
                console.log(`El registro con rut: ${rut} no existe`);
                return;
            }

            const queryJson = {
                text: `DELETE FROM ${tabla} WHERE rut = $1 RETURNING *`,
                values: [rut]
            }

            const res = await pool.query(queryJson);
            console.log(`Registro de estudiante con rut: ${rut} eliminado`);
            console.log("Estudiante eliminado: ", res.rows[0]);

        } else {
            return console.log("Ingrese un rut valido");
        }

    } catch (err) {
        console.log("Error General: ", err)
        const final = errors(err.code, status, message);
        console.log("Codigo de Error: ", final.code);
        console.log("Status de Error: ", final.status);
        console.log("Mensaje de Error: ", final.message);
        console.log("Error Original: ", err.message);
    }
}

// Objeto que contiene las funciones disponibles
const funciones = {
    consulta: getEstudiantes,
    rut: consultaRut,
    nuevo: nuevoEstudiante,
    editar: actualizarEstudiante,
    eliminar: eliminarEstudiante
};

// Array con los nombres de las funciones disponibles
const arreglo = Object.keys(funciones);

// Ejecución principal
(async () => {
    // Verificar si la función solicitada existe y ejecutarla
    (arreglo.includes(funcion) == true)
        ? await funciones[funcion]({ rut, nombre, curso, nivel })
        : console.log("La funcion invocada" + funcion + " no es valida")

    // Cierre de la conexión con la base de datos
    pool.end()
})()