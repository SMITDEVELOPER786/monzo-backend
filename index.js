const exp = require("express")
const app = exp()
const port = 5000
const bodyParser = require('body-parser')
const mainRouter = require("./Router/mainRouter")
const mongoose  = require("mongoose")
require("dotenv").config()
const dburl = process.env.dbLink
const cors = require("cors");
mongoose.connect(dburl)

const db = mongoose.connection


const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
 
 


db.once("open",()=>{
    console.log("mongoo db Connect")
})

db.on("error",(e)=>{
    console.log(e,"mongoo db disconnect")
})







// parse application/json
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(mainRouter)


app.listen(port,()=>{
    console.log("port asssign",port)
})








