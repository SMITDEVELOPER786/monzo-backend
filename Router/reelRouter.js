const exp = require("express")
const router = exp.Router()
const multer = require("multer");
const reelsController = require("../Controller/reelsController.js")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/reels");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype == "video/mp4" || file.mimetype == "video/webm") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ fileFilter: fileFilter }).single("video");


router.route("/").get(reelsController.getReels)
router.route("/upload").post(upload, reelsController.uploadReel)
router.route("/like").post(reelsController.likeReel)
router.route("/dislike").post(reelsController.dislikeReel)
router.route("/comment").post(reelsController.addComment)
router.route("/comment/update").post(reelsController.updateComment)
router.route("/comment/delete").post(reelsController.deleteComment)
router.route("/comment/like").post(reelsController.likeComment)
router.route("/comment/dislike").post(reelsController.dislikeComment)
router.route("/share").post(reelsController.shareReel)



module.exports = router