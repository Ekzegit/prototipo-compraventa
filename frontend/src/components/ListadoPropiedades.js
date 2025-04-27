import { useState, useEffect } from "react";
import { obtenerPropiedades } from "../services/api";
import { Link } from "react-router-dom";
import "./ListadoPropiedades.css";

export default function ListadoPropiedades() {
    const [propiedades, setPropiedades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vista, setVista] = useState("grid"); // grid o lista

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

    const cambiarVista = () => {
        setVista(vista === "grid" ? "lista" : "grid");
    };

    if (loading) return <p className="loading">Cargando propiedades...</p>;

    if (!propiedades.length) {
        return <p className="no-data">No hay propiedades registradas aún.</p>;
    }

    return (
        <div className="listado-container">
            <div className="header">
                <h1>🏠 Listado de Propiedades</h1>
                <div className="botones-header">
                    <button className="btn-recargar" onClick={() => window.location.reload()}>
                        🔄 Actualizar
                    </button>
                    <button className="btn-cambiar-vista" onClick={cambiarVista}>
                        {vista === "grid" ? "📃 Ver como Lista" : "🖼️ Ver como Tarjetas"}
                    </button>
                </div>
            </div>

            {vista === "grid" ? (
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
                            <p className={`estado 
                                ${propiedad.estado === "Disponible" ? "estado-disponible" : ""}
                                ${propiedad.estado === "En proceso de venta" ? "estado-enproceso" : ""}
                                ${propiedad.estado === "Vendida" ? "estado-vendida" : ""}`}>
                                {propiedad.estado || "Desconocido"}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="lista-container">
                    {propiedades.map((propiedad) => (
                        <div
                            key={propiedad.contratoDireccion || propiedad.direccionContrato || propiedad.id}
                            className="item-lista"
                        >
                            {Array.isArray(propiedad.imagenesUrls) && propiedad.imagenesUrls[0] && (
                                <img
                                    src={propiedad.imagenesUrls[0]}
                                    alt="Imagen de propiedad"
                                    className="imagen-lista"
                                />
                            )}
                            <div className="item-lista-info">
                                <Link
                                    to={`/propiedades/${propiedad.contratoDireccion || propiedad.direccionContrato || propiedad.id}`}
                                >
                                    <strong>{propiedad.descripcion || "Sin descripción"}</strong>
                                </Link>
                                <p>💰 {propiedad.precio} ETH | 📄 Estado: {propiedad.estado || "Desconocido"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}