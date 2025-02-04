import Web3 from 'web3';
import axios from 'axios';

const web3 = new Web3('http://127.0.0.1:8545'); // Conexion a la blockchain local
const API_URL = 'http://localhost:3000';       // URL del backend

export const obtenerPropiedad = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/propiedad/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la propiedad:', error);
        throw error;
    }
};

export const registrarPropiedad = async (descripcion, precio) => {
    try {
        const accounts = await web3.eth.getAccounts();
        const response = await axios.post(`${API_URL}/registrar`, {
            descripcion,
            precio,
            from: accounts[0]
        });
        return response.data;
    } catch (error) {
        console.error('Error al registrar la propiedad:', error);
        throw error;
    }
};
