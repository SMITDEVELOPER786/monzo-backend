const express = require("express")
const router = express.Router()
const AdminController = require("../Controller/AdminController")
const userController = require("../Controller/userController.js")
const { protectSubAdmin } = require("../AuthMiddleware/protect.js")
const coinRouter = require("./coinRouter.js");

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



// router.post("/login", AdminController.loginSubAdmin)
router.get("/get-all-user", protectSubAdmin, userController.getAllUser);

router.post("/ban-user", protectSubAdmin, userController.banUser);
router.post("/unban-user", protectSubAdmin, userController.unBanUser);
router.post("/search-user", protectSubAdmin, AdminController.searchById);
router.put("/edit-user/:id", protectSubAdmin, upload.single("profileImage"), AdminController.editUserInfo);

router.use("/coins", protectSubAdmin, coinRouter)



module.exports = router