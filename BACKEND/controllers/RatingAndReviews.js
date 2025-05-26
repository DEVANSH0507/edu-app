const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create Rating

exports.createRating = async(req,res) => {

  try {
      //get course id
      const userId = req.user.id;

      //get course details
      const {rating,reviews,courseId} = req.body;
  
        //check if user has buy course or not
  
      //course detail me jao fir student enrolled se user id dhund lao
       
      let courseDetails = await Course.findOne(
         {_id:courseId,
          studentsEnrolled:{$elemMatch:{$eq:userId}},
          }
      );
  
    if(!courseDetails)
    {
      return res.status(404).json({
          success:false,
          message:"You have not enrolled the course"
      });
    }
      //check if user has reviewed already or not
           // reating based on course and user both otherwise contradict
      
      const alreadyReviewed = await RatingAndReview.findOne({
          user:userId,
          course:courseId
      });
      
      if(alreadyReviewed)
      {
          return res.status(403).json({
              success:false,
              message:"course is already reviewed by user"
          });
      }
       
      //create review
  
      const ratingReview = await RatingAndReview.create({
          user:userId,
          course:courseId,
          rating,
          reviews
      });
  
      //update course with rating and review
  
      const updatedCourseDetails = await Course.findByIdAndUpdate(
          {_id:courseId},
          {
              $push:{
                  ratingAndReviews:ratingReview._id,
              }
          },
          {new:true}
      );
  
      //return response
      return res.status(200).json({
          success:true,
          ratingReview,
          message:"Rating and review succesfully saved"
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Unable to save Rating and Review"
    });
  }
};

//get Average rating

exports.getAverageRating = async(req,res) =>
{
 try {
    
    //get courseid
    const courseId = req.body.courseId;

    //calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match:{
            course:new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group:{
         _id:null,
         averageRating: {$avg: "$rating"},
        }
      }
    ])
    //return rating

    if(result.length>0)
    {
        return res.status(200).json({
            success:true,
            averageRating:result[0].averageRating,
        });
    }

    //if no rating review exist

    return res.status(200).json({
        success:true,
        message:"Average Rating is Zero,no Review till now",
        averageRating:0,
    })
 } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        meassage:error.message
    });
 }
}


exports.getAllRating = async(req,res) =>{

    try {
        
       const allReviews= await RatingAndReview.find({})
       .sort({rating:"desc"}) //descending order
       .populate({
        path:"user",
        select:"firstName lastName email image",
       }) //rating se user id nikal ke populate krke user me jaake data nikala 
       .populate({
        path:"course",
        select:"courseName"
       })
       .exec();

       return res.status(200).json({
        success:true,
        data:allReviews
       });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};



