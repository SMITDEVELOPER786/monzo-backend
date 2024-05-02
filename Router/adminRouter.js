const express = require("express")
const router = express.Router()
const AdminController = require("../Controller/AdminController")
const protectAdmin = require("../AuthMiddleware/protect")


router.post("/sub-admin/create", protectAdmin, AdminController.signup)
router.post("/verifyOtp", AdminController.verifyOtp)
router.post("/login", AdminController.loginAdmin)
router.get("/sub-admin/get", protectAdmin, AdminController.getAllSubAdmin)

module.exports = router