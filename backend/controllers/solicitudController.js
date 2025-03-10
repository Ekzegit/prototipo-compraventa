const { contrato, web3 } = require('./contratoService');

// Crear una solicitud de compra
const crearSolicitud = async (req, res) => {
    try {
        const { propiedadId, comprador, oferta } = req.body;

        if (!propiedadId || !comprador || !oferta) {
            return res.status(400).json({ error: "Debe proporcionar propiedadId, comprador y oferta." });
        }

        // ✅ Convertir la oferta a string y asegurar formato correcto
        const ofertaWei = oferta.toString().trim();
        if (!/^\d+$/.test(ofertaWei)) {
            return res.status(400).json({ error: "La oferta debe ser un número válido en Wei." });
        }

        console.log(`📌 Oferta recibida en Wei: ${ofertaWei}`);

        // Obtener la propiedad desde el contrato
        const propiedad = await contrato.methods.propiedades(propiedadId).call();
        const precioPropiedad = propiedad.precio.toString().trim();
        console.log(`📌 Precio esperado de la propiedad en Wei: ${precioPropiedad}`);

        // ✅ Comparar precios en formato de string
        if (ofertaWei !== precioPropiedad) {
            return res.status(400).json({
                error: "El valor enviado no coincide con el precio de la propiedad.",
                esperado: precioPropiedad,
                recibido: ofertaWei
            });
        }

        // ✅ Enviar la transacción al contrato
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
        console.error("❌ Error al crear la solicitud de compra:", error);
        res.status(500).json({ error: "Error al crear la solicitud de compra.", detalles: error.message });
    }
};

// Aceptar solicitud de compra
const aceptarSolicitud = async (req, res) => {
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

        res.json({
            mensaje: "Solicitud de compra aceptada exitosamente.",
            resultado
        });

    } catch (error) {
        console.error("❌ Error al aceptar la solicitud de compra:", error);
        res.status(500).json({ error: "Error al aceptar la solicitud de compra.", detalles: error.message });
    }
};

// Obtener una solicitud de compra por ID
const obtenerSolicitud = async (req, res) => {
    try {
        const solicitudId = req.params.id;
        const solicitud = await contrato.methods.solicitudes(solicitudId).call();

        if (solicitud.comprador === '0x0000000000000000000000000000000000000000') {
            return res.status(404).json({ error: "Solicitud no encontrada" });
        }

        res.json({
            id: solicitudId,
            propiedadId: solicitud.propiedadId.toString(),
            comprador: solicitud.comprador,
            oferta: web3.utils.fromWei(solicitud.oferta.toString(), 'ether') + ' ETH',
            estado: solicitud.aceptada ? (solicitud.verificada ? "Verificada" : "Aceptada") : "Pendiente"
        });
    } catch (error) {
        console.error("❌ Error al obtener la solicitud:", error);
        res.status(500).json({ error: "Error al obtener la solicitud.", detalles: error.message });
    }
};

// Verificar la transacción
const verificarTransaccion = async (req, res) => {
    try {
        const { solicitudId, notario } = req.body;

        if (!solicitudId || !notario) {
            return res.status(400).json({ error: "Debe proporcionar solicitudId y notario." });
        }

        // Ejecutar la verificación en la blockchain
        const resultado = await contrato.methods.verificarTransaccion(solicitudId).send({
            from: notario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        // ✅ Convertir valores BigInt a string antes de enviarlos como JSON
        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        ));

        res.json({
            mensaje: "✅ Transacción verificada correctamente.",
            resultado: resultadoFormateado
        });

    } catch (error) {
        console.error("❌ Error al verificar la transacción:", error);
        res.status(500).json({ error: "Error al verificar la transacción.", detalles: error.message });
    }
};


// Obtener todas las solicitudes de compra
const obtenerTodasLasSolicitudes = async (req, res) => {
    try {
        const totalSolicitudes = await contrato.methods.contadorSolicitudes().call();
        let solicitudes = [];

        for (let i = 1; i <= totalSolicitudes; i++) {
            const solicitud = await contrato.methods.solicitudes(i).call();

            // Ignorar solicitudes vacías
            if (solicitud.comprador === '0x0000000000000000000000000000000000000000') continue;

            solicitudes.push({
                id: i,
                propiedadId: solicitud.propiedadId.toString(),
                comprador: solicitud.comprador,
                oferta: web3.utils.fromWei(solicitud.oferta.toString(), 'ether') + ' ETH',
                estado: solicitud.aceptada ? (solicitud.verificada ? "Verificada" : "Aceptada") : "Pendiente"
            });
        }

        res.json(solicitudes);
    } catch (error) {
        console.error("❌ Error al obtener todas las solicitudes:", error);
        res.status(500).json({ error: "Error al obtener todas las solicitudes.", detalles: error.message });
    }
};

// ✅ Exportar todas las funciones correctamente
module.exports = {
    crearSolicitud,
    aceptarSolicitud,
    obtenerSolicitud,
    verificarTransaccion,
    obtenerTodasLasSolicitudes
};
