import { useState, useEffect } from "react";
import { obtenerPropiedades } from "../services/api";
import { Link } from "react-router-dom";
import "./ListadoPropiedades.css"; // Nuevo archivo de estilos

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
            } finally {
                setLoading(false);
            }
        }
        cargarPropiedades();
    }, []);

    if (loading) return <p className="loading">Cargando propiedades...</p>;

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
                    <div key={propiedad.id} className="tarjeta-propiedad">
                        <h3>ID: {propiedad.id}</h3>
                        <p><strong>Descripción:</strong> <Link to={`/propiedades/${propiedad.id}`}>{propiedad.nombre}</Link></p>
                        <p><strong>Precio:</strong> {propiedad.precio} ETH</p>
                        <p className={`estado ${propiedad.estado === "Vendida" ? "vendida" : "disponible"}`}>
                            {propiedad.estado}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
