const User=require("../models/User");
const Course=require("../models/Course");
const {uploadImageToCloudinary}=require("../utils/imageUploader");
const Category = require("../models/Category");
const CourseProgress = require("../models/CourseProgress")
const Section = require("../models/Section")
const SubSection=require("../models/SubSection") 

//create course handler

exports.createCourse = async (req,res)=>
{
  try {
      //fetch data
      const {courseName,
        courseDescription,
        whatYouWillLearn,
        price,
        tag,
        category}=req.body;

      

      //get thumbnail
      const thumbnail=req.files.thumbnailImage;
      
      //validation
      if(!courseName || 
        !courseDescription || 
        !whatYouWillLearn || 
        !price || 
        !tag || 
        !thumbnail||
        !category)
      {
          return res.status(400).json({
              success:false,
              message:"All fields required"
          });
      }
  
      //check for instructor
      const userId=req.user.id;
      const instructorDetails = await User.findById(userId);
      console.log("instructorDetails",instructorDetails);

      //status draft add**??
  
      if(!instructorDetails)
      {
          return res.status(404).json({
              success:false,
              message:"Instructor detail not found"
          });
      }
  
         //check category validity
      const categoryDetails=await Category.findById(category);
      if(!categoryDetails)
      {
          return res.status(404).json({
              success:false,
              message:"Invalid Category"
          });
      }
  
      const thumbnailImage=await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
    );
    console.log(thumbnailImage)

      //create entry for new course
  
      const newCourse = await Course.create(
          {
              courseName,
              courseDescription,
              instructor:instructorDetails._id,
              whatYouWillLearn:whatYouWillLearn,
              price,
              tag:tag,
              category:categoryDetails._id,
              thumbnail:thumbnailImage.secure_url,
          }
      );
  
      //add course to instructor course schema 
  
      await User.findByIdAndUpdate(
          {_id: instructorDetails._id},
          {
              $push:{
                  course:newCourse._id,
              }
          },
         { new:true},
      );
  
      //update Category schema
  
      await Category.findByIdAndUpdate(
          {_id:category},
          {
              $push:{
                  course:newCourse._id,
              }
          },
          { new:true},
      );


      return res.status(200).json({
        success: true,
        message: "Course created successfully",
        data: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
        success: false,
        message: "Something went wrong while creating the course",
        error: error.message,
    });
  }
};

exports.getAllCourse = async (req, res) => {
  try {
    const allCourses = await Course.find({})
      .populate("instructor")
      .populate("category")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      });


    //open above to see all details of each course else only courses fetch not details


    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      data: allCourses,
    });

  } catch (error) {
    console.error("Error fetching all courses:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching courses",
      error: error.message,
    });
  }
};

exports.getCourseDetails = async(req,res) =>{

    try {
        //get id
        const {courseId} = req.body;

        //find course details
        const courseDetails = await Course.findByIdAndUpdate(
            {_id:courseId},)
            .populate(
                {
                    path:"instructor",
                    populate:
                    {
                     path:"additionalDetails",
                    },
                }
            )
            .populate("category")
            // .populate("ratingAndReviews") //there is not rating so it will throw error in testing update later
            .populate(
                {
                    path:"courseContent",
                    populate:
                    {
                        path:"subSection",
                    },
                }
            )

         if(!courseDetails)
         {
            return res.status(400).json({
                status:false,
                message:"Failed to retrieve course details"
            });
         }

         return res.status(200).json({
            status:true,
            message:"course details succesfully retrieved",
            courseDetails
         });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};