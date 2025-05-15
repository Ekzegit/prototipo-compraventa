const express = require('express');
const router = express.Router();
const {
    crearSolicitud,
    aceptarSolicitud,
    verificarTransaccion,
    obtenerTodasLasSolicitudes,
    obtenerHistorial,
    rechazarSolicitud 
} = require('../controllers/solicitudController');

// ✅ Crear una nueva solicitud de compra
router.post('/', crearSolicitud);

// ✅ Aceptar una solicitud de compra
router.post('/aceptar', aceptarSolicitud);

// ✅ Verificar una transacción (por el notario)
router.post('/verificar', verificarTransaccion);

// ✅ Rechazar una solicitud (por el propietario)
router.post('/rechazar', rechazarSolicitud); 

// ✅ Listar solicitudes activas (filtradas por tipo: compras / ventas / validaciones)
router.get('/', obtenerTodasLasSolicitudes);

// ✅ Nuevo endpoint para obtener el historial completo
router.get('/historial', obtenerHistorial);

module.exports = router;
