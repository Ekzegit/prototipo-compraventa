require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors');
const Web3 = require('web3').default;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const propiedadRoutes = require('./routes/propiedadRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const registroRoutes = require('./routes/registroRoutes');
const historialRoutes = require('./routes/historialRoutes'); // ✅ Importar historial

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Servir archivos estáticos desde /uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// ✅ Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const nombreUnico = Date.now() + '-' + file.originalname;
        cb(null, nombreUnico);
    }
});
const upload = multer({ storage });

// ✅ Ruta para subir imágenes
app.post('/upload', upload.single('imagen'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen.' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
});

// ✅ Verificar que esté configurado el NETWORK
if (!process.env.NETWORK) {
    throw new Error("ERROR: La variable NETWORK no está definida en el archivo .env.");
}

// ✅ Configurar Web3
const web3 = new Web3(process.env.NETWORK);

// ✅ Cargar contrato principal
const contratoData = require('../build/contracts/CompraventaInmobiliaria.json');
const contratoDireccion = process.env.CONTRACT_ADDRESS || contratoData.networks[Object.keys(contratoData.networks)[0]]?.address;

if (!contratoDireccion) {
    throw new Error("ERROR: No se encontró la dirección del contrato CompraventaInmobiliaria.");
}

const contrato = new web3.eth.Contract(contratoData.abi, contratoDireccion);

// ✅ Confirmar variables cargadas
console.log("✅ Web3 conectado a:", process.env.NETWORK);
console.log("📄 Dirección del contrato principal:", contratoDireccion);
console.log("🧑‍💼 Propietario:", process.env.PROPIETARIO);
console.log("🧑‍💼 Comprador:", process.env.COMPRADOR);
console.log("🧑‍💼 Notario:", process.env.NOTARIO);

// ✅ Definir rutas
app.use('/propiedades', propiedadRoutes);
app.use('/solicitudes', solicitudRoutes);
app.use('/registro', registroRoutes);
app.use('/historial', historialRoutes); // ✅ Ruta nueva

// ✅ Rutas para obtener saldo
app.get("/saldos/:solicitudId/comprador", async (req, res) => {
    try {
        const comprador = process.env.COMPRADOR;
        if (!comprador) {
            return res.status(400).json({ error: "❌ Dirección del comprador no configurada en .env" });
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
            return res.status(400).json({ error: "❌ Dirección del vendedor no configurada en .env" });
        }
        const saldo = await web3.eth.getBalance(vendedor);
        res.json({ saldo: web3.utils.fromWei(saldo, "ether") });
    } catch (error) {
        console.error("❌ Error al obtener el saldo del vendedor:", error);
        res.status(500).json({ error: "Error al obtener el saldo del vendedor" });
    }
});

// ✅ Iniciar el servidor
app.listen(port, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
});
