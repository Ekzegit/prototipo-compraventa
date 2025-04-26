import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ListadoSolicitudes.css";

const NOTARIO_DIRECCION = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";

const ListadoSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cuenta, setCuenta] = useState("");
    const [tipo, setTipo] = useState("compras");

    const esNotario = cuenta.toLowerCase() === NOTARIO_DIRECCION.toLowerCase();

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

                setCuenta(cuentaActual);

                const url = esNotario && tipo === "validaciones"
                    ? "http://localhost:3001/solicitudes"
                    : `http://localhost:3001/solicitudes?cuenta=${cuentaActual}&tipo=${tipo}`;

                const respuesta = await axios.get(url);

                const filtradas = (tipo === "validaciones")
                    ? respuesta.data.filter(sol =>
                        sol.estado === "Aceptada" &&
                        sol.comprador.toLowerCase() !== cuentaActual.toLowerCase() &&
                        sol.propietario.toLowerCase() !== cuentaActual.toLowerCase()
                    )
                    : respuesta.data.filter(sol =>
                        sol.estado !== "Verificada" // 👉 No mostrar solicitudes verificadas en compras/ventas
                    );

                setSolicitudes(filtradas);
            } catch (error) {
                console.error("❌ Error al obtener las solicitudes:", error);
                setError("Error al obtener las solicitudes.");
            } finally {
                setLoading(false);
            }
        };

        cargarSolicitudes();
    }, [tipo]);

    const renderBadgeEstado = (estado) => {
        const texto = estado?.toLowerCase();
        let clase = "badge estado-pendiente";
        if (texto.includes("aceptada")) clase = "badge estado-aceptada";
        else if (texto.includes("verificada")) clase = "badge estado-verificada";
        else if (texto.includes("rechazada")) clase = "badge estado-rechazada";
        return <span className={clase}>{estado}</span>;
    };

    const manejarAceptar = async (direccionContrato) => {
        try {
            await axios.post("http://localhost:3001/solicitudes/aceptar", {
                direccionContrato,
                propietario: cuenta
            });
            alert("✅ Solicitud aceptada correctamente.");
            window.location.reload();
        } catch (error) {
            console.error("❌ Error al aceptar la solicitud:", error);
            alert("❌ Error al aceptar la solicitud.");
        }
    };

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

    const renderAcciones = (sol) => {
        const esPropietario = cuenta.toLowerCase() === sol.propietario.toLowerCase();

        if (sol.estado === "Pendiente" && esPropietario) {
            return <button onClick={() => manejarAceptar(sol.direccionContrato)}>✅ Aceptar</button>;
        }

        if (sol.estado === "Aceptada" && esNotario &&
            sol.propietario.toLowerCase() !== cuenta.toLowerCase() &&
            sol.comprador.toLowerCase() !== cuenta.toLowerCase()
        ) {
            return <button onClick={() => manejarVerificar(sol.direccionContrato)}>📜 Verificar</button>;
        }

        return <span style={{ color: "#aaa" }}>Sin acciones</span>;
    };

    if (loading) return <p className="mensaje-cargando">⏳ Cargando solicitudes...</p>;
    if (error) return <p className="mensaje-error">{error}</p>;

    return (
        <div className="listado-solicitudes-container">
            <h2>📄 {esNotario && tipo === "validaciones" ? "Solicitudes para Validar" : `Tus Solicitudes de ${tipo === "compras" ? "Compra" : "Venta"}`}</h2>

            <div className="filtros-solicitudes">
                <button className={tipo === "compras" ? "activo" : ""} onClick={() => setTipo("compras")}>🛒 Compras</button>
                <button className={tipo === "ventas" ? "activo" : ""} onClick={() => setTipo("ventas")}>🏠 Ventas</button>
                {esNotario && (
                    <button className={tipo === "validaciones" ? "activo" : ""} onClick={() => setTipo("validaciones")}>📜 Validaciones</button>
                )}
            </div>

            <table className="tabla-solicitudes">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Contrato</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>{tipo === "compras" ? "Propietario" : tipo === "ventas" ? "Comprador" : "Rol"}</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudes.map((sol) => (
                        <tr key={sol.id}>
                            <td>{sol.nombre || "-"}</td>
                            <td style={{ fontSize: "0.75rem" }}>{sol.direccionContrato}</td>
                            <td>{sol.oferta}</td>
                            <td>{renderBadgeEstado(sol.estado)}</td>
                            <td>{tipo === "compras" ? sol.propietario : tipo === "ventas" ? sol.comprador : `${sol.propietario.slice(0, 6)} / ${sol.comprador.slice(0, 6)}`}</td>
                            <td>{renderAcciones(sol)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListadoSolicitudes;
