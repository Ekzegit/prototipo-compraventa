const express = require('express');
const cors = require('cors');
const Web3 = require('web3').default;

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json()); // Asegura que el backend pueda procesar JSON

// Configurar Web3 para conectarse a la blockchain local
const web3 = new Web3('http://127.0.0.1:8545');

// Importar el ABI y la dirección del contrato
const contratoABI = require('../build/contracts/CompraventaInmobiliaria.json').abi;
const contratoDireccion = '0xf82f6CFf4E69B4bFD9dc6A213c04d5E87ef3D910'; // Dirección del contrato

// Crear la instancia del contrato
const contrato = new web3.eth.Contract(contratoABI, contratoDireccion);


// Ruta para obtener los detalles de una propiedad por su ID
app.get('/propiedades/:id', async (req, res) => {
    try {
        const propiedadId = req.params.id;
        const propiedad = await contrato.methods.propiedades(propiedadId).call();

        // Convertir BigInt a String
        const propiedadFormateada = JSON.parse(JSON.stringify(propiedad, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(propiedadFormateada);
    } catch (error) {
        console.error('Error al obtener la propiedad:', error);
        res.status(500).json({ error: 'Error al obtener la propiedad.', detalles: error.message });
    }
});


// Ruta para crear una solicitud de compraventa
app.post('/solicitudes', async (req, res) => {
    try {
        const { propiedadId, comprador, oferta } = req.body;

        const resultado = await contrato.methods.solicitarCompraventa(propiedadId).send({
            from: comprador,
            value: oferta,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()  // Forzar el uso de transacciones legacy
        });

        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ mensaje: 'Solicitud de compra creada exitosamente.', resultado: resultadoFormateado });
    } catch (error) {
        console.error('Error al crear la solicitud de compra:', error);
        res.status(500).json({ error: 'Error al crear la solicitud de compra.', detalles: error.message });
    }
});

// Ruta para aceptar una solicitud de compraventa
app.post('/solicitudes/:id/aceptar', async (req, res) => {
    try {
        const solicitudId = req.params.id;
        const { propietario } = req.body;

        const resultado = await contrato.methods.aceptarSolicitud(solicitudId).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ mensaje: 'Solicitud de compra aceptada exitosamente.', resultado: resultadoFormateado });
    } catch (error) {
        console.error('Error al aceptar la solicitud de compra:', error);
        res.status(500).json({ error: 'Error al aceptar la solicitud de compra.', detalles: error.message });
    }
});

// Ruta para rechazar una solicitud de compraventa
app.post('/solicitudes/:id/rechazar', async (req, res) => {
    try {
        const solicitudId = req.params.id;
        const { propietario } = req.body;

        const resultado = await contrato.methods.rechazarSolicitud(solicitudId).send({
            from: propietario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ mensaje: 'Solicitud de compra rechazada exitosamente.', resultado: resultadoFormateado });
    } catch (error) {
        console.error('Error al rechazar la solicitud de compra:', error);
        res.status(500).json({ error: 'Error al rechazar la solicitud de compra.', detalles: error.message });
    }
});

// Ruta para que el notario verifique la transacción de compraventa
app.post('/solicitudes/:id/verificar', async (req, res) => {
    try {
        const solicitudId = req.params.id;
        const { notario } = req.body;

        const resultado = await contrato.methods.verificarTransaccion(solicitudId).send({
            from: notario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice()
        });

        // Convertir BigInt a String antes de enviar la respuesta
        const resultadoFormateado = JSON.parse(JSON.stringify(resultado, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ mensaje: 'Transacción verificada exitosamente.', resultado: resultadoFormateado });
    } catch (error) {
        console.error('Error al verificar la transacción:', error);
        res.status(500).json({ error: 'Error al verificar la transacción.', detalles: error.message });
    }
});



// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
