const exp = require("express")
const messageController = require("../Controller/messageController.js")
const router = exp.Router()
const userController =require("../Controller/userController.js")
const multer = require("multer")
const protect = require("../AuthMiddleware/protect.js")
const reelRouter = require("./reelRouter.js")
const { unfollow, follow, getListFollowValidationRules } = require("../Controller/FollowController.js")




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqeString = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, "media-" + uniqeString + "." + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/logout",userController.Logout);

router.post("/send-otp", userController.sendOtp);

router.post("/verify-otp",userController.verifyOtp)
router.post("/completeprofile",upload.single("profileImage"),protect,userController.completeProfile)
router.post("/forgetpassword",protect,userController.forgotPassword)
router.post('/change-password',protect, userController.PasswordOtpVerify);

router.post("/block-users",userController.blockUsers)
router.post("/unblock-users",userController.unblockUsers)



router.get("/myprofile",protect,userController.Myprofile)
router.get("/get-all-user",userController.getAllUser)
router.post("/follow",protect,follow)
router.post("/unfollow",protect,unfollow)
router.get("/getfollowing",protect,getListFollowValidationRules)
router.post("/search-user",userController.SearchUser)
router.get("/chat",messageController.getMessages)
router.put("/edit-profile",upload.single("profileImage"),protect,userController.editprofile)


router.use("/reel", reelRouter)



module.exports = router;
