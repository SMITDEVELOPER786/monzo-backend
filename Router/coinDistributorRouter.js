const exp = require("express");
const router = exp.Router();
const { protectCoinDistributor } = require("../AuthMiddleware/protect");
const { TransferCoins, loginCoinDistributor, getMyAmout } = require("../Controller/CoinDistributorController");


router.post("/login",  loginCoinDistributor);
router.post("/send-coin", protectCoinDistributor, TransferCoins);
router.get("/get-amount", protectCoinDistributor, getMyAmout);

module.exports = router;