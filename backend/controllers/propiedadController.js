const { contrato, web3 } = require('../controllers/contratoService');
const CompraventaInmobiliaria = require('../../build/contracts/CompraventaInmobiliaria.json');
const fs = require('fs');
const path = require('path');

// 📁 Ruta del archivo persistente
const rutaImagenes = path.join(__dirname, '../data/imagenes.json');

// 🔁 Cargar imágenes guardadas si existen
let imagenesPorContrato = {};
if (fs.existsSync(rutaImagenes)) {
    imagenesPorContrato = JSON.parse(fs.readFileSync(rutaImagenes));
}

// 💾 Guardar imágenes en disco con manejo de error y log
const guardarImagenes = () => {
    try {
        fs.writeFileSync(rutaImagenes, JSON.stringify(imagenesPorContrato, null, 2));
        console.log("✅ Archivo imagenes.json guardado con éxito.");
    } catch (err) {
        console.error("❌ Error al guardar imagenes.json:", err);
    }
};

// 📋 Estados de las propiedades
const estados = ['Disponible', 'En proceso de venta', 'Vendida'];

// ✅ Registrar nueva propiedad
exports.registrarPropiedad = async (req, res) => {
    try {
        const { descripcion, precio, propietario, imagenUrl } = req.body;

        if (!descripcion || !precio || !propietario) {
            return res.status(400).json({ error: 'Debe proporcionar descripción, precio y propietario.' });
        }

        const resultado = await contrato.methods.crearPropiedad(
            descripcion, web3.utils.toWei(precio, 'ether')
        ).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice(),
        });

        const evento = resultado.events?.PropiedadCreada?.returnValues;
        const direccion = evento?.contratoDireccion?.toLowerCase();

        if (direccion && imagenUrl) {
            if (!imagenesPorContrato[direccion]) {
                imagenesPorContrato[direccion] = [];
            }

            if (!Array.isArray(imagenesPorContrato[direccion])) {
                imagenesPorContrato[direccion] = [imagenesPorContrato[direccion]];
            }

            imagenesPorContrato[direccion].push(imagenUrl);
            guardarImagenes();
        }

        res.json({
            mensaje: '✅ Propiedad registrada con éxito.',
            direccionContrato: direccion,
            tx: resultado.transactionHash
        });

    } catch (error) {
        console.error('❌ Error al registrar la propiedad:', error);
        res.status(500).json({ error: 'Error al registrar la propiedad.', detalles: error.message });
    }
};

// ✅ Obtener todas las propiedades
exports.obtenerPropiedades = async (req, res) => {
    try {
        const propiedades = [];
        const total = await contrato.methods.contadorPropiedades().call();

        for (let i = 1; i <= total; i++) {
            const datos = await contrato.methods.propiedadesRegistradas(i).call();
            const direccion = datos.contratoDireccion.toLowerCase();

            const instancia = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccion);
            const resumen = await instancia.methods.getResumen().call();
            console.log("📦 Estado recibido para propiedad", datos.id.toString(), ":", resumen[4]);


            const estadoIndex = Number(resumen[4].toString());
            const estadoTexto = estados[estadoIndex] || 'Desconocido';

            propiedades.push({
                id: datos.id.toString(),
                nombre: resumen[2],
                descripcion: resumen[2],
                precio: web3.utils.fromWei(resumen[3].toString(), 'ether') + ' ETH',
                propietario: resumen[0],
                direccionContrato: direccion,
                estado: estadoTexto,
                imagenesUrls: Array.isArray(imagenesPorContrato[direccion]) ? imagenesPorContrato[direccion] : []
            });
        }

        res.json(propiedades);

    } catch (error) {
        console.error("❌ Error al obtener propiedades:", error);
        res.status(500).json({ error: "Error al obtener propiedades.", detalles: error.message });
    }
};

// ✅ Obtener propiedad por dirección
exports.obtenerPropiedadPorDireccion = async (req, res) => {
    try {
        const { direccion } = req.params;
        if (!direccion || !web3.utils.isAddress(direccion)) {
            return res.status(400).json({ error: 'Dirección inválida.' });
        }

        const direccionLower = direccion.toLowerCase();
        const instancia = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccionLower);
        const resumen = await instancia.methods.getResumen().call();

        // Buscar ID
        let idEncontrado = null;
        const total = await contrato.methods.contadorPropiedades().call();
        for (let i = 1; i <= total; i++) {
            const datos = await contrato.methods.propiedadesRegistradas(i).call();
            if (datos.contratoDireccion.toLowerCase() === direccionLower) {
                idEncontrado = datos.id.toString();
                break;
            }
        }

        const estadoIndex = Number(resumen[4].toString());
        const estadoTexto = estados[estadoIndex] || 'Desconocido';

        const propiedad = {
            id: idEncontrado,
            direccionContrato: direccionLower,
            descripcion: resumen[2],
            propietario: resumen[0],
            precio: web3.utils.fromWei(resumen[3].toString(), 'ether') + ' ETH',
            estado: estadoTexto,
            imagenesUrls: Array.isArray(imagenesPorContrato[direccionLower]) ? imagenesPorContrato[direccionLower] : []
        };

        res.json(propiedad);

    } catch (error) {
        console.error('❌ Error al obtener la propiedad por dirección:', error);
        res.status(500).json({ error: 'Error al obtener la propiedad.', detalles: error.message });
    }
};
