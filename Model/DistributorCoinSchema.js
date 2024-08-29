const { default: mongoose } = require("mongoose");

const DistributorCoinsSchema = new mongoose.Schema({
    coins: { type: Number, required: true },
    distributorId: { type: mongoose.Schema.Types.ObjectId, require: true },
    
})

module.exports = mongoose.model("distributor-coins", DistributorCoinsSchema)