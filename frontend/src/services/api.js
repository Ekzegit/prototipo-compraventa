import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const obtenerPropiedad = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/propiedades/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la propiedad:', error);
    return null;
  }
};
