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

exports.registrarPropiedad = async (req, res) => {
    try {
        const { descripcion, precio, propietario, imagenUrl } = req.body;

        if (!descripcion || !precio || !propietario) {
            return res.status(400).json({ error: 'Debe proporcionar descripción, precio y propietario.' });
        }

        const resultado = await contrato.methods
            .crearPropiedad(descripcion, web3.utils.toWei(precio, 'ether'))
            .send({
                from: propietario,
                gas: 3000000,
                gasPrice: await web3.eth.getGasPrice(),
            });

        const evento = resultado.events?.PropiedadCreada?.returnValues;
        const direccion = evento?.contratoDireccion;

        // 🧠 Guardar la imagen asociada a la propiedad
        if (direccion && imagenUrl) {
            const clave = direccion.toLowerCase();

            if (!imagenesPorContrato[clave]) {
                imagenesPorContrato[clave] = [];
            }

            if (!Array.isArray(imagenesPorContrato[clave])) {
                imagenesPorContrato[clave] = [imagenesPorContrato[clave]];
            }

            imagenesPorContrato[clave].push(imagenUrl);
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

exports.obtenerPropiedades = async (req, res) => {
    try {
        const propiedades = [];
        const total = await contrato.methods.contadorPropiedades().call();

        for (let i = 1; i <= total; i++) {
            const datos = await contrato.methods.propiedadesRegistradas(i).call();
            const direccion = datos.contratoDireccion;
            const clave = direccion.toLowerCase();

            const instancia = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccion);
            const resumen = await instancia.methods.getResumen().call();

            const estadoTexto = ['Disponible', 'En negociación', 'Vendida'][parseInt(resumen[4])] || 'Desconocido';

            propiedades.push({
                id: datos.id.toString(),
                nombre: resumen[2],
                precio: web3.utils.fromWei(resumen[3].toString(), 'ether'),
                propietario: resumen[0],
                direccionContrato: direccion,
                estado: estadoTexto,
                imagenesUrls: Array.isArray(imagenesPorContrato[clave])
                    ? imagenesPorContrato[clave]
                    : imagenesPorContrato[clave]
                        ? [imagenesPorContrato[clave]]
                        : []
            });
        }

        res.json(propiedades);
    } catch (error) {
        console.error("❌ Error al obtener propiedades:", error);
        res.status(500).json({ error: "Error al obtener propiedades.", detalles: error.message });
    }
};

exports.obtenerPropiedadPorDireccion = async (req, res) => {
    try {
        const { direccion } = req.params;

        if (!direccion || !web3.utils.isAddress(direccion)) {
            return res.status(400).json({ error: 'Dirección inválida.' });
        }

        const instancia = new web3.eth.Contract(CompraventaInmobiliaria.abi, direccion);
        const descripcion = await instancia.methods.descripcion().call();
        const precio = await instancia.methods.precio().call();
        const propietario = await instancia.methods.propietario().call();
        const estado = await instancia.methods.estado().call();

        // 🔎 Buscar el ID desde el contrato principal
        let idEncontrado = null;
        const total = await contrato.methods.contadorPropiedades().call();
        for (let i = 1; i <= total; i++) {
            const datos = await contrato.methods.propiedadesRegistradas(i).call();
            if (datos.contratoDireccion.toLowerCase() === direccion.toLowerCase()) {
                idEncontrado = i;
                break;
            }
        }

        const clave = direccion.toLowerCase();

        const propiedad = {
            id: idEncontrado,
            direccionContrato: direccion,
            descripcion,
            propietario,
            precio: web3.utils.fromWei(precio.toString(), 'ether') + ' ETH',
            estado: ['Disponible', 'En negociación', 'Vendida'][parseInt(estado)] || 'Desconocido',
            imagenesUrls: Array.isArray(imagenesPorContrato[clave])
                ? imagenesPorContrato[clave]
                : imagenesPorContrato[clave]
                    ? [imagenesPorContrato[clave]]
                    : []
        };

        res.json(propiedad);

    } catch (error) {
        console.error('❌ Error al obtener la propiedad por dirección:', error);
        res.status(500).json({ error: 'Error al obtener la propiedad.', detalles: error.message });
    }
};
