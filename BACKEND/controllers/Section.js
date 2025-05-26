const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSections = async(req,res) =>
{

    try {
        //fetch data
        const {sectionName,courseId}=req.body;
        //validate data
        if(!sectionName || !courseId)
        {
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }
        //create enty

        const newSection = await Section.create(
            {sectionName:sectionName}
        )

        //add section to that course
        const updatedCourse= await Course.findByIdAndUpdate(
            {_id:courseId},
            {
                $push:{
                    courseContent:newSection._id
                }
            },
           { new:true},
        )

        //use populated to replace sectionand subsection in updated course

        //return response
        return res.status(201).json({
            success: true,
            message: "Section created successfully",
            data: newSection,
        });
    } catch (error) {
        console.error("Error creating course:", error);
    return res.status(500).json({
        success: false,
        message: "Something went wrong while creating the section",
        error: error.message,
    });
    }
};

exports.updateSections = async(req,res) =>{
try {
    
    //fetch data
    const {sectionName,sectionId}= req.body;

    //validate
    if(!sectionName || !sectionId)
    {
        return res.status(400).json({
            success:false,
            message:"cannot update section"
        });
    }

    //update in db
    const updatedSection =await Section.findByIdAndUpdate(
        {_id:sectionId},
        {sectionName:sectionName},
        {new:true}
    )

    //return response

    return res.status(201).json({
        success: true,
        message: "Section updated successfully",
        data:updatedSection,
    });
} catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
        success: false,
        message: "Something went wrong while updating the section",
        error: error.message,
    });
}
};

exports.deleteSections = async (req, res) => {
  try {
    const { courseId, sectionId } = req.body;

    // Validate input
    if (!courseId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Both courseId and sectionId are required",
      });
    }

    // 1. Remove sectionId from course
    await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: {
          courseContent: sectionId, // assumes 'courseContent' in Course schema stores section IDs
        },
      }
    );
    
    //To delete Subsection associated to section
    
    const section = await Section.findById(sectionId);
    if (section && section.subSection && section.subSection.length > 0) {
    await SubSection.deleteMany({ _id: { $in: section.subSection } });
}


    // 2. Delete the section itself
    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting section:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the section",
      error: error.message,
    });
  }
};
