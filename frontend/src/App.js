import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ListadoPropiedades from "./components/ListadoPropiedades";
import Propiedad from "./components/Propiedad";
import RegistrarPropiedad from "./components/RegistrarPropiedad";

function App() {
    return (
        <Router>
            <div className="App">
                <h1>Compraventa Inmobiliaria</h1>
                <nav>
                    <Link to="/propiedades">Ver Propiedades</Link> |
                    <Link to="/registrar">Registrar Propiedad</Link>
                </nav>
                <Routes>
                    <Route path="/propiedades" element={<ListadoPropiedades />} />
                    <Route path="/propiedades/:id" element={<Propiedad />} />
                    <Route path="/registrar" element={<RegistrarPropiedad />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;


