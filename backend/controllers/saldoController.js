exports.obtenerSaldo = async (req, res) => {
    try {
        const { cuenta } = req.params;
        if (!web3.utils.isAddress(cuenta)) {
            return res.status(400).json({ error: "Dirección de Ethereum no válida" });
        }

        const saldoWei = await web3.eth.getBalance(cuenta);
        const saldoETH = web3.utils.fromWei(saldoWei, "ether");

        res.json({ cuenta, saldo: saldoETH + " ETH" });

    } catch (error) {
        console.error("Error al obtener el saldo:", error);
        res.status(500).json({ error: "Error al obtener el saldo.", detalles: error.message });
    }
};
