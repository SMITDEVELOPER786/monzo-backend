const express = require("express");
const router = express.Router();
const AdminController = require("../Controller/AdminController");
const { protectAdmin } = require("../AuthMiddleware/protect");
const bannerRouter = require("./bannerRouter.js");
const mallRouter = require("./mallRouter.js");
// const customIdRouter = require("./customIdRouter.js");
const CustomIdRouter = require("./CustomIdRouter.js");

const vipRouter = require("./vipRouter.js");


router.post("/sub-admin/create", protectAdmin, AdminController.signup)
router.post("/verifyOtp", AdminController.verifyOtp)
router.post("/login", AdminController.loginAdmin)
router.post("/logout", AdminController.logoutAdmin)
router.get("/sub-admin/get", protectAdmin, AdminController.getAllSubAdmin)

// banner 
router.use("/banner", bannerRouter)
// mall router
router.use("/mall", protectAdmin, mallRouter)
// customId
router.use("/customId", protectAdmin, CustomIdRouter)
// make vip
router.use("/vip", protectAdmin, vipRouter)



module.exports = router