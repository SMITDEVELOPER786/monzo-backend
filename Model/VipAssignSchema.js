const mongoose = require('mongoose');

const VIPAssignmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'users'
    },
    vipLevel: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    vipId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    }
});

const VipAssignSchema = mongoose.model('VipAssign', VIPAssignmentSchema);

module.exports = VipAssignSchema;
