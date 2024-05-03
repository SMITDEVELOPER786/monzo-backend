const exp = require("express")
const messageController = require("../Controller/messageController.js")
const router = exp.Router()
const userController = require("../Controller/userController.js")
const multer = require("multer")
const protect = require("../AuthMiddleware/protect.js")
const reelRouter = require("./reelRouter.js")
const LiveStreamRouter = require("./LiveStreamRouter.js")
const { unfollow, follow, getListFollowValidationRules } = require("../Controller/FollowController.js")
const { LiveStreamController } = require("../Controller/LiveStreamController.js")
const adminRouter = require("./adminRouter.js")
const subAdminRouter = require("./subAdminRouter.js")
const bannerRouter = require("./bannerRouter.js")


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
router.get("/logout", userController.Logout);

router.post("/send-otp", userController.sendOtp);

router.post("/verify-otp", userController.verifyOtp)
router.post("/completeprofile", protect, upload.single("profileImage"), userController.completeProfile)
// router.post("/forgetpassword",protect,userController.forgotPassword)
// router.post('/change-password', protect, userController.PasswordOtpVerify);
// router.post("/verify-otp", userController.verifyOtp)
// router.post("/completeprofile", upload.single("profileImage"), protect, userController.completeProfile)
router.post("/forgetpassword", userController.forgotPassword)
router.post("/verify-forget-otp", userController.VerifyForgetOTP)
router.post('/change-password', protect, userController.PasswordOtpVerify);

router.post("/ban-user", userController.banUser)
router.post("/unBan-user", userController.unBanUser)
// router.post("/changeBan-user", userController.changeBanUser)



router.get("/myprofile", protect, userController.Myprofile)
router.get("/get-all-user", userController.getAllUser)
router.post("/levelUp-user", userController.levelUpUser)
router.post("/levelDown-user", userController.levelDownUser)
router.post("/follow", protect, follow)
router.post("/unfollow", protect, unfollow)
router.get("/getfollowing", protect, getListFollowValidationRules)
router.post("/search-user", userController.SearchUser)
router.get("/chat", messageController.getMessages)
router.get("/get-followers", userController.getFollowersUsers)
router.get("/get-broadcaster", userController.getAllBroadCasters)
router.put("/edit-profile", upload.single("profileImage"), protect, userController.editprofile)
// router.post("/live-stream", protect, LiveStreamController)


router.use("/reel", reelRouter)
router.use("/live-stream", protect, LiveStreamRouter)

// for admin
router.use("/admin", adminRouter)
router.use("/sub-admin", subAdminRouter)
router.use("/banner",  bannerRouter)


module.exports = router;
