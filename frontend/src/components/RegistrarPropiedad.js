import React, { useState } from 'react';
import { registrarPropiedad } from '../services/blockchainService';

const RegistrarPropiedad = ({ cuenta }) => {
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!cuenta) {
            setMensaje('⚠️ Debes conectar MetaMask antes de registrar una propiedad.');
            return;
        }
        if (!descripcion.trim()) {
            setMensaje('⚠️ La descripción no puede estar vacía.');
            return;
        }
        if (isNaN(precio) || Number(precio) <= 0) {
            setMensaje('⚠️ El precio debe ser un número mayor a 0.');
            return;
        }

        try {
            setCargando(true);
            await registrarPropiedad(descripcion, precio, cuenta); // ✅ Pasar la cuenta del usuario
            setMensaje('✅ Propiedad registrada exitosamente.');
            setDescripcion('');
            setPrecio('');
        } catch (error) {
            console.error('Error al registrar la propiedad:', error);
            setMensaje('❌ Error al registrar la propiedad.');
        } finally {
            setCargando(false);
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
                <button type="submit" disabled={cargando}>
                    {cargando ? 'Registrando...' : 'Registrar'}
                </button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
};

export default RegistrarPropiedad;
