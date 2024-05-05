const CustomIdSchema = require("../Model/CustomIdSchema");
const userSchema = require("../Model/userSchema")

exports.generateCustomId = async (req, res) => {
    try {
        const { customId, coinValue } = req.body;

        if (!customId) {
            return res.status(400).json({ message: "provide custom ID" })
        }

        if (customId.length !== 6) {
            return res.status(400).json({ message: "Id must be length of 6 letters" })
        }
        if (!coinValue) {
            return res.status(400).json({ message: "add value for custom ID" })
        }

        const checkID = await userSchema.findOne({ Id: customId })
        const checkCustomId = await CustomIdSchema.findOne({ customId })
        if (checkID || checkCustomId) {
            return res.status(400).json({
                message: "Id is already taken",
                status: false
            });
        }
        console.log(checkID);
        const customID = await CustomIdSchema(req.body).save();
        return res.status(200).json({
            data: customID,
            status: true
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getCustomId = async (req, res) => {
    try {
        const data = await CustomIdSchema.find()

        return res.status(200).json({
            data: data,
            status: true
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.DeleteCustomId = async (req, res) => {
    try {
        const checkId = await CustomIdSchema.findOne({ _id: req.params.id })
        console.log(req.params.id)
        console.log(checkId)
        if (!checkId) {
            return res.status(400).json({ message: "Id not found" })
        }
        const data = await CustomIdSchema.findOneAndDelete({ _id: req.params.id })

        return res.status(200).json({
            data: data,
            message: "Custom Id deleted successfully",
            status: true
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}