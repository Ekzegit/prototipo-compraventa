exports.verificarTransaccion = async (req, res) => {
    try {
        const { solicitudId, notario } = req.body;

        if (!solicitudId || !notario) {
            return res.status(400).json({ error: "Debe proporcionar solicitudId y notario." });
        }

        const notarioRegistrado = await contrato.methods.notario().call();

        if (notario.toLowerCase() !== notarioRegistrado.toLowerCase()) {
            return res.status(403).json({ error: "Solo el notario registrado puede realizar esta acción." });
        }

        const resultado = await contrato.methods.verificarTransaccion(solicitudId).send({
            from: notario,
            gas: 3000000,
            gasPrice: await web3.eth.getGasPrice(),
        });

        res.json({ mensaje: "Transacción verificada exitosamente.", resultado });

    } catch (error) {
        console.error("Error al verificar la transacción:", error);
        res.status(500).json({ error: "Error al verificar la transacción.", detalles: error.message });
    }
};
