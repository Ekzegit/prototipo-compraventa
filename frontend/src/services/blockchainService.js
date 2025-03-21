import { Web3 } from "web3"; // Web3 v4 usa importación con llaves
import contratoABI from "../contracts/CompraventaInmobiliaria.json"; // Verifica que la ruta es correcta

// Tomar la dirección del contrato desde `.env` o usar la que estaba hardcodeada
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xF12b5dd4EAD5F743C6BaA640B0216200e89B60Da";

// ✅ Conectar a MetaMask si está disponible, de lo contrario usar Ganache
const web3 = new Web3(window.ethereum || new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

// ✅ Crear la instancia del contrato inteligente
const contrato = new web3.eth.Contract(contratoABI.abi, CONTRACT_ADDRESS);

// ✅ Exponer Web3 y el contrato en el objeto `window` para depuración
window.web3 = web3;
window.contrato = contrato;

console.log("✅ Web3 conectado a:", web3.currentProvider.host);
console.log("✅ Contrato desplegado en:", CONTRACT_ADDRESS);

// ✅ Registrar propiedad usando la cuenta conectada en MetaMask
export const registrarPropiedad = async (descripcion, precio, cuenta) => {
    try {
        if (!cuenta) throw new Error("❌ No hay cuenta conectada a MetaMask.");

        // Convertir el precio de ETH a Wei
        const precioEnWei = web3.utils.toWei(precio, "ether");
        console.log("💰 Registrando propiedad con cuenta:", cuenta);

        // Obtener gasPrice dinámicamente
        const gasPrice = await web3.eth.getGasPrice();

        // Enviar transacción con valores adecuados
        const tx = await contrato.methods.registrarPropiedad(descripcion, precioEnWei).send({
            from: cuenta,
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

// ✅ Obtener solicitudes de compra
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

// ✅ Verificar una transacción
export const verificarTransaccion = async (solicitudId) => {
    try {
        const cuentas = await web3.eth.getAccounts();
        console.log("Usando cuenta del notario:", cuentas[0]);

        const tx = await contrato.methods.verificarTransaccion(solicitudId).send({
            from: cuentas[0],
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
