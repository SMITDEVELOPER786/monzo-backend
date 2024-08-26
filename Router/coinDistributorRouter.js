const exp = require("express");
const router = exp.Router();
const { protectCoinDistributor } = require("../AuthMiddleware/protect");
const { TransferCoins, loginCoinDistributor } = require("../Controller/CoinDistributorController");


router.post("/login",  loginCoinDistributor);
router.post("/send-coin", protectCoinDistributor, TransferCoins);

module.exports = router;