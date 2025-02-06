import React, { useState } from 'react';
import axios from 'axios';

const SolicitudCompra = () => {
    const [propiedadId, setPropiedadId] = useState('');
    const [comprador, setComprador] = useState('');
    const [mensaje, setMensaje] = useState('');

    const manejarEnvio = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await axios.post('http://localhost:3001/solicitudes', {
                propiedadId,
                comprador
            });
            setMensaje(respuesta.data.mensaje);
        } catch (error) {
            setMensaje('Error al realizar la solicitud de compra.');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Solicitar Compra de Propiedad</h2>
            <form onSubmit={manejarEnvio}>
                <input
                    type="text"
                    placeholder="ID de la propiedad"
                    value={propiedadId}
                    onChange={(e) => setPropiedadId(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Dirección del comprador"
                    value={comprador}
                    onChange={(e) => setComprador(e.target.value)}
                    required
                />
                <button type="submit">Solicitar Compra</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
};

export default SolicitudCompra;
