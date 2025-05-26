const express= require("express")
const router = express.Router();
const {auth} = require("../middlewares/auth");

const {
    deleteProfile,
    updateProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses, 
}= require("../controllers/Profile");

                    //PROFILES ROUTES

//Delete user account

router.delete("/deleteProfile",auth,deleteProfile) //checked
router.put("/updateProfile",auth,updateProfile)     //checked
router.get("/getUserDetails",auth,getAllUserDetails) // checked
router.get("/getEnrolledCourses",auth,getEnrolledCourses)
router.put("/updateDisplayPicture",auth,updateDisplayPicture) //checked

module.exports = router;