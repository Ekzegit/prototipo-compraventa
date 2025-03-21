import React, { useState } from "react";
import axios from "axios";
import "./VerificarTransaccion.css"; // ⬅️ Archivo CSS externo

const VerificarTransaccion = () => {
    const [solicitudId, setSolicitudId] = useState("");
    const [notario, setNotario] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const manejarVerificacion = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!solicitudId || !notario) {
            setError("⚠️ Debes ingresar el ID de la solicitud y la dirección del notario.");
            return;
        }

        try {
            const respuesta = await axios.post("http://localhost:3001/solicitudes/verificar", {
                solicitudId,
                notario
            });

            setMensaje(`✅ ${respuesta.data.mensaje}`);
            setSolicitudId("");
            setNotario("");

            const saldoComprador = await axios.get(`http://localhost:3001/saldos/${solicitudId}/comprador`);
            const saldoVendedor = await axios.get(`http://localhost:3001/saldos/${solicitudId}/vendedor`);

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
                    type="number"
                    placeholder="ID de la Solicitud"
                    value={solicitudId}
                    onChange={(e) => setSolicitudId(e.target.value)}
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
