const mongoose= require("mongoose");

const userSchema = new mongoose.Schema({

    firstName: {
      type:String,
      required:true,
      trim:true,
    },

    lastName: {
      type:String,
      required:true,
      trim:true,
    },

    email: {
      type:String,
      required:true,
      trim:true,
    },

   password: {
      type:String,
      required:true,
    },

    accountType: {
      type:String,
      enum:["Admin","Student","Instructor"],
      required:true,
    
    },

    additionalDetails: {
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"Profile",
    },

    courses: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Courses",
      }],

      image:{
        type:String,
        require:true,
      },

      courseProgress: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress",
      }],

      token:{
        type:String,
      },

      resetPasswordExpiryTime:{
        type:String,
      }

    });

    module.exports = mongoose.model("User",userSchema)