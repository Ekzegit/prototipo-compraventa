import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ListadoPropiedades from "./components/ListadoPropiedades";
import Propiedad from "./components/Propiedad";
import RegistrarPropiedad from "./components/RegistrarPropiedad";
import SolicitudCompra from "./components/SolicitudCompra";
import AceptarSolicitud from "./components/AceptarSolicitud";
import VerificarTransaccion from "./components/VerificarTransaccion";
import ListadoSolicitudes from "./components/ListadoSolicitudes";

function App() {
    return (
        <Router>
            <div className="App">
                <h1>🏡 Compraventa Inmobiliaria</h1>

                {/* ✅ Menú de Navegación Mejorado */}
                <nav className="nav">
                    <ul>
                        <li><Link to="/propiedades">🏠 Ver Propiedades</Link></li>
                        <li><Link to="/registrar">📝 Registrar Propiedad</Link></li>
                        <li><Link to="/SolicitudCompra">📄 Ver Solicitudes</Link></li>
                        <li><Link to="/aceptar-solicitud">✅ Aceptar Solicitud</Link></li>
                        <li><Link to="/verificar-transaccion">🔍 Verificar Transacción</Link></li>
                        <li><Link to="/solicitudes">🔍 Listado solicitudes</Link></li>
                    </ul>
                </nav>

                {/* ✅ Definición de Rutas */}
                <Routes>
                    <Route exact path="/propiedades" element={<ListadoPropiedades />} />
                    <Route exact path="/propiedades/:id" element={<Propiedad />} />
                    <Route exact path="/registrar" element={<RegistrarPropiedad />} />
                    <Route path="/SolicitudCompra" element={<SolicitudCompra />} />
                    <Route exact path="/aceptar-solicitud" element={<AceptarSolicitud />} />
                    <Route exact path="/verificar-transaccion" element={<VerificarTransaccion />} />
                    <Route path="/solicitudes" element={<ListadoSolicitudes />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;




