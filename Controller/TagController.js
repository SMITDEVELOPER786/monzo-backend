const userSchema = require("../Model/userSchema");

exports.addUserTag = async (req, res) => {
    try {
        const { userId, tag } = req.body;
        if (!userId || !tag) {
            return res.status(400).json({
                message: "User id and tag are required"
            })
        }
        const user = await userSchema.findOneAndUpdate({ _id: userId }, { $set: { tag } });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "Tag added successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getAssignTags = async (req, res) => {
    try {
        const data = await userSchema.find({ tag: { $exists: true, $ne: null, $ne: "" } });
    
        return res.status(200).json({
            data,
            length: data.length
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}