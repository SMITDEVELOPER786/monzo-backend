const mongoose = require("mongoose");

const coinTransferSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users", required: true
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users", required: true
    },
    coins: { type: Number,required:true },
}, { timestamps: true })

module.exports = mongoose.model("cointransfers", coinTransferSchema)