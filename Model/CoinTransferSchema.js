const mongoose = require("mongoose");

const coinTransferSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users"
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users"
    },
    coins: { type: Number },
}, { timestamps: true })

module.exports = mongoose.model("cointransfers", coinTransferSchema)