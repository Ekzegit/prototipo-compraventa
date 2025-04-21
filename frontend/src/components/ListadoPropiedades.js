import { useState, useEffect } from "react";
import { obtenerPropiedades } from "../services/api";
import { Link } from "react-router-dom";
import "./ListadoPropiedades.css";

export default function ListadoPropiedades() {
    const [propiedades, setPropiedades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarPropiedades() {
            try {
                const datos = await obtenerPropiedades();
                console.log("Propiedades obtenidas:", datos);
                setPropiedades(datos);
            } catch (error) {
                console.error("Error al cargar propiedades:", error);
                setPropiedades([]);
            } finally {
                setLoading(false);
            }
        }
        cargarPropiedades();
    }, []);

    if (loading) return <p className="loading">Cargando propiedades...</p>;

    if (!propiedades.length) {
        return <p className="no-data">No hay propiedades registradas aún.</p>;
    }

    return (
        <div className="listado-container">
            <div className="header">
                <h1>🏠 Listado de Propiedades</h1>
                <button className="btn-recargar" onClick={() => window.location.reload()}>
                    🔄 Actualizar
                </button>
            </div>

            <div className="tarjetas-container">
                {propiedades.map((propiedad) => (
                    <div
                        key={propiedad.contratoDireccion || propiedad.direccionContrato || propiedad.id}
                        className="tarjeta-propiedad"
                    >
                        {Array.isArray(propiedad.imagenesUrls) && propiedad.imagenesUrls[0] && (
                            <img
                                src={propiedad.imagenesUrls[0]}
                                alt="Imagen de propiedad"
                                className="imagen-propiedad"
                            />
                        )}
                        <h3>ID: {propiedad.id || "-"}</h3>
                        <p>
                            <strong>Descripción:</strong>{" "}
                            <Link
                                to={`/propiedades/${propiedad.contratoDireccion || propiedad.direccionContrato || propiedad.id}`}
                            >
                                {propiedad.descripcion || "Sin descripción"}
                            </Link>
                        </p>
                        <p><strong>Precio:</strong> {propiedad.precio} ETH</p>
                        <p className={`estado ${propiedad.estado === "Vendida" ? "vendida" : "disponible"}`}>
                            {propiedad.estado || "Desconocido"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
