const exp = require("express")
const router = exp.Router()
const messageController = require("../Controller/messageController.js")


router.route("/chat").get(messageController.getMessages)



module.exports = router