import React, { useState } from "react";
import axios from "axios";

const SolicitudCompra = () => {
    const [propiedadId, setPropiedadId] = useState("");
    const [comprador, setComprador] = useState("");
    const [oferta, setOferta] = useState(""); // Oferta en ETH
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (!propiedadId || !comprador || !oferta) {
            setError("⚠️ Todos los campos son obligatorios.");
            return;
        }

        let ofertaWei;
        try {
            // ✅ Convertir a número flotante antes de cualquier operación
            const ofertaNumero = parseFloat(oferta);

            if (isNaN(ofertaNumero) || ofertaNumero <= 0) {
                setError("⚠️ La oferta debe ser un número mayor a 0.");
                return;
            }

            // ✅ Convertir a Wei SOLO si aún no está en Wei
            if (!oferta.includes("000000000000000000")) {
                ofertaWei = window.web3.utils.toWei(ofertaNumero.toString(), "ether");
            } else {
                ofertaWei = ofertaNumero.toString(); // Ya está en Wei
            }

            console.log("📌 Oferta ingresada en ETH:", oferta);
            console.log("📌 Oferta convertida a Wei:", ofertaWei);

        } catch (err) {
            console.error("❌ Error en la conversión de ETH a Wei:", err);
            setError("❌ Error al convertir la oferta a Wei.");
            return;
        }

        const datosSolicitud = {
            propiedadId: Number(propiedadId),
            comprador,
            oferta: ofertaWei // ✅ Enviar oferta en Wei correctamente
        };

        console.log("📌 Datos enviados al backend:", datosSolicitud);

        try {
            const respuesta = await axios.post("http://localhost:3001/solicitudes", datosSolicitud);
            setMensaje(`✅ Solicitud enviada con éxito: ${respuesta.data.mensaje}`);
            setPropiedadId("");
            setComprador("");
            setOferta("");
        } catch (error) {
            console.error("❌ Error al enviar la solicitud:", error.response?.data || error.message);
            setError("❌ Ocurrió un error al realizar la solicitud. Inténtalo de nuevo.");
        }
    };





    return (
        <div>
            <h2>Solicitar Compra de Propiedad</h2>
            <form onSubmit={manejarEnvio}>
                <input
                    type="number"
                    placeholder="ID de la propiedad"
                    value={propiedadId}
                    onChange={(e) => setPropiedadId(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Dirección del comprador"
                    value={comprador}
                    onChange={(e) => setComprador(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Oferta en ETH"
                    value={oferta}
                    onChange={(e) => setOferta(e.target.value)}
                    required
                />
                <button type="submit">Solicitar Compra</button>
            </form>

            {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default SolicitudCompra;
