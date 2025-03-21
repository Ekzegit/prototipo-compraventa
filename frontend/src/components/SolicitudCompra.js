import React, { useState } from "react";
import axios from "axios";
import "./SolicitudCompra.css"; // ✅ Importar el archivo CSS

const SolicitudCompra = () => {
    const [propiedadId, setPropiedadId] = useState("");
    const [comprador, setComprador] = useState("");
    const [oferta, setOferta] = useState("");
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

        try {
            const ofertaNumero = parseFloat(oferta);
            if (isNaN(ofertaNumero) || ofertaNumero <= 0) {
                setError("⚠️ La oferta debe ser un número mayor a 0.");
                return;
            }

            const ofertaWei = oferta.includes("000000000000000000")
                ? ofertaNumero.toString()
                : window.web3.utils.toWei(ofertaNumero.toString(), "ether");

            const datosSolicitud = {
                propiedadId: Number(propiedadId),
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

            {mensaje && <p className="mensaje">{mensaje}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default SolicitudCompra;
