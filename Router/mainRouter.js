const exp = require("express")
const router = exp.Router()
const userRouter = require("./userRouter.js")
const messageRouter = require("./messageRouter.js")


router.use("/monzo", userRouter)
router.use("/message", messageRouter)



module.exports = router