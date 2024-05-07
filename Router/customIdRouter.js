const express = require("express")
const router = express.Router()
// const { protectAdmin } = require("../AuthMiddleware/protect")
const CustomIdController = require("../Controller/CustomIdController")

router.post("/generate", CustomIdController.generateCustomId)
router.get("/get", CustomIdController.getCustomId)
router.delete("/delete/:id", CustomIdController.DeleteCustomId)


module.exports = router;