const User= require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//TO RESET PASSWORD
//break into two parts
//a) code to send change password link 
//b)  change password

//code to send reset link

exports.resetPasswordToken = async(req,res) =>
{
   try {
    //get email and user form request body
    const {email}=req.body;
    console.log('hello')
    const user=await User.findOne({email});
    console.log("jee")
    //VALIDATE EMAIL
    if(!user)
    {
        return res.json({
            success:"false",
            message:"Invalid email",
        });
    }

   //generate token
    const token = crypto.randomUUID();

//save token in user db
const updateDetails = await User.findOneAndUpdate(
                  {email},
                  {
                    token:token,
                    resetExpiryTime:Date.now()+5*60*1000,
                  },
                  {new:true}
);

//CREATE URL TO SEND 
const url = `http://localhost:3000/update-password/${token}`;

//send mail with token
await mailSender(email,"Password Reset link is given below ,Only valid for 5 minutes",`click ${url}`);

//return response
return res.status(200).json({
    success:true,
    message:"Reset Link Sent",
});
   } catch (error) {
     console.log(error);
     return res.status(500).json({
        success:false,
        message:"Unable to send Reset Link",
     });
   }
};

exports.resetPassword = async(req,res) =>
{
 try {
    
    //fetch data
    const {password,confirmPassword,token} = req.body;

    //validation
    if(password!==confirmPassword)
    {
      return res.json({
        success:false,
        message:"password don't match",
      });
    }
  
    //get user detail from db
    const userDetail = await User.findOne({token:token});
  
    //validate token
    if(!userDetail)
    {
      return res.json({
        success:false,
        message:"Token is invalid",
      });
    }
  
    //check time
    if(userDetail.resetPasswordExpiryTime < Date.now()){
      return res.json({
        success:false,
        message:"Time limit Exceed,plz try again",
      });
    }
  
    //hash pwd
    const hashedPassword=await bcrypt.hash(password,10);
  
    //password update
    await User.findOneAndUpdate(
      {token:token},
      {password:hashedPassword},
      {new:true},
    );
  
    //return response
    return res.status(200).json({
      success:true,
      message:"Password Updated",
    });

 } catch (error) {
    return res.status(500).json(
      {
        success:false,
        message:"Password change unsuccessfull",
      }
    );
 }

}