import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "./SolicitudCompra.css";

const SolicitudCompra = () => {
    const [searchParams] = useSearchParams();
    const contratoDesdeURL = searchParams.get("contrato");
    const precioDesdeURL = searchParams.get("precio");

    const [propiedadId, setPropiedadId] = useState("");
    const [comprador, setComprador] = useState("");
    const [oferta, setOferta] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (contratoDesdeURL) setPropiedadId(contratoDesdeURL);
        if (precioDesdeURL) {
            const valorLimpio = precioDesdeURL.replace(" ETH", "").trim();
            setOferta(valorLimpio);
        }

        // Obtener cuenta conectada desde MetaMask
        const obtenerCuenta = async () => {
            if (window.ethereum) {
                try {
                    const cuentas = await window.ethereum.request({ method: "eth_accounts" });
                    if (cuentas.length > 0) {
                        setComprador(cuentas[0]);
                    } else {
                        setError("❌ No hay cuentas conectadas. Conecta MetaMask.");
                    }
                } catch (err) {
                    console.error("❌ Error al obtener cuenta de MetaMask:", err);
                    setError("❌ No se pudo obtener la cuenta de MetaMask.");
                }
            } else {
                setError("❌ MetaMask no está disponible.");
            }
        };

        obtenerCuenta();
    }, [contratoDesdeURL, precioDesdeURL]);

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!propiedadId || !comprador || !oferta) {
            setError("⚠️ Todos los campos son obligatorios.");
            return;
        }

        try {
            const ofertaNumero = parseFloat(oferta.toString().replace(" ETH", "").trim());
            if (isNaN(ofertaNumero) || ofertaNumero <= 0) {
                setError("⚠️ La oferta debe ser un número mayor a 0.");
                return;
            }

            const precioEsperado = parseFloat(precioDesdeURL?.replace(" ETH", "").trim());
            if (!isNaN(precioEsperado) && ofertaNumero !== precioEsperado) {
                setError(`⚠️ La oferta debe ser exactamente igual al precio actual: ${precioEsperado} ETH.`);
                return;
            }

            const ofertaWei = window.web3.utils.toWei(ofertaNumero.toString(), "ether");

            const datosSolicitud = {
                propiedadId,
                comprador,
                oferta: ofertaWei
            };

            const respuesta = await axios.post("http://localhost:3001/solicitudes", datosSolicitud);
            setMensaje(`✅ Solicitud enviada con éxito: ${respuesta.data.mensaje}`);
            setPropiedadId("");
            setComprador("");
            setOferta("");
        } catch (err) {
            console.error("❌ Error al enviar la solicitud:", err);
            setError("❌ Ocurrió un error al realizar la solicitud.");
        }
    };

    return (
        <div className="solicitud-container">
            <h2>Solicitar Compra de Propiedad</h2>
            <form onSubmit={manejarEnvio} className="solicitud-form">
                <input
                    type="text"
                    placeholder="Dirección del contrato"
                    value={propiedadId}
                    readOnly
                    required
                />
                <input
                    type="text"
                    placeholder="Dirección del comprador"
                    value={comprador}
                    readOnly
                    required
                />
                <div className="input-eth-group">
                    <input
                        type="text"
                        value={oferta}
                        readOnly
                        required
                    />
                    <span className="eth-label">ETH</span>
                </div>
                <button type="submit">📩 Solicitar Compra</button>
            </form>

            {mensaje && <p className="mensaje">{mensaje}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default SolicitudCompra;
