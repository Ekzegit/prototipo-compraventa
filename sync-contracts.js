// sync-contracts.js
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build', 'contracts');
const frontendDir = path.join(__dirname, 'frontend', 'src', 'contracts'); // Ajusta si tu ruta es diferente

const contratos = ['RegistroPropiedades.json', 'CompraventaInmobiliaria.json'];

if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
}

contratos.forEach(nombreArchivo => {
    const origen = path.join(buildDir, nombreArchivo);
    const destino = path.join(frontendDir, nombreArchivo);

    fs.copyFileSync(origen, destino);
    console.log(`✅ ${nombreArchivo} copiado a frontend.`);
});
