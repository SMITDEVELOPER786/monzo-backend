const exp = require("express");
const router = exp.Router();
const CoinController = require("../Controller/CoinController")
const CustomIdController = require("../Controller/CustomIdController")
const userController = require("../Controller/userController")

router.post("/transfer", CoinController.transferCoins);
router.get("/", CoinController.coinHistoryChecker);
router.post("/make-reseller", userController.makeUserReseller);
router.post("/refund", CoinController.coinRefund)

module.exports = router