const express = require('express');
const { crearSolicitud, aceptarSolicitud } = require('../controllers/solicitudController');

const router = express.Router();

router.post('/', crearSolicitud);  // POST /api/solicitudes
router.post('/aceptar', aceptarSolicitud); // POST /api/solicitudes/aceptar

module.exports = router;
