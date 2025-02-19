const express = require('express');
const { crearSolicitud, aceptarSolicitud, obtenerSolicitud, verificarTransaccion} = require('../controllers/solicitudController');

const router = express.Router();

router.post('/', crearSolicitud);  // POST /solicitudes
router.post('/aceptar', aceptarSolicitud); // POST /solicitudes/aceptar
router.get('/:id', obtenerSolicitud); // GET /solicitudes/:id  Nueva ruta para obtener una solicitud
router.post('/verificar', verificarTransaccion); // POST /solicitudes/verificar


module.exports = router;

