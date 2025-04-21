const { web3, contratoRegistro, getContratoCompraventa } = require('../controllers/contratoService');

// Crear contrato de compraventa para una propiedad
exports.crearContratoCompraventa = async (req, res) => {
    try {
        const { propiedadId, comprador, oferta } = req.body;

        if (!propiedadId || !comprador || !oferta) {
            return res.status(400).json({ error: 'Debe proporcionar propiedadId, comprador y oferta.' });
        }

        const ofertaWei = web3.utils.toWei(oferta, 'ether');

        const resultado = await contratoRegistro.methods.crearContrato(propiedadId, comprador).send({
            from: comprador,
            value: ofertaWei,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        const evento = resultado.events.ContratoCreado.returnValues;
        res.json({
            mensaje: 'Contrato de compraventa creado exitosamente.',
            contratoDireccion: evento.contrato,
            propiedadId: evento.propiedadId
        });
    } catch (error) {
        console.error('❌ Error al crear contrato de compraventa:', error);
        res.status(500).json({ error: 'Error al crear contrato de compraventa.', detalles: error.message });
    }
};

// Obtener detalles de un contrato de compraventa
exports.obtenerContratoCompraventa = async (req, res) => {
    try {
        const { propiedadId } = req.params;
        const direccionContrato = await contratoRegistro.methods.propiedadToContrato(propiedadId).call();

        if (direccionContrato === '0x0000000000000000000000000000000000000000') {
            return res.status(404).json({ error: 'No existe contrato para esta propiedad.' });
        }

        const contrato = getContratoCompraventa(direccionContrato);
        const descripcion = await contrato.methods.descripcion().call();
        const precio = await contrato.methods.precio().call();
        const estado = await contrato.methods.estado().call();
        const propietario = await contrato.methods.propietario().call();
        const comprador = await contrato.methods.comprador().call();

        res.json({
            propiedadId,
            contrato: direccionContrato,
            descripcion,
            precio: web3.utils.fromWei(precio, 'ether') + ' ETH',
            estado: ['Disponible', 'En proceso', 'Vendida'][estado],
            propietario,
            comprador
        });

    } catch (error) {
        console.error('❌ Error al obtener el contrato de compraventa:', error);
        res.status(500).json({ error: 'Error al obtener el contrato.', detalles: error.message });
    }
};

// Aceptar solicitud de compraventa
exports.aceptarCompraventa = async (req, res) => {
    try {
        const { propiedadId, propietario } = req.body;
        const direccionContrato = await contratoRegistro.methods.propiedadToContrato(propiedadId).call();

        const contrato = getContratoCompraventa(direccionContrato);

        const resultado = await contrato.methods.aceptar().send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        res.json({
            mensaje: '✅ Solicitud aceptada correctamente.',
            tx: resultado.transactionHash
        });
    } catch (error) {
        console.error('❌ Error al aceptar la compraventa:', error);
        res.status(500).json({ error: 'Error al aceptar compraventa.', detalles: error.message });
    }
};

// Verificar la compraventa (por notario)
exports.verificarCompraventa = async (req, res) => {
    try {
        const { propiedadId, notario } = req.body;
        const direccionContrato = await contratoRegistro.methods.propiedadToContrato(propiedadId).call();

        const contrato = getContratoCompraventa(direccionContrato);

        const resultado = await contrato.methods.verificar().send({
            from: notario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        res.json({
            mensaje: '✅ Transacción verificada exitosamente.',
            tx: resultado.transactionHash
        });
    } catch (error) {
        console.error('❌ Error al verificar la compraventa:', error);
        res.status(500).json({ error: 'Error al verificar la compraventa.', detalles: error.message });
    }
};
