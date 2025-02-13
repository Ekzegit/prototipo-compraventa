const CompraventaInmobiliaria = artifacts.require("CompraventaInmobiliaria");
module.exports = function (deployer, network, accounts) {
    deployer.deploy(CompraventaInmobiliaria, accounts[2]); // Notario fijo en accounts[2]
};


