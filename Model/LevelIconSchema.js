const mongoose = require("mongoose");

const levelIconSchema = new mongoose.Schema({
    serialNo: { type: Number, required: true },
    levelIcon: { type: String, required: true },
})

module.exports = mongoose.model("levelIcon", levelIconSchema)