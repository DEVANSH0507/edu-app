const mongoose=require("mongoose");

const courseSchema = new mongoose.Schema({

   courseName:{
    type:String,
   },
   
   courseDescription:{
    type:String,
   },

   instructor:{
   type:mongoose.Schema.Types.ObjectId,
   require:true,
   ref:"User",
   },

   whatYouwWillLearn:{
    type:String,
   },

   courseContent:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Section",
   }],

   ratingAndReviews:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"RatingAndReviews",
   }],

   price:{
    type:Number,
    require:true,
   },

  tag: {
		type: String,
		required: true,
	},

   category: {
		type: mongoose.Schema.Types.ObjectId,
	    required: true,
		ref: "Category",
	},

   thumbnail:{
    type:String,
   },

   studentsEnrolled:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    require:true,
   }

});

    module.exports = mongoose.model("Course",courseSchema)