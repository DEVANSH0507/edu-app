const User = require("../models/User");
const Profile=require("../models/Profile");
const Course = require("../models/Course");
const {uploadImageToCloudinary} = require("../utils/imageUploader")

exports.updateProfile = async(req,res) =>{

    try {
        
        //fetch data
        const{contactNumber,gender,dateOfBirth="",about=""}=req.body;
         // dob=" " means if give so val otherwise null means optional data 
        const userId= await req.user.id;
        console.log(userId)
        //validate data
        if(!userId || !contactNumber || !gender)
        {
            return res.status(500).json({
                success:false,
                message:"plz ill required details"
            });
        }

        //get user userid profileid an details
        const userDetails = await User.findById(userId);
        const profileId  = userDetails.additionalDetails;
        const profileDetails =  await Profile.findById(profileId);

        //update detail and save
        profileDetails.dateOfBirth= dateOfBirth;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        profileDetails.about=about;

        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
           error:error.message,
        });
    }
};

exports.deleteProfile = async (req, res) => {
  try {
    // 1. Get user id from req.user (assuming user is authenticated and user info is populated)
    const id = req.user.id;

    // 2. Find the user by id
    const userDetails = await User.findById(id);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // 3. Delete the related profile (assuming profile model is AdditionalDetails)
    // You need to import the model for additionalDetails, example:
    // const AdditionalDetails = require('../models/AdditionalDetails');
    const profileId = userDetails.additionalDetails;
    if (profileId) {
      await Profile.findByIdAndDelete(profileId);
    }

    // 4. Delete the user
    await User.findByIdAndDelete(id);

    // 5. Unenroll student from all courses
    // Assuming the Course model has a 'studentEnrolled' array and you want to remove this user from all courses
    // So you update all courses to pull this user id from studentEnrolled array
    await Course.updateMany(
      { studentEnrolled: id },
      { $pull: { studentEnrolled: id } }
    );

    // 6. Return success response
    return res.status(200).json({
      success: true,
      message: "User and profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the user",
      error: error.message,
    });
  }
};


exports.getAllUserDetails = async(req,res) =>{
    try {
        
        //fetch id
        const id= req?.user?.id;

        //validate and get all details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        //return response
        return res.status(200).json({
            success:true,
            userDetails,
            message:"All data of user retrieved"
        });

    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve data of user",
            error: error.message,
        });
    }
};

exports.updateDisplayPicture = async(req,res) =>{
   try {

	const id = req.user.id;

	const user = await User.findById(id);
      

	if (!user) {
		return res.status(404).json({
            success: false,
            message: "User not found",
        });
	}

	const image = req.files.displayPicture;
  

	if (!image) {
		return res.status(404).json({
            success: false,
            message: "Image not found",
        });
    }

	const uploadDetails = await uploadImageToCloudinary(
		image,
		process.env.FOLDER_NAME
	);

	console.log(uploadDetails);

	const updatedImage = await User.findByIdAndUpdate({_id:id},{image:uploadDetails.secure_url},{ new: true });

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
    });
		
	} catch (error) {
		return res.status(500).json({
            success: false,
            message: error.message,
        });
		
	}

};

//change all from here
exports.getEnrolledCourses = async(req,res) =>{
    try {
        
        //fetch id
        const id=await req?.user?.id;

        //validate and get all details
        const userDetails = await User.findbyId(id).populate("additionalDetails").exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"All data of user retrieved"
        });

    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve data of user",
            error: error.message,
        });
    }
};


