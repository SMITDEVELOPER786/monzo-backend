const { createTransport } = require("nodemailer")
const nodemailer = require("nodemailer")



 {/* exports.sendmailer = (message,email,otp)=>{


    try {
        
   

    const transporter =nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.email,
            pass:process.env.pass
        },
        tls:{
            rejectUnauthorized:false
        }
    })
     
    const contactinfo={
        from:process.env.email,
        to:email,
        subject:"welcom",
        html:`
        
        <h1>${message}</h1>
        <p>${otp}</p>
        `
    }

    transporter.sendMail(contactinfo,(err,result)=>{
        if(err){
            console.log(err)
        }
    })

} catch (error) {
        
}

}  */}

exports.mail = (message ,otp ,email)=>{

try {
    



const transpoter = nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:process.env.email,
      pass:process.env.pass      
    },
    tls:{
        rejectUnauthorized:false
    }
})

const info ={
    from:process.env.email,
    to:email,
    subject:"Welcome to Our WebPage",
    html:`
    <h1>${message}</h1>
    <p>${otp}</p>
    `
}

transpoter.sendMail(info,(error,result)=>{
if(error){
console.log(error)
}
})

} catch (error) {
 console.log(error)   
}

}