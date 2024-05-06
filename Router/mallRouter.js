const express = require("express")
const router = express.Router()
const { protectAdmin } = require("../AuthMiddleware/protect")
const MallController = require("../Controller/MallController")
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

router.post("/upload", upload.single("mallImg"), MallController.uploadMall)
router.get("/get", MallController.getMall)
router.put("/update/:id", MallController.updateMall)
router.delete("/delete/:id", MallController.deleteMall)
// delete ki api rhti hai



// router.post("/upload", MallController.uploadMall)
// router.get("/get", protectAdmin, BannerController.getBanners)
// router.post("/delete", protectAdmin, BannerController.deleteBanner)

module.exports = router