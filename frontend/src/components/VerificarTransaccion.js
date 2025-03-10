import React, { useState } from "react";
import axios from "axios";

const VerificarTransaccion = () => {
    const [solicitudId, setSolicitudId] = useState("");
    const [notario, setNotario] = useState(""); // Nuevo campo para la dirección del notario
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
        } catch (error) {
            console.error("❌ Error al verificar la transacción:", error.response?.data || error.message);
            setError(error.response?.data?.error || "❌ Ocurrió un error al verificar la transacción.");
        }
    };

    return (
        <div>
            <h2>🔍 Verificar Transacción</h2>
            <form onSubmit={manejarVerificacion}>
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

            {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default VerificarTransaccion;
