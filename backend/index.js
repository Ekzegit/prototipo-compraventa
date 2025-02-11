const express = require('express');
const cors = require('cors');
const Web3 = require('web3').default;
const propiedadRoutes = require('./routes/propiedadRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json()); // Habilitar JSON en el backend

// Configurar Web3 para conectarse a Ganache o la blockchain local
const web3 = new Web3('http://127.0.0.1:8545');

// Importar el ABI y obtener la dirección del contrato desde la migración
const contratoData = require('../build/contracts/CompraventaInmobiliaria.json');
const networkId = Object.keys(contratoData.networks)[0]; // Obtener la primera red disponible
const contratoDireccion = contratoData.networks[networkId]?.address || null;

if (!contratoDireccion) {
    throw new Error("🚨 ERROR: No se encontró la dirección del contrato. Asegúrate de haber migrado correctamente.");
}

// Crear la instancia del contrato
const contrato = new web3.eth.Contract(contratoData.abi, contratoDireccion);

// Usar las rutas separadas
app.use('/propiedades', propiedadRoutes);
app.use('/solicitudes', solicitudRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

