const MallSchema = require("../Model/MallSchema");

exports.uploadMall = async (req, res) => {
    try {
        const { itemCategory, mallName } = req.body;
        if (!itemCategory || !mallName || !mallCoin) {
            return res.status(400).json({
                message: "mallCoin , mallName & itemCategory is required"
            })
        }
        const mall = await MallSchema(req.body)
        return res.status(200).json({
            data: mall,
            status: true
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

}