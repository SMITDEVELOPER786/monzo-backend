const express = require("express")
const router = express.Router()
// const { protectAdmin } = require("../AuthMiddleware/protect")
const CustomIdController = require("../Controller/CustomIdController")

router.post("/generate", CustomIdController.generateCustomId)
router.get("/get", CustomIdController.getCustomId)
router.delete("/delete/:id", CustomIdController.DeleteCustomId)
// router.delete("/delete/:id", CustomIdController.getCustomId)
// router.get("/get",  BannerController.getBanners)
// router.put("/update/:id", protectAdmin, upload.single("bannerImg"), BannerController.updateBanner)
// router.post("/delete", protectAdmin, BannerController.deleteBanner)

module.exports = router;