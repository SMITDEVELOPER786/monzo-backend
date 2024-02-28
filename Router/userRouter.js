const exp = require("express")

const router = exp.Router()
const userController =require("../Controller/userController")
const multer = require("multer")




const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/")
    },
    filename:function(req,file,cb){
        const uniqeString =  Date.now()+ "-"+Math.round(Math.random()*1E9)
        const ext = file.originalname.split('.').pop()
        cb(null,"media-"+uniqeString + "."+ ext )
    }
})

const upload = multer({storage:storage})


router.post("/signup",userController.signup)
router.post("/login",userController.login)
router.get("/logout",userController.Logout)

router.post("/send-otp",userController.sendOtp)

// router.post("/verify-otp",userController.verifyOtp)
router.post("/completeprofile",upload.single("profileImage"),userController.completeProfile)
router.post("/forgetpassword",userController.forgotPassword)
router.post('/change-password', userController.PasswordOtpVerify);
router.post("/signup",userController.signup)
router.get("/myprofile",userController.Myprofile)
router.get("/get-all-user",userController.getAllUser)



module.exports = router