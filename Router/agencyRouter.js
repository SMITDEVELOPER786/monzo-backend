const express = require("express")
const router = express.Router()
const { protectAdmin } = require("../AuthMiddleware/protect")
const AgencyController = require("../Controller/AgencyController.js")
const multer = require("multer");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqeString = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split(".").pop();
        cb(null, "media-" + uniqeString + "." + ext);
    },
});

const upload = multer({ storage: storage });

router.post("/create", upload.single("agencyImg"), AgencyController.createAgency);

module.exports = router