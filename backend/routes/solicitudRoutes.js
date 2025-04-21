const express = require('express');
const router = express.Router();
const {
    crearSolicitud,
    aceptarSolicitud,
    verificarTransaccion,
    obtenerTodasLasSolicitudes
} = require('../controllers/solicitudController');

router.post('/', crearSolicitud);
router.post('/aceptar', aceptarSolicitud);          // Asegúrate de que esté activa
router.post('/verificar', verificarTransaccion);    // Asegúrate de que esté activa
router.get('/', obtenerTodasLasSolicitudes);

module.exports = router;
