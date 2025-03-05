import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { obtenerPropiedad } from "../services/api";

export default function Propiedad() {
    const { id } = useParams(); // <-- Obtener el ID de la URL correctamente
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("ID recibido en Propiedad.js:", id); // <-- Agregar log para depurar

        if (!id || id === "undefined") {
            console.error("Error: ID de propiedad inválido.");
            setLoading(false);
            return;
        }

        async function cargarPropiedad() {
            try {
                const datos = await obtenerPropiedad(id);
                setPropiedad(datos);
            } catch (error) {
                console.error("Error al obtener la propiedad:", error);
            } finally {
                setLoading(false);
            }
        }
        cargarPropiedad();
    }, [id]);

    if (loading) return <p>Cargando propiedad...</p>;
    if (!propiedad) return <p>No se encontró la propiedad.</p>;

    return (
        <div>
            <h1>{propiedad.nombre}</h1>
            <p><strong>Precio:</strong> {propiedad.precio} ETH</p>
            <p><strong>Estado:</strong> {propiedad.estado}</p>
            <p><strong>Propietario:</strong> {propiedad.propietario}</p>
        </div>
    );
}



