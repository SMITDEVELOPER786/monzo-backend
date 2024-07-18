const exp = require("express");
const router = exp.Router();
const CoinController = require("../Controller/CoinController")
const CoinTansfer = require("../Controller/CoinTansfer")
const CustomIdController = require("../Controller/CustomIdController")
const userController = require("../Controller/userController");
const { protectAdmin } = require("../AuthMiddleware/protect");

router.post("/transfer", CoinController.transferCoins);
router.get("/", CoinController.coinHistoryChecker);
router.post("/make-reseller", userController.makeUserReseller);
router.post("/refund", CoinController.coinRefund)
// ----------- coins transfer history
router.get("/transfer-history", CoinTansfer.getCoinsHistory)

module.exports = router