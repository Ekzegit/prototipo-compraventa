import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPropiedad } from "../services/api";
import Slider from "react-slick";
import "./Propiedad.css";

export default function Propiedad({ cuenta }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarPropiedad() {
            try {
                const datos = await obtenerPropiedad(id);
                setPropiedad(datos);
            } catch (error) {
                console.error("Error al cargar propiedad:", error);
            } finally {
                setLoading(false);
            }
        }
        cargarPropiedad();
    }, [id]);

    if (loading) return <p className="mensaje-cargando">Cargando propiedad...</p>;
    if (!propiedad) return <p className="mensaje-error">No se encontró la propiedad.</p>;

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true
    };

    return (
        <div className="propiedad-container">
            <h2 className="propiedad-titulo">Detalle de la Propiedad</h2>

            <div className="propiedad-flex">
                {/* Carrusel */}
                {Array.isArray(propiedad.imagenesUrls) && propiedad.imagenesUrls.length > 0 && (
                    <Slider {...sliderSettings} className="slider-propiedad">
                        {propiedad.imagenesUrls.map((url, index) => (
                            <div key={index}>
                                <img src={url} alt={`Imagen ${index + 1}`} className="imagen-slider" />
                            </div>
                        ))}
                    </Slider>
                )}

                {/* Detalles */}
                <div className="propiedad-detalles">
                    <p><strong>Descripción:</strong> {propiedad.descripcion}</p>
                    <p><strong>Precio:</strong> {propiedad.precio}</p>
                    <p><strong>Propietario:</strong> {propiedad.propietario}</p>
                    <p><strong>Contrato:</strong> {propiedad.direccionContrato}</p>
                    <p><strong>Estado:</strong> {propiedad.estado}</p>

                    <button
                        className="btn-solicitar"
                        onClick={() =>
                            navigate(
                                `/SolicitudCompra?contrato=${propiedad.direccionContrato}&precio=${propiedad.precio}&comprador=${cuenta}`
                            )
                        }
                    >
                        📩 Solicitar Compra
                    </button>
                </div>
            </div>
        </div>
    );
}
