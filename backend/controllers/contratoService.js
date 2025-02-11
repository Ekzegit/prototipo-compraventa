const Web3 = require('web3').default;
const web3 = new Web3('http://127.0.0.1:8545');
const contratoABI = require('../../build/contracts/CompraventaInmobiliaria.json').abi;
const contratoData = require('../../build/contracts/CompraventaInmobiliaria.json');

// Obtener la primera red disponible (puede ser 1739026294025 u otra)
const networkId = Object.keys(contratoData.networks)[0]; // Obtiene el primer ID de red
const contratoDireccion = contratoData.networks[networkId]?.address || null;

if (!contratoDireccion) {
    throw new Error("🚨 ERROR: No se encontró la dirección del contrato. Asegúrate de haber migrado correctamente.");
}

// Exportar el contrato
const contrato = new web3.eth.Contract(contratoData.abi, contratoDireccion);

module.exports = { contrato, web3 };

