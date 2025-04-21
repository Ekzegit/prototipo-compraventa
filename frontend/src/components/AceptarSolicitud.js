import React, { useState } from "react";
import { web3 } from "../services/blockchainService";
import contratoABI from "../contracts/CompraventaInmobiliaria.json";
import "./AceptarSolicitud.css";

const AceptarSolicitud = () => {
    const [direccionContrato, setDireccionContrato] = useState("");
    const [mensaje, setMensaje] = useState("");

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setMensaje("");

        try {
            if (!web3.utils.isAddress(direccionContrato)) {
                setMensaje("❌ Dirección del contrato inválida.");
                return;
            }

            const accounts = await web3.eth.getAccounts();
            const cuentaConectada = accounts[0];

            const instanciaContrato = new web3.eth.Contract(contratoABI.abi, direccionContrato);

            // Obtener la dirección del propietario desde el contrato
            const propietario = await instanciaContrato.methods.propietario().call();

            // Comparar con la cuenta conectada
            if (cuentaConectada.toLowerCase() !== propietario.toLowerCase()) {
                setMensaje("❌ Solo el propietario registrado puede aceptar la solicitud.");
                return;
            }

            // Enviar la transacción
            await instanciaContrato.methods.aceptarSolicitud().send({
                from: cuentaConectada,
                gas: 3000000,
                gasPrice: web3.utils.toWei("20", "gwei"),
            });

            setMensaje("✅ Solicitud aceptada correctamente.");
        } catch (error) {
            console.error(error);
            setMensaje("❌ Error al aceptar la solicitud.");
        }
    };

    return (
        <div className="aceptar-solicitud">
            <h2>Aceptar Solicitud de Compra</h2>
            <form onSubmit={manejarEnvio} className="formulario-solicitud">
                <input
                    type="text"
                    placeholder="Dirección del contrato"
                    value={direccionContrato}
                    onChange={(e) => setDireccionContrato(e.target.value)}
                    required
                />
                <button type="submit">Aceptar Solicitud</button>
            </form>
            {mensaje && <p className="mensaje">{mensaje}</p>}
        </div>
    );
};

export default AceptarSolicitud;
