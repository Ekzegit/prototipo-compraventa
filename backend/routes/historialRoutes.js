const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');

// ✅ Ruta para obtener el historial completo
router.get('/', solicitudController.obtenerHistorial);

module.exports = router;
