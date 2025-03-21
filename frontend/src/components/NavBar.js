import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css"; // Importamos los estilos

const NavBar = ({ cuenta }) => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo">🏡 Compraventa Inmobiliaria</div>

                <ul className="nav-menu">
                    <li><Link to="/propiedades">🏠 Ver Propiedades</Link></li>
                    <li><Link to="/registrar">📝 Registrar Propiedad</Link></li>
                    <li><Link to="/SolicitudCompra">📄 Crear Solicitudes</Link></li>
                    <li><Link to="/aceptar-solicitud">✅ Aceptar Solicitud</Link></li>
                    <li><Link to="/verificar-transaccion">🔍 Verificar Transacción</Link></li>
                    <li><Link to="/solicitudes">📋 Listado Solicitudes</Link></li>
                </ul>

                <div className="nav-account">
                    {cuenta ? (
                        <span>🦊 Conectado: {cuenta}</span>
                    ) : (
                        <span>🔴 No conectado</span>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
