import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ListadoPropiedades from "./components/ListadoPropiedades";
import Propiedad from "./components/Propiedad";
import RegistrarPropiedad from "./components/RegistrarPropiedad";
import ListadoSolicitudes from "./components/ListadoSolicitudes";
import Historial from "./components/Historial";
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

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (cuentas) => {
                if (cuentas.length > 0) {
                    console.log("🔄 Cuenta cambiada:", cuentas[0]);
                    setCuenta(cuentas[0]);
                } else {
                    console.log("🔴 No hay cuentas conectadas.");
                    setCuenta(null); // Podrías también redirigir al login si quieres
                }
            });
        }

        return () => {
            if (window.ethereum?.removeListener) {
                window.ethereum.removeListener("accountsChanged", () => { });
            }
        };
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
                    <Route path="/" element={!cuenta ? <Login setUserAccount={setCuenta} /> : <Navigate to="/propiedades" />} />

                    {cuenta && (
                        <>
                            <Route path="/propiedades" element={<ListadoPropiedades />} />
                            <Route path="/propiedades/:id" element={<Propiedad cuenta={cuenta} />} />
                            <Route path="/registrar" element={<RegistrarPropiedad cuenta={cuenta} />} />
                            <Route path="/solicitudes" element={<ListadoSolicitudes />} />
                            <Route path="/historial" element={<Historial />} />
                        </>
                    )}

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
