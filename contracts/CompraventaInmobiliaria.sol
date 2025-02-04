// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CompraventaInmobiliaria {
    struct Propiedad {
        uint id;
        string descripcion;
        address payable propietario;
        bool enVenta;
        uint precio;
    }

    uint public contadorPropiedades;
    mapping(uint => Propiedad) public propiedades;

    event PropiedadRegistrada(uint id, string descripcion, address propietario);
    event PropiedadVendida(uint id, address nuevoPropietario, uint precio);

    // Constructor vacio
    constructor() {}

    // Registrar una nueva propiedad
    function registrarPropiedad(string memory descripcion, uint precio) public {
        require(precio > 0, "El precio debe ser mayor que cero.");
        contadorPropiedades++;

        propiedades[contadorPropiedades] = Propiedad(
            contadorPropiedades,
            descripcion,
            payable(msg.sender),
            true,
            precio
        );

        emit PropiedadRegistrada(contadorPropiedades, descripcion, msg.sender);
    }

    // Comprar una propiedad
    function comprarPropiedad(uint id) public payable {
        require(id > 0 && id <= contadorPropiedades, "Propiedad no valida.");
        Propiedad storage propiedad = propiedades[id];
        require(propiedad.enVenta, "La propiedad no esta en venta.");
        require(msg.value >= propiedad.precio, "Fondos insuficientes para la compra.");

        (bool enviado, ) = propiedad.propietario.call{value: msg.value}("");
        require(enviado, "Fallo la transferencia de fondos.");

        propiedad.propietario = payable(msg.sender);
        propiedad.enVenta = false;

        emit PropiedadVendida(id, msg.sender, propiedad.precio);
    }
}
