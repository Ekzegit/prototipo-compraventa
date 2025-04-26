// SDPX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CompraventaInmobiliaria {
    enum EstadoPropiedad { Disponible, EnProcesoDeVenta, Vendida }

    uint public id;
    address public propietario;
    address public propietarioOriginal;
    address public notario;
    string public descripcion;
    uint public precio;
    EstadoPropiedad public estado;

    address public comprador;
    uint public oferta;
    bool public aceptada;
    bool public verificada;

    modifier soloPropietario() {
        require(msg.sender == propietario, "No eres el propietario.");
        _;
    }

    modifier soloNotario() {
        require(msg.sender == notario, "Solo el notario puede verificar la transaccion.");
        _;
    }

    modifier soloComprador() {
        require(msg.sender == comprador, "Solo el comprador puede continuar.");
        _;
    }

    constructor(
        address _propietario,
        address _notario,
        string memory _descripcion,
        uint _precio
    ) {
        require(_propietario != address(0), "Propietario invalido.");
        require(_notario != address(0), "Notario invalido.");
        require(_propietario != _notario, "Notario no puede ser propietario.");
        require(_precio > 0, "Precio debe ser mayor a cero.");

        propietario = _propietario;
        propietarioOriginal = _propietario;
        notario = _notario;
        descripcion = _descripcion;
        precio = _precio;
        estado = EstadoPropiedad.Disponible;
    }

    function solicitarCompra() public payable {
        require(estado == EstadoPropiedad.Disponible, "Propiedad no disponible.");
        require(msg.sender != propietario && msg.sender != notario, "No autorizado.");
        require(msg.value == precio, "Monto enviado incorrecto.");

        comprador = msg.sender;
        oferta = msg.value;
        estado = EstadoPropiedad.EnProcesoDeVenta;
    }

    function aceptarSolicitud() public soloPropietario {
        require(estado == EstadoPropiedad.EnProcesoDeVenta, "No hay solicitud activa.");
        require(!aceptada, "Ya fue aceptada.");
        aceptada = true;
    }

    function rechazarSolicitud() public soloPropietario {
        require(estado == EstadoPropiedad.EnProcesoDeVenta, "No hay solicitud en proceso.");
        require(!aceptada, "No se puede rechazar una solicitud aceptada.");

        payable(comprador).transfer(oferta);

        comprador = address(0);
        oferta = 0;
        estado = EstadoPropiedad.Disponible;
    }

    function verificarTransaccion() public soloNotario {
        require(aceptada, "Solicitud no aceptada.");
        require(!verificada, "Ya verificada.");

        verificada = true;
        estado = EstadoPropiedad.Vendida;

        address anteriorPropietario = propietario;
        propietario = comprador;

        payable(anteriorPropietario).transfer(oferta);
    }

    function getResumen() public view returns (
        address, address, string memory, uint, EstadoPropiedad, address, uint, bool, bool, address
    ) {
        return (
            propietario,
            notario,
            descripcion,
            precio,
            estado,
            comprador,
            oferta,
            aceptada,
            verificada,
            propietarioOriginal
        );
    }
}
