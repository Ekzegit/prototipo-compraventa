const { contrato, web3 } = require('./contratoService');

// Crear una solicitud de compra
exports.crearSolicitud = async (req, res) => {
    try {
        const { propiedadId, comprador, oferta } = req.body;

        if (!propiedadId || !comprador || !oferta) {
            return res.status(400).json({ error: "Debe proporcionar propiedadId, comprador y oferta." });
        }

        // Convertir oferta de ETH a Wei si está en formato numérico
        const ofertaWei = web3.utils.toWei(oferta.toString(), "ether");

        console.log(`Oferta convertida a Wei: ${ofertaWei}`);

        // Obtener la propiedad
        const propiedad = await contrato.methods.propiedades(propiedadId).call();
        console.log(`Precio esperado de la propiedad: ${propiedad.precio.toString()}`);

        // Verificar si la oferta coincide con el precio de la propiedad
        if (ofertaWei !== propiedad.precio.toString()) {
            return res.status(400).json({
                error: "El valor enviado no coincide con el precio de la propiedad.",
                esperado: propiedad.precio.toString(),
                recibido: ofertaWei
            });
        }

        // Crear la solicitud de compra
        const resultado = await contrato.methods.solicitarCompraventa(propiedadId).send({
            from: comprador,
            value: ofertaWei,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        res.json({
            mensaje: "Solicitud de compra creada exitosamente.",
            resultado: JSON.parse(JSON.stringify(resultado, (key, value) =>
                typeof value === "bigint" ? value.toString() : value
            ))
        });


    } catch (error) {
        console.error("Error al crear la solicitud de compra:", error);
        res.status(500).json({ error: "Error al crear la solicitud de compra.", detalles: error.message });
    }
};



// Aceptar solicitud de compra
exports.aceptarSolicitud = async (req, res) => {
    try {
        const { solicitudId, propietario } = req.body;

        if (!solicitudId || !propietario) {
            return res.status(400).json({ error: "Debe proporcionar solicitudId y propietario." });
        }

        // Ejecutar la transacción en la blockchain
        const resultado = await contrato.methods.aceptarSolicitud(solicitudId).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        // Convertir BigInt a string para evitar errores de serialización
        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            mensaje: "Solicitud de compra aceptada exitosamente.",
            resultado: resultadoFormateado
        });

    } catch (error) {
        console.error("Error al aceptar la solicitud de compra:", error);
        res.status(500).json({
            error: "Error al aceptar la solicitud de compra.",
            detalles: error.message
        });
    }
};


// función para obtener una solicitud de compra por ID
exports.obtenerSolicitud = async (req, res) => {
    try {
        const solicitudId = req.params.id;
        const solicitud = await contrato.methods.solicitudes(solicitudId).call();

        // Verificar si la solicitud existe
        if (solicitud.comprador === '0x0000000000000000000000000000000000000000') {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        // Convertir valores BigInt a string
        const solicitudFormateada = {
            id: solicitudId,
            propiedadId: solicitud.propiedadId.toString(),
            comprador: solicitud.comprador,
            oferta: web3.utils.fromWei(solicitud.oferta.toString(), 'ether') + ' ETH',
            estado: solicitud.aceptada ? (solicitud.verificada ? "Verificada" : "Aceptada") : "Pendiente"
        };

        res.json(solicitudFormateada);
    } catch (error) {
        console.error('Error al obtener la solicitud:', error);
        res.status(500).json({ error: 'Error al obtener la solicitud.', detalles: error.message });
    }
};

exports.verificarTransaccion = async (req, res) => {
    try {
        const { solicitudId, notario } = req.body;

        if (!solicitudId || !notario) {
            return res.status(400).json({ error: 'Debe proporcionar solicitudId y notario.' });
        }

        // Llamar al contrato para verificar la transacción
        const resultado = await contrato.methods.verificarTransaccion(solicitudId).send({
            from: notario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        // Convertir cualquier BigInt a string para evitar errores de serialización
        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            mensaje: 'Transacción verificada correctamente.',
            resultado: resultadoFormateado
        });

    } catch (error) {
        console.error('Error al verificar la transacción:', error);
        res.status(500).json({ error: 'Error al verificar la transacción.', detalles: error.message });
    }
};

