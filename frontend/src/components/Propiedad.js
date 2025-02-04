import React, { useEffect, useState } from 'react';
import { obtenerPropiedad } from '../services/api';

const Propiedad = ({ id }) => {
  const [propiedad, setPropiedad] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await obtenerPropiedad(id);
      setPropiedad(data);
    };

    fetchData();
  }, [id]);

  if (!propiedad) {
    return <p>Cargando propiedad...</p>;
  }

  return (
    <div>
      <h2>{propiedad.descripcion}</h2>
      <p><strong>Propietario:</strong> {propiedad.propietario}</p>
      <p><strong>Precio:</strong> {parseFloat(propiedad.precio) / 1e18} ETH</p>
      <p><strong>En Venta:</strong> {propiedad.enVenta ? 'Si' : 'No'}</p>
    </div>
  );
};

export default Propiedad;
