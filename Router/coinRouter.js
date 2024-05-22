const exp = require("express");
const router = exp.Router();
const CoinController = require("../Controller/CoinController")

router.post("/transfer", CoinController.transferCoins)
router.get("/", CoinController.coinHistoryChecker)

module.exports = router