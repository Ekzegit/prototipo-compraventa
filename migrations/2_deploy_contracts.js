const fs = require("fs");
const path = require("path");
const RegistroPropiedades = artifacts.require("RegistroPropiedades");

module.exports = async function (deployer, network, accounts) {
    const notario = accounts[2];

    await deployer.deploy(RegistroPropiedades, notario);
    const instancia = await RegistroPropiedades.deployed();

    const direccionContrato = instancia.address;
    console.log("✅ Dirección del contrato RegistroPropiedades:", direccionContrato);

    // === Actualizar .env del backend ===
    const envPathBackend = path.resolve(__dirname, "../backend/.env");
    let contenidoBackend = "";
    try {
        contenidoBackend = fs.readFileSync(envPathBackend, "utf8");
    } catch (err) {
        console.warn("⚠️ No se pudo leer el archivo .env del backend, se creará uno nuevo.");
    }
    const regex = /^CONTRACT_ADDRESS=.*/m;
    if (regex.test(contenidoBackend)) {
        contenidoBackend = contenidoBackend.replace(regex, `CONTRACT_ADDRESS=${direccionContrato}`);
    } else {
        contenidoBackend += `\nCONTRACT_ADDRESS=${direccionContrato}\n`;
    }
    fs.writeFileSync(envPathBackend, contenidoBackend);
    console.log("✅ Dirección del contrato actualizada en .env del backend");

    // === Actualizar .env del frontend ===
    const envPathFrontend = path.resolve(__dirname, "../frontend/.env");
    let contenidoFrontend = "";
    try {
        contenidoFrontend = fs.readFileSync(envPathFrontend, "utf8");
    } catch (err) {
        console.warn("⚠️ No se pudo leer el archivo .env del frontend, se creará uno nuevo.");
    }
    const regexFrontend = /^REACT_APP_CONTRACT_ADDRESS=.*/m;
    if (regexFrontend.test(contenidoFrontend)) {
        contenidoFrontend = contenidoFrontend.replace(regexFrontend, `REACT_APP_CONTRACT_ADDRESS=${direccionContrato}`);
    } else {
        contenidoFrontend += `\nREACT_APP_CONTRACT_ADDRESS=${direccionContrato}\n`;
    }
    fs.writeFileSync(envPathFrontend, contenidoFrontend);
    console.log("✅ Dirección del contrato actualizada en .env del frontend");

    // === Copiar RegistroPropiedades.json al frontend/src/contracts
    const origenRegistro = path.resolve(__dirname, "../build/contracts/RegistroPropiedades.json");
    const destinoRegistro = path.resolve(__dirname, "../frontend/src/contracts/RegistroPropiedades.json");

    try {
        fs.copyFileSync(origenRegistro, destinoRegistro);
        console.log("✅ ABI RegistroPropiedades copiado a frontend/src/contracts");
    } catch (err) {
        console.error("❌ Error al copiar RegistroPropiedades.json:", err);
    }

    // === Copiar CompraventaInmobiliaria.json al frontend/src/contracts
    const origenCompra = path.resolve(__dirname, "../build/contracts/CompraventaInmobiliaria.json");
    const destinoCompra = path.resolve(__dirname, "../frontend/src/contracts/CompraventaInmobiliaria.json");

    try {
        fs.copyFileSync(origenCompra, destinoCompra);
        console.log("✅ ABI CompraventaInmobiliaria copiado a frontend/src/contracts");
    } catch (err) {
        console.error("❌ Error al copiar CompraventaInmobiliaria.json:", err);
    }
};
