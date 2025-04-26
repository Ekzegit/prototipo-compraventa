import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ListadoSolicitudes.css";

const NOTARIO_DIRECCION = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";

const Historial = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cuenta, setCuenta] = useState("");
    const [filtro, setFiltro] = useState("todos");

    const esNotario = cuenta.toLowerCase() === NOTARIO_DIRECCION.toLowerCase();

    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                const cuentas = await window.ethereum.request({ method: "eth_accounts" });
                const cuentaActual = cuentas[0];

                if (!cuentaActual) {
                    setError("⚠️ No hay cuenta conectada en MetaMask.");
                    setLoading(false);
                    return;
                }

                setCuenta(cuentaActual);

                const respuesta = await axios.get(`http://localhost:3001/historial?cuenta=${cuentaActual}`);
                setHistorial(respuesta.data || []);
            } catch (error) {
                console.error("❌ Error al obtener el historial:", error);
                setError("Error al obtener el historial.");
            } finally {
                setLoading(false);
            }
        };

        cargarHistorial();
    }, []);

    const historialFiltrado = historial.filter((item) => {
        if (filtro === "todos") return true;
        return item.rol?.toLowerCase() === filtro;
    });

    const renderBadgeEstado = (estado) => (
        <span className="badge estado-verificada">Verificada</span> // ✅ Siempre verificada ahora
    );

    if (loading) return <p className="mensaje-cargando">⏳ Cargando historial...</p>;
    if (error) return <p className="mensaje-error">{error}</p>;

    return (
        <div className="listado-solicitudes-container">
            <h2>📚 Historial de Transacciones Completadas</h2>

            <div className="filtros-solicitudes">
                <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                    <option value="todos">📋 Ver Todo</option>
                    <option value="comprador">🛒 Compras</option>
                    <option value="vendedor">🏠 Ventas</option>
                    {esNotario && <option value="notario">📜 Validaciones</option>}
                </select>
            </div>

            {historialFiltrado.length === 0 ? (
                <p className="mensaje-cargando">🔎 No hay actividades verificadas aún.</p>
            ) : (
                <table className="tabla-solicitudes">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Contrato</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historialFiltrado.map((item) => (
                            <tr key={item.id}>
                                <td>{item.nombre || "-"}</td>
                                <td style={{ fontSize: "0.75rem" }}>{item.direccionContrato}</td>
                                <td>{item.oferta}</td>
                                <td>{renderBadgeEstado(item.estado)}</td>
                                <td style={{ textTransform: "capitalize" }}>{item.rol}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Historial;
