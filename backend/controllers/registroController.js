const { web3 } = require('./contratoService');
const fs = require('fs');
const path = require('path');

const RegistroPropiedadesABI = require('../../build/contracts/RegistroPropiedades.json');
const CompraventaInmobiliariaABI = require('../../build/contracts/CompraventaInmobiliaria.json');

const registroDireccion = process.env.CONTRACT_ADDRESS;
if (!registroDireccion) {
    throw new Error("⚠️ No se ha definido la dirección del contrato RegistroPropiedades en .env");
}

const registroContrato = new web3.eth.Contract(RegistroPropiedadesABI.abi, registroDireccion);

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
        console.log("✅ imagenes.json actualizado desde registroController.");
    } catch (err) {
        console.error("❌ Error al guardar imagenes.json:", err);
    }
};

const estados = ['Disponible', 'En proceso de venta', 'Vendida'];

// ✅ Registrar una propiedad desde RegistroPropiedades
exports.registrarPropiedadEnRegistro = async (req, res) => {
    try {
        const { descripcion, precio, propietario, imagenesUrls } = req.body;

        if (!descripcion || !precio || !propietario) {
            return res.status(400).json({ error: 'Debe proporcionar descripción, precio y dirección del propietario.' });
        }

        const precioEnWei = web3.utils.toWei(precio.toString(), 'ether');

        const resultado = await registroContrato.methods.crearPropiedad(descripcion, precioEnWei).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        const evento = resultado.events?.PropiedadCreada?.returnValues;

        if (evento?.contratoDireccion && Array.isArray(imagenesUrls)) {
            const direccion = evento.contratoDireccion.toLowerCase();
            imagenesPorContrato[direccion] = imagenesUrls;
            guardarImagenes();
        }

        res.json({
            mensaje: '✅ Propiedad registrada con éxito.',
            tx: resultado.transactionHash,
            datos: evento ? {
                id: evento.id.toString(),
                contratoDireccion: evento.contratoDireccion,
                propietario: evento.propietario,
                descripcion: evento.descripcion,
                precio: web3.utils.fromWei(evento.precio.toString(), 'ether'),
                imagenesUrls: imagenesPorContrato[evento.contratoDireccion.toLowerCase()] || []
            } : null
        });

    } catch (error) {
        console.error('❌ Error al registrar propiedad en el contrato RegistroPropiedades:\n', error);
        res.status(500).json({
            error: 'Error al registrar propiedad en el Registro.',
            detalles: error.message
        });
    }
};

// ✅ Obtener todas las propiedades registradas en el contrato con estado
exports.obtenerPropiedadesDesdeRegistro = async (req, res) => {
    try {
        const total = await registroContrato.methods.contadorPropiedades().call();
        const propiedades = [];

        for (let i = 1; i <= total; i++) {
            const data = await registroContrato.methods.propiedadesRegistradas(i).call();
            const direccion = data.contratoDireccion.toLowerCase();

            const instancia = new web3.eth.Contract(CompraventaInmobiliariaABI.abi, direccion);
            const resumen = await instancia.methods.getResumen().call();

            let estadoIndex;
            try {
                estadoIndex = Number(resumen[4].toString());
            } catch {
                estadoIndex = -1;
            }

            const estadoTexto = (estadoIndex >= 0 && estadoIndex < estados.length)
                ? estados[estadoIndex]
                : 'Desconocido';

            propiedades.push({
                id: data.id.toString(),
                contratoDireccion: data.contratoDireccion,
                propietario: data.propietario,
                descripcion: data.descripcion,
                precio: web3.utils.fromWei(data.precio.toString(), 'ether'),
                estado: estadoTexto,
                imagenesUrls: imagenesPorContrato[direccion] || []
            });
        }

        res.json(propiedades);
    } catch (error) {
        console.error("❌ Error al obtener propiedades desde el registro:", error);
        res.status(500).json({ error: "Error al obtener propiedades.", detalles: error.message });
    }
};
