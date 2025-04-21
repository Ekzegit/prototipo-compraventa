import axios from "axios";

const API_URL = "http://localhost:3001";

// ✅ Obtener TODAS las propiedades desde el contrato RegistroPropiedades
export const obtenerPropiedades = async () => {
    try {
        const response = await axios.get(`${API_URL}/registro/propiedades`);
        console.log("Datos obtenidos de la API:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener propiedades:", error);
        throw error;
    }
};

// Obtener UNA propiedad por su ID (desde contrato individual si aplica)
export const obtenerPropiedad = async (id) => {
    if (!id) {
        throw new Error("ID de propiedad inválido.");
    }
    try {
        const response = await axios.get(`${API_URL}/propiedades/${id}`);
        console.log("Datos de la propiedad:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la propiedad:", error);
        throw error;
    }
};

// ✅ Registrar propiedad con múltiples imágenes
export const registrarPropiedadEnRegistro = async (descripcion, precio, propietario, imagenesUrls) => {
    try {
        const response = await axios.post(`${API_URL}/registro/registrar`, {
            descripcion,
            precio,
            propietario,
            imagenesUrls  // ⬅️ ahora es un arreglo de URLs
        });
        console.log("✅ Propiedad registrada en el registro:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al registrar propiedad en el registro:", error.response?.data || error.message);
        throw error;
    }
};
