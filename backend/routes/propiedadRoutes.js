const express = require('express');
const router = express.Router();
const {
    registrarPropiedad,
    obtenerPropiedades,
    obtenerPropiedadPorDireccion
} = require('../controllers/propiedadController');

// Obtener todas las propiedades
router.get('/', obtenerPropiedades);

// Registrar nueva propiedad
router.post('/', registrarPropiedad);

// Obtener una propiedad por su dirección
router.get('/:direccion', obtenerPropiedadPorDireccion);

module.exports = router;




