import { Web3 } from "web3";
import contratoABI from "../contracts/RegistroPropiedades.json"; // ✅ ABI copiado automáticamente

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
    throw new Error("❌ La variable REACT_APP_CONTRACT_ADDRESS no está definida. Verifica tu archivo .env.");
}

const web3 = new Web3(window.ethereum || new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const contrato = new web3.eth.Contract(contratoABI.abi, CONTRACT_ADDRESS);

// Para depuración desde la consola del navegador
window.web3 = web3;
window.contrato = contrato;

console.log("✅ Web3 conectado a:", web3.currentProvider?.host || "desconocido");
console.log("✅ Contrato desplegado en:", CONTRACT_ADDRESS);

// ✅ Registrar propiedad usando cuenta conectada automáticamente
export const registrarPropiedad = async (descripcion, precio) => {
    try {
        const accounts = await web3.eth.getAccounts();
        const cuenta = accounts[0];

        if (!cuenta) throw new Error("❌ No hay cuenta conectada a MetaMask.");

        const precioEnWei = web3.utils.toWei(precio, "ether");
        const gasPrice = await web3.eth.getGasPrice();

        const tx = await contrato.methods.registrarPropiedad(descripcion, precioEnWei).send({
            from: cuenta,
            gas: 3000000,
            gasPrice,
        });

        console.log("✅ Propiedad registrada:", tx);
        return tx;
    } catch (error) {
        console.error("🚨 Error al registrar la propiedad:", error);
        throw error;
    }
};

export { web3, contrato };
