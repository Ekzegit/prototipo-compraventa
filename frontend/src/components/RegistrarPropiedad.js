import React, { useState } from 'react';
import axios from 'axios';
import { registrarPropiedadEnRegistro } from '../services/api';
import './RegistrarPropiedad.css';

const RegistrarPropiedad = ({ cuenta }) => {
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [imagenes, setImagenes] = useState([]); // múltiples archivos
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    const subirImagen = async (archivo) => {
        const formData = new FormData();
        formData.append('imagen', archivo);

        const response = await axios.post('http://localhost:3001/upload', formData);
        return response.data.url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        if (!imagenes.length) {
            setMensaje('⚠️ Debes seleccionar al menos una imagen.');
            return;
        }

        try {
            setCargando(true);

            // Subir todas las imágenes una a una
            const urls = await Promise.all(imagenes.map(subirImagen));

            // Enviar datos al backend
            await registrarPropiedadEnRegistro(descripcion, precio, cuenta, urls);

            setMensaje('✅ Propiedad registrada exitosamente en el Registro.');
            setDescripcion('');
            setPrecio('');
            setImagenes([]);
        } catch (error) {
            console.error('❌ Error al registrar la propiedad en el Registro:', error);
            setMensaje('❌ Error al registrar la propiedad.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="registro-contenedor">
            <h2>Registrar Propiedad</h2>
            <form onSubmit={handleSubmit} className="formulario-propiedad" encType="multipart/form-data">
                <div className="campo">
                    <label>Descripción:</label>
                    <input
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />
                </div>
                <div className="campo">
                    <label>Precio (en ETH):</label>
                    <input
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                    />
                </div>
                <div className="campo">
                    <label>Imágenes de la Propiedad:</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setImagenes(Array.from(e.target.files))}
                    />
                </div>
                <button type="submit" disabled={cargando}>
                    {cargando ? 'Registrando...' : 'Registrar'}
                </button>
            </form>
            {mensaje && <p className="mensaje">{mensaje}</p>}
        </div>
    );
};

export default RegistrarPropiedad;
