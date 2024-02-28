const exp = require("express")
const router = exp.Router()
const userRouter = require("./userRouter")


router.use("/monzo",userRouter)



module.exports = router