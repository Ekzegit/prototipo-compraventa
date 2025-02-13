const express = require('express');
const router = express.Router();
const { registrarPropiedad, obtenerPropiedad, aceptarSolicitud } = require('../controllers/propiedadController');

// Ruta para registrar una propiedad
router.post('/', registrarPropiedad);  

// Ruta para obtener una propiedad
router.get('/:id', obtenerPropiedad);

// Ruta para aceptar una solicitud de compra
router.post('/aceptarSolicitud', aceptarSolicitud);

module.exports = router;

