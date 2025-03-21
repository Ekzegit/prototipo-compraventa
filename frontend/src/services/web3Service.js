import Web3 from "web3";

let web3;
let isRequesting = false; // Variable para evitar múltiples solicitudes simultáneas

// Verificar si MetaMask está instalado
if (window.ethereum) {
    web3 = new Web3(window.ethereum);

    // 🔹 Escuchar evento de desconexión y recargar la página automáticamente
    window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
            console.warn("🔴 MetaMask desconectado. Recargando página...");
            window.location.reload();
        }
    });

    window.ethereum.on("disconnect", () => {
        console.warn("🔴 MetaMask se ha desconectado. Recargando...");
        window.location.reload();
    });
} else {
    console.warn("⚠️ MetaMask no está instalado. Instálalo para usar Web3.");
}

// Función para abrir MetaMask sin solicitar cuentas de inmediato
export const openMetaMask = async () => {
    if (!window.ethereum) {
        alert("❌ MetaMask no está instalado. Instálalo y vuelve a intentarlo.");
        return null;
    }

    // Evitar múltiples solicitudes simultáneas
    if (isRequesting) {
        console.warn("⚠️ Ya hay una solicitud de conexión en curso.");
        return null;
    }

    try {
        isRequesting = true; // Bloquear nuevas solicitudes mientras se procesa

        // Solicitar permisos sin abrir la ventana emergente
        await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }]
        });
        console.log("✅ MetaMask abierto.");

        // Esperar 1.5 segundos antes de obtener la cuenta
        return new Promise((resolve) => {
            setTimeout(async () => {
                const userAccount = await getMetaMaskAccount();
                if (userAccount) {
                    console.log("✅ Cuenta conectada:", userAccount);
                    window.location.reload(); // 🔄 Recargar la página automáticamente al conectar
                }
                resolve(userAccount);
            }, 1500);
        });
    } catch (error) {
        console.error("❌ Error al abrir MetaMask:", error);
        alert("⚠️ No se pudo abrir MetaMask. Inténtalo nuevamente.");
        return null;
    } finally {
        isRequesting = false; // Liberar el bloqueo
    }
};

// Función para obtener la cuenta conectada
export const getMetaMaskAccount = async () => {
    if (!window.ethereum) {
        alert("❌ MetaMask no está instalado.");
        return null;
    }

    try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
        console.error("❌ Error al obtener la cuenta de MetaMask:", error);
        return null;
    }
};

// Exportar Web3 para usarlo en otras partes del proyecto
export { web3 };
