const express = require("express")
const router = express.Router()
const AdminController = require("../Controller/AdminController")
const userController = require("../Controller/userController.js")
const protectAdmin = require("../AuthMiddleware/protect.js")


// router.post("/signup", AdminController.signup)
// router.post("/verifyOtp", AdminController.verifyOtp)
router.post("/login", AdminController.loginSubAdmin)
router.post("/ban-user", protectAdmin, userController.banUser)
router.post("/unban-user", protectAdmin, userController.unBanUser)

module.exports = router