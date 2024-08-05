const express = require("express");
const router = express.Router();
const AdminController = require("../Controller/AdminController");
const { protectAdmin } = require("../AuthMiddleware/protect");
const bannerRouter = require("./bannerRouter.js");
const mallRouter = require("./mallRouter.js");
// const customIdRouter = require("./customIdRouter.js");
const CustomIdRouter = require("./customIdRouter.js");

const vipRouter = require("./vipRouter.js");
const giftRouter = require("./giftRouter.js");
const coinRouter = require("./coinRouter.js");
// const agencyRouter = require("./agencyRouter.js");
const AgencyController = require("../Controller/AgencyController")
const TagController = require("../Controller/TagController.js")
const userController = require("../Controller/userController.js")
const LevelIconController = require("../Controller/LevelIconController.js")


const multer = require("multer");
const GuardianController = require("../Controller/GuardianController.js");


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




router.post("/verifyOtp", AdminController.verifyOtp)
router.post("/login", AdminController.loginAdmin)
router.post("/logout", AdminController.logoutAdmin)

// ----------- sub admin routes
router.post("/sub-admin/create", protectAdmin, AdminController.signup)
router.get("/sub-admin/get", protectAdmin, AdminController.getAllSubAdmin);
router.get("/sub-admin/activities", protectAdmin, AdminController.getSubAdminActivity);
router.delete("/sub-admin/delete/:id", protectAdmin, AdminController.deleteSubAdmin);

// ---------- ban User
router.post("/ban-user", protectAdmin, userController.banUser)
router.post("/unBan-user", protectAdmin, userController.unBanUser)

// ----------- level UP User
router.post("/levelUp-user", protectAdmin, userController.levelUpUser)
router.post("/levelDown-user", protectAdmin, userController.levelDownUser)

// --------------- upload level icon
router.post("/levelIcon-upload", protectAdmin, upload.single("levelIcon"), LevelIconController.uploadLevelIcon)
router.get("/levelIcon-get", protectAdmin, LevelIconController.getLevelIcons)
router.put("/levelIcon-update", protectAdmin, upload.single("levelIcon"), LevelIconController.updateLevelIcon)

// ---------------- guardian -----------
router.post("/guardian/create", protectAdmin, upload.single("guardianImg"), GuardianController.createGuardian);
router.get("/guardian/", GuardianController.getGuardian);
router.put("/guardian/update", protectAdmin, upload.single("guardianImg"), GuardianController.updateGuardian);
router.delete("/guardian/delete", protectAdmin, GuardianController.deleteGuardian);

// backgroud image
router.post("/bgImg/upload", protectAdmin, upload.single("bgImg"), AdminController.uploadBackground)
router.put("/bgImg/update/:id", protectAdmin, upload.single("bgImg"), AdminController.updateBackground)

// agency
router.post("/agency/accept", protectAdmin, AgencyController.acceptAgencyReq)
router.post("/agency/reject", protectAdmin, AgencyController.rejectAgencyReq)
router.post("/agency/switch", protectAdmin, AgencyController.switchAgency)
router.get("/agency/get", AgencyController.adminGetAgency)
router.put("/agency/chngeInfo", protectAdmin, upload.fields([{ name: 'agencyImg', maxCount: 1 }, { name: 'passport', maxCount: 1 }, { name: "photoId", maxCount: 1 }]), AgencyController.agencyChngeInfo)
router.delete("/agency/delete", protectAdmin, AgencyController.deleteAgency)

// assign tag or model
router.post("/tag/add", protectAdmin, TagController.addUserTag)
router.get("/tag/", protectAdmin, TagController.getAssignTags)
router.put("/tag/update", protectAdmin, TagController.addUserTag)
router.delete("/tag/delete", protectAdmin, TagController.deleteAssignTag)

// special tag option
router.post("/special-tag/assign", upload.single("specialIcon"), protectAdmin, TagController.assignSpecialTag)
router.get("/special-tag", protectAdmin, TagController.getAssignSpecialTags)
router.put("/special-tag/update", upload.single("specialIcon"), protectAdmin, TagController.assignSpecialTag)
router.delete("/special-tag/delete", protectAdmin, TagController.deleteAssignSpecialTag)


router.put("/change/userInfo", protectAdmin, upload.single("profileImage"), AdminController.changeInfoForm)





// banner 
router.use("/banner", bannerRouter)
// mall router
router.use("/mall", protectAdmin, mallRouter)
// customId
router.use("/customId", protectAdmin, CustomIdRouter)
// make vip
router.use("/vip", protectAdmin, vipRouter)
// gift
router.use("/gift", protectAdmin, giftRouter)
// master coins
router.use("/coins", protectAdmin, coinRouter)



module.exports = router