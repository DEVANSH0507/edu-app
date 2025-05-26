const express = require("express");
const router = express.Router()
const{
    login,
    signup,
    sendOtp,
    changePassword,
} = require("../controllers/Auth")

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword")

const{auth}=require("../middlewares/auth")

                              //AUTHENCATION ROUTES

router.post('/login',login); //checked
router.post('/signup',signup); //checked
router.post('/sendotp',sendOtp); //checked
router.post('/changePassword',auth,changePassword); //checked

                               //RESET PASSWORD ROUTES

router.post("/reset-password-token",resetPasswordToken) //checked
 
router.post("/reset-password",resetPassword)  //checked


module.exports = router;


