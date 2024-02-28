
// models/item.js
const mongoose = require('mongoose');

const userprofileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    profileImage: {
        type: String, // Assuming you will store a URL or file path for the image
        required: true
    }
    ,
favBroadcaster:{
type: String,
required:true
},
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
});

module.exports = mongoose.model('userprofiles', userprofileSchema);
