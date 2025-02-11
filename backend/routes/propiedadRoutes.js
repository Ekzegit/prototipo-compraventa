const express = require('express');
const { obtenerPropiedad, aceptarSolicitud } = require('../controllers/propiedadController');
const router = express.Router();

router.get('/:id', obtenerPropiedad);

// Nueva ruta para aceptar una solicitud de compra
router.post('/aceptarSolicitud', aceptarSolicitud);

module.exports = router;
