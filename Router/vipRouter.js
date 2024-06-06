const express = require("express")
const router = express.Router()
const { protectAdmin } = require("../AuthMiddleware/protect")
const VipController = require("../Controller/VipController")
const multer = require("multer");


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

router.post("/create", protectAdmin, upload.array("vipImgs", 5), VipController.createVip)
// router.post("/create", protectAdmin, upload.single("vipImg"), VipController.createVip)
router.get("/get", protectAdmin, VipController.getVips)
router.put("/update/:id", protectAdmin, upload.single("vipImg"), VipController.updateVip)
router.delete("/delete/:id", protectAdmin, VipController.deleteVip)

module.exports = router