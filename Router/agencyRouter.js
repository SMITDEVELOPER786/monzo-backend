const express = require("express");
const router = express.Router();
const AgencyController = require("../Controller/AgencyController.js");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Specify the upload directory
    },
    filename: function (req, file, cb) {
        const uniqueString = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split(".").pop();
        cb(null, `agency-${uniqueString}.${ext}`); // Consistent naming for agencyImg
    },
});

const upload = multer({ storage: storage });

router.post("/create", upload.fields([{ name: 'agencyImg', maxCount: 1 }, { name: 'passport', maxCount: 1 }, { name: "photoId", maxCount: 1 }]), AgencyController.createAgency);

router.post("/join-request", AgencyController.joinAgencyRequest)
router.get("/join-request/get", AgencyController.getJoinAgencyRequest)
router.post("/respond-join-request", AgencyController.RespondAgencyJoinRequest)
router.post("/remove-user", AgencyController.removeUserAgency)

module.exports = router;
