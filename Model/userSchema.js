const mongoose = require("mongoose")



const userSchema = new mongoose.Schema({
  
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
     otp : {
        type:Number,
        required:true

    }, 
    isVerify: {
        type: Boolean,
        default: false
    },
    isCompleteProfile: {
        type: Boolean,
        default: false
    },
    ProfileId :  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userprofiles',
    },
    
   
   
})






module.exports = mongoose.model("users",userSchema)



