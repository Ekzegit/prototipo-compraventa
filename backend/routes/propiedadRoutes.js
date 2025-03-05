const express = require('express');
const router = express.Router();
const { registrarPropiedad, obtenerPropiedad, obtenerPropiedades, aceptarSolicitud } = require('../controllers/propiedadController');

// Nueva ruta para obtener todas las propiedades
router.get('/', obtenerPropiedades);

// Ruta para registrar una propiedad
router.post('/', registrarPropiedad);

// Ruta para obtener una propiedad por ID
router.get('/:id', obtenerPropiedad);

// Ruta para aceptar una solicitud de compra
router.post('/aceptarSolicitud', aceptarSolicitud);

module.exports = router;


