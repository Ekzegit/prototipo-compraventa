﻿import { Web3 } from "web3"; // Web3 v4 usa importación con llaves
import contratoABI from "../contracts/CompraventaInmobiliaria.json"; // Verifica que la ruta es correcta

const CONTRACT_ADDRESS = "0xdDA6327139485221633A1FcD65f4aC932E60A2e1"; // Reemplaza con la dirección real

// Conectar a Ganache localmente
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

// Crear la instancia del contrato inteligente
const contrato = new web3.eth.Contract(contratoABI.abi, CONTRACT_ADDRESS);

// Exponer Web3 y el contrato en el objeto `window` para depuración en la consola del navegador
window.web3 = web3;
window.contrato = contrato;

console.log("✅ Web3 conectado a:", web3.currentProvider.host);
console.log("✅ Contrato desplegado en:", CONTRACT_ADDRESS);

export const registrarPropiedad = async (descripcion, precio) => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log("📌 Usando cuenta:", accounts[0]);

        // Convertir el precio de ETH a Wei
        const precioEnWei = web3.utils.toWei(precio, "ether");
        console.log("💰 Precio en Wei:", precioEnWei);

        // Obtener gasPrice dinámicamente
        const gasPrice = await web3.eth.getGasPrice();

        // Enviar transacción con valores adecuados
        const tx = await contrato.methods.registrarPropiedad(descripcion, precioEnWei).send({
            from: accounts[0],
            gas: 3000000,
            gasPrice: gasPrice,
        });

        console.log("✅ Propiedad registrada en blockchain:", tx);
        return tx;
    } catch (error) {
        console.error("🚨 Error al registrar la propiedad:", error);
        throw error;
    }
};

export const obtenerSolicitudes = async () => {
    try {
        const totalSolicitudes = await contrato.methods.contadorSolicitudes().call();
        const solicitudes = [];

        for (let i = 1; i <= totalSolicitudes; i++) {
            const solicitud = await contrato.methods.solicitudes(i).call();
            solicitudes.push({
                id: i,
                propiedadId: solicitud.propiedadId,
                comprador: solicitud.comprador,
                oferta: web3.utils.fromWei(solicitud.oferta, "ether"),
                aceptada: solicitud.aceptada,
                verificada: solicitud.verificada,
            });
        }

        return solicitudes;
    } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        return [];
    }
};

export const verificarTransaccion = async (solicitudId) => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log("Usando cuenta del notario:", accounts[0]);

        const tx = await contrato.methods.verificarTransaccion(solicitudId).send({
            from: accounts[0],
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice(),
        });

        console.log("✅ Transacción verificada con éxito:", tx);
        return tx;
    } catch (error) {
        console.error("❌ Error al verificar la transacción:", error);
        throw error;
    }
};



// Exportar Web3 y el contrato para otros módulos
export { web3, contrato };




