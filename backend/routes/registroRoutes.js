const express = require('express');
const router = express.Router();
const {
    registrarPropiedadEnRegistro,
    obtenerPropiedadesDesdeRegistro
} = require('../controllers/registroController');

// Ruta para registrar una propiedad desde el contrato RegistroPropiedades
router.post('/registrar', registrarPropiedadEnRegistro);

// ✅ Nueva ruta: Obtener todas las propiedades registradas
router.get('/propiedades', obtenerPropiedadesDesdeRegistro); // Asegúrate de que esta función esté definida

module.exports = router;
