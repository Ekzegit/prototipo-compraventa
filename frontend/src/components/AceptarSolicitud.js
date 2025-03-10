import React, { useState } from "react";
import { web3, contrato } from "../services/blockchainService";

const AceptarSolicitud = () => {
    const [solicitudId, setSolicitudId] = useState("");
    const [mensaje, setMensaje] = useState("");

    const manejarEnvio = async (e) => {
        e.preventDefault();
        try {
            const accounts = await web3.eth.getAccounts();
            await contrato.methods.aceptarSolicitud(solicitudId).send({
                from: accounts[0],
                gas: 3000000,
                gasPrice: web3.utils.toWei("20", "gwei"),
            });

            setMensaje("✅ Solicitud aceptada correctamente.");
        } catch (error) {
            setMensaje("❌ Error al aceptar la solicitud.");
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Aceptar Solicitud de Compra</h2>
            <form onSubmit={manejarEnvio}>
                <input
                    type="text"
                    placeholder="ID de la solicitud"
                    value={solicitudId}
                    onChange={(e) => setSolicitudId(e.target.value)}
                    required
                />
                <button type="submit">Aceptar Solicitud</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
};

export default AceptarSolicitud;
