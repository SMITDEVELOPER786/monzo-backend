const Message = require("../Model/messageSchema");

exports.getMessages = async (req, res) => {
    try {
        const data = await Message.find({})
        return res.status(200).json({
            message: "get message",
            data: data
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}
