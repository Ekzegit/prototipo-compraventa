import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ListadoPropiedades from "./components/ListadoPropiedades";
import Propiedad from "./components/Propiedad";
import RegistrarPropiedad from "./components/RegistrarPropiedad";
import SolicitudCompra from "./components/SolicitudCompra";
import AceptarSolicitud from "./components/AceptarSolicitud";
import VerificarTransaccion from "./components/VerificarTransaccion";
import ListadoSolicitudes from "./components/ListadoSolicitudes";
import Login from "./components/Login";
import NavBar from "./components/NavBar"; // ✅ Importamos NavBar

function App() {
    const [cuenta, setCuenta] = useState(null);

    // ✅ Verificar si MetaMask ya está conectado al cargar la página
    useEffect(() => {
        const verificarConexion = async () => {
            if (window.ethereum) {
                const cuentas = await window.ethereum.request({ method: "eth_accounts" });
                if (cuentas.length > 0) {
                    setCuenta(cuentas[0]);
                }
            }
        };
        verificarConexion();
    }, []);

    // ✅ Función para cerrar sesión
    const handleLogout = () => {
        setCuenta(null);
        window.location.href = "/"; // Redirigir al login al cerrar sesión
    };

    return (
        <Router>
            <div className="App">
                {/* ✅ Agregamos la barra de navegación en toda la aplicación */}
                {cuenta && <NavBar cuenta={cuenta} onLogout={handleLogout} />}

                <Routes>
                    {/* Página de Login */}
                    <Route path="/" element={!cuenta ? <Login setCuenta={setCuenta} /> : <Navigate to="/propiedades" />} />

                    {/* ✅ Rutas protegidas: Solo accesibles si el usuario está conectado */}
                    {cuenta && (
                        <>
                            <Route path="/propiedades" element={<ListadoPropiedades />} />
                            <Route path="/propiedades/:id" element={<Propiedad />} />
                            <Route path="/registrar" element={<RegistrarPropiedad cuenta={cuenta} />} />
                            <Route path="/SolicitudCompra" element={<SolicitudCompra />} />
                            <Route path="/aceptar-solicitud" element={<AceptarSolicitud />} />
                            <Route path="/verificar-transaccion" element={<VerificarTransaccion />} />
                            <Route path="/solicitudes" element={<ListadoSolicitudes />} />
                        </>
                    )}

                    {/* Redirigir a login si intenta acceder sin estar conectado */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
