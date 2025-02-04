const express = require('express');
const cors = require('cors');
const Web3 = require('web3').default;  


const app = express();
const port = 3001;

app.use(cors());



// Configurar Web3 para conectarse a la blockchain local
const web3 = new Web3('http://127.0.0.1:8545');

// Importar el ABI y la direccion del contrato
const contratoABI = require('../build/contracts/CompraventaInmobiliaria.json').abi;
const contratoDireccion = '0x3669C3f75ADE54aDdfD6BdB75Df4342bbce6A68c';

// Crear la instancia del contrato
const contrato = new web3.eth.Contract(contratoABI, contratoDireccion);

// Ruta para obtener los detalles de una propiedad por su ID
app.get('/propiedades/:id', async (req, res) => {
    try {
        const propiedadId = req.params.id;
        const propiedad = await contrato.methods.propiedades(propiedadId).call();

        // Convertir BigInt a String si es necesario
        const propiedadFormateada = Object.fromEntries(
            Object.entries(propiedad).map(([key, value]) => 
                typeof value === 'bigint' ? [key, value.toString()] : [key, value]
            )
        );

        res.json(propiedadFormateada);
    } catch (error) {
        console.error('Error al obtener la propiedad:', error);
        res.status(500).json({ error: 'Error al obtener la propiedad.', detalles: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
