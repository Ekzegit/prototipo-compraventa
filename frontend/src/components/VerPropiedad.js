import React, { useState } from 'react';
import { obtenerPropiedad } from '../services/blockchainService';
import './VerPropiedad.css';

const VerPropiedad = () => {
    const [id, setId] = useState('');
    const [propiedad, setPropiedad] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await obtenerPropiedad(id);
            setPropiedad(data);
            setError('');
        } catch (err) {
            setError('❌ Error al obtener la propiedad.');
            setPropiedad(null);
        }
    };

    return (
        <div className="ver-propiedad-container">
            <h2>🔍 Ver Propiedad</h2>
            <form onSubmit={handleSubmit} className="ver-propiedad-form">
                <label>ID de la Propiedad:</label>
                <input
                    type="number"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                />
                <button type="submit">Buscar</button>
            </form>

            {error && <p className="mensaje-error">{error}</p>}

            {propiedad && (
                <div className="detalle-propiedad">
                    <h3>📋 Detalles de la Propiedad</h3>
                    <p><strong>ID:</strong> {propiedad.id}</p>
                    <p><strong>Descripción:</strong> {propiedad.descripcion}</p>
                    <p><strong>Propietario:</strong> {propiedad.propietario}</p>
                    <p><strong>En Venta:</strong> {propiedad.enVenta ? 'Sí' : 'No'}</p>
                    <p><strong>Precio:</strong> {parseFloat(propiedad.precio) / 1e18} ETH</p>
                </div>
            )}
        </div>
    );
};

export default VerPropiedad;
