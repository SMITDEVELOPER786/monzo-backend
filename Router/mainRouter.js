const exp = require("express")
const router = exp.Router()
const userRouter = require("./userRouter.js")
const messageRouter = require("./messageRouter.js")
const reelRouter = require("./reelRouter.js")


router.use("/monzo", userRouter)
router.use("/message", messageRouter)
router.use("/reel", reelRouter)



module.exports = router