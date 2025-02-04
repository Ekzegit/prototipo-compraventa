import React, { useState } from 'react';
import { registrarPropiedad } from '../services/blockchainService';

const RegistrarPropiedad = () => {
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [mensaje, setMensaje] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registrarPropiedad(descripcion, precio);
            setMensaje('Propiedad registrada exitosamente.');
            setDescripcion('');
            setPrecio('');
        } catch (error) {
            setMensaje('Error al registrar la propiedad.');
        }
    };

    return (
        <div>
            <h2>Registrar Propiedad</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Descripción:</label>
                    <input
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Precio (en ETH):</label>
                    <input
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Registrar</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
};

export default RegistrarPropiedad;
