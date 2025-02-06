const CompraventaInmobiliaria = artifacts.require("CompraventaInmobiliaria");
module.exports = function (deployer) {
    deployer.deploy(CompraventaInmobiliaria, { gas: 6000000 });
};



