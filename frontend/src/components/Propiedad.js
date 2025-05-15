import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPropiedad } from "../services/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import Web3 from "web3";
import "./Propiedad.css";

export default function Propiedad({ cuenta }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);

    const web3 = new Web3(window.ethereum);

    useEffect(() => {
        async function cargarPropiedad() {
            try {
                const datos = await obtenerPropiedad(id);
                console.log("🔍 Propiedad recibida:", datos);
                setPropiedad(datos);
            } catch (error) {
                console.error("❌ Error al cargar propiedad:", error);
            } finally {
                setLoading(false);
            }
        }
        cargarPropiedad();
    }, [id]);

    const solicitarCompra = async () => {
        try {
            const ofertaEnWei = web3.utils.toWei(
                propiedad.precio.replace(" ETH", ""),
                "ether"
            );

            const body = {
                propiedadId: propiedad.direccionContrato,
                comprador: cuenta,
                oferta: ofertaEnWei
            };

            console.log("Datos enviados al backend:", body);

            const respuesta = await axios.post("http://localhost:3001/solicitudes", body);
            console.log("✅ Solicitud enviada:", respuesta.data);

            alert("✅ Solicitud de compra enviada correctamente.");
            navigate("/solicitudes");
        } catch (error) {
            console.error("❌ Error al solicitar compra:", error?.response?.data || error.message || error);
        }
    };

    if (loading) return <p className="mensaje-cargando">⏳ Cargando propiedad...</p>;
    if (!propiedad) return <p className="mensaje-error">❌ No se encontró la propiedad.</p>;

    console.log("🖼️ imágenes recibidas:", propiedad.imagenesUrls);


    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true
    };

    const deshabilitarSolicitud =
        propiedad.estado !== "Disponible" ||
        cuenta?.toLowerCase() === propiedad.propietario?.toLowerCase();

    return (
        <div className="propiedad-container">
            <h2 className="propiedad-titulo">Detalle de la Propiedad</h2>

            <div className="propiedad-flex">
                {Array.isArray(propiedad.imagenesUrls) && propiedad.imagenesUrls.length > 0 && (
                    <Slider {...sliderSettings} className="slider-propiedad">
                        {propiedad.imagenesUrls.map((url, index) => (
                            <div key={index}>
                                <img src={url} alt={`Imagen ${index + 1}`} className="imagen-slider" />
                            </div>
                        ))}
                    </Slider>
                )}

                <div className="propiedad-detalles">
                    <p><strong>Descripción:</strong> {propiedad.descripcion}</p>
                    <p><strong>Precio:</strong> {propiedad.precio}</p>
                    <p><strong>Propietario:</strong> {propiedad.propietario}</p>
                    <p><strong>Contrato:</strong> {propiedad.direccionContrato}</p>
                    <p><strong>Estado:</strong> {propiedad.estado}</p>

                    <button
                        className={`btn-solicitar ${deshabilitarSolicitud ? "btn-disabled" : ""}`}
                        onClick={solicitarCompra}
                        disabled={deshabilitarSolicitud}
                    >
                        📩 Solicitar Compra
                    </button>

                    {deshabilitarSolicitud && (
                        <p className="mensaje-alerta">
                            {propiedad.estado !== "Disponible"
                                ? "Esta propiedad ya no está disponible para solicitar compra."
                                : "Eres el propietario de esta propiedad."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}