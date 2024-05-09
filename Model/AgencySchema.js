const { default: mongoose } = require("mongoose");

const agencySchema = new mongoose.Schema({
    idCard: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    agencyImg: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("agency", agencySchema)