const exp = require("express");
const router = exp.Router();
const CoinController = require("../Controller/CoinController")
const CustomIdController = require("../Controller/CustomIdController")

router.post("/transfer", CoinController.transferCoins)
router.get("/", CoinController.coinHistoryChecker)
router.post("/id-generate", CustomIdController.generateCustomId)
router.get("/id-get", CustomIdController.getCustomId)

module.exports = router