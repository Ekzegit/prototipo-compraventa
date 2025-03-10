import React, { useState, useEffect } from "react";
import axios from "axios";

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

    if (loading) return <p>Cargando solicitudes...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h2>Listado de Solicitudes de Compra</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Propiedad ID</th>
                        <th>Comprador</th>
                        <th>Oferta</th>
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
                            <td>{sol.estado}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListadoSolicitudes;
