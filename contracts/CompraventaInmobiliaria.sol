// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CompraventaInmobiliaria {
    address public notario;
    address public propietario;
    address public comprador;

    enum EstadoPropiedad { Disponible, EnProcesoDeVenta, Vendida }

    struct Propiedad {
        uint id;
        address propietario;
        string descripcion;
        uint precio;
        EstadoPropiedad estado;
    }

    struct SolicitudCompraventa {
        uint propiedadId;
        address comprador;
        uint oferta;
        bool aceptada;
        bool verificada;
    }

    mapping(uint => Propiedad) public propiedades;
    mapping(uint => SolicitudCompraventa) public solicitudes;

    uint public contadorPropiedades;
    uint public contadorSolicitudes;

    modifier soloPropietario(uint _propiedadId) {
        require(msg.sender == propiedades[_propiedadId].propietario, "No eres el propietario.");
        _;
    }

    modifier soloNotario() {
        require(msg.sender == notario, "Solo el notario puede realizar esta accion.");
        _;
    }

    modifier soloComprador() {
        require(msg.sender == comprador, "Solo el comprador puede realizar esta accion.");
        _;
    }

    constructor(address _notario) {
        require(_notario != msg.sender, "El notario no puede ser el propietario");
        notario = _notario;
    }

    function registrarPropiedad(string memory _descripcion, uint _precio) public {
        require(msg.sender != notario, "El notario no puede registrar propiedades.");
        require(_precio > 0, "El precio debe ser mayor a 0.");
        
        contadorPropiedades++;
        propiedades[contadorPropiedades] = Propiedad(
            contadorPropiedades,
            msg.sender,
            _descripcion,
            _precio,
            EstadoPropiedad.Disponible
        );
    }

    function solicitarCompraventa(uint _propiedadId) public payable {
        Propiedad storage propiedad = propiedades[_propiedadId];
        require(propiedad.estado == EstadoPropiedad.Disponible, "La propiedad no esta disponible.");
        require(msg.sender != propiedad.propietario, "El propietario no puede comprar su propia propiedad.");
        require(msg.sender != notario, "El notario no puede comprar propiedades.");
        require(msg.value == propiedad.precio, "El valor enviado no coincide con el precio de la propiedad.");

        contadorSolicitudes++;
        solicitudes[contadorSolicitudes] = SolicitudCompraventa(_propiedadId, msg.sender, msg.value, false, false);
        comprador = msg.sender;

        propiedad.estado = EstadoPropiedad.EnProcesoDeVenta;
    }

    function aceptarSolicitud(uint _solicitudId) public soloPropietario(solicitudes[_solicitudId].propiedadId) {
        SolicitudCompraventa storage solicitud = solicitudes[_solicitudId];
        require(!solicitud.aceptada, "La solicitud ya ha sido aceptada.");

        solicitud.aceptada = true;
    }

    function rechazarSolicitud(uint _solicitudId) public soloPropietario(solicitudes[_solicitudId].propiedadId) {
        SolicitudCompraventa storage solicitud = solicitudes[_solicitudId];
        require(!solicitud.aceptada, "No se puede rechazar una solicitud ya aceptada.");

        propiedades[solicitud.propiedadId].estado = EstadoPropiedad.Disponible;
        payable(solicitud.comprador).transfer(solicitud.oferta);
        delete solicitudes[_solicitudId];
    }

    function verificarTransaccion(uint _solicitudId) public soloNotario {
        SolicitudCompraventa storage solicitud = solicitudes[_solicitudId];
        require(solicitud.aceptada, "La solicitud no ha sido aceptada.");
        require(!solicitud.verificada, "La transaccion ya ha sido verificada.");

        solicitud.verificada = true;
        Propiedad storage propiedad = propiedades[solicitud.propiedadId];

        address propietarioAnterior = propiedad.propietario;
        propiedad.propietario = solicitud.comprador;
        propiedad.estado = EstadoPropiedad.Vendida;

        payable(propietarioAnterior).transfer(solicitud.oferta);
    }
}
