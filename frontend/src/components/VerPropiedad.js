import React, { useState } from 'react';
import { obtenerPropiedad } from '../services/blockchainService';

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
            setError('Error al obtener la propiedad.');
            setPropiedad(null);
        }
    };

    return (
        <div>
            <h2>Ver Propiedad</h2>
            <form onSubmit={handleSubmit}>
                <label>ID de la Propiedad:</label>
                <input
                    type="number"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                />
                <button type="submit">Buscar</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {propiedad && (
                <div>
                    <h3>Detalles de la Propiedad</h3>
                    <p><strong>ID:</strong> {propiedad.id}</p>
                    <p><strong>Descripcion:</strong> {propiedad.descripcion}</p>
                    <p><strong>Propietario:</strong> {propiedad.propietario}</p>
                    <p><strong>En Venta:</strong> {propiedad.enVenta ? 'Si' : 'No'}</p>
                    <p><strong>Precio:</strong> {parseFloat(propiedad.precio) / 1e18} ETH</p>
                </div>
            )}
        </div>
    );
};

export default VerPropiedad;
