const { default: mongoose, Schema } = require("mongoose");

const coinSchema = new mongoose.Schema({
    resellerId: {
        type: String
    },
    coins: {
        type: Number
    },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
})
module.exports = mongoose.model("coins", coinSchema)