// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CompraventaInmobiliaria.sol";

contract RegistroPropiedades {
    address public notario;
    uint public contadorPropiedades;

    struct PropiedadData {
        uint id;
        address contratoDireccion;
        address propietario;
        string descripcion;
        uint precio;
    }

    mapping(uint => PropiedadData) public propiedadesRegistradas;
    address[] public direccionesPropiedades;

    event PropiedadCreada(
        uint indexed id,
        address contratoDireccion,
        address propietario,
        string descripcion,
        uint precio
    );

    constructor(address _notario) {
        notario = _notario;
    }

    function crearPropiedad(string memory _descripcion, uint _precio) external {
        contadorPropiedades++;

        CompraventaInmobiliaria nuevaPropiedad = new CompraventaInmobiliaria(
            msg.sender,
            notario,
            _descripcion,
            _precio
        );

        propiedadesRegistradas[contadorPropiedades] = PropiedadData({
            id: contadorPropiedades,
            contratoDireccion: address(nuevaPropiedad),
            propietario: msg.sender,
            descripcion: _descripcion,
            precio: _precio
        });

        direccionesPropiedades.push(address(nuevaPropiedad));

        emit PropiedadCreada(
            contadorPropiedades,
            address(nuevaPropiedad),
            msg.sender,
            _descripcion,
            _precio
        );
    }

    function obtenerTodasDirecciones() public view returns (address[] memory) {
        address[] memory direcciones = new address[](contadorPropiedades);
        for (uint i = 1; i <= contadorPropiedades; i++) {
            direcciones[i - 1] = propiedadesRegistradas[i].contratoDireccion;
        }
        return direcciones;
    }

    function obtenerPropiedadPorIndice(uint _indice) public view returns (
    uint id,
    address contratoDireccion,
    address propietario,
    string memory descripcion,
    uint precio
) {
    PropiedadData memory propiedad = propiedadesRegistradas[_indice];
    return (
        propiedad.id,
        propiedad.contratoDireccion,
        propiedad.propietario,
        propiedad.descripcion,
        propiedad.precio
    );
}
}
