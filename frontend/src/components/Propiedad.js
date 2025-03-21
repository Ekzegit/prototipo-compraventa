import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { obtenerPropiedad } from "../services/api";
import "./Propiedad.css";

export default function Propiedad() {
    const { id } = useParams();
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === "undefined") {
            console.error("⚠️ ID de propiedad inválido.");
            setLoading(false);
            return;
        }

        async function cargarPropiedad() {
            try {
                const datos = await obtenerPropiedad(id);
                setPropiedad(datos);
            } catch (error) {
                console.error("❌ Error al obtener la propiedad:", error);
            } finally {
                setLoading(false);
            }
        }
        cargarPropiedad();
    }, [id]);

    if (loading) return <p className="mensaje-cargando">⏳ Cargando propiedad...</p>;
    if (!propiedad) return <p className="mensaje-error">❌ No se encontró la propiedad.</p>;

    return (
        <div className="propiedad-container">
            <h2 className="propiedad-titulo">🏡 {propiedad.nombre || `Propiedad #${propiedad.id}`}</h2>
            <div className="propiedad-detalles">
                <p><strong>📝 Descripción:</strong> {propiedad.descripcion}</p>
                <p><strong>💰 Precio:</strong> {propiedad.precio} ETH</p>
                <p><strong>📄 Estado:</strong> {propiedad.estado}</p>
                <p><strong>👤 Propietario:</strong> {propiedad.propietario}</p>
            </div>
        </div>
    );
}
