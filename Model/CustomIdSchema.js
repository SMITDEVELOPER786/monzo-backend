const mongoose = require("mongoose");

const CustomIdSchema = new mongoose.Schema({
    coinValue: {
        type: Number,
        required: true
    },
    customId: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("customId", CustomIdSchema);