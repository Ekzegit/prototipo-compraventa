const fs = require("fs");
const path = require("path");

// Cargar el archivo del contrato compilado
const contratoData = require("../build/contracts/CompraventaInmobiliaria.json");

// Verificar si el contrato tiene redes registradas
if (!contratoData.networks || Object.keys(contratoData.networks).length === 0) {
    console.error("❌ No se encontraron redes en el contrato. ¿Ejecutaste `truffle migrate --reset`?");
    process.exit(1);
}

// Obtener la última red registrada
const networkIds = Object.keys(contratoData.networks);
const latestNetworkId = networkIds[networkIds.length - 1]; // Toma la última migración
const contratoDireccion = contratoData.networks[latestNetworkId]?.address;

if (!contratoDireccion) {
    console.error("❌ No se encontró la dirección del contrato en la red.");
    process.exit(1);
}

console.log("✅ Nueva dirección del contrato:", contratoDireccion);

// Ruta del archivo .env
const envPath = path.join(__dirname, "../.env");

// Leer el contenido actual de .env
let envContent = fs.readFileSync(envPath, "utf8");

// Reemplazar la línea CONTRACT_ADDRESS con la nueva dirección
envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contratoDireccion}`);

// Guardar el archivo .env actualizado
fs.writeFileSync(envPath, envContent);
console.log("✅ Archivo .env actualizado correctamente.");

