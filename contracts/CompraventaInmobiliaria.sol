// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CompraventaInmobiliaria {
    enum EstadoPropiedad { Disponible, EnProcesoDeVenta, Vendida }
    enum EstadoSolicitud { Pendiente, Aceptada, Rechazada }

    struct Solicitud {
        address comprador;
        uint oferta;
        EstadoSolicitud estado;
    }

    uint public id;
    address public propietario;
    address public propietarioOriginal;
    address public notario;
    string public descripcion;
    uint public precio;
    EstadoPropiedad public estado;
    bool public verificada;

    Solicitud[] public solicitudes;

    modifier soloPropietario() {
        require(msg.sender == propietario, "No eres el propietario");
        _;
    }

    modifier soloNotario() {
        require(msg.sender == notario, "Solo el notario puede verificar");
        _;
    }

    constructor(
        address _propietario,
        address _notario,
        string memory _descripcion,
        uint _precio
    ) {
        require(_propietario != address(0), "Propietario invalido");
        require(_notario != address(0), "Notario invalido");
        require(_propietario != _notario, "Notario no puede ser propietario");
        require(_precio > 0, "Precio debe ser mayor a cero");

        propietario = _propietario;
        propietarioOriginal = _propietario;
        notario = _notario;
        descripcion = _descripcion;
        precio = _precio;
        estado = EstadoPropiedad.Disponible;
    }

    function solicitarCompra() public payable {
        require(estado == EstadoPropiedad.Disponible, "Propiedad no disponible");
        require(msg.sender != propietario && msg.sender != notario, "No autorizado");
        require(msg.value == precio, "Monto incorrecto");

        solicitudes.push(Solicitud({
            comprador: msg.sender,
            oferta: msg.value,
            estado: EstadoSolicitud.Pendiente
        }));

        estado = EstadoPropiedad.EnProcesoDeVenta;
    }

    function aceptarSolicitud(uint index) public soloPropietario {
        require(index < solicitudes.length, "Indice invalido");
        Solicitud storage s = solicitudes[index];
        require(s.estado == EstadoSolicitud.Pendiente, "Solicitud ya resuelta");

        s.estado = EstadoSolicitud.Aceptada;
    }

    function rechazarSolicitud(uint index) public soloPropietario {
        require(index < solicitudes.length, "Indice invalido");
        Solicitud storage s = solicitudes[index];
        require(s.estado == EstadoSolicitud.Pendiente, "Solicitud ya resuelta");

        s.estado = EstadoSolicitud.Rechazada;
        payable(s.comprador).transfer(s.oferta);

        bool hayPendiente = false;
        for (uint i = 0; i < solicitudes.length; i++) {
            if (solicitudes[i].estado == EstadoSolicitud.Pendiente) {
                hayPendiente = true;
                break;
            }
        }

        if (!hayPendiente) {
            estado = EstadoPropiedad.Disponible;
        }
    }

    function verificarTransaccion(uint index) public soloNotario {
        require(index < solicitudes.length, "Indice invalido");
        Solicitud storage s = solicitudes[index];
        require(s.estado == EstadoSolicitud.Aceptada, "No aceptada");
        require(!verificada, "Ya verificada");

        verificada = true;
        estado = EstadoPropiedad.Vendida;

        address anteriorPropietario = propietario;
        propietario = s.comprador;

        payable(anteriorPropietario).transfer(s.oferta);
    }

    function getResumen() public view returns (
        address, address, string memory, uint, uint, address, uint, bool, bool, address
    ) {
        address compradorActivo = address(0);
        uint ofertaActiva = 0;
        bool aceptada = false;

        for (uint i = 0; i < solicitudes.length; i++) {
            if (solicitudes[i].estado == EstadoSolicitud.Pendiente) {
                compradorActivo = solicitudes[i].comprador;
                ofertaActiva = solicitudes[i].oferta;
                break;
            } else if (solicitudes[i].estado == EstadoSolicitud.Aceptada) {
                compradorActivo = solicitudes[i].comprador;
                ofertaActiva = solicitudes[i].oferta;
                aceptada = true;
                break;
            }
        }

        return (
            propietario,
            notario,
            descripcion,
            precio,
            uint(estado),
            compradorActivo,
            ofertaActiva,
            aceptada,
            verificada,
            propietarioOriginal
        );
    }

    function obtenerTodasLasSolicitudes() public view returns (Solicitud[] memory) {
        return solicitudes;
    }
}