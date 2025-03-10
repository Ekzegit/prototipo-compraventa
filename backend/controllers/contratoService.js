const path = require('path');
const Web3 = require('web3').default;
const web3 = new Web3('http://127.0.0.1:8545');

// Ruta absoluta al archivo JSON de la compilación del contrato
const contratoData = require(path.join(__dirname, '../../build/contracts/CompraventaInmobiliaria.json'));



// Obtener el ID de la red
const networkId = Object.keys(contratoData.networks)[0];

if (!networkId || !contratoData.networks[networkId]?.address) {
    throw new Error("🚨 ERROR: No se encontró una dirección válida para el contrato. Asegúrate de haber migrado correctamente con 'truffle migrate'.");
}

const contratoDireccion = contratoData.networks[networkId].address;
console.log("✅ Contrato cargado en la dirección:", contratoDireccion);

// Crear la instancia del contrato
const contrato = new web3.eth.Contract(contratoData.abi, contratoDireccion);

module.exports = { contrato, web3 };


