import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ListadoPropiedades from "./components/ListadoPropiedades";
import Propiedad from "./components/Propiedad";
import RegistrarPropiedad from "./components/RegistrarPropiedad";
import ListadoSolicitudes from "./components/ListadoSolicitudes";
import Historial from "./components/Historial"; // ✅ Nuevo
import Login from "./components/Login";
import NavBar from "./components/NavBar";

function App() {
    const [cuenta, setCuenta] = useState(null);

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

    const handleLogout = () => {
        setCuenta(null);
        window.location.href = "/";
    };

    return (
        <Router>
            <div className="App">
                {cuenta && <NavBar cuenta={cuenta} onLogout={handleLogout} />}

                <Routes>
                    {/* Página de Login */}
                    <Route path="/" element={!cuenta ? <Login setCuenta={setCuenta} /> : <Navigate to="/propiedades" />} />

                    {/* Rutas protegidas */}
                    {cuenta && (
                        <>
                            <Route path="/propiedades" element={<ListadoPropiedades />} />
                            <Route path="/propiedades/:id" element={<Propiedad cuenta={cuenta} />} />
                            <Route path="/registrar" element={<RegistrarPropiedad cuenta={cuenta} />} />
                            <Route path="/solicitudes" element={<ListadoSolicitudes />} />
                            <Route path="/historial" element={<Historial />} /> {/* ✅ Agregado Historial */}
                        </>
                    )}

                    {/* Redirigir todo lo demás al login */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
