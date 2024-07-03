const mongoose = require("mongoose");

const typeGuard = ["Silver", "Gold", "King"]
const guradianSchema = new mongoose.Schema({
    guardianImg: {
        type: String,
        required: true
    },
    guardianCoin: {
        type: Number,
        required: true
    },
    guardianType: {
        type: String,
        enum: typeGuard,
        required: true
    },
})

module.exports = mongoose.model("guardian", guradianSchema)