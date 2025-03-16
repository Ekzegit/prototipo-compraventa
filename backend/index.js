require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors');
const Web3 = require('web3').default;
const propiedadRoutes = require('./routes/propiedadRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Habilitar JSON en el backend

// Verificar que la URL de la red esté definida
if (!process.env.NETWORK) {
    throw new Error("ERROR: La variable NETWORK no está definida en el archivo .env.");
}

// Configurar Web3 para conectarse a la red especificada en .env
const web3 = new Web3(process.env.NETWORK);

// Importar el ABI y obtener la dirección del contrato desde .env o la migración
const contratoData = require('../build/contracts/CompraventaInmobiliaria.json');

const contratoDireccion = process.env.CONTRACT_ADDRESS || contratoData.networks[Object.keys(contratoData.networks)[0]]?.address;

if (!contratoDireccion) {
    throw new Error("ERROR: No se encontró la dirección del contrato. Asegúrate de haber migrado correctamente y haber definido CONTRACT_ADDRESS en .env.");
}

// Crear la instancia del contrato
const contrato = new web3.eth.Contract(contratoData.abi, contratoDireccion);

// Confirmar que las variables de entorno se cargaron correctamente
console.log("Web3 conectado a:", process.env.NETWORK);
console.log("Dirección del contrato:", contratoDireccion);
console.log("Propietario:", process.env.PROPIETARIO);
console.log("Comprador:", process.env.COMPRADOR);
console.log("Notario:", process.env.NOTARIO);

// Usar las rutas separadas
app.use('/propiedades', propiedadRoutes);
app.use('/solicitudes', solicitudRoutes);

// 📌 Rutas para obtener los saldos del comprador y del vendedor
app.get("/saldos/:solicitudId/comprador", async (req, res) => {
    try {
        const comprador = process.env.COMPRADOR;
        if (!comprador) {
            return res.status(400).json({ error: "❌ No se ha configurado la dirección del comprador en .env" });
        }

        const saldo = await web3.eth.getBalance(comprador);
        res.json({ saldo: web3.utils.fromWei(saldo, "ether") });
    } catch (error) {
        console.error("❌ Error al obtener el saldo del comprador:", error);
        res.status(500).json({ error: "Error al obtener el saldo del comprador" });
    }
});

app.get("/saldos/:solicitudId/vendedor", async (req, res) => {
    try {
        const vendedor = process.env.PROPIETARIO;
        if (!vendedor) {
            return res.status(400).json({ error: "❌ No se ha configurado la dirección del vendedor en .env" });
        }

        const saldo = await web3.eth.getBalance(vendedor);
        res.json({ saldo: web3.utils.fromWei(saldo, "ether") });
    } catch (error) {
        console.error("❌ Error al obtener el saldo del vendedor:", error);
        res.status(500).json({ error: "Error al obtener el saldo del vendedor" });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
