const exp = require("express");
const { getAllLiveStreams, CreateLiveStreamController, joinLiveStream, EndLiveStream } = require("../Controller/LiveStreamController");
const router = exp.Router();

router.route("/get").get(getAllLiveStreams);
router.route("/create").post(CreateLiveStreamController);
router.route("/join").post(joinLiveStream);
router.route("/end").post(EndLiveStream);

module.exports = router;