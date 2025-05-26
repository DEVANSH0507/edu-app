const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async(req,res) => {
   
    try {

         //fetch data
    const {name,description}=req.body;
   
    //check data
    if(!name || !description)
    {
      return res.status(400).json(
        {
            success:false,
            message:"All fields required"
        }
      );
    }

   //update db
    const categoryDetails = await Category.create(
        {
            name:name,
            description:description,
        }
    );

    console.log(categoryDetails);

    //return response
    return res.status(200).json({
        success:true,
        message:"Category created successfully",
    });
    } catch (error) {
        console.log(error);
        return res.status(200).json(
            {
                success:false,
                message:"error in creating Category",
            }
        )
    }

};

exports.showAllCategories = async (req, res) => {
    try {
      const allCategories = await Category.find({}, {
        name: true,
        description: true,
      });
  
      res.status(200).json({
        success: true,
        message: "All categories retrieved successfully",
        categories: allCategories,
      });
    } catch (error) {
        console.log(error);
      return res.status(500).json({
        success: false,
        message: "Unable to show all Categories",
        error: error.message,
      });
    }
};

exports.categoryPageDetails = async(req,res) =>
  {
 try {
  
    //get category id
    const {categoryId} = req.body;

    //fetch courses for category
    const selectedCategory = await Category.findById(categoryId)
                             .populate("course")
                             .exec();
    //validate
    if(!selectedCategory)
    {
      return res.status(404).json({
        success:false,
      message:"Data not found"
      });
    }

    //fetch courses for different categories

    const differentCategories = await Category.find({
      _id:{$ne:categoryId},
    })
    .populate("course")
    .exec();

    //get top selling course
    const topSellingCourses = await Course.find({})
    .sort({ enrolledStudent: -1 }) // Assuming you have a 'sold' field
    .limit(10);

    //return response
    return res.status(200).json({
      success:true,
      message:"courses for category retrieved",
      data: {
        selectedCategory,
        differentCategories,
        topSellingCourses,
      }
    });
 } catch (error) {
  console.log(error);
  return res.status(500).json({
    success:false,
    message:"courses for category can not be retrieved"
  });
 }

};

//CHANGE

exports.addCourseToCategory = async (req, res) => {
  try {
    const { categoryId, courseId } = req.body;

    // Validate input
    if (!categoryId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Category ID and Course ID are required",
      });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Add course to category if not already added
    if (!category.course.includes(courseId)) {
      category.course.push(courseId);
      await category.save();
    }

    // Optional: Add category to course model (if your schema has a category field)
    if (!Course.category || Course.category.toString() !== categoryId) {
      Course.category = categoryId;
      await course.save();
    }

    return res.status(200).json({
      success: true,
      message: "Course added to category successfully",
      category,
    });
  } catch (error) {
    console.error("Error adding course to category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding course to category",
      error: error.message,
    });
  }
};
