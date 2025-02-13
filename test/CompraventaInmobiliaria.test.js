const CompraventaInmobiliaria = artifacts.require("CompraventaInmobiliaria");

contract("CompraventaInmobiliaria", (accounts) => {
    let instancia;
    const propietario = accounts[0];
    const comprador = accounts[1];
    const notario = accounts[2];

    before(async () => {
        instancia = await CompraventaInmobiliaria.deployed();
    });

    it("Debería registrar una propiedad correctamente", async () => {
        await instancia.registrarPropiedad("Casa en Santiago", web3.utils.toWei('2', 'ether'), { from: propietario });
        const propiedad = await instancia.propiedades(1);

        assert.equal(propiedad.descripcion, "Casa en Santiago", "La descripción no coincide");
        assert.equal(propiedad.precio, web3.utils.toWei('2', 'ether'), "El precio no coincide");
        assert.equal(propiedad.propietario, propietario, "El propietario inicial no coincide");
    });

    it("El propietario NO puede comprar su propia propiedad", async () => {
        try {
            await instancia.solicitarCompraventa(1, { from: propietario, value: web3.utils.toWei('2', 'ether') });
            assert.fail("La transacción debería haber fallado");
        } catch (error) {
            assert(error.message.includes("El propietario no puede comprar su propia propiedad"), "Error inesperado");
        }
    });

    it("El comprador puede solicitar la compra de una propiedad", async () => {
        await instancia.solicitarCompraventa(1, { from: comprador, value: web3.utils.toWei('2', 'ether') });
        const solicitud = await instancia.solicitudes(1);

        assert.equal(solicitud.comprador, comprador, "El comprador no coincide");
        assert.equal(solicitud.oferta, web3.utils.toWei('2', 'ether'), "La oferta no coincide");
    });

    it("El propietario puede aceptar la solicitud", async () => {
        await instancia.aceptarSolicitud(1, { from: propietario });
        const solicitud = await instancia.solicitudes(1);

        assert.equal(solicitud.aceptada, true, "La solicitud no fue aceptada correctamente");
    });

    it("Solo el notario puede verificar la transacción", async () => {
        try {
            await instancia.verificarTransaccion(1, { from: comprador });
            assert.fail("La transacción debería haber fallado");
        } catch (error) {
            assert(error.message.includes("Solo el notario puede realizar esta accion"), "Error inesperado");
        }
    });

    it("La propiedad cambia de propietario tras la verificación", async () => {
        await instancia.verificarTransaccion(1, { from: notario });
        const propiedad = await instancia.propiedades(1);

        assert.equal(propiedad.propietario, comprador, "El nuevo propietario no coincide");
        assert.equal(propiedad.estado, 2, "El estado de la propiedad no cambió a 'Vendida'");
    });
});
