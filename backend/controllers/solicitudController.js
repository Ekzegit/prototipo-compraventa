const { contrato, web3 } = require('./contratoService');

// Crear una solicitud de compra
exports.crearSolicitud = async (req, res) => {
    try {
        const { propiedadId, comprador, oferta } = req.body;
        const propiedad = await contrato.methods.propiedades(propiedadId).call();

        if (propiedad.propietario.toLowerCase() === comprador.toLowerCase()) {
            return res.status(400).json({ error: 'El propietario no puede comprar su propia propiedad' });
        }

        const resultado = await contrato.methods.solicitarCompraventa(propiedadId).send({
            from: comprador,
            value: oferta,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice(),
        });

        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) => typeof value === 'bigint' ? value.toString() : value));
        res.json({ mensaje: 'Solicitud de compra creada exitosamente.', resultado });

    } catch (error) {
        console.error('Error al crear la solicitud de compra:', error);
        res.status(500).json({ error: 'Error al crear la solicitud de compra.', detalles: error.message });
    }
};

// Aceptar solicitud de compra
exports.aceptarSolicitud = async (req, res) => {
    try {
        const { solicitudId, propietario } = req.body;

        const resultado = await contrato.methods.aceptarSolicitud(solicitudId).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice(),
        });

        res.json({ mensaje: 'Solicitud de compra aceptada exitosamente.', resultado });

    } catch (error) {
        console.error('Error al aceptar la solicitud de compra:', error);
        res.status(500).json({ error: 'Error al aceptar la solicitud de compra.', detalles: error.message });
    }
};
