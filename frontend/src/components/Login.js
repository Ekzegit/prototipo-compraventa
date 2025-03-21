import React, { useState } from "react";
import { openMetaMask } from "../services/web3Service";

const Login = ({ setUserAccount }) => {
    const [account, setAccount] = useState("");
    const [error, setError] = useState("");

    const handleOpenMetaMask = async () => {
        setError(""); // Limpiar error antes de intentar conectar
        try {
            const userAccount = await openMetaMask();
            if (userAccount) {
                setAccount(userAccount);
                setUserAccount(userAccount);

                // ✅ Forzar recarga completa del navegador después de una conexión exitosa
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            } else {
                setError("⚠️ No se pudo conectar con MetaMask. Inténtalo nuevamente.");
            }
        } catch (err) {
            setError("❌ Error al conectar con MetaMask. Asegúrate de que está instalado y desbloqueado.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>🔐 Inicia sesión con MetaMask</h2>
            <button
                onClick={handleOpenMetaMask}
                style={{
                    fontSize: "18px",
                    padding: "10px",
                    cursor: "pointer",
                    backgroundColor: "#f6851b",
                    color: "white",
                    border: "none",
                    borderRadius: "5px"
                }}
            >
                🦊 Abrir MetaMask
            </button>

            {/* ✅ Mostrar solo si hay cuenta conectada */}
            {account && <p style={{ color: "green" }}>✅ Conectado: {account}</p>}

            {/* ✅ Ocultar error si se conectó correctamente */}
            {error && !account && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;
