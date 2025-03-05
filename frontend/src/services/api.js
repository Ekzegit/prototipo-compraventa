import axios from "axios";

const API_URL = "http://localhost:3001";

// Obtener TODAS las propiedades
export const obtenerPropiedades = async () => {
    try {
        const response = await axios.get(`${API_URL}/propiedades`);
        console.log("Datos obtenidos de la API:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener propiedades:", error);
        throw error;
    }
};

// Obtener UNA propiedad por su ID
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






