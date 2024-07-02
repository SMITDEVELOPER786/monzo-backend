const GuardianSchema = require("../Model/GuardianSchema");

exports.createGuardian = async (req, res) => {
    try {
        const { guradianCoin, guradianType } = req.file;
        if (!guradianCoin || !guradianType) {
            return res.status(200).json({
                message: "coin & type are required..!"
            })
        }
        if (!req.file) {
            return res.status(200).json({
                message: "guardian img is required..!"
            })
        }
        await GuardianSchema(req.body).save();
        return res.status(200).json({
            message: "Guardian added..!"
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}