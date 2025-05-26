const Course = require("../models/Course");
const mailSender = require("../utils/mailSender");
const User = require("../models/User");
const {instance} = require("../config/razorpay");
const { Mongoose } = require("mongoose");
const {courseEnrollmentEmail}=require("../Templates/courseEnrollmentEmail")
const {paymentSuccess} = require("../Templates/paymentSuccess")
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const CourseProgress =require("../models/CourseProgress");

exports.capturePayment = async(req,res) =>{

    //get user id course id
    const userId = req.user.id;
    const {courseId} = req.body;

    //id Validity check
    if(!courseId)
    {
        return res.json({
            success:false,
            message:" Invalid courseid ",
        })
    };

    //get course details
    let course;

    try {
        
        course = await Course.findById(courseId);

        //valdate
        if(!course)
        {
            return res.json({
                success:false,
                message:"Unable to find source",
            });
        }
         
        //check for user already paid or not

        let uid= new mongoose.Types.ObjectId(userId);

        if(course.studentsEnrolled.includes(uid))
        {
            return res.status(200).json(
                {
                    success:false,
                    message:"Users already enrolled",
                }
            );
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }

    
    //create order

    const amount = course.price;
    const currency="INR";

    const options ={
        amount: amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:courseId,
            userId
        }
    };

    //initaiate paynment 

   try {
    
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);

    //return response

    return res.status(200).json({
        success:true,
        courseName:course.courseName,
        courseDesription:courseDesription,
        thumbnail:course.thumbnail,
        orderId:paymentResponse.id,
        currency:paymentResponse.currency,
        amount:paymentResponse.amount
    });

   } catch (error) {
    console.log(error);
        return res.json({
            success:false,
            message:"Unable to initiate payment",
        });
   }

};


exports.verifySignature = async(req,res) =>{


     
    const webHookSecret ="12345678";
    const signature= req.headers("x-razorpay-signature");

    //encryption to convert webhook in received data

    const shasum = crypto.createHmac("sha256",webHookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest)
    {
        console.log("Payment is Authorized");
        const {courseId,userId}=req.body.payoad.payment.entity.notes;

        try {
            // Find the course and enroll student in it

            const enrolledCourse = await Course.findOneAndUpdates(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true}
            );

            if(!enrolledCourse)
            {
                return res.status(500).json({
                    success:false,
                    message:"Course not found"
                });
            }

            console.log(enrolledCourse);

            //add course to student
            const enrolledStudent = User.findOneAndUpdates(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true}
            );
           
            console.log(enrolledStudent);

            //mail send 

            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from Devansh",
                "Congratulation,You are enrolled in new course",
                
            );

            console.log(emailResponse);

            return res.status(200).json({
                success:true,
                message:"mail send successfully",
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"INVALID RESPONSE",
        })
    }

};