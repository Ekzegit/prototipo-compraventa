import React, { useState } from "react";
import axios from "axios";
import { web3 } from "../services/blockchainService"; // ⬅️ Asegúrate de importar web3 correctamente
import "./VerificarTransaccion.css";

const VerificarTransaccion = () => {
    const [direccionContrato, setDireccionContrato] = useState("");
    const [notario, setNotario] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const manejarVerificacion = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!direccionContrato || !notario) {
            setError("⚠️ Debes ingresar la dirección del contrato y la dirección del notario.");
            return;
        }

        try {
            const cuentas = await web3.eth.getAccounts();
            const cuentaConectada = cuentas[0];

            if (cuentaConectada.toLowerCase() !== notario.toLowerCase()) {
                setError("❌ Solo el notario puede realizar la verificación.");
                return;
            }

            const respuesta = await axios.post("http://localhost:3001/solicitudes/verificar", {
                direccionContrato,
                notario
            });

            setMensaje(`✅ ${respuesta.data.mensaje}`);
            setDireccionContrato("");
            setNotario("");

            const saldoComprador = await axios.get(`http://localhost:3001/saldos/1/comprador`);
            const saldoVendedor = await axios.get(`http://localhost:3001/saldos/1/vendedor`);

            alert(`💰 Saldos después de la transacción:\n\n👤 Comprador: ${saldoComprador.data.saldo} ETH\n🏠 Vendedor: ${saldoVendedor.data.saldo} ETH`);
        } catch (error) {
            console.error("❌ Error al verificar la transacción:", error.response?.data || error.message);
            setError(error.response?.data?.error || "❌ Ocurrió un error al verificar la transacción.");
        }
    };

    return (
        <div className="verificar-container">
            <h2>🔍 Verificar Transacción</h2>
            <form onSubmit={manejarVerificacion} className="verificar-form">
                <input
                    type="text"
                    placeholder="Dirección del Contrato de la Propiedad"
                    value={direccionContrato}
                    onChange={(e) => setDireccionContrato(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Dirección del Notario"
                    value={notario}
                    onChange={(e) => setNotario(e.target.value)}
                    required
                />
                <button type="submit">Verificar</button>
            </form>

            {mensaje && <p className="mensaje exito">{mensaje}</p>}
            {error && <p className="mensaje error">{error}</p>}
        </div>
    );
};

export default VerificarTransaccion;
