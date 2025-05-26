//sabse pehle model import kro 

const User=require("../models/User");
const Otp=require("../models/Otp");
const jwt = require('jsonwebtoken');
const mailSender=require("../utils/mailSender");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");

const { passwordUpdated } = require("../Templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

//ab otp bnao

exports.sendOtp=async(req,res)=>{

    try {
           //fetch email from body
   const {email}=req.body;
   console.log(email)

//    check if user already exist

   let checkUserPresent=await User.findOne({email});
        console.log(checkUserPresent)

   if(checkUserPresent)
   {
    return res.status(401).json({
        success:false,
        message:"USER ALREADY EXIST",
    });
   }

   //generation of OTP
   var otp=otpGenerator.generate(6,{
    upperCaseAlphabets:false,
    lowerCaseAlphabets:false,
    specialChars:false,
   });
   
   console.log("OTP GENERATED : ",otp);

//    check if otp generated is unique or not

   const result=await Otp.findOne({otp:otp});

   while(result)
   {
    var otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
       });
       
    const result=await Otp.findOne({otp});
    
   }

   //create payload for otp
   const otpPayload= {email,otp};
   //payload is use to created db entry

   const otpBody = await Otp.create(otpPayload);
   console.log(otpBody);

   //send mail
    try {
            const mailResponse= await mailSender(email,"Otp for Verification",otp);
            console.log("Email Send Successfully",mailResponse);
        } catch (error) {
            console.log("error in Sending MESSAGE",error);
            throw error;
        }


   return res.status(200).json({
    success:true,
    message:"OTP SENT SUCCESSFULLY",
    otp,
});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in sending message",
        });
        
    }


};

exports.signup= async(req,res) => {

  try {
    
      //fetch data
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
     }=await req.body;

    //validate

    if(!firstName || !lastName || !email || !password 
        || !confirmPassword || !accountType || !otp)
        {
            return res.status(403).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED",
            });
        }

    //match password

    if(password!==confirmPassword)
        {
            return res.status(400).json({
                success:false,
                message:"PASSWORD AND CONFIRM PASSWORD DOES NOT MATCH",
            });
        }

    //check if user exist

    const existingUser =await User.findOne({email});

    if(existingUser)
    {
        return res.status(401).json({
            success:false,
            message:"User already registered"
        });
    }

    

    //find most recent otp stored

        //to find recent otp use following
        const recentOtp = await Otp.find({email}).sort({createdAt:-1}).limit(1);
        // console.log(recentOtp);
        // console.log(otp)

    //validate otp

    if(recentOtp.length==0)
    {
        return res.status(400).json({
            success:false,
            message:"Otp Not Found ,try again",
        });
    }
   else if(recentOtp[0].otp!==otp)
    {
        return res.status(400).json({
            success:false,
            message:"Invalid Otp",
        });
    }

    //hash password
    const hashedPassword= await bcrypt.hash(password,10);

    //create entry in db

    const profileDetails = await Profile.create(
        {
          gender:null,
          dateOfBirth:null,
          about:null,
          contactNumber:null,
        }
    );

    const userDetails = await User.create({
      
    firstName,
    lastName,
    email,
    contactNumber,
    password:hashedPassword,
    accountType,
    additionalDetails:profileDetails._id,
    image:`https://api.dicebear.com/9.x/initials/svg?seed=${firstName}`,
    });
    //return response

    return res.status(200).json({
        success:true,
        message:"User registered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(
        {
            success:false,
            message:"Sign up unsuccessfull",
        }
    );
  }
};


exports.login= async(req,res) => {
 
  try {
    
      //fetch data

      const {email,password}=req.body;

      //validate
      if(!email || !password)
      {
        return res.status(400).json({
            success:false,
            message:"All Fields are required",
        });
      }

      //check existence
      const user = await User.findOne({email}).populate("additionalDetails");
      if(!user)
      {
        return res.status(400).json({
            success:false,
            message:"Please signup first",
        });
      }
      //match password and generate jwt

      if(await bcrypt.compare(password,user.password))
      {

        const payload={
            email:user.email,
            id:user._id,
            accountType:user.accountType,
        }

        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h",
        });
        user.token=token;
        user.password=undefined;

          //save  cookie

      const options= {
        expires : new Date(Date.now()+3*24*60*60*1000),
        httpOnly:true,
      }

    res.cookie("token",token,options).status(200).json({
    success:true,
    message:"Logged in successfully",
    user,
    token,
      });
      }
      else
      {
        return res.status(401).json({
            success:false,
            message:"Incorrect password",
        });
      }
    
} catch (error) {
    console.log(error);
    return res.status(400).json({
        success:false,
        message:"Login Failed",
    });
}
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match",
            });
        }

        // Get user from DB
        const email = req.user?.email || req.body.email; // Adjust according to auth setup
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Verify old password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect old password",
            });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Send email
        try {
            await mailSender(
                email,
                "Password Changed Successfully",
                "Your password has been updated."
            );
        } catch (error) {
            console.error("Error sending email:", error);
        }

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error in changePassword:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
 





