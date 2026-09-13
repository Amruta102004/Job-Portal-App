import Job from "../models/job.model.js";

// Admin job posting controller
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      salary,
      jobType,
      companyId,
      position,
      experience,
    } = req.body;
    const userId = req.id; // Get the logged-in user's ID from the request object

    if (
      !title ||
      !description ||
      !requirements ||
      !location ||
      !salary ||
      !jobType ||
      !companyId ||
      !position  ||
      !experience
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const job = await Job.create({
      title,
      description,
      requirements,
      location,
      salary: Number(salary), // Convert salary to a number
      jobType,
      company: companyId,
      position,
      experience: Number(experience),
      created_by: userId
    });

    return res.status(201).json({ message: "Job posted successfully", success: true, job });

  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            
            ],
        };
        const jobs = await Job.find(query).populate({
            path: "company",
        }).sort({ createdAt: -1 });
        
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: "No jobs found", success: false });
        }
        res.status(200).json({ message: "Jobs retrieved successfully", success: true, jobs });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

// Users
export const getJobById = async (req, res) => {

    try{
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({ message: "Job not found", success: false });
        }
        res.status(200).json({ message: "Job retrieved successfully", success: true, job });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
};


// Admin job created
export const getAdminJobs = async (req, res) => {
    try{
        const adminId = req.id; // Get the logged-in admin's ID from the request object
        const jobs = await Job.find({ created_by: adminId });
        if(!jobs || jobs.length === 0){
            return res.status(404).json({ message: "No jobs found for this admin", success: false });
        }
        res.status(200).json({ message: "Jobs retrieved successfully", success: true, jobs });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", success: false });
    }
}