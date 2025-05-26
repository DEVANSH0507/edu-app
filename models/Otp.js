const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({

    email:{
       type:String,
       req:true,
    },

    otp:{
        type:String,
        require:true,
    },

    createdAt:{
        type:Date,
        default:Date.now(),
        expiresAt:5*60,
    }

});

//writing middleware to dend otp without saving entry
//jaise hi send orp kiya  otp bnega phir db entry save ki call
//db entry bnegi phir save hone se pehle mail send ho jyga otp  
//ar time ke saath save hoga db me email ke respect we can check 


async function sendVerificationEmail(email,otp) {
    try {
        const mailResponse= await mailSender(email,"Otp for Verification",otp);
        console.log("Email Send Successfully",mailResponse);
    } catch (error) {
        console.log("error in Sending MESSAGE",error);
        throw error;
        
    }
}

otpSchema.pre("save",async function (next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("Otp",otpSchema)