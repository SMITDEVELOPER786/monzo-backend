const express = require("express");
const router = express.Router();
const AdminController = require("../Controller/AdminController");
const { protectAdmin } = require("../AuthMiddleware/protect");
const bannerRouter = require("./bannerRouter.js");
const mallRouter = require("./mallRouter.js");
// const customIdRouter = require("./customIdRouter.js");
const CustomIdRouter = require("./customIdRouter.js");

const vipRouter = require("./vipRouter.js");
const giftRouter = require("./giftRouter.js");

const multer = require("multer")


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




router.post("/sub-admin/create", protectAdmin, AdminController.signup)
router.post("/verifyOtp", AdminController.verifyOtp)
router.post("/login", AdminController.loginAdmin)
router.post("/logout", AdminController.logoutAdmin)
router.get("/sub-admin/get", protectAdmin, AdminController.getAllSubAdmin);
router.delete("/sub-admin/delete/:id", protectAdmin, AdminController.deleteSubAdmin);

router.post("/bgImg/upload", protectAdmin, upload.single("bgImg"), AdminController.uploadBackground)
router.put("/bgImg/update/:id", protectAdmin, upload.single("bgImg"), AdminController.updateBackground)

// banner 
router.use("/banner", bannerRouter)
// mall router
router.use("/mall", protectAdmin, mallRouter)
// customId
router.use("/customId", protectAdmin, CustomIdRouter)
// make vip
router.use("/vip", protectAdmin, vipRouter)
// gift
router.use("/gift", protectAdmin, giftRouter)



module.exports = router