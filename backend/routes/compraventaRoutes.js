const express = require('express');
const router = express.Router();
const {
    crearContratoCompraventa,
    obtenerContratoCompraventa,
    aceptarCompraventa,
    verificarCompraventa
} = require('../controllers/compraventaController');

// Ruta para crear un contrato individual de compraventa
router.post('/crear', crearContratoCompraventa);

// Ruta para obtener detalles del contrato de una propiedad
router.get('/:propiedadId', obtenerContratoCompraventa);

// Ruta para aceptar la solicitud de compraventa
router.post('/aceptar', aceptarCompraventa);

// Ruta para verificar la compraventa (por notario)
router.post('/verificar', verificarCompraventa);

module.exports = router;
