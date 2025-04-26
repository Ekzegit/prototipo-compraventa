const { web3 } = require('./contratoService');
const RegistroPropiedades = require('../../build/contracts/RegistroPropiedades.json');
const CompraventaInmobiliaria = require('../../build/contracts/CompraventaInmobiliaria.json');

const registroDireccion = process.env.CONTRACT_ADDRESS;
const notarioAutorizado = process.env.NOTARIO?.toLowerCase();

const registroContrato = new web3.eth.Contract(RegistroPropiedades.abi, registroDireccion);

// Utilidad para sanitizar BigInt
const sanitize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v));

// ✅ Crear solicitud
const crearSolicitud = async (req, res) => {
    try {
        const { propiedadId, comprador, oferta } = req.body;

        if (!propiedadId || !comprador || !oferta) {
            return res.status(400).json({ error: "Debe proporcionar propiedadId, comprador y oferta." });
        }

        const ofertaWei = oferta.toString().trim();
        if (!/^\d+$/.test(ofertaWei)) {
            return res.status(400).json({ error: "La oferta debe ser un número válido en Wei." });
        }

        const contratoPropiedad = new web3.eth.Contract(CompraventaInmobiliaria.abi, propiedadId);
        const precioEnContrato = await contratoPropiedad.methods.precio().call();

        if (ofertaWei !== precioEnContrato.toString().trim()) {
            return res.status(400).json({
                error: "El valor enviado no coincide con el precio de la propiedad.",
                esperado: precioEnContrato.toString(),
                recibido: ofertaWei
            });
        }

        const resultado = await contratoPropiedad.methods.solicitarCompra().send({
            from: comprador,
            value: ofertaWei,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        res.json({
            mensaje: "✅ Solicitud de compra creada exitosamente.",
            resultado: sanitize(resultado)
        });

    } catch (error) {
        console.error("❌ Error al crear la solicitud de compra:", error?.cause?.message || error.message);
        res.status(500).json({ error: "Error al crear la solicitud de compra.", detalles: error?.cause?.message || error.message });
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

        res.json({
            mensaje: "✅ Solicitud aceptada correctamente.",
            resultado: sanitize(resultado)
        });

    } catch (error) {
        console.error("❌ Error al aceptar la solicitud:", error?.cause?.message || error.message);
        res.status(500).json({ error: "Error al aceptar la solicitud.", detalles: error?.cause?.message || error.message });
    }
};

// ✅ Verificar transacción
const verificarTransaccion = async (req, res) => {
    try {
        const { direccionContrato, notario } = req.body;

        if (!direccionContrato || !notario) {
            return res.status(400).json({ error: "Debe proporcionar dirección del contrato y notario." });
        }

        if (notario.toLowerCase() !== notarioAutorizado) {
            return res.status(403).json({ error: "❌ No está autorizado como notario." });
        }

        const contrato = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccionContrato);

        const resultado = await contrato.methods.verificarTransaccion().send({
            from: notario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        res.json({
            mensaje: "✅ Transacción verificada correctamente.",
            resultado: sanitize(resultado)
        });

    } catch (error) {
        console.error("❌ Error al verificar la transacción:", error?.cause?.message || error.message);
        res.status(500).json({ error: "Error al verificar la transacción.", detalles: error?.cause?.message || error.message });
    }
};

// ✅ Obtener solicitudes activas
const obtenerTodasLasSolicitudes = async (req, res) => {
    try {
        const cuenta = req.query.cuenta?.toLowerCase();
        const tipo = req.query.tipo?.toLowerCase();

        const total = await registroContrato.methods.contadorPropiedades().call();
        const solicitudes = [];

        for (let i = 1; i <= total; i++) {
            const datos = await registroContrato.methods.propiedadesRegistradas(i).call();
            const direccion = datos.contratoDireccion;

            const contrato = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccion);
            const resumen = await contrato.methods.getResumen().call();

            const propietarioActual = resumen[0];
            const descripcion = resumen[2];
            const precio = resumen[3];
            const comprador = resumen[5];
            const oferta = resumen[6];
            const aceptada = resumen[7];
            const verificada = resumen[8];

            if (!comprador || comprador === "0x0000000000000000000000000000000000000000") continue;
            if (verificada) continue; // ⚡️ No mostrar solicitudes finalizadas

            const esComprador = cuenta === comprador.toLowerCase();
            const esPropietario = cuenta === propietarioActual.toLowerCase();
            const cumpleFiltro =
                !cuenta ||
                (tipo === "compras" && esComprador) ||
                (tipo === "ventas" && esPropietario);

            if (cumpleFiltro) {
                solicitudes.push({
                    id: i.toString(),
                    propiedadId: datos.id.toString(),
                    nombre: descripcion,
                    direccionContrato: direccion,
                    propietario: propietarioActual,
                    comprador,
                    oferta: web3.utils.fromWei(oferta.toString(), 'ether') + ' ETH',
                    estado: aceptada ? 'Aceptada' : 'Pendiente'
                });
            }
        }

        res.json(solicitudes);
    } catch (error) {
        console.error("❌ Error al obtener solicitudes:", error?.message);
        res.status(500).json({ error: "Error al obtener solicitudes.", detalles: error.message });
    }
};

// ✅ Obtener historial
// ✅ Obtener historial (solo transacciones verificadas)
const obtenerHistorial = async (req, res) => {
    try {
        const cuenta = req.query.cuenta?.toLowerCase();
        if (!cuenta) {
            return res.status(400).json({ error: "Debe proporcionar una cuenta." });
        }

        const total = await registroContrato.methods.contadorPropiedades().call();
        const historial = [];

        for (let i = 1; i <= total; i++) {
            const datos = await registroContrato.methods.propiedadesRegistradas(i).call();
            const direccion = datos.contratoDireccion;

            const contrato = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccion);
            const resumen = await contrato.methods.getResumen().call();

            const propietarioActual = resumen[0];
            const descripcion = resumen[2];
            const precio = resumen[3];
            const estado = parseInt(resumen[4]);
            const comprador = resumen[5];
            const oferta = resumen[6];
            const aceptada = resumen[7];
            const verificada = resumen[8];
            const propietarioOriginal = resumen[9]; // ✨ Aquí capturamos el vendedor original

            // ✅ Solo considerar propiedades VERIFICADAS
            if (!verificada) continue;

            const fueComprador = comprador && cuenta === comprador.toLowerCase();
            const fuePropietario = propietarioOriginal && cuenta === propietarioOriginal.toLowerCase();
            const fueNotario = cuenta === notarioAutorizado;

            if (fueComprador || fuePropietario || fueNotario) {
                historial.push({
                    id: i.toString(),
                    propiedadId: datos.id.toString(),
                    nombre: descripcion,
                    direccionContrato: direccion,
                    propietario: propietarioActual, // este sigue siendo el actual, no el original
                    comprador,
                    oferta: web3.utils.fromWei(oferta.toString(), 'ether') + ' ETH',
                    estado: 'Verificada', // porque filtramos arriba
                    rol: fueComprador ? 'comprador' : fuePropietario ? 'vendedor' : 'notario'
                });
            }
        }

        res.json(historial);
    } catch (error) {
        console.error("❌ Error al obtener el historial:", error);
        res.status(500).json({ error: "Error al obtener el historial.", detalles: error.message });
    }
};


module.exports = {
    crearSolicitud,
    aceptarSolicitud,
    verificarTransaccion,
    obtenerTodasLasSolicitudes,
    obtenerHistorial
};
