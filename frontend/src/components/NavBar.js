import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

const NavBar = ({ cuenta }) => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo">🏡 Compraventa Inmobiliaria</div>

                <ul className="nav-menu">
                    <li className={location.pathname === "/propiedades" ? "active" : ""}>
                        <Link to="/propiedades">🏠 Propiedades</Link>
                    </li>
                    <li className={location.pathname === "/registrar" ? "active" : ""}>
                        <Link to="/registrar">📝 Registrar</Link>
                    </li>
                    <li className={location.pathname === "/SolicitudCompra" ? "active" : ""}>
                        <Link to="/SolicitudCompra">📄 Solicitudes</Link>
                    </li>
                    <li className={location.pathname === "/aceptar-solicitud" ? "active" : ""}>
                        <Link to="/aceptar-solicitud">✅ Aceptar</Link>
                    </li>
                    <li className={location.pathname === "/verificar-transaccion" ? "active" : ""}>
                        <Link to="/verificar-transaccion">🔍 Verificar</Link>
                    </li>
                    <li className={location.pathname === "/solicitudes" ? "active" : ""}>
                        <Link to="/solicitudes">📋 Listado</Link>
                    </li>
                </ul>

                <div className="nav-account">
                    {cuenta ? (
                        <span className="conectado">🦊 {cuenta}</span>
                    ) : (
                        <span className="desconectado">🔴 No conectado</span>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
