import { useState, useEffect } from "react";
import { obtenerPropiedades } from "../services/api";
import { Link } from "react-router-dom";

export default function ListadoPropiedades() {
    const [propiedades, setPropiedades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarPropiedades() {
            try {
                const datos = await obtenerPropiedades();
                console.log("Propiedades obtenidas:", datos); // <-- Verificar los datos recibidos
                setPropiedades(datos);
            } catch (error) {
                console.error("Error al cargar propiedades:", error);
            } finally {
                setLoading(false);
            }
        }
        cargarPropiedades();
    }, []);

    if (loading) return <p>Cargando propiedades...</p>;

    return (
        <div>
            <h1>Listado de Propiedades</h1>
            <ul>
                {propiedades.map((propiedad) => (
                    <li key={propiedad.id}>
                        <Link to={`/propiedades/${propiedad.id}`}>{propiedad.nombre}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

