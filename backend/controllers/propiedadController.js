﻿const { contrato, web3 } = require('../controllers/contratoService');

// Nueva función para registrar una propiedad
exports.registrarPropiedad = async (req, res) => {
    try {
        const { descripcion, precio, propietario } = req.body;

        if (!descripcion || !precio || !propietario) {
            return res.status(400).json({ error: 'Debe proporcionar descripción, precio y propietario.' });
        }

        const resultado = await contrato.methods.registrarPropiedad(descripcion, web3.utils.toWei(precio, 'ether')).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        res.json({
            mensaje: 'Propiedad registrada con éxito.',
            tx: resultado.transactionHash
        });

    } catch (error) {
        console.error('Error al registrar la propiedad:', error);
        res.status(500).json({ error: 'Error al registrar la propiedad.', detalles: error.message });
    }
};

// Función para obtener una propiedad por ID
exports.obtenerPropiedad = async (req, res) => {
    try {
        const propiedadId = req.params.id;
        const propiedad = await contrato.methods.propiedades(propiedadId).call();

        if (propiedad.propietario === '0x0000000000000000000000000000000000000000') {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }

        const estadosPropiedad = ["Disponible", "En negociación", "Vendida"];

        const propiedadFormateada = {
            id: propiedad.id.toString(),
            propietario: propiedad.propietario,
            descripcion: propiedad.descripcion,
            precio: web3.utils.fromWei(propiedad.precio.toString(), 'ether') + ' ETH',
            estado: estadosPropiedad[parseInt(propiedad.estado)] || "Desconocido"
        };

        res.json(propiedadFormateada);
    } catch (error) {
        console.error('Error al obtener la propiedad:', error);
        res.status(500).json({ error: 'Error al obtener la propiedad.', detalles: error.message });
    }
};

// Función para aceptar una solicitud de compra
exports.aceptarSolicitud = async (req, res) => {
    try {
        const { solicitudId, propietario } = req.body;

        if (!solicitudId || !propietario) {
            return res.status(400).json({ error: 'Debe proporcionar solicitudId y propietario.' });
        }

        const resultado = await contrato.methods.aceptarSolicitud(solicitudId).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        res.json({
            mensaje: 'Solicitud de compra aceptada exitosamente.',
            resultado
        });

    } catch (error) {
        console.error('Error al aceptar la solicitud de compra:', error);
        res.status(500).json({ error: 'Error al aceptar la solicitud de compra.', detalles: error.message });
    }
};

exports.obtenerPropiedades = async (req, res) => {
    try {
        const totalPropiedades = await contrato.methods.getTotalPropiedades().call();
        let propiedades = [];

        for (let i = 1; i <= totalPropiedades; i++) {
            const propiedad = await contrato.methods.propiedades(i).call();

            // Verificar que la propiedad realmente existe
            if (propiedad.propietario !== "0x0000000000000000000000000000000000000000") {
                propiedades.push({
                    id: propiedad.id.toString(),
                    nombre: propiedad.descripcion,
                    precio: web3.utils.fromWei(propiedad.precio.toString(), "ether") + " ETH",
                    estado: ["Disponible", "En negociación", "Vendida"][parseInt(propiedad.estado)] || "Desconocido",
                    propietario: propiedad.propietario
                });
            }
        }

        console.log("🔹 Propiedades obtenidas desde la blockchain:", propiedades);
        res.json(propiedades);

    } catch (error) {
        console.error("❌ Error al obtener propiedades:", error);
        res.status(500).json({ error: "Error al obtener propiedades.", detalles: error.message });
    }
};



