﻿const { execSync } = require("child_process");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 12000000,         
      gasPrice: 20000000000  
    }
  },
  compilers: {
    solc: {
      version: "0.8.2"
    }
  }

};




