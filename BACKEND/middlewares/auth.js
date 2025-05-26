const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User=require("../models/User");

exports.auth=async(req,res,next) =>{
 try {
    //get token

 const token =await req.cookies.token ||
 req.body.token||
 req.header("Authorization").replace("Bearer ","");
//validate

if(!token)
{
return res.status(400).json({
success:false,
message:"token missing",
});
}

//Verify the token

try {
const decode =  jwt.verify(token,process.env.JWT_SECRET);
console.log(decode);
req.user=decode; 

} catch (error) {
//console.log(error);
return res.status(401).json({
success:false,
message:"Invalid Token",
});
}

next();
 } catch (error) {
    console.log(error);
    return res.status(400).json({
        success:false,
    message:"Something went wrong while validating",
});
 }
}

//is STUDENT

exports.isStudent=(req,res,next)=>
{
    try {
        if(req.user.accountType !== "Student")
        {
            return res.status(500).json({
                success:false,
                message:"Protected route only for Student",
            });

            
        }
        next();
    } catch (error) {
        return res.status(500).json(
            {
                success:false,
                message:"USER ROLE CANNOT BE VERRIFIED",
            }
        );
    }
}

//is Insructor

exports.isInstructor=async(req,res,next)=>
{
    try {
     
        if(req.user.accountType !== "Instructor")
        {
            return res.status(500).json({
                success:false,
                message:"Protected route only for Instructor",
            });

        
        }
        next();
    } catch (error) {
        return res.status(500).json(
            {
                success:false,
                message:"USER ROLE CANNOT BE VERRIFIED",
            }
        );
    }
}

//is Admin 


exports.isAdmin=(req,res,next)=>
{
      
    try {
        if(req.user.accountType !== "Admin")
        {
            return res.status(500).json({
                success:false,
                message:"Protected route only for Admin",
            });
            
            
        }
        next();
    } catch (error) {
        return res.status(500).json(
            {
                success:false,
                message:"USER ROLE CANNOT BE VERRIFIED",
            }
        );
    }
}

