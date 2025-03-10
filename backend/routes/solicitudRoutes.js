const express = require('express');
const router = express.Router();

const {
    crearSolicitud,
    aceptarSolicitud,
    obtenerSolicitud,
    verificarTransaccion,
    obtenerTodasLasSolicitudes
} = require('../controllers/solicitudController');

// Verificación de que las funciones estén correctamente importadas
const verificarFunciones = {
    crearSolicitud,
    aceptarSolicitud,
    obtenerSolicitud,
    verificarTransaccion,
    obtenerTodasLasSolicitudes
};

Object.entries(verificarFunciones).forEach(([nombre, funcion]) => {
    if (typeof funcion !== 'function') {
        console.error(`❌ Error: La función '${nombre}' no está definida en solicitudController.js`);
        throw new Error(`❌ Error: La función '${nombre}' no está definida o no es una función válida.`);
    }
});

// Rutas de solicitudes
router.post('/', crearSolicitud);
router.post('/aceptar', aceptarSolicitud);
router.get('/:id', obtenerSolicitud);
router.post('/verificar', verificarTransaccion);
router.get('/', obtenerTodasLasSolicitudes);

module.exports = router;


