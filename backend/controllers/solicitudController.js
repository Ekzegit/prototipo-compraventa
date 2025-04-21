const { web3 } = require('./contratoService');
const RegistroPropiedades = require('../../build/contracts/RegistroPropiedades.json');
const CompraventaInmobiliaria = require('../../build/contracts/CompraventaInmobiliaria.json');

const registroDireccion = process.env.CONTRACT_ADDRESS;
const registroContrato = new web3.eth.Contract(RegistroPropiedades.abi, registroDireccion);

// ✅ Crear solicitud
const crearSolicitud = async (req, res) => {
    try {
        const { propiedadId, comprador, oferta } = req.body;

        if (!propiedadId || !comprador || !oferta) {
            return res.status(400).json({ error: "Debe proporcionar propiedadId (dirección contrato), comprador y oferta." });
        }

        const ofertaWei = oferta.toString().trim();
        if (!/^\d+$/.test(ofertaWei)) {
            return res.status(400).json({ error: "La oferta debe ser un número válido en Wei." });
        }

        const contratoPropiedad = new web3.eth.Contract(CompraventaInmobiliaria.abi, propiedadId);
        const precioEnContrato = await contratoPropiedad.methods.precio().call();
        const precioEsperado = precioEnContrato.toString().trim();

        if (ofertaWei !== precioEsperado) {
            return res.status(400).json({
                error: "El valor enviado no coincide con el precio de la propiedad.",
                esperado: precioEsperado,
                recibido: ofertaWei
            });
        }

        const resultado = await contratoPropiedad.methods.solicitarCompra().send({
            from: comprador,
            value: ofertaWei,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        const resultadoSanitizado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            mensaje: "✅ Solicitud de compra creada exitosamente.",
            resultado: resultadoSanitizado
        });

    } catch (error) {
        console.error("❌ Error al crear la solicitud de compra:", error);
        res.status(500).json({ error: "Error al crear la solicitud de compra.", detalles: error.message });
    }
};

// ✅ Aceptar solicitud
const aceptarSolicitud = async (req, res) => {
    try {
        const { direccionContrato, propietario } = req.body;

        if (!direccionContrato || !propietario) {
            return res.status(400).json({ error: "Debe proporcionar dirección del contrato y propietario." });
        }

        const contrato = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccionContrato);

        const resultado = await contrato.methods.aceptarSolicitud().send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        const resultadoSanitizado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            mensaje: "✅ Solicitud aceptada correctamente.",
            resultado: resultadoSanitizado
        });

    } catch (error) {
        console.error("❌ Error al aceptar la solicitud:", error);
        res.status(500).json({ error: "Error al aceptar la solicitud.", detalles: error.message });
    }
};

// ✅ Verificar transacción
const verificarTransaccion = async (req, res) => {
    try {
        const { direccionContrato, notario } = req.body;

        if (!direccionContrato || !notario) {
            return res.status(400).json({ error: "Debe proporcionar dirección del contrato y notario." });
        }

        const contrato = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccionContrato);

        const resultado = await contrato.methods.verificarTransaccion().send({
            from: notario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        const resultadoSanitizado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            mensaje: "✅ Transacción verificada correctamente.",
            resultado: resultadoSanitizado
        });

    } catch (error) {
        console.error("❌ Error al verificar la transacción:", error);
        res.status(500).json({ error: "Error al verificar la transacción.", detalles: error.message });
    }
};

// ✅ Obtener todas las solicitudes con filtro opcional por cuenta
const obtenerTodasLasSolicitudes = async (req, res) => {
    try {
        const cuenta = req.query.cuenta?.toLowerCase();
        const total = await registroContrato.methods.contadorPropiedades().call();
        const solicitudes = [];

        for (let i = 1; i <= total; i++) {
            const datos = await registroContrato.methods.propiedadesRegistradas(i).call();
            const direccion = datos.contratoDireccion;

            const contrato = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccion);
            const resumen = await contrato.methods.getResumen().call();

            const propietario = resumen[0];
            const comprador = resumen[5];
            const oferta = resumen[6];
            const aceptada = resumen[7];
            const verificada = resumen[8];

            if (comprador === "0x0000000000000000000000000000000000000000") continue;

            if (!cuenta || cuenta === comprador.toLowerCase() || cuenta === propietario.toLowerCase()) {
                solicitudes.push({
                    id: i.toString(),
                    propiedadId: datos.id.toString(),
                    nombre: datos.descripcion,
                    direccionContrato: direccion,
                    propietario,
                    comprador,
                    oferta: web3.utils.fromWei(oferta.toString(), 'ether') + ' ETH',
                    estado: aceptada ? (verificada ? 'Verificada' : 'Aceptada') : 'Pendiente'
                });
            }
        }

        res.json(solicitudes);
    } catch (error) {
        console.error("❌ Error al obtener todas las solicitudes:", error);
        res.status(500).json({ error: "Error al obtener todas las solicitudes.", detalles: error.message });
    }
};

module.exports = {
    crearSolicitud,
    aceptarSolicitud,
    verificarTransaccion,
    obtenerTodasLasSolicitudes
};
