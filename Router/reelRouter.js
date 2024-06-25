const exp = require("express")
const router = exp.Router()
const multer = require("multer");
const reelsController = require("../Controller/reelsController.js")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/reels");
    },
    filename: (req, file, cb) => {
        // Use Date.now() to make sure filename is unique
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "video/mp4" || file.mimetype === "video/webm" || file.mimetype === "video/x-matroska") {
        cb(null, true); // Accept file
    } else {
        cb(null, false); // Reject file
    }
};

// Multer upload middleware
const upload = multer({
    // storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB file size limit
    }
}).single("video");

// router.post('/upload-reel', upload, reelsController.uploadReel);
router.route("/get-reels").get(reelsController.getReels)
router.route("/upload-reels").post(upload, reelsController.uploadReel)
router.route("/like").post(reelsController.likeReel)
router.route("/dislike").post(reelsController.dislikeReel)
router.route("/comment").post(reelsController.addComment)
router.route("/comment-update").post(reelsController.updateComment)
router.route("/comment-delete").post(reelsController.deleteComment)
router.route("/comment/like").post(reelsController.likeComment)
router.route("/comment/dislike").post(reelsController.dislikeComment)
router.route("/share").post(reelsController.shareReel)



module.exports = router