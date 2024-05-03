const express = require("express")
const router = express.Router()
const AdminController = require("../Controller/AdminController")
const userController = require("../Controller/userController.js")
const protectAdmin = require("../AuthMiddleware/protect.js")
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


// router.post("/signup", AdminController.signup)
// router.post("/verifyOtp", AdminController.verifyOtp)
router.post("/login", AdminController.loginSubAdmin)
router.post("/ban-user", protectAdmin, userController.banUser)
router.post("/unban-user", protectAdmin, userController.unBanUser)
router.post("/search-user", protectAdmin, AdminController.searchById)
router.post("/edit-user", protectAdmin, upload.single("profileImage"), AdminController.editUserInfo)

module.exports = router