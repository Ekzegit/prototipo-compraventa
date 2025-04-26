import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ListadoSolicitudes.css";

const NOTARIO_DIRECCION = "0x1234567890123456789012345678901234567890"; // Reemplazar por la dirección real del notario

const ValidacionesNotario = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cuenta, setCuenta] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarSolicitudes = async () => {
            try {
                const cuentas = await window.ethereum.request({ method: "eth_accounts" });
                const cuentaActual = cuentas[0];

                if (!cuentaActual) {
                    setError("⚠️ No hay cuenta conectada en MetaMask.");
                    setLoading(false);
                    return;
                }

                setCuenta(cuentaActual.toLowerCase());

                const respuesta = await axios.get(`http://localhost:3001/solicitudes`);
                const soloParaVerificar = respuesta.data.filter(
                    (sol) =>
                        sol.estado === "Aceptada" &&
                        cuentaActual.toLowerCase() !== sol.comprador.toLowerCase() &&
                        cuentaActual.toLowerCase() !== sol.propietario.toLowerCase()
                );

                setSolicitudes(soloParaVerificar);
            } catch (error) {
                console.error("❌ Error al cargar solicitudes para validación:", error);
                setError("Error al cargar solicitudes para validar.");
            } finally {
                setLoading(false);
            }
        };

        cargarSolicitudes();
    }, []);

    const manejarVerificar = async (direccionContrato) => {
        try {
            await axios.post("http://localhost:3001/solicitudes/verificar", {
                direccionContrato,
                notario: cuenta
            });
            alert("✅ Transacción verificada correctamente.");
            window.location.reload();
        } catch (error) {
            console.error("❌ Error al verificar la transacción:", error);
            alert("❌ Error al verificar la transacción.");
        }
    };

    if (loading) return <p className="mensaje-cargando">⏳ Cargando validaciones...</p>;
    if (error) return <p className="mensaje-error">{error}</p>;

    return (
        <div className="listado-solicitudes-container">
            <h2>📜 Solicitudes Pendientes de Verificación</h2>

            <table className="tabla-solicitudes">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Contrato</th>
                        <th>Precio</th>
                        <th>Propietario</th>
                        <th>Comprador</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudes.map((sol) => (
                        <tr key={sol.id}>
                            <td>{sol.nombre}</td>
                            <td style={{ fontSize: "0.75rem" }}>{sol.direccionContrato}</td>
                            <td>{sol.oferta}</td>
                            <td>{sol.propietario}</td>
                            <td>{sol.comprador}</td>
                            <td>
                                <button onClick={() => manejarVerificar(sol.direccionContrato)}>
                                    ✅ Verificar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ValidacionesNotario;
