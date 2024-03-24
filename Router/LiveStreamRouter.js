const exp = require("express");
const { LiveStreamController } = require("../Controller/LiveStreamController");
const router = exp.Router();

router.post("/live-stream", auth, LiveStreamController)

module.exports = router;