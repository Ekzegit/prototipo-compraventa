import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ListadoSolicitudes.css";

const ListadoSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarSolicitudes = async () => {
            try {
                const respuesta = await axios.get("http://localhost:3001/solicitudes");
                setSolicitudes(respuesta.data);
            } catch (error) {
                console.error("❌ Error al obtener las solicitudes:", error);
                setError("Error al obtener las solicitudes.");
            } finally {
                setLoading(false);
            }
        };

        cargarSolicitudes();
    }, []);

    const renderBadgeEstado = (estado) => {
        const texto = estado?.toLowerCase();
        let clase = "badge estado-pendiente";

        if (texto.includes("aceptada")) clase = "badge estado-aceptada";
        else if (texto.includes("verificada")) clase = "badge estado-verificada";
        else if (texto.includes("rechazada")) clase = "badge estado-rechazada";

        return <span className={clase}>{estado}</span>;
    };

    if (loading) return <p className="mensaje-cargando">⏳ Cargando solicitudes...</p>;
    if (error) return <p className="mensaje-error">{error}</p>;

    return (
        <div className="listado-solicitudes-container">
            <h2>📄 Listado de Solicitudes de Compra</h2>
            <table className="tabla-solicitudes">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Propiedad ID</th>
                        <th>Comprador</th>
                        <th>Oferta (ETH)</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudes.map((sol) => (
                        <tr key={sol.id}>
                            <td>{sol.id}</td>
                            <td>{sol.propiedadId}</td>
                            <td>{sol.comprador}</td>
                            <td>{sol.oferta}</td>
                            <td>{renderBadgeEstado(sol.estado)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListadoSolicitudes;
