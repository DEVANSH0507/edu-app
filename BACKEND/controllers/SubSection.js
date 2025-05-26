const SubSection =require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} =require("../utils/imageUploader");
const Course = require("../models/Course");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//create subsection

exports.createSubSections = async(req,res) =>{
    try {
        
        //fetch data 
        const{sectionId,title,timeDuration,description} =req.body;
    
        //fetch image
        const video = req.files.videoFile;

        //validate both
        if(!sectionId  || !title || !timeDuration ||!description  ||!video)
        {
            return res.statis(500).json(
                {
                    success:false,
                    message:"All Fields required",
                }
            );
        }

        //upload image to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        //create database 
        const SubSectionDetails= await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
            videoPublicId: uploadDetails.public_id,
        })
        
        //update subsecton id in section
        const updatedSection=await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                  subSection:SubSectionDetails._id,
                }
            },
            {new:true}
        )

        //log updated section here after adding populate query

        //return response

        return res.status(200).json({
            success:true,
            message:"SubSection created successfully"
        });

    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the section",
            error: error.message,
        });
    }
};

//CHANGE LATER ITS NEEDED

exports.updateSubSections = async (req, res) => {
    try {
        const { subSectionId, title, timeDuration, description } = req.body;
        const video = req.files?.videoFile;

        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: "SubSection ID is required",
            });
        }

        const updatedData = {};

        if (title) updatedData.title = title;
        if (timeDuration) updatedData.timeDuration = timeDuration;
        if (description) updatedData.description = description;

        if (video) {
        // 1. Get the old SubSection
           const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
           return res.status(404).json({ success: false, message: "SubSection not found" });
        }

    // 2. Delete old video from Cloudinary
         if (subSection.videoPublicId) {
            await cloudinary.uploader.destroy(subSection.videoPublicId, {
            resource_type: "video",
        });
    }

  // 3. Upload new video
  const uploadDetails = await uploadImageToCloudinary(
    video,
    process.env.FOLDER_NAME,
    "video"
  );

  // 4. Save new video URL and public ID
  updatedData.videoUrl = uploadDetails.secure_url;
  updatedData.videoPublicId = uploadDetails.public_id;
}

        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            updatedData,
            { new: true }
        );

        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: updatedSubSection,
        });

    } catch (error) {
        console.error("Error updating subsection:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the subsection",
            error: error.message,
        });
    }
};

exports.deleteSubSections = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "SubSection ID and Section ID are required",
            });
        }

        // Remove subsection from the section's subSection array
        await Section.findByIdAndUpdate(sectionId, {
            $pull: { subSection: subSectionId }
        });

        // Delete the actual subsection
        const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

        if (!deletedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

         //  Delete video from cloud if stored
        if (deletedSubSection.videoPublicId) {
            await cloudinary.uploader.destroy(deletedSubSection.videoPublicId, {
            resource_type: "video",
        });
        }

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting subsection:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the subsection",
            error: error.message,
        });
    }
};
