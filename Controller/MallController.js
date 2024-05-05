const MallSchema = require("../Model/MallSchema");

exports.uploadMall = async (req, res) => {
    try {
        const { itemCategory, mallName, mallCoin } = req.body;
        if (!itemCategory || !mallName || !mallCoin) {
            return res.status(400).json({
                message: "mallCoin , mallName & itemCategory is required"
            })
        }
        const mall = await MallSchema(req.body).save();

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

exports.getMall = async (req, res) => {
    try {
        const data = await MallSchema.find();
        return res.status(200).json({
            data: data,
            status: true,
            size: data.length
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateMall = async (req, res) => {
    try {
        const mall = await MallSchema.findById(req.params.id);
        if (!mall) {
            return res.status(400).json({
                message: "Mall Not Found"
            })
        }
        // mall(req.body)
        mall.set(req.body);
        await mall.save(req.body);
        return res.status(200).json({
            message: "mall Updated successfully",
            data: mall
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.deleteMall = async (req, res) => {
    try {
        const mall = await MallSchema.findById(req.params.id);
        if (!mall) {
            return res.status(400).json({
                message: "Mall Not Found"
            })
        }
        await mall.deleteOne({ _id: req.body.params });
        return res.status(200).json({
            message: "Mall deleted successfully",
            data: mall
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}