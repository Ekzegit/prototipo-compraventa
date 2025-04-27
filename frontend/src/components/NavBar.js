import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Web3 from "web3";
import "./NavBar.css";

const NavBar = ({ cuenta }) => {
    const location = useLocation();
    const [saldo, setSaldo] = useState(null);

    useEffect(() => {
        const web3 = new Web3(window.ethereum);

        async function cargarSaldo() {
            if (cuenta) {
                try {
                    const saldoWei = await web3.eth.getBalance(cuenta);
                    const saldoEther = web3.utils.fromWei(saldoWei, "ether");
                    setSaldo(parseFloat(saldoEther).toFixed(4)); // 4 decimales
                } catch (error) {
                    console.error("❌ Error al obtener saldo:", error);
                }
            }
        }

        cargarSaldo();

        const intervalo = setInterval(cargarSaldo, 60000); // actualizar cada 60 segundos

        return () => clearInterval(intervalo);
    }, [cuenta]);

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
                    <li className={location.pathname === "/solicitudes" ? "active" : ""}>
                        <Link to="/solicitudes">📬 Solicitudes</Link>
                    </li>
                    <li className={location.pathname === "/historial" ? "active" : ""}>
                        <Link to="/historial">📚 Historial</Link>
                    </li>
                </ul>

                <div className="nav-account">
                    {cuenta ? (
                        <div className="conectado">
                            🦊 {cuenta.substring(0, 6)}...{cuenta.slice(-4)}
                            {saldo !== null && (
                                <span className="saldo"> | 💰 {saldo} ETH</span>
                            )}
                        </div>
                    ) : (
                        <span className="desconectado">🔴 No conectado</span>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
