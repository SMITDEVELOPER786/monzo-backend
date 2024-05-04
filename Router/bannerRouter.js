const express = require("express")
const router = express.Router()
const { protectAdmin } = require("../AuthMiddleware/protect")
const BannerController = require("../Controller/BannerController")
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

router.post("/upload", protectAdmin, upload.single("bannerImg"), BannerController.uploadBanner)
router.get("/get", protectAdmin, BannerController.getBanners)
router.put("/update/:id", protectAdmin, upload.single("bannerImg"), BannerController.updateBanner)
router.post("/delete", protectAdmin, BannerController.deleteBanner)

module.exports = router