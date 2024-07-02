const { default: mongoose } = require("mongoose");

const typeGuard = ["Silver", "Gold", "King"]
const guradianSchema = new mongoose.Schema({
    guradianImg: {
        type: String,
    },
    guradianCoin: {
        type: Number
    },
    guradianType: {
        type: String,
        enum: typeGuard,
    },
})

module.exports = mongoose.model("guardian", guradianSchema)