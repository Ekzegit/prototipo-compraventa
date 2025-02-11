const { contrato, web3 } = require('../controllers/contratoService');

// Ruta para obtener una propiedad por ID
exports.obtenerPropiedad = async (req, res) => {
    try {
        const propiedadId = req.params.id;
        const propiedad = await contrato.methods.propiedades(propiedadId).call();

        // Verificar si la propiedad existe
        if (propiedad.propietario === '0x0000000000000000000000000000000000000000') {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }

        const estadosPropiedad = ["Disponible", "En negociación", "Vendida"];

        // Convertir valores BigInt a string para evitar problemas de serialización
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

// ✅ Nueva función para aceptar una solicitud de compra
exports.aceptarSolicitud = async (req, res) => {
    try {
        const { solicitudId, propietario } = req.body;

        if (!solicitudId || !propietario) {
            return res.status(400).json({ error: 'Debe proporcionar solicitudId y propietario.' });
        }

        const resultado = await contrato.methods.aceptarSolicitud(solicitudId).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice() // ✅ Corregido
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

